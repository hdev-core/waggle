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

export async function fetchGlobalFeed(limit = 20): Promise<FypPost[]> {
  if (USE_MOCK) return MOCK_FEED
  try {
    return await getJson(`/v1/fyp/global?limit=${limit}`)
  } catch (e) {
    console.warn('global feed failed, using mock', e)
    return MOCK_FEED
  }
}

export async function fetchPersonalizedFeed(
  username: string,
  limit = 20,
): Promise<FypPost[]> {
  if (USE_MOCK)
    return MOCK_FEED.map((p) => ({ ...p, fyp: { ...p.fyp!, source: 'personalized' } }))
  try {
    return await getJson(`/v1/fyp/feed/${encodeURIComponent(username)}?limit=${limit}`)
  } catch (e) {
    console.warn('personalized feed failed, using mock', e)
    return MOCK_FEED.map((p) => ({ ...p, fyp: { ...p.fyp!, source: 'personalized' } }))
  }
}
