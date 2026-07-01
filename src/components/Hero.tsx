import { useEffect, useState } from 'react'
import type { FypPost } from '../lib/types'
import { extractHero } from '../lib/post'
import { useInView } from '../lib/useInView'

// Renders one post's hero media with TikTok-style playback:
//  1. Lazy-mount: nothing heavy loads until the slide is ~1.5 screens away
//     (useInView), so we never decode 20 full-screen images at once.
//  2. Auto-play on active: when a video slide is the centered one (>=60% in
//     view) it auto-plays muted (browser autoplay policy requires muted). It
//     unmounts as soon as it scrolls away, so only one video ever plays.
//  3. Tap to toggle sound; a poster + play button remains as a manual fallback.
export function Hero({ post, title, blurred }: { post: FypPost; title: string; blurred?: boolean }) {
  const { ref, inView } = useInView<HTMLDivElement>()
  const [active, setActive] = useState(false)
  const [muted, setMuted] = useState(true)
  const hero = extractHero(post)
  const isVideo = hero.kind === 'video'

  // Track whether this slide is the centered/active one so its video auto-plays.
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

  // Reset to muted each time playback (re)starts, so scrolling back never blasts
  // audio and autoplay stays within policy.
  useEffect(() => {
    if (!active) setMuted(true)
  }, [active])

  const playing = isVideo && active

  const iframeSrc = (url: string) => {
    const sep = url.includes('?') ? '&' : '?'
    return `${url}${sep}autoplay=1&mute=${muted ? 1 : 0}&muted=${muted ? 1 : 0}&playsinline=1`
  }

  return (
    <div className={`card__media ${blurred ? 'card__media--blur' : ''}`} ref={ref}>
      {/* gradient base — also the placeholder before in-view and for text posts */}
      <div className="card__textbg" aria-hidden={hero.kind !== 'none'}>
        {hero.kind === 'none' && <h1 className="card__textbg-title">{title}</h1>}
      </div>

      {inView && hero.kind === 'image' && hero.src && (
        <img className="card__img" src={hero.src} alt="" decoding="async" loading="lazy" />
      )}

      {/* Poster shown until this slide is active (or as a fallback if blocked). */}
      {inView && isVideo && !playing && (
        <div className="card__playbtn" aria-hidden>
          {hero.poster && <img className="card__img" src={hero.poster} alt="" decoding="async" />}
          <span className="card__playicon">▶</span>
        </div>
      )}

      {playing && hero.embedUrl && (
        <iframe
          key={muted ? 'm' : 'u'}
          className="card__video"
          src={iframeSrc(hero.embedUrl)}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      )}
      {playing && hero.src && (
        <video className="card__video" src={hero.src} autoPlay playsInline muted={muted} loop controls={false} />
      )}

      {/* Tap-to-unmute pill while a video is auto-playing muted. */}
      {playing && (
        <button
          className="card__mute"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? '🔇 Tap for sound' : '🔊'}
        </button>
      )}

      <div className="card__scrim" />
    </div>
  )
}
