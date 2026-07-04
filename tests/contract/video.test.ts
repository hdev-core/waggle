import { describe, it, expect } from 'vitest'
import { resolveVideo } from '../../src/lib/video'

// Contract test for the 3Speak resolver: the embed API must return a playable
// m3u8 for a real video and null for a bogus one. Network — `npm run test:contract`.
describe('resolveVideo via 3Speak embed API', () => {
  it('resolves a real 3Speak video to a CORS-open m3u8', async () => {
    const r = await resolveVideo('aichanbot', 'daigm2d9')
    expect(r).not.toBeNull()
    expect(r!.hls).toMatch(/\.m3u8$/)
    // Verify the returned manifest is actually fetchable + CORS-open.
    const res = await fetch(r!.hls!, { headers: { Origin: 'https://x.io' } as HeadersInit })
    expect(res.ok).toBe(true)
    expect(res.headers.get('access-control-allow-origin')).toBe('*')
  })

  it('returns null for a video that does not exist', async () => {
    const r = await resolveVideo('aichanbot', 'definitely-not-a-real-video-000')
    expect(r).toBeNull()
  })
})
