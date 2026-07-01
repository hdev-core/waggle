// Read-only Hive RPC client. Comments live on-chain (not in HAF_FYP), so we read
// the discussion thread from a public Hive node. Public nodes send
// Access-Control-Allow-Origin: * so the browser can call them directly.
const RPC = import.meta.env.VITE_HIVE_RPC ?? 'https://api.hive.blog'

async function rpc<T>(method: string, params: unknown): Promise<T> {
  const res = await fetch(RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method, params, id: 1 }),
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error.message || 'RPC error')
  return data.result as T
}

export interface HiveComment {
  author: string
  permlink: string
  body: string
  created: string
  net_votes: number
  children: number
  author_reputation: number
  pending_payout_value: string // e.g. "0.123 HBD"
  total_payout_value: string
  depth: number
}

// Direct replies to a post (one level). Each carries a `children` count we can
// surface as "N replies" without loading the nested tree (expandable later).
export function getReplies(author: string, permlink: string): Promise<HiveComment[]> {
  return rpc<HiveComment[]>('condenser_api.get_content_replies', [author, permlink])
}

export function commentPayout(c: HiveComment): number {
  const pending = parseFloat(c.pending_payout_value) || 0
  const paid = parseFloat(c.total_payout_value) || 0
  return pending > 0 ? pending : paid
}

// Hive timestamps are UTC without a zone suffix.
export function timeAgo(iso: string): string {
  const then = new Date(iso.endsWith('Z') ? iso : iso + 'Z').getTime()
  const s = Math.max(0, Math.floor((Date.now() - then) / 1000))
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}d`
  const mo = Math.floor(d / 30)
  return mo < 12 ? `${mo}mo` : `${Math.floor(mo / 12)}y`
}

export function avatarUrl(account: string, size: 'small' | 'medium' = 'small'): string {
  return `https://images.hive.blog/u/${account}/avatar/${size}`
}

export interface HiveCommunity {
  name: string // "hive-163772"
  title: string
  about: string
  subscribers: number
}

// Popular communities for the cold-start interest picker, ranked by activity.
export function listCommunities(limit = 80): Promise<HiveCommunity[]> {
  return rpc<HiveCommunity[]>('bridge.list_communities', { sort: 'rank', limit })
}

// FYP's community_id is the numeric suffix of the "hive-NNNNNN" name
// (processor does REPLACE(name,'hive-','')::INT), so we derive it client-side.
export function communityIdFromName(name: string): number {
  return parseInt(name.replace(/^hive-/, ''), 10)
}
