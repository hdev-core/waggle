// Impression / engagement telemetry emitter (haf_fyp #12).
//
// Best-effort, batched, fire-and-forget. Records what the user SAW (impressions
// with rank/source/algo_version + dwell), post opens and on-chain actions, so
// feed quality can be measured (CTR@rank, dwell) and the ranker A/B-tuned.
//
// OFF unless VITE_TELEMETRY=true. Kept disabled by default so nothing emits in
// production until the backend retention/rollup follow-up lands (agreed on the
// ingest MR). Flip the flag to enable once that's in and the endpoint deployed.

const ENABLED = (import.meta.env.VITE_TELEMETRY ?? 'false') === 'true'
const ENDPOINT =
  (import.meta.env.VITE_FYP_ADMIN_BASE ?? 'https://testapi.hivescan.info/haf-fyp-admin') + '/v1/fyp/events'

const SESSION_KEY = 'waggle.telemetry.session'
const USER_KEY = 'hivefy.username' // read (not owned) — non-authoritative
const FLUSH_MS = 10_000
const MAX_BATCH = 200 // server cap
const FLUSH_AT = 40 // flush early once the queue reaches this

type Source = 'personalized' | 'global'
type ActionKind = 'vote' | 'comment' | 'reblog' | 'follow'

interface Event {
  t: 'impression' | 'open' | 'video' | 'action'
  post_id?: string // #12: string, id > 2^53 (never Number())
  rank?: number
  source?: Source
  algo_version?: string | null
  dwell_ms?: number
  watch_ms?: number
  duration_ms?: number
  kind?: ActionKind
  ts: number
}

let queue: Event[] = []
let timer: ReturnType<typeof setTimeout> | null = null

function sessionId(): string {
  try {
    let s = localStorage.getItem(SESSION_KEY)
    if (!s) {
      s = crypto?.randomUUID?.() ?? `s-${Date.now()}-${Math.random().toString(36).slice(2)}`
      localStorage.setItem(SESSION_KEY, s)
    }
    return s
  } catch {
    return 's-anon'
  }
}

function currentUser(): string | null {
  try {
    return localStorage.getItem(USER_KEY)
  } catch {
    return null
  }
}

function flush(beacon = false): void {
  if (!queue.length) return
  const events = queue.slice(0, MAX_BATCH)
  queue = queue.slice(MAX_BATCH)
  const body = JSON.stringify({ session: sessionId(), username: currentUser(), events })
  try {
    if (beacon && typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'application/json' }))
    } else {
      // keepalive lets the request outlive a navigation on a normal flush.
      void fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {})
    }
  } catch {
    /* best-effort — telemetry must never disrupt the app */
  }
  if (queue.length) scheduleFlush()
}

function scheduleFlush(): void {
  if (timer != null) return
  timer = setTimeout(() => {
    timer = null
    flush()
  }, FLUSH_MS)
}

function enqueue(ev: Event): void {
  if (!ENABLED) return
  queue.push(ev)
  if (queue.length >= FLUSH_AT) flush()
  else scheduleFlush()
}

// Flush on tab-hide / unload — sendBeacon survives the navigation.
if (ENABLED && typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush(true)
  })
  window.addEventListener('pagehide', () => flush(true))
}

export interface PostMeta {
  postId?: string
  rank?: number
  source?: Source
  algoVersion?: string | null
}

export const telemetry = {
  enabled: ENABLED,
  impression(m: PostMeta & { dwellMs: number }): void {
    enqueue({
      t: 'impression',
      post_id: m.postId,
      rank: m.rank,
      source: m.source,
      algo_version: m.algoVersion,
      dwell_ms: Math.round(m.dwellMs),
      ts: Date.now(),
    })
  },
  open(m: PostMeta): void {
    enqueue({ t: 'open', post_id: m.postId, rank: m.rank, source: m.source, algo_version: m.algoVersion, ts: Date.now() })
  },
  action(m: { postId?: string; kind: ActionKind }): void {
    enqueue({ t: 'action', post_id: m.postId, kind: m.kind, ts: Date.now() })
  },
  // test-only: inspect/reset the pending queue
  _peek(): Event[] {
    return queue
  },
  _reset(): void {
    queue = []
  },
}
