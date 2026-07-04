import { useEffect, useState } from 'react'
import { proxiedImage, type HeroMedia } from './post'

// The FYP feed trims json_metadata (dropping the `video` block), so 3Speak posts
// arrive with only a body URL and no playable source. We resolve the real HLS
// (.m3u8) stream on demand from 3Speak's own embed API — authoritative for every
// 3Speak format (new `video_v2`, old "reusable", and even videos that aren't a
// Hive mainnet post), and CORS-open. Results are cached; anything without a
// published stream resolves to null → "Video unavailable / Watch on 3Speak".
//
// `author`/`permlink` here are the 3Speak video ref from the embed URL
// (?v=author/permlink), which is what the API is keyed on.

const EMBED_API = 'https://play.3speak.tv/api/embed?v='

type Resolved = { hls?: string; poster?: string }
const cache = new Map<string, Resolved | null>()

interface EmbedResponse {
  success?: boolean
  status?: string
  videoUrl?: string
  videoUrlFallback1?: string
  thumbnail?: string
}

export async function resolveVideo(author: string, permlink: string): Promise<Resolved | null> {
  const key = `${author}/${permlink}`
  const hit = cache.get(key)
  if (hit !== undefined) return hit
  try {
    const res = await fetch(`${EMBED_API}${encodeURIComponent(author)}/${encodeURIComponent(permlink)}`)
    const j: EmbedResponse = await res.json()
    // Prefer the stable gateway (videoUrlFallback1 = ipfs-3speak.b-cdn.net) over
    // the hot node; both are CORS-open. HlsVideo picks a variant off the master.
    const m3u8 = j?.videoUrlFallback1 || j?.videoUrl
    if (!j?.success || j?.status !== 'published' || !m3u8) {
      cache.set(key, null)
      return null
    }
    const out: Resolved = { hls: m3u8, poster: j.thumbnail ? proxiedImage(j.thumbnail) : undefined }
    cache.set(key, out)
    return out
  } catch {
    cache.set(key, null)
    return null
  }
}

export type VideoStatus = 'ready' | 'loading' | 'unavailable' | 'none'

// Resolves a hero's playable source. Inline HLS (from full metadata) is used as
// is; a `resolve` marker triggers an on-demand RPC lookup.
export function useResolvedVideo(hero: HeroMedia): { hls?: string; poster?: string; status: VideoStatus } {
  const [r, setR] = useState<Resolved | null | undefined>(undefined)
  const author = hero.resolve?.author
  const permlink = hero.resolve?.permlink

  useEffect(() => {
    if (hero.hls || !author || !permlink) {
      setR(undefined)
      return
    }
    let live = true
    setR(undefined)
    resolveVideo(author, permlink).then((x) => {
      if (live) setR(x)
    })
    return () => {
      live = false
    }
  }, [hero.hls, author, permlink])

  if (hero.hls) return { hls: hero.hls, poster: hero.poster, status: 'ready' }
  if (!author) return { poster: hero.poster, status: 'none' } // mp4/youtube handled by caller
  if (r === undefined) return { poster: hero.poster, status: 'loading' }
  if (r === null) return { poster: hero.poster, status: 'unavailable' }
  return { hls: r.hls, poster: r.poster || hero.poster, status: 'ready' }
}
