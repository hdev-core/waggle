import { useState } from 'react'
import { IconHeart } from './icons'

// Per-vote weight picker: choose how much % to assign to this upvote before
// broadcasting. Defaults to the user's saved default; presets for speed.
const PRESETS = [10, 25, 50, 100]

export function VoteWeightSheet({
  defaultWeight,
  busy,
  onClose,
  onConfirm,
}: {
  defaultWeight: number
  busy?: boolean
  onClose: () => void
  onConfirm: (pct: number) => void
}) {
  const [pct, setPct] = useState(defaultWeight)

  return (
    <div className="why" onClick={onClose}>
      <div className="why__sheet" onClick={(e) => e.stopPropagation()}>
        <h3>Upvote strength</h3>
        <div className="vote__value">{pct}%</div>
        <input
          className="setting__range"
          type="range"
          min={1}
          max={100}
          value={pct}
          onChange={(e) => setPct(Number(e.target.value))}
        />
        <div className="vote__presets">
          {PRESETS.map((p) => (
            <button key={p} className={`chip vote__preset ${pct === p ? 'vote__preset--on' : ''}`} onClick={() => setPct(p)}>
              {p}%
            </button>
          ))}
        </div>
        <button className="btn btn--full vote__confirm" disabled={busy} onClick={() => onConfirm(pct)}>
          <IconHeart size={18} filled /> {busy ? 'Signing…' : `Upvote ${pct}%`}
        </button>
      </div>
    </div>
  )
}
