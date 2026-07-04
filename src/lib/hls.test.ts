import { describe, it, expect } from 'vitest'
import { pickVariant, fixMasterCodecs } from './hls'

const MASTER = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=6500000,RESOLUTION=1920x1080,CODECS="avc1.640028,mp4a.40.2"
1080p/index.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=3500000,RESOLUTION=1280x720,CODECS="avc1.64001F,mp4a.40.2"
720p/index.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=1800000,RESOLUTION=854x480,CODECS="avc1.4D401F,mp4a.40.2"
480p/index.m3u8`

describe('pickVariant', () => {
  it('picks the highest rendition <=720p and resolves it against the base URL', () => {
    const base = 'https://gw/ipfs/CID/manifest.m3u8'
    expect(pickVariant(MASTER, base)).toBe('https://gw/ipfs/CID/720p/index.m3u8')
  })

  it('falls back to the smallest when every rendition is above 720p', () => {
    const m = `#EXTM3U
#EXT-X-STREAM-INF:RESOLUTION=1920x1080
1080p/i.m3u8
#EXT-X-STREAM-INF:RESOLUTION=2560x1440
1440p/i.m3u8`
    expect(pickVariant(m, 'https://gw/x/master.m3u8')).toBe('https://gw/x/1080p/i.m3u8')
  })

  it('returns null when there are no variant streams', () => {
    expect(pickVariant('#EXTM3U\n#EXT-X-TARGETDURATION:6\nseg0.ts', 'https://gw/x/media.m3u8')).toBeNull()
  })
})

describe('fixMasterCodecs', () => {
  it('injects an H.264 codec into an audio-only CODECS attr', () => {
    const audioOnly = `#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=2000000,CODECS="mp4a.40.2",RESOLUTION=607x1080
1080p/index.m3u8`
    const out = fixMasterCodecs(audioOnly)
    expect(out).toContain('CODECS="avc1.4d401f,mp4a.40.2"')
  })

  it('leaves a CODECS attr that already lists a video codec untouched', () => {
    expect(fixMasterCodecs(MASTER)).toBe(MASTER)
  })

  it('is a no-op for a media playlist (no EXT-X-STREAM-INF)', () => {
    const media = '#EXTM3U\n#EXT-X-TARGETDURATION:6\nseg0.ts'
    expect(fixMasterCodecs(media)).toBe(media)
  })
})
