import { describe, it, expect } from 'vitest'
import {
  extractHero,
  proxiedImage,
  unproxyImage,
  displayReputation,
  metaTags,
  contentWarning,
  payoutOf,
  excerpt,
  parseMeta,
} from './post'
import type { FypPost } from './types'

// Minimal post factory — only the fields these helpers read.
function post(p: Partial<FypPost>): FypPost {
  return { author: 'alice', permlink: 'p1', title: 'T', body: '', created: '2026-07-01T00:00:00', ...p } as FypPost
}

describe('proxiedImage', () => {
  it('wraps a normal URL through the Hive proxy at the target width', () => {
    expect(proxiedImage('https://example.com/a.jpg')).toBe('https://images.hive.blog/720x0/https://example.com/a.jpg')
    expect(proxiedImage('https://example.com/a.jpg', 640)).toBe('https://images.hive.blog/640x0/https://example.com/a.jpg')
  })
  it('strips an existing proxy size prefix so it never double-proxies', () => {
    expect(proxiedImage('https://images.hive.blog/1024x0/https://x/y.png')).toBe(
      'https://images.hive.blog/720x0/https://x/y.png',
    )
  })
  it('serves files.peakd.com directly (the proxy 403s those)', () => {
    const url = 'https://files.peakd.com/file/peakd-hive/alice/abc.jpg'
    expect(proxiedImage(url)).toBe(url)
  })
})

describe('unproxyImage', () => {
  it('reverses a proxied URL back to the original', () => {
    expect(unproxyImage('https://images.hive.blog/720x0/https://example.com/a.jpg')).toBe('https://example.com/a.jpg')
  })
  it('leaves a non-proxied URL unchanged', () => {
    expect(unproxyImage('https://example.com/a.jpg')).toBe('https://example.com/a.jpg')
  })
})

describe('extractHero', () => {
  it('detects a YouTube watch URL as a video embed', () => {
    const h = extractHero(post({ body: 'see https://www.youtube.com/watch?v=dQw4w9WgXcQ now' }))
    expect(h.kind).toBe('video')
    expect(h.embedUrl).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ')
    expect(h.poster).toContain('dQw4w9WgXcQ')
  })

  it('detects a YouTube Shorts URL', () => {
    const h = extractHero(post({ body: 'https://youtube.com/shorts/SuVvOxFOLBU' }))
    expect(h.kind).toBe('video')
    expect(h.embedUrl).toBe('https://www.youtube.com/embed/SuVvOxFOLBU')
  })

  it('marks a 3Speak body URL for on-demand resolution by its video ref', () => {
    const h = extractHero(post({ author: 'aichanbot', body: 'https://play.3speak.tv/embed?v=aichanbot/daigm2d9' }))
    expect(h.kind).toBe('video')
    expect(h.resolve).toEqual({ author: 'aichanbot', permlink: 'daigm2d9' })
    expect(h.hls).toBeUndefined() // resolved later, not inline
  })

  it('uses an inline HLS manifest from json_metadata.video (ipfs → gateway)', () => {
    const h = extractHero(
      post({ json_metadata: { video: { info: { video_v2: 'ipfs://QmABC/manifest.m3u8' } } } as never }),
    )
    expect(h.kind).toBe('video')
    expect(h.hls).toBe('https://ipfs-3speak.b-cdn.net/ipfs/QmABC/manifest.m3u8')
  })

  it('detects a direct mp4', () => {
    const h = extractHero(post({ body: 'clip https://cdn.example.com/v.mp4' }))
    expect(h.kind).toBe('video')
    expect(h.src).toBe('https://cdn.example.com/v.mp4')
  })

  it('uses json_metadata.image (array) as an image hero', () => {
    const h = extractHero(post({ json_metadata: { image: ['https://img.example.com/a.jpg'] } }))
    expect(h.kind).toBe('image')
    expect(h.src).toBe('https://images.hive.blog/720x0/https://img.example.com/a.jpg')
  })

  it('normalises json_metadata.image given as a bare string', () => {
    const h = extractHero(post({ json_metadata: { image: 'https://img.example.com/a.jpg' } }))
    expect(h.kind).toBe('image')
    expect(h.src).toContain('img.example.com/a.jpg')
  })

  it('returns kind "none" for a text-only post', () => {
    expect(extractHero(post({ body: 'just words, no media' })).kind).toBe('none')
  })
})

describe('displayReputation', () => {
  it('returns already-display-scaled values rounded', () => {
    expect(displayReputation(84.57)).toBe(85)
  })
  it('converts a raw signed integer to the 25–75 scale', () => {
    expect(displayReputation(7.1e12)).toBeGreaterThan(50)
  })
  it('treats 0 / null as no reputation', () => {
    expect(displayReputation(0)).toBeNull()
    expect(displayReputation(undefined)).toBeNull()
  })
})

describe('metaTags', () => {
  it('reads a tags array', () => {
    expect(metaTags(post({ json_metadata: { tags: ['a', 'b'] } }))).toEqual(['a', 'b'])
  })
  it('splits a space/comma-separated tags string', () => {
    expect(metaTags(post({ json_metadata: { tags: 'a b,c' } }))).toEqual(['a', 'b', 'c'])
  })
  it('returns [] when absent', () => {
    expect(metaTags(post({}))).toEqual([])
  })
})

describe('contentWarning', () => {
  it('flags nsfw tags', () => {
    expect(contentWarning(post({ json_metadata: { tags: ['nsfw'] } }))?.label).toMatch(/NSFW/i)
  })
  it('flags moderation hide / blacklists', () => {
    expect(contentWarning(post({ stats: { hide: true } }))?.label).toMatch(/moderation/i)
    expect(contentWarning(post({ blacklists: ['x'] }))?.label).toMatch(/moderation/i)
  })
  it('flags gray (low-rated)', () => {
    expect(contentWarning(post({ stats: { gray: true } }))?.label).toMatch(/low-rated/i)
  })
  it('returns null for a clean post', () => {
    expect(contentWarning(post({ json_metadata: { tags: ['photography'] } }))).toBeNull()
  })
})

describe('payoutOf', () => {
  it('prefers payout, then pending_payout', () => {
    expect(payoutOf(post({ payout: 3.5 }))).toBe(3.5)
    expect(payoutOf(post({ pending_payout: 2.1 }))).toBe(2.1)
    expect(payoutOf(post({}))).toBe(0)
  })
})

describe('excerpt / parseMeta', () => {
  it('strips markdown/images/links to a clean text excerpt', () => {
    const e = excerpt('# Hi ![x](http://i/y.png) [link](http://z) **bold** http://bare/url text')
    expect(e).not.toMatch(/!\[|\]\(|https?:\/\//)
    expect(e).toContain('bold')
  })
  it('parseMeta tolerates a JSON string or object and bad JSON', () => {
    expect(parseMeta(post({ json_metadata: '{"tags":["a"]}' }))).toEqual({ tags: ['a'] })
    expect(parseMeta(post({ json_metadata: 'not json' }))).toEqual({})
  })
})
