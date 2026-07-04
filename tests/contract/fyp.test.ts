import { describe, it, expect } from 'vitest'

// Contract tests: assert the SHAPE of the live HAF_FYP API for the two journeys
// (new vs existing user). These guard against upstream surprises like "the feed
// strips json_metadata.video" or "reputation is already display-scaled". They
// hit the network — run with `npm run test:contract`.

const BASE = 'https://testapi.hivescan.info/haf-fyp-api'
// A user known to have an interest vector (bootstrapped for cold-start testing).
const EXISTING_USER = 'sample.user'
// A username unlikely to exist / have a vector → the "new user" cold-start path.
const NEW_USER = 'zzq-nonexistent-user-949331'

async function getJson(path: string) {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: 'application/json' } })
  expect(res.ok, `${path} → ${res.status}`).toBe(true)
  return res.json()
}

function asRow<T>(data: unknown): T {
  return (Array.isArray(data) ? data[0] : data) as T
}

describe('HAF_FYP global feed (Discover)', () => {
  it('returns ranked posts with the expected fyp shape', async () => {
    const posts = await getJson('/v1/fyp/global?page=1&page-size=5')
    expect(Array.isArray(posts)).toBe(true)
    expect(posts.length).toBeGreaterThan(0)
    const p = posts[0]
    // Core Hive fields the UI reads.
    expect(typeof p.author).toBe('string')
    expect(typeof p.permlink).toBe('string')
    expect(typeof p.title).toBe('string')
    // The nested ranking object (the "Why you're seeing this" panel).
    expect(p.fyp).toBeTruthy()
    expect(typeof p.fyp.final_score).toBe('number')
    for (const k of ['score_recency', 'score_engagement', 'score_credibility'] as const) {
      expect(typeof p.fyp[k], `fyp.${k}`).toBe('number')
    }
    // score_relevance is nullable (null at cold-start / no embedding).
    expect(p.fyp.score_relevance === null || typeof p.fyp.score_relevance === 'number').toBe(true)
  })
})

describe('profile — new vs existing user (cold-start detection)', () => {
  it('returns a row even for an unknown user, with has_vector=false', async () => {
    const profile = asRow<{ has_vector: boolean; has_feed: boolean }>(
      await getJson(`/v1/fyp/profile/${encodeURIComponent(NEW_USER)}`),
    )
    expect(profile).toBeTruthy()
    expect(typeof profile.has_vector).toBe('boolean')
    expect(profile.has_vector).toBe(false) // drives the interest-picker cold-start UX
  })

  it('reports a boolean has_vector for an existing user', async () => {
    const profile = asRow<{ has_vector: boolean; has_feed: boolean; top_communities?: unknown }>(
      await getJson(`/v1/fyp/profile/${encodeURIComponent(EXISTING_USER)}`),
    )
    expect(profile).toBeTruthy()
    expect(typeof profile.has_vector).toBe('boolean')
    expect(typeof profile.has_feed).toBe('boolean')
  })
})

describe('personalized feed (For You)', () => {
  it('returns posts tagged with a fyp.source for a user', async () => {
    const posts = await getJson(`/v1/fyp/feed/${encodeURIComponent(EXISTING_USER)}?page=1&page-size=5`)
    expect(Array.isArray(posts)).toBe(true)
    if (posts.length) {
      const src = posts[0].fyp?.source
      expect(['personalized', 'global', undefined]).toContain(src)
    }
  })
})
