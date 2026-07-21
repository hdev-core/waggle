import { useEffect, useRef } from 'react'
import { telemetry, type PostMeta } from './telemetry'

// Measures ACTUAL video playback time for one post and emits a `video`
// telemetry sample (haf_fyp #12). watch_ms is real playing time — accumulated
// across pause/resume from the player's true play state — NOT active-slide time
// (which would count paused/buffering as watched). Together with duration_ms
// this feeds avg_watch_ms / completion in the metrics rollup, the single most
// valuable signal for a video-first feed.
//
// `playing` is the player's onPlay/onPause (HlsVideo) or PLAYING state
// (YouTubePlayer). We flush on unmount — the common case, since a slide's player
// unmounts once it scrolls ~1.2 screens away — and on tab-hide, so closing
// mid-watch isn't lost (telemetry beacons the queue on pagehide, which fires
// after visibilitychange). Samples under 1s are dropped as noise; posts with no
// id (e.g. the reader's native player) never emit.
export function useWatchTime(playing: boolean, durationSec: number, meta?: PostMeta): void {
  const accMs = useRef(0)
  const startedAt = useRef<number | null>(null)
  const durationMs = useRef(0)
  durationMs.current = durationSec > 0 && isFinite(durationSec) ? Math.round(durationSec * 1000) : 0
  // Live handle so the flush closure reads the latest meta without re-subscribing.
  const metaRef = useRef(meta)
  metaRef.current = meta

  // Start/stop the clock on real play/pause transitions.
  useEffect(() => {
    if (playing) {
      if (startedAt.current == null) startedAt.current = performance.now()
    } else if (startedAt.current != null) {
      accMs.current += performance.now() - startedAt.current
      startedAt.current = null
    }
  }, [playing])

  useEffect(() => {
    const flush = () => {
      if (startedAt.current != null) {
        // Fold in the in-flight interval, then restart so a still-playing clip
        // keeps counting toward the next sample (no double count — the reset).
        accMs.current += performance.now() - startedAt.current
        startedAt.current = performance.now()
      }
      const watchMs = Math.round(accMs.current)
      // Only emit-and-reset past the 1s noise floor; carry a sub-second bucket so
      // a watch split across a tab-hide isn't repeatedly rounded away to nothing.
      if (watchMs >= 1000 && metaRef.current?.postId) {
        accMs.current = 0
        telemetry.video({ ...metaRef.current, watchMs, durationMs: durationMs.current || undefined })
      }
    }
    const onHide = () => {
      if (document.visibilityState === 'hidden') flush()
    }
    document.addEventListener('visibilitychange', onHide)
    return () => {
      document.removeEventListener('visibilitychange', onHide)
      flush()
    }
  }, [])
}
