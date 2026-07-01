import type { FypPost, PostJsonMetadata } from './types'

const IMG_PROXY = 'https://images.hive.blog'

export function parseMeta(post: FypPost): PostJsonMetadata {
  const m = post.json_metadata
  if (!m) return {}
  if (typeof m === 'string') {
    try {
      return JSON.parse(m) as PostJsonMetadata
    } catch {
      return {}
    }
  }
  return m
}

// Route an image through the Hive image proxy at a target width. A consistent,
// modest width (default 720) keeps payloads small and maximises proxy cache hits
// (each distinct size triggers a server-side resize on first request). Strips an
// existing proxy size prefix so we never double-proxy.
export function proxiedImage(url: string, width = 720): string {
  if (!url) return url
  const m = url.match(/^https?:\/\/images\.hive\.blog\/(?:\d+x\d+|p|0x0)\/(.+)$/)
  const original = m ? m[1] : url
  return `${IMG_PROXY}/${width}x0/${original}`
}

export interface HeroMedia {
  kind: 'image' | 'video' | 'none'
  src?: string
  poster?: string
  embedUrl?: string
}

const FIRST_MD_IMG = /!\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/i
const FIRST_HTML_IMG = /<img[^>]+src=["'](https?:\/\/[^"']+)["']/i
const YT_RE = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/i
const THREESPEAK_RE = /3speak\.tv\/watch\?v=([\w.-]+\/[\w-]+)/i
const MP4_RE = /(https?:\/\/[^\s)"']+\.mp4)/i

// Pick the best hero for a card: explicit json_metadata image, then any embed
// or image found in the body. Cheap, synchronous, no DOM.
export function extractHero(post: FypPost): HeroMedia {
  const meta = parseMeta(post)
  const body = post.body || ''

  const yt = body.match(YT_RE)
  if (yt) {
    return {
      kind: 'video',
      embedUrl: `https://www.youtube.com/embed/${yt[1]}`,
      poster: `https://img.youtube.com/vi/${yt[1]}/hqdefault.jpg`,
    }
  }
  const ts = body.match(THREESPEAK_RE)
  if (ts) {
    return { kind: 'video', embedUrl: `https://3speak.tv/embed?v=${ts[1]}` }
  }
  const mp4 = body.match(MP4_RE)
  if (mp4) return { kind: 'video', src: mp4[1] }

  // json_metadata.image is inconsistent across Hive apps: array, or a bare
  // string, or absent. Normalise to an array before searching.
  const imgs = Array.isArray(meta.image) ? meta.image : meta.image ? [meta.image as string] : []
  const metaImg = imgs.find(Boolean)
  if (metaImg) return { kind: 'image', src: proxiedImage(metaImg) }

  const mdImg = body.match(FIRST_MD_IMG)?.[1]
  if (mdImg) return { kind: 'image', src: proxiedImage(mdImg) }

  const htmlImg = body.match(FIRST_HTML_IMG)?.[1]
  if (htmlImg) return { kind: 'image', src: proxiedImage(htmlImg) }

  return { kind: 'none' }
}

// A clean plain-text excerpt from markdown for the card overlay. Strips images,
// links-to-text, html, headings, emphasis. Not a full renderer — that lands in M3.
export function excerpt(body: string, max = 220): string {
  const text = (body || '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links → text
    .replace(/<[^>]+>/g, ' ') // html tags
    .replace(/[#>*_`~]/g, '') // md punctuation
    .replace(/https?:\/\/\S+/g, '') // bare urls
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > max ? text.slice(0, max).trimEnd() + '…' : text
}

// Reputation may arrive already on the ~25–75 display scale (live FYP gives
// e.g. 84.57) or as a raw signed integer (e.g. 7.1e12). Normalize both.
export function displayReputation(rep?: number): number | null {
  if (rep == null || rep === 0) return null
  if (Math.abs(rep) < 1000) return Math.round(rep) // already display-scale
  const neg = rep < 0
  let log = Math.log10(Math.abs(rep))
  log = Math.max(log - 9, 0)
  log = neg ? -log : log
  return Math.round(log * 9 + 25)
}

export function payoutOf(post: FypPost): number {
  return Number(post.payout ?? post.pending_payout ?? 0)
}

// A content gate reason, if the post should be blurred/collapsed by default.
// Honors Hive's nsfw tag and the bridge's moderation signals (mutes/blacklists,
// gray/hide flags). Returns null when the post is safe to show outright.
export function contentWarning(post: FypPost): { label: string } | null {
  const tags = metaTags(post)
  if (tags.includes('nsfw') || tags.includes('nsfl')) return { label: 'Sensitive content (NSFW)' }
  if (post.stats?.hide || (post.blacklists && post.blacklists.length > 0)) return { label: 'Hidden by moderation' }
  if (post.stats?.gray) return { label: 'Low-rated content' }
  return null
}

// tags is an array on most apps but occasionally a bare/space-separated string.
export function metaTags(post: FypPost): string[] {
  const t = parseMeta(post).tags
  if (Array.isArray(t)) return t.filter(Boolean)
  if (typeof t === 'string') return t.split(/[\s,]+/).filter(Boolean)
  return []
}
