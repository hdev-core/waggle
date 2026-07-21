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

  it('emits a rounded video sample and clamps watch/duration to 24h', async () => {
    const { telemetry } = await import('./telemetry')
    telemetry._reset()

    telemetry.video({ postId: '9', rank: 1, source: 'personalized', algoVersion: 'v7', watchMs: 8200.4, durationMs: 30000 })
    // A long-parked looping clip: watch_ms outruns the 24h backend cap and must
    // be clamped (else the whole batch 422s).
    const DAY = 24 * 60 * 60 * 1000
    telemetry.video({ postId: '9', watchMs: DAY + 5000, durationMs: DAY + 5000 })

    const q = telemetry._peek()
    expect(q).toHaveLength(2)
    expect(q[0]).toMatchObject({
      t: 'video', post_id: '9', rank: 1, source: 'personalized', algo_version: 'v7',
      watch_ms: 8200, duration_ms: 30000,
    })
    expect(q[1]).toMatchObject({ t: 'video', watch_ms: DAY, duration_ms: DAY })
    telemetry._reset()
  })
})
