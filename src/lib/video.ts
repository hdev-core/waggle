import { useEffect, useState } from 'react'
import { proxiedImage, type HeroMedia } from './post'

// The FYP API trims json_metadata and drops the `video` block, so 3Speak posts
// arrive with only a body URL and no playable source. We resolve the actual HLS
// (.m3u8) stream on demand from the full on-chain post, then cache it. Synthetic
// test posts whose 3Speak permlink isn't a real Hive post resolve to null and
// fall back to an "unavailable" state instead of a dead embed link.

const RPC = import.meta.env.VITE_HIVE_RPC ?? 'https://api.hive.blog'
const IPFS_GATEWAY = 'https://ipfs-3speak.b-cdn.net/ipfs/'

function ipfsToHttp(u?: string): string | undefined {
  if (!u) return undefined
  return u.startsWith('ipfs://') ? IPFS_GATEWAY + u.slice('ipfs://'.length) : u
}

type Resolved = { hls?: string; poster?: string }
const cache = new Map<string, Resolved | null>()

interface VideoSource { url: string; type?: string; format?: string }
interface VideoInfo { video_v2?: string; ipfsThumbnail?: string; sourceMap?: VideoSource[] }

export async function resolveVideo(author: string, permlink: string): Promise<Resolved | null> {
  const key = `${author}/${permlink}`
  const hit = cache.get(key)
  if (hit !== undefined) return hit
  try {
    const res = await fetch(RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'bridge.get_post', params: { author, permlink }, id: 1 }),
    })
    const json = await res.json()
    const md = json?.result?.json_metadata
    const meta = typeof md === 'string' ? JSON.parse(md) : md || {}
    const info: VideoInfo | undefined = meta.video?.info || meta.video?.content
    const v2 =
      info?.video_v2 || (Array.isArray(info?.sourceMap) ? info!.sourceMap.find((s) => s.format === 'm3u8')?.url : undefined)
    if (!v2) {
      cache.set(key, null)
      return null
    }
    const thumb =
      (Array.isArray(info?.sourceMap) ? info!.sourceMap.find((s) => s.type === 'thumbnail')?.url : undefined) ||
      info?.ipfsThumbnail
    const th = ipfsToHttp(thumb)
    const out: Resolved = { hls: ipfsToHttp(v2), poster: th ? proxiedImage(th) : undefined }
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
