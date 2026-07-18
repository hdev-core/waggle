import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Default-OFF is a safety property (nothing emits in prod until the flag is
// flipped), so it gets its own assertion. The enabled path re-imports the
// module with VITE_TELEMETRY=true and fake timers so no real flush fires.

describe('telemetry — disabled by default', () => {
  it('reports disabled and enqueues nothing', async () => {
    const { telemetry } = await import('./telemetry')
    telemetry._reset()
    expect(telemetry.enabled).toBe(false)
    telemetry.impression({ postId: '1', rank: 2, source: 'personalized', algoVersion: 'v7', dwellMs: 1500 })
    telemetry.action({ postId: '1', kind: 'vote' })
    telemetry.open({ postId: '1', rank: 2, source: 'personalized' })
    expect(telemetry._peek()).toHaveLength(0)
  })
})

describe('telemetry — enabled', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('VITE_TELEMETRY', 'true')
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllEnvs()
  })

  it('queues well-formed events and rounds dwell', async () => {
    const { telemetry } = await import('./telemetry')
    telemetry._reset()
    expect(telemetry.enabled).toBe(true)

    telemetry.impression({ postId: '9', rank: 3, source: 'global', algoVersion: null, dwellMs: 1234.7 })
    telemetry.action({ postId: '9', kind: 'reblog' })

    const q = telemetry._peek()
    expect(q).toHaveLength(2)
    expect(q[0]).toMatchObject({ t: 'impression', post_id: '9', rank: 3, source: 'global', algo_version: null, dwell_ms: 1235 })
    expect(q[1]).toMatchObject({ t: 'action', post_id: '9', kind: 'reblog' })
    expect(typeof q[0].ts).toBe('number')
    telemetry._reset()
  })
})
