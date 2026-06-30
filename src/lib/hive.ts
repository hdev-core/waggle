// On-chain write layer. Provider-agnostic interface so the desktop Keychain path
// and a future WAX-backed HiveAuth (mobile QR) signer share one surface.
//
// Design note (answers "could we use WAX with FYP?"): for the Keychain path,
// Keychain itself builds, signs AND broadcasts every op — bundling @hiveio/wax
// just to construct a vote/custom_json would be redundant WASM. WAX earns its
// place for (a) the HiveAuth mobile signer and (b) typed HAF reads; both slot in
// behind this same Signer interface in M2.5 without touching FeedCard.

export type VoteWeightPct = number // 1..100 (UI). Hive op weight = pct * 100.

export interface Signer {
  readonly kind: 'keychain' | 'hiveauth'
  login(username: string): Promise<{ username: string }>
  vote(author: string, permlink: string, weightPct: VoteWeightPct): Promise<void>
  reblog(author: string, permlink: string): Promise<void>
  follow(account: string): Promise<void>
  comment(parentAuthor: string, parentPermlink: string, body: string): Promise<void>
}

interface KeychainResponse {
  success: boolean
  error?: string
  message?: string
}

// Minimal typing for the injected extension.
type Keychain = {
  requestSignBuffer: (a: string | null, m: string, k: string, cb: (r: KeychainResponse) => void, rpc?: string | null, t?: string) => void
  requestVote: (a: string, p: string, author: string, w: number, cb: (r: KeychainResponse) => void) => void
  requestCustomJson: (a: string | null, id: string, k: string, json: string, msg: string, cb: (r: KeychainResponse) => void) => void
  requestBroadcast: (a: string, ops: unknown[], k: string, cb: (r: KeychainResponse) => void) => void
}

declare global {
  interface Window {
    hive_keychain?: Keychain
  }
}

export function hasKeychain(): boolean {
  return typeof window !== 'undefined' && !!window.hive_keychain
}

function kc(): Keychain {
  if (!window.hive_keychain) throw new Error('Hive Keychain not found. Install the browser extension to sign in.')
  return window.hive_keychain
}

function run(fn: (cb: (r: KeychainResponse) => void) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    fn((r) => (r && r.success ? resolve() : reject(new Error(r?.message || r?.error || 'Keychain request failed'))))
  })
}

export class KeychainSigner implements Signer {
  readonly kind = 'keychain' as const
  private user: string | null = null

  async login(username: string): Promise<{ username: string }> {
    const name = username.trim().replace(/^@/, '').toLowerCase()
    if (!name) throw new Error('Enter a username')
    // Prove key ownership by signing a challenge with the posting key.
    await run((cb) =>
      kc().requestSignBuffer(name, `Login to HiveFY @ ${name}`, 'Posting', cb, null, 'HiveFY'),
    )
    this.user = name
    return { username: name }
  }

  private me(): string {
    if (!this.user) throw new Error('Not signed in')
    return this.user
  }

  vote(author: string, permlink: string, weightPct: VoteWeightPct): Promise<void> {
    const weight = Math.max(-10000, Math.min(10000, Math.round(weightPct * 100)))
    return run((cb) => kc().requestVote(this.me(), permlink, author, weight, cb))
  }

  reblog(author: string, permlink: string): Promise<void> {
    const json = JSON.stringify(['reblog', { account: this.me(), author, permlink }])
    return run((cb) => kc().requestCustomJson(this.me(), 'reblog', 'Posting', json, 'Reblog', cb))
  }

  follow(account: string): Promise<void> {
    const json = JSON.stringify(['follow', { follower: this.me(), following: account, what: ['blog'] }])
    return run((cb) => kc().requestCustomJson(this.me(), 'follow', 'Posting', json, 'Follow', cb))
  }

  comment(parentAuthor: string, parentPermlink: string, body: string): Promise<void> {
    const me = this.me()
    const permlink = `re-${parentPermlink}-${Date.now().toString(36)}`.slice(0, 255)
    const op = [
      'comment',
      {
        parent_author: parentAuthor,
        parent_permlink: parentPermlink,
        author: me,
        permlink,
        title: '',
        body,
        json_metadata: JSON.stringify({ app: 'hivefy/0.1' }),
      },
    ]
    return run((cb) => kc().requestBroadcast(me, [op], 'Posting', cb))
  }
}
