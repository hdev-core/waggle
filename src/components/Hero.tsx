import { useState } from 'react'
import type { FypPost } from '../lib/types'
import { extractHero } from '../lib/post'
import { useInView } from '../lib/useInView'

// Renders one post's hero media with two perf safeguards:
//  1. Lazy-mount: nothing heavy loads until the slide is ~1.5 screens away
//     (useInView), so we never decode 20 full-screen images at once.
//  2. Video facade: show a poster + play button; only mount the <iframe>/<video>
//     on tap. Avoids iframe-autoplay blocks and embedding-disabled errors that
//     made some YouTube posts fail.
export function Hero({ post, title, blurred }: { post: FypPost; title: string; blurred?: boolean }) {
  const { ref, inView } = useInView<HTMLDivElement>()
  const [playing, setPlaying] = useState(false)
  const hero = extractHero(post)

  return (
    <div className={`card__media ${blurred ? 'card__media--blur' : ''}`} ref={ref}>
      {/* gradient base — also the placeholder before in-view and for text posts */}
      <div className="card__textbg" aria-hidden={hero.kind !== 'none'}>
        {hero.kind === 'none' && <h1 className="card__textbg-title">{title}</h1>}
      </div>

      {inView && hero.kind === 'image' && hero.src && (
        <img className="card__img" src={hero.src} alt="" decoding="async" loading="lazy" />
      )}

      {inView && hero.kind === 'video' && !playing && (
        <button className="card__playbtn" onClick={() => setPlaying(true)} aria-label="Play video">
          {hero.poster && <img className="card__img" src={hero.poster} alt="" decoding="async" />}
          <span className="card__playicon">▶</span>
        </button>
      )}

      {playing && hero.kind === 'video' && hero.embedUrl && (
        <iframe
          className="card__video"
          src={`${hero.embedUrl}${hero.embedUrl.includes('?') ? '&' : '?'}autoplay=1&playsinline=1`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      )}
      {playing && hero.kind === 'video' && hero.src && (
        <video className="card__video" src={hero.src} controls autoPlay playsInline />
      )}

      <div className="card__scrim" />
    </div>
  )
}
