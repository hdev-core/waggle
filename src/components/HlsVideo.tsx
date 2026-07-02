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
        // Many 3Speak master playlists declare only the audio codec in CODECS
        // (e.g. CODECS="mp4a.40.2" with no avc1), so hls.js sets videoCodec=
        // undefined and builds an audio-only pipeline → sound but no picture
        // (the .ts segments are actually muxed H.264+AAC). Inject a generic
        // H.264 codec so hls.js creates the video buffer; the decoder handles
        // the real profile from the segments. Verified against hls.js's parser.
        /* eslint-disable @typescript-eslint/no-explicit-any */
        const Base: any = Hls.DefaultConfig.loader
        class FixCodecsLoader extends Base {
          load(context: any, config: any, callbacks: any) {
            const orig = callbacks.onSuccess
            callbacks.onSuccess = (response: any, ...rest: any[]) => {
              if (typeof response?.data === 'string' && response.data.includes('#EXT-X-STREAM-INF')) {
                response.data = response.data.replace(/CODECS="([^"]*)"/g, (m: string, codecs: string) =>
                  /avc1|avc3|hvc1|hev1|vp0?9|av01/i.test(codecs) ? m : `CODECS="avc1.4d401f,${codecs}"`,
                )
              }
              orig(response, ...rest)
            }
            super.load(context, config, callbacks)
          }
        }
        /* eslint-enable @typescript-eslint/no-explicit-any */
        hls = new Hls({ maxBufferLength: 20, capLevelToPlayerSize: true, pLoader: FixCodecsLoader as never })
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
