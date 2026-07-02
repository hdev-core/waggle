import { useEffect, useRef } from 'react'

// Choose a single variant (media playlist) from an HLS master. We deliberately
// bypass the master's CODECS attribute: many 3Speak masters declare only the
// audio codec (e.g. CODECS="mp4a.40.2", no avc1), which makes players build an
// audio-only pipeline → sound but no picture. A media playlist carries no codec
// hint, so hls.js reads the real codec from the (muxed H.264+AAC) segments.
// Prefer the highest rendition <=720p (feed-friendly), else the smallest.
function pickVariant(master: string, baseUrl: string): string | null {
  const lines = master.split(/\r?\n/)
  const variants: { h: number; uri: string }[] = []
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('#EXT-X-STREAM-INF')) {
      const m = lines[i].match(/RESOLUTION=\d+x(\d+)/i)
      const uri = lines[i + 1]?.trim()
      if (uri && !uri.startsWith('#')) variants.push({ h: m ? parseInt(m[1], 10) : 0, uri })
    }
  }
  if (!variants.length) return null
  const le720 = variants.filter((v) => v.h && v.h <= 720).sort((a, b) => b.h - a.h)
  const chosen = le720[0] || [...variants].sort((a, b) => a.h - b.h)[0]
  try {
    return new URL(chosen.uri, baseUrl).href
  } catch {
    return null
  }
}

// Plays an HLS (.m3u8) stream — 3Speak / Hive-native video. Safari/iOS play HLS
// natively; other browsers get hls.js (loaded on demand so it never weighs down
// the initial bundle). The <video> is fully controlled via the ref so React's
// flaky `muted` attribute handling doesn't leave audio on when we want it off.
export function HlsVideo({
  src,
  poster,
  muted,
  autoPlay = true,
  controls = false,
  className,
}: {
  src: string
  poster?: string
  muted: boolean
  autoPlay?: boolean
  controls?: boolean
  className?: string
}) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return

    let cancelled = false
    let hls: import('hls.js').default | undefined

    async function start() {
      // Resolve master → a single variant media playlist (see pickVariant).
      let url = src
      try {
        const res = await fetch(src)
        const text = await res.text()
        if (text.includes('#EXT-X-STREAM-INF')) url = pickVariant(text, src) || src
      } catch {
        /* network hiccup — fall back to the master URL below */
      }
      if (cancelled || !video) return

      // Native HLS (Safari, iOS).
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url
        return
      }
      const { default: Hls } = await import('hls.js')
      if (cancelled) return
      if (Hls.isSupported()) {
        hls = new Hls({ maxBufferLength: 20 })
        hls.loadSource(url)
        hls.attachMedia(video)
      } else {
        video.src = url // last-ditch
      }
    }
    start()

    return () => {
      cancelled = true
      hls?.destroy()
    }
  }, [src])

  // Keep the muted property in sync (React's attribute handling is unreliable).
  useEffect(() => {
    if (ref.current) ref.current.muted = muted
  }, [muted])

  return (
    <video
      ref={ref}
      className={className}
      poster={poster}
      autoPlay={autoPlay}
      muted={muted}
      playsInline
      loop
      controls={controls}
    />
  )
}
