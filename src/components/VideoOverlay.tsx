import { useEffect, useRef, useState } from 'react'
import { useMediaPrefs } from '../lib/mediaPrefs'

function fmt(t: number): string {
  if (!isFinite(t) || t < 0) t = 0
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

// Shared TikTok-style control overlay for any video player (HLS <video> or the
// YouTube IFrame API). The parent owns playback; this component renders the UI
// and calls back. Mute / volume / speed come from the global media prefs so the
// choice carries across every card.
export function VideoOverlay({
  paused,
  current,
  duration,
  onTogglePlay,
  onSeek,
  onScrubStart,
  onScrubEnd,
}: {
  paused: boolean
  current: number
  duration: number
  onTogglePlay: () => void
  onSeek: (t: number) => void
  onScrubStart: () => void
  onScrubEnd: () => void
}) {
  const { muted, volume, speed, setVolume, cycleSpeed } = useMediaPrefs()
  const [volOpen, setVolOpen] = useState(false)
  const [volDragging, setVolDragging] = useState(false)
  const [scrubVal, setScrubVal] = useState<number | null>(null)
  const volWrapRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  function setVolFromEvent(e: { clientY: number }) {
    const track = trackRef.current
    if (!track) return
    const rect = track.getBoundingClientRect()
    const ratio = 1 - (e.clientY - rect.top) / rect.height
    setVolume(Math.min(1, Math.max(0, ratio)))
  }

  useEffect(() => {
    if (!volOpen) return
    const onDown = (e: PointerEvent) => {
      if (volWrapRef.current && !volWrapRef.current.contains(e.target as Node)) setVolOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [volOpen])

  const shown = scrubVal ?? current
  const vol = muted ? 0 : volume

  return (
    <>
      {/* Transparent tap layer: click the video to play/pause. Sits below the
          control buttons and above the media. */}
      <button className="hls__tap" aria-label={paused ? 'Play' : 'Pause'} onClick={onTogglePlay} />
      {paused && (
        <button className="hls__bigplay" onClick={onTogglePlay} aria-label="Play">
          ▶
        </button>
      )}

      <div className="hls__ctl" onClick={(e) => e.stopPropagation()}>
        <button className="hls__pill" onClick={cycleSpeed} aria-label="Playback speed">
          {speed}×
        </button>
        <div className="hls__vol" ref={volWrapRef}>
          <button
            className="hls__pill"
            onClick={(e) => {
              e.stopPropagation()
              setVolOpen((o) => !o)
            }}
            aria-label="Volume"
          >
            {vol === 0 ? '🔇' : '🔊'}
          </button>
          {volOpen && (
            <div className="hls__volpop" onClick={(e) => e.stopPropagation()}>
              <div
                className="hls__voltrack"
                ref={trackRef}
                onPointerDown={(e) => {
                  e.stopPropagation()
                  trackRef.current?.setPointerCapture?.(e.pointerId)
                  setVolDragging(true)
                  setVolFromEvent(e)
                }}
                onPointerMove={(e) => {
                  if (volDragging) setVolFromEvent(e)
                }}
                onPointerUp={() => setVolDragging(false)}
                onPointerCancel={() => setVolDragging(false)}
              >
                <div className="hls__volfill" style={{ height: `${vol * 100}%` }} />
                <div className="hls__volthumb" style={{ bottom: `${vol * 100}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {scrubVal != null && <div className="hls__scrubtime">{fmt(shown)} / {fmt(duration)}</div>}
      <input
        className={`hls__seek ${scrubVal != null ? 'hls__seek--active' : ''}`}
        type="range"
        min={0}
        max={duration || 0}
        step={0.1}
        value={Math.min(shown, duration || 0)}
        disabled={!duration}
        onClick={(e) => e.stopPropagation()}
        onInput={(e) => {
          const t = Number((e.target as HTMLInputElement).value)
          setScrubVal(t)
          onSeek(t)
        }}
        onPointerDown={() => {
          setScrubVal(current)
          onScrubStart()
        }}
        onPointerUp={() => {
          setScrubVal(null)
          onScrubEnd()
        }}
        onPointerCancel={() => {
          setScrubVal(null)
          onScrubEnd()
        }}
        aria-label="Seek"
        style={{ ['--pct' as string]: `${duration ? (shown / duration) * 100 : 0}%` }}
      />
    </>
  )
}
