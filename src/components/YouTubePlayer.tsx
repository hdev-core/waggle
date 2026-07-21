import { useEffect, useRef, useState } from 'react'
import { useMediaPrefs } from '../lib/mediaPrefs'
import { useWatchTime } from '../lib/useWatchTime'
import type { PostMeta } from '../lib/telemetry'
import { VideoOverlay } from './VideoOverlay'

/* eslint-disable @typescript-eslint/no-explicit-any */

// Load the YouTube IFrame API once and resolve when YT.Player is available.
let ytReady: Promise<any> | null = null
function loadYT(): Promise<any> {
  if (ytReady) return ytReady
  ytReady = new Promise((resolve) => {
    const w = window as any
    if (w.YT?.Player) return resolve(w.YT)
    const prev = w.onYouTubeIframeAPIReady
    w.onYouTubeIframeAPIReady = () => {
      prev?.()
      resolve(w.YT)
    }
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
    }
  })
  return ytReady
}

// Warm the IFrame API ahead of time (call when a YouTube card nears the
// viewport) so the first player boots without paying the script-load cost.
export function preloadYT() {
  loadYT()
}

// Plays a YouTube video via the IFrame API (not a bare iframe), so mute, volume,
// speed and seek all work through the shared VideoOverlay without reloading the
// player (a bare iframe would restart at 0 on every change). Auto-plays when
// `active`, pauses + rewinds otherwise so only the on-screen video plays.
export function YouTubePlayer({
  videoId,
  poster,
  className,
  active = true,
  meta,
}: {
  videoId: string
  poster?: string
  className?: string
  active?: boolean
  meta?: PostMeta
}) {
  const mountRef = useRef<HTMLDivElement>(null)
  const player = useRef<any>(null)
  const scrubbing = useRef(false)
  const { muted, volume, speed } = useMediaPrefs()
  // Latest sound prefs, readable inside the active-effect without making it a
  // dependency (so adjusting volume mid-play doesn't restart the video).
  const prefs = useRef({ muted, volume, speed })
  prefs.current = { muted, volume, speed }
  const [ready, setReady] = useState(false)
  const [paused, setPaused] = useState(true)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)

  // #12: sample real watch-time (YT's BUFFERING/PAUSED states already read as not-playing).
  useWatchTime(!paused, duration, meta)

  function applyPrefs(p: any) {
    if (!p) return
    try {
      if (muted || volume === 0) p.mute()
      else {
        p.unMute()
        p.setVolume(Math.round(volume * 100))
      }
      p.setPlaybackRate(speed)
    } catch {
      /* player not ready */
    }
  }

  // Create the player. YT replaces the inner element with an iframe, so we give
  // it a throwaway child div and keep the outer container React-managed.
  useEffect(() => {
    let destroyed = false
    loadYT().then((YT) => {
      if (destroyed || !mountRef.current) return
      const host = document.createElement('div')
      mountRef.current.appendChild(host)
      player.current = new YT.Player(host, {
        videoId,
        playerVars: {
          controls: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          iv_load_policy: 3,
          fs: 0,
          disablekb: 1,
        },
        events: {
          onReady: (e: any) => {
            setReady(true)
            setDuration(e.target.getDuration() || 0)
          },
          onStateChange: (e: any) => {
            setPaused(e.data !== YT.PlayerState.PLAYING)
            const d = e.target.getDuration?.()
            if (d) setDuration(d)
          },
        },
      })
    })
    return () => {
      destroyed = true
      try {
        player.current?.destroy?.()
      } catch {
        /* noop */
      }
      player.current = null
    }
  }, [videoId])

  // Poll current time for the seek bar.
  useEffect(() => {
    if (!ready) return
    const id = window.setInterval(() => {
      const p = player.current
      if (p && !scrubbing.current && p.getCurrentTime) setCurrent(p.getCurrentTime() || 0)
    }, 250)
    return () => window.clearInterval(id)
  }, [ready])

  // Apply prefs on live change (user toggles sound/speed while watching — a
  // gesture is present, so unmute produces sound immediately).
  useEffect(() => {
    applyPrefs(player.current)
  }, [muted, volume, speed])

  // Play only while active; pause + rewind otherwise. Browsers block autoplay
  // WITH sound, so we always start MUTED (guaranteeing playback), then restore
  // the user's sound preference a beat later. If the page has sticky user
  // activation (any earlier tap) the unmute produces sound; if not, the video
  // still plays muted rather than freezing on a play button.
  useEffect(() => {
    const p = player.current
    if (!ready || !p) return
    if (!active) {
      p.pauseVideo?.()
      p.seekTo?.(0, true)
      return
    }
    try {
      p.setPlaybackRate?.(prefs.current.speed)
      p.mute?.()
      p.playVideo?.()
    } catch {
      /* not ready */
    }
    if (prefs.current.muted || prefs.current.volume === 0) return
    const t = window.setTimeout(() => {
      try {
        player.current?.unMute?.()
        player.current?.setVolume?.(Math.round(prefs.current.volume * 100))
      } catch {
        /* noop */
      }
    }, 400)
    return () => window.clearTimeout(t)
  }, [active, ready])

  return (
    <div className={`hls ${className ?? ''}`}>
      <div className="hls__video hls__yt" ref={mountRef} />
      {poster && !ready && <img className="hls__video" src={poster} alt="" decoding="async" />}
      <VideoOverlay
        paused={paused}
        current={current}
        duration={duration}
        onTogglePlay={() => {
          const p = player.current
          if (!p) return
          paused ? p.playVideo?.() : p.pauseVideo?.()
        }}
        onSeek={(t) => {
          player.current?.seekTo?.(t, true)
          setCurrent(t)
        }}
        onScrubStart={() => (scrubbing.current = true)}
        onScrubEnd={() => (scrubbing.current = false)}
      />
    </div>
  )
}
