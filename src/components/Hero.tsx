import { useEffect, useState } from 'react'
import type { FypPost } from '../lib/types'
import { extractHero } from '../lib/post'
import { useInView } from '../lib/useInView'
import { useResolvedVideo } from '../lib/video'
import { useMuted } from '../lib/muteStore'
import { HlsVideo } from './HlsVideo'

// Renders one post's hero media with TikTok-style playback:
//  1. Lazy-mount: nothing heavy loads until the slide is ~1.5 screens away.
//  2. Auto-play on active: when a video slide is the centered one (>=60% in
//     view) it auto-plays muted; it unmounts as it scrolls away so only one
//     video ever plays.
//  3. Tap to toggle sound; a poster remains as a fallback while a stream loads
//     or when a (synthetic) post has no real video behind it.
export function Hero({ post, title, blurred }: { post: FypPost; title: string; blurred?: boolean }) {
  const { ref, inView } = useInView<HTMLDivElement>()
  const [active, setActive] = useState(false)
  const [muted, setMuted] = useMuted() // global: sound choice carries to every card
  const hero = extractHero(post)
  const isVideo = hero.kind === 'video'
  const { hls, poster, status } = useResolvedVideo(hero)

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

  const playing = isVideo && active
  const hasSound = playing && (hls || hero.embedUrl || hero.src)

  const iframeSrc = (url: string) => {
    const sep = url.includes('?') ? '&' : '?'
    return `${url}${sep}autoplay=1&mute=${muted ? 1 : 0}&muted=${muted ? 1 : 0}&playsinline=1`
  }

  return (
    <div className={`card__media ${blurred ? 'card__media--blur' : ''}`} ref={ref}>
      <div className="card__textbg" aria-hidden={hero.kind !== 'none'}>
        {hero.kind === 'none' && <h1 className="card__textbg-title">{title}</h1>}
      </div>

      {inView && hero.kind === 'image' && hero.src && (
        <img className="card__img" src={hero.src} alt="" decoding="async" loading="lazy" />
      )}

      {/* Poster shown until the stream mounts (or as the permanent frame if the
          video can't be resolved). */}
      {inView && isVideo && (!playing || !hls) && (
        <div className="card__playbtn" aria-hidden>
          {poster && <img className="card__img" src={poster} alt="" decoding="async" />}
          {playing && status === 'loading' && <span className="card__spinner" />}
          {playing && status === 'unavailable' ? (
            <span className="card__unavail">Video unavailable</span>
          ) : (
            !playing && <span className="card__playicon">▶</span>
          )}
        </div>
      )}

      {playing && hls && <HlsVideo className="card__video" src={hls} poster={poster} muted={muted} />}
      {playing && !hls && hero.embedUrl && (
        <iframe
          key={muted ? 'm' : 'u'}
          className="card__video"
          src={iframeSrc(hero.embedUrl)}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      )}
      {playing && !hls && !hero.embedUrl && hero.src && (
        <video className="card__video" src={hero.src} autoPlay playsInline muted={muted} loop controls={false} />
      )}

      {hasSound && (
        <button className="card__mute" onClick={() => setMuted(!muted)} aria-label={muted ? 'Unmute' : 'Mute'}>
          {muted ? '🔇 Tap for sound' : '🔊'}
        </button>
      )}

      <div className="card__scrim" />
    </div>
  )
}
