import { useEffect, useState } from 'react'
import type { FypPost } from '../lib/types'
import type { PostMeta } from '../lib/telemetry'
import { extractHero, unproxyImage } from '../lib/post'
import { useInView } from '../lib/useInView'
import { useResolvedVideo } from '../lib/video'
import { HlsVideo } from './HlsVideo'
import { YouTubePlayer, preloadYT } from './YouTubePlayer'

// Renders one post's hero media with TikTok-style playback:
//  1. Lazy-mount: nothing heavy loads until the slide is ~1.5 screens away.
//  2. Preload + auto-play: HLS videos mount while near the viewport (so playback
//     starts instantly on swipe) but only PLAY while this is the centered/active
//     slide; they pause + rewind when they scroll away, so only one plays.
//  3. Custom controls (seek / speed / volume) live in the HlsVideo overlay.
export function Hero({ post, title, blurred, meta }: { post: FypPost; title: string; blurred?: boolean; meta?: PostMeta }) {
  const { ref, inView } = useInView<HTMLDivElement>()
  const [active, setActive] = useState(false)
  const [near, setNear] = useState(false)
  const hero = extractHero(post)
  const isVideo = hero.kind === 'video'
  const { hls, poster, status } = useResolvedVideo(hero)
  const ytId = hero.embedUrl?.match(/embed\/([\w-]{11})/)?.[1]

  // "active" = this is the centered slide (drives play). No rootMargin so the
  // 0.6 ratio is measured against the real viewport.
  useEffect(() => {
    const el = ref.current
    if (!el || !isVideo) return
    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.intersectionRatio >= 0.6),
      { threshold: [0, 0.6, 1] },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, isVideo])

  // "near" = within a screen of the viewport (preload window). Toggles OFF when
  // far away so the player unmounts — otherwise every scrolled-past video would
  // keep a buffering <video>/hls.js instance alive and leak memory/bandwidth.
  useEffect(() => {
    const el = ref.current
    if (!el || !isVideo) return
    const io = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), { rootMargin: '120% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, isVideo])

  // Warm the YouTube IFrame API as soon as a YT card nears the viewport.
  useEffect(() => {
    if (ytId && near) preloadYT()
  }, [ytId, near])

  const gated = !!blurred // NSFW/muted — never autoplay behind the blur
  const playing = isVideo && active && !gated
  // Poster/spinner facade for non-HLS states (YouTube/mp4 before play, resolve
  // loading/unavailable) and for gated videos. HLS/YT render their own poster.
  const showFacade = inView && isVideo && (gated || (!hls && !ytId)) && (!playing || status === 'loading' || status === 'unavailable')

  // If a proxied image 403s, retry the raw original once (see unproxyImage).
  const onImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const el = e.currentTarget
    const orig = unproxyImage(el.src)
    if (orig !== el.src) el.src = orig
  }

  return (
    <div className={`card__media ${blurred ? 'card__media--blur' : ''}`} ref={ref}>
      <div className="card__textbg" aria-hidden={hero.kind !== 'none'}>
        {hero.kind === 'none' && <h1 className="card__textbg-title">{title}</h1>}
      </div>

      {inView && hero.kind === 'image' && hero.src && (
        <img className="card__img" src={hero.src} alt="" decoding="async" loading="lazy" onError={onImgError} />
      )}

      {showFacade && (
        <div className="card__playbtn" aria-hidden>
          {poster && <img className="card__img" src={poster} alt="" decoding="async" onError={onImgError} />}
          {playing && status === 'loading' && <span className="card__spinner" />}
          {playing && status === 'unavailable' ? (
            <span className="card__unavail">Video unavailable</span>
          ) : (
            !playing && <span className="card__playicon">▶</span>
          )}
        </div>
      )}

      {/* HLS: mounted while near the viewport (preload), plays only when active;
          unmounts when far so players don't accumulate. */}
      {near && isVideo && hls && !gated && (
        <HlsVideo className="card__video" src={hls} poster={poster} active={active} overlay meta={meta} />
      )}

      {/* YouTube via the IFrame API — preloaded near the viewport, plays only
          when active; same overlay controls as HLS. */}
      {near && !hls && ytId && !gated && (
        <YouTubePlayer className="card__video" videoId={ytId} poster={poster} active={active} meta={meta} />
      )}
      {/* Bare mp4 (rare on Hive) — native controls. */}
      {playing && !hls && !ytId && hero.src && (
        <video className="card__video" src={hero.src} autoPlay playsInline loop controls />
      )}

      <div className="card__scrim" />
    </div>
  )
}
