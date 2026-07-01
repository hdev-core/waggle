import { useEffect, useRef } from 'react'

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

    // Native HLS (Safari, iOS) — just point the element at the manifest.
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src
      return
    }

    let cancelled = false
    let hls: import('hls.js').default | undefined
    import('hls.js').then(({ default: Hls }) => {
      if (cancelled) return
      if (Hls.isSupported()) {
        hls = new Hls({ maxBufferLength: 20, capLevelToPlayerSize: true })
        hls.loadSource(src)
        hls.attachMedia(video)
      } else {
        video.src = src // last-ditch; may not play in unsupported browsers
      }
    })
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
