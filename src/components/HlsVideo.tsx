import { useEffect, useRef, useState } from 'react'
import { useMediaPrefs } from '../lib/mediaPrefs'
import { VideoOverlay } from './VideoOverlay'

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
        hls = new Hls({ maxBufferLength: 30 })
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
