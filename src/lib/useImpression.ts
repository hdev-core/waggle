import { useEffect, type RefObject } from 'react'
import { telemetry, type PostMeta } from './telemetry'

// Emit one impression per card once it has been the active/centered slide for
// >=1s, with dwell = total active time. An impression is the "shown" half of
// CTR — without it we can't tell a good ranking from one the user never saw.
// The card stays mounted in the pager, so we accumulate active time across
// re-visits and emit at most once (on first qualifying exit, or on unmount).
export function useImpression(ref: RefObject<Element | null>, meta: PostMeta): void {
  useEffect(() => {
    const el = ref.current
    if (!el) return

    let activeSince: number | null = null
    let dwell = 0
    let emitted = false

    const maybeEmit = () => {
      if (emitted || dwell < 1000) return
      emitted = true
      telemetry.impression({ ...meta, dwellMs: dwell })
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        const active = entry.intersectionRatio >= 0.6
        if (active && activeSince == null) {
          activeSince = performance.now()
        } else if (!active && activeSince != null) {
          dwell += performance.now() - activeSince
          activeSince = null
          maybeEmit()
        }
      },
      { threshold: [0, 0.6, 1] },
    )
    io.observe(el)

    return () => {
      if (activeSince != null) dwell += performance.now() - activeSince
      maybeEmit()
      io.disconnect()
    }
    // meta is stable per post (post_id/rank/source/algo don't change); intentionally
    // not a dependency so the observer isn't torn down on unrelated re-renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref])
}
