import type { FypPost } from './types'
import { MOCK_FEED } from './mock'

// Base origin + path prefix for HAF_FYP. Live testapi serves the clean URLs
// under /haf-fyp-api and already sends Access-Control-Allow-Origin: *, so the
// browser can call it directly — no proxy, no BFF. Override with VITE_FYP_BASE.
const BASE =
  import.meta.env.VITE_FYP_BASE ?? 'https://testapi.hivescan.info/haf-fyp-api'

// Live by default; set VITE_USE_MOCK=true to render the bundled sample feed
// offline. We also fall back to mock automatically if a live fetch throws.
const USE_MOCK = (import.meta.env.VITE_USE_MOCK ?? 'false') === 'true'

async function getJson(path: string): Promise<FypPost[]> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`FYP ${path} → ${res.status}`)
  const data = await res.json()
  // PostgREST functions return an array; clean-URL nginx may wrap it. Normalize.
  return Array.isArray(data) ? data : (data.posts ?? data.result ?? [])
}

// HAF_FYP pages with page (1-based) + page-size (capped 50 server-side) over the
// cached top-~200 ranked posts. A short page (< pageSize) means end of cache.
export async function fetchGlobalFeed(page = 1, pageSize = 20): Promise<FypPost[]> {
  if (USE_MOCK) return page === 1 ? MOCK_FEED : []
  try {
    return await getJson(`/v1/fyp/global?page=${page}&page-size=${pageSize}`)
  } catch (e) {
    console.warn('global feed failed, using mock', e)
    return page === 1 ? MOCK_FEED : []
  }
}

export async function fetchPersonalizedFeed(
  username: string,
  page = 1,
  pageSize = 20,
): Promise<FypPost[]> {
  const asPersonalized = (ps: FypPost[]) =>
    ps.map((p) => ({ ...p, fyp: { ...p.fyp!, source: 'personalized' as const } }))
  if (USE_MOCK) return page === 1 ? asPersonalized(MOCK_FEED) : []
  try {
    return await getJson(`/v1/fyp/feed/${encodeURIComponent(username)}?page=${page}&page-size=${pageSize}`)
  } catch (e) {
    console.warn('personalized feed failed, using mock', e)
    return page === 1 ? asPersonalized(MOCK_FEED) : []
  }
}
