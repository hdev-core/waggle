import HAS from 'hive-auth-wrapper'
import type { Signer, VoteWeightPct } from './hive'

// HiveAuth signer — the cross-platform login. The user approves in a HiveAuth
// wallet (Hive Keychain mobile app, or any HAS-compatible PKSA): on desktop they
// scan a QR code, on mobile they tap a `has://` deep link. After auth the app
// holds a session token; each write op is routed to the wallet for approval over
// the HiveAuth Service (HAS) — the app never sees a private key.

const APP_META = {
  name: 'Waggle',
  description: 'For You on Hive',
  icon: 'https://hdev-core.github.io/waggle/icon.svg',
}

// HiveAuth Service (HAS) host. Pin it explicitly so the server we talk to and
// the one we advertise in the QR payload can never diverge.
const HAS_HOST = import.meta.env.VITE_HAS_HOST ?? 'wss://hive-auth.arcange.eu/'
HAS.setOptions({ host: HAS_HOST })

// A pending wallet interaction the UI must surface: an `auth` prompt shows the
// QR / deep link; a `sign` prompt tells the user to approve in their wallet.
export interface AuthPrompt {
  kind: 'auth' | 'sign'
  uri?: string // has://auth_req/… (auth only)
  expire: number // epoch ms the request times out
  action?: string // e.g. 'Upvote', 'Comment' (sign only)
}

export type PromptFn = (p: AuthPrompt | null) => void

export interface HiveAuthSession {
  username: string
  token?: string
  expire?: number
  key?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Evt = any

// The QR / deep-link payload the wallet scans. `host` is REQUIRED: it tells the
// wallet which HAS server to send the approval back to. Omit it and the wallet
// approves against its own default server, so our app never receives the ack
// (symptom: "scanned the QR but nothing happened").
export function buildAuthUri(account: string, uuid: string, key: string, host: string): string {
  return 'has://auth_req/' + btoa(JSON.stringify({ account, uuid, key, host }))
}

function postingCustomJson(user: string, id: string, payload: unknown) {
  return ['custom_json', { required_auths: [], required_posting_auths: [user], id, json: JSON.stringify(payload) }]
}

export class HiveAuthSigner implements Signer {
  readonly kind = 'hiveauth' as const
  private auth: HiveAuthSession
  private prompt: PromptFn

  constructor(username: string, prompt: PromptFn, restore?: Omit<HiveAuthSession, 'username'>) {
    this.auth = { username: username.trim().replace(/^@/, '').toLowerCase(), ...restore }
    this.prompt = prompt
  }

  get username(): string {
    return this.auth.username
  }

  // Serialize the live session so it can be persisted and restored across reloads.
  get session(): HiveAuthSession {
    return { ...this.auth }
  }

  get valid(): boolean {
    return !!this.auth.token && !!this.auth.expire && this.auth.expire > Date.now()
  }

  private buildUri(evt: Evt): string {
    return buildAuthUri(this.auth.username, evt.uuid, evt.key, HAS.status()?.host || HAS_HOST)
  }

  async login(): Promise<{ username: string }> {
    if (this.valid) return { username: this.auth.username }
    const challenge_data = {
      key_type: 'posting',
      challenge: JSON.stringify({ login: this.auth.username, app: APP_META.name, ts: Date.now() }),
    }
    try {
      // The wrapper mutates `this.auth`, setting token/expire/key on success.
      await HAS.authenticate(this.auth, APP_META, challenge_data, (evt: Evt) =>
        this.prompt({ kind: 'auth', uri: this.buildUri(evt), expire: evt.expire }),
      )
      return { username: this.auth.username }
    } catch (e) {
      // The request most often just expires because the WALLET never completed
      // its registration handshake with the HiveAuth server (it gets stuck on
      // "registering account…" when its stored key doesn't match the account's
      // on-chain key). Say so, rather than dying silently.
      const raw = (e as { error?: string })?.error || (e as Error)?.message || String(e)
      throw new Error(
        `HiveAuth didn't complete (${raw}). If your wallet showed "registering account…" and then stopped, it couldn't register with the HiveAuth server — re-add the account in your wallet (check its memo key), or use Hive Keychain on desktop.`,
      )
    } finally {
      this.prompt(null)
    }
  }

  private ensure() {
    if (!this.valid) throw new Error('Your Hive session expired — sign in again.')
  }

  private async broadcast(action: string, ops: unknown[]): Promise<void> {
    this.ensure()
    try {
      await HAS.broadcast(this.auth, 'posting', ops, (evt: Evt) =>
        this.prompt({ kind: 'sign', expire: evt.expire, action }),
      )
    } finally {
      this.prompt(null)
    }
  }

  vote(author: string, permlink: string, weightPct: VoteWeightPct): Promise<void> {
    const weight = Math.max(-10000, Math.min(10000, Math.round(weightPct * 100)))
    return this.broadcast('Upvote', [['vote', { voter: this.auth.username, author, permlink, weight }]])
  }

  reblog(author: string, permlink: string): Promise<void> {
    return this.broadcast('Reblog', [
      postingCustomJson(this.auth.username, 'reblog', ['reblog', { account: this.auth.username, author, permlink }]),
    ])
  }

  follow(account: string): Promise<void> {
    return this.broadcast('Follow', [
      postingCustomJson(this.auth.username, 'follow', [
        'follow',
        { follower: this.auth.username, following: account, what: ['blog'] },
      ]),
    ])
  }

  comment(parentAuthor: string, parentPermlink: string, body: string): Promise<void> {
    const permlink = `re-${parentPermlink}-${Date.now().toString(36)}`.slice(0, 255)
    const op = [
      'comment',
      {
        parent_author: parentAuthor,
        parent_permlink: parentPermlink,
        author: this.auth.username,
        permlink,
        title: '',
        body,
        json_metadata: JSON.stringify({ app: 'waggle/0.1' }),
      },
    ]
    return this.broadcast('Comment', [op])
  }

  async sign(message: string): Promise<string> {
    this.ensure()
    try {
      const res: Evt = await HAS.challenge(this.auth, { key_type: 'posting', challenge: message }, (evt: Evt) =>
        this.prompt({ kind: 'sign', expire: evt.expire, action: 'Sign' }),
      )
      return res.data.challenge as string
    } finally {
      this.prompt(null)
    }
  }
}
