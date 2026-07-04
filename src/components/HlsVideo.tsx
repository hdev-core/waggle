import { useEffect, useRef, useState } from 'react'
import { useMediaPrefs } from '../lib/mediaPrefs'
import { pickVariant, fixMasterCodecs } from '../lib/hls'
import { VideoOverlay } from './VideoOverlay'

// Plays an HLS (.m3u8) stream — 3Speak / Hive-native video. Safari/iOS play HLS
// natively; other browsers get hls.js (loaded on demand). Two modes:
//  • feed (overlay): custom controls (VideoOverlay); auto-plays when `active`,
//    preloads otherwise so playback starts instantly on swipe.
//  • native: the browser's own controls (reader), user-driven.
export function HlsVideo({
  src,
  poster,
  className,
  active = true,
  overlay = false,
  native = false,
}: {
  src: string
  poster?: string
  className?: string
  active?: boolean
  overlay?: boolean
  native?: boolean
}) {
  const ref = useRef<HTMLVideoElement>(null)
  const scrubbing = useRef(false)
  const { muted, volume, speed } = useMediaPrefs()
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [paused, setPaused] = useState(true)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    let cancelled = false
    let hls: import('hls.js').default | undefined

    async function start() {
      let url = src
      try {
        const res = await fetch(src)
        const text = await res.text()
        if (text.includes('#EXT-X-STREAM-INF')) url = pickVariant(text, src) || src
      } catch {
        /* fall back to master */
      }
      if (cancelled || !video) return
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url
        return
      }
      const { default: Hls } = await import('hls.js')
      if (cancelled) return
      if (Hls.isSupported()) {
        // Safety net: if we couldn't pick a variant and fell back to a master
        // playlist, some 3Speak masters declare only the audio codec (no avc1),
        // yielding sound-but-no-picture. Inject a generic H.264 codec into any
        // video-less CODECS attr so hls.js builds the video track. No-op for
        // variant/media playlists (they have no EXT-X-STREAM-INF).
        /* eslint-disable @typescript-eslint/no-explicit-any */
        const Base: any = Hls.DefaultConfig.loader
        class FixCodecsLoader extends Base {
          load(context: any, config: any, callbacks: any) {
            const orig = callbacks.onSuccess
            callbacks.onSuccess = (response: any, ...rest: any[]) => {
              if (typeof response?.data === 'string') response.data = fixMasterCodecs(response.data)
              orig(response, ...rest)
            }
            super.load(context, config, callbacks)
          }
        }
        /* eslint-enable @typescript-eslint/no-explicit-any */
        hls = new Hls({ maxBufferLength: 30, pLoader: FixCodecsLoader as never })
        hls.loadSource(url)
        hls.attachMedia(video)
      } else {
        video.src = url
      }
    }
    start()
    return () => {
      cancelled = true
      hls?.destroy()
    }
  }, [src])

  // Apply global prefs to the element.
  useEffect(() => {
    if (ref.current) ref.current.muted = native ? false : muted
  }, [muted, native])
  useEffect(() => {
    if (ref.current) ref.current.volume = volume
  }, [volume])
  useEffect(() => {
    if (ref.current) ref.current.playbackRate = speed
  }, [speed])

  // Feed mode: play ONLY while this is the active (centered) slide. Preloaded
  // neighbors buffer but must never play — else you'd hear a video that isn't on
  // screen. If autoplay-with-sound is blocked, retry muted so it never stalls.
  useEffect(() => {
    if (native) return
    const video = ref.current
    if (!video) return
    if (active) {
      video.playbackRate = speed
      video.play().catch(() => {
        video.muted = true
        video.play().catch(() => {})
      })
    } else {
      video.pause()
      video.currentTime = 0
    }
  }, [active, native, speed])

  return (
    <div className={`hls ${className ?? ''}`}>
      <video
        ref={ref}
        className="hls__video"
        poster={poster}
        preload="auto"
        playsInline
        loop
        controls={native}
        onPlay={() => setPaused(false)}
        onPause={() => setPaused(true)}
        onTimeUpdate={() => {
          if (!scrubbing.current && ref.current) setCurrent(ref.current.currentTime)
        }}
        onDurationChange={() => {
          const d = ref.current?.duration
          if (d && isFinite(d)) setDuration(d)
        }}
        onLoadedMetadata={() => {
          if (ref.current) {
            const d = ref.current.duration
            if (d && isFinite(d)) setDuration(d)
            ref.current.playbackRate = speed
          }
        }}
      />

      {overlay && !native && (
        <VideoOverlay
          paused={paused}
          current={current}
          duration={duration}
          onTogglePlay={() => {
            const v = ref.current
            if (!v) return
            v.paused ? v.play().catch(() => {}) : v.pause()
          }}
          onSeek={(t) => {
            if (ref.current) ref.current.currentTime = t
            setCurrent(t)
          }}
          onScrubStart={() => (scrubbing.current = true)}
          onScrubEnd={() => (scrubbing.current = false)}
        />
      )}
    </div>
  )
}
