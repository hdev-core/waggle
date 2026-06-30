import { useState } from 'react'
import { useSession } from '../lib/session'

// Lazy auth sheet: Keychain sign-in (enables on-chain actions) or a read-only
// username (personalized feed only, no signing). Also hosts the adjustable
// vote-weight control (default 100%).
export function LoginSheet({ onClose }: { onClose: () => void }) {
  const { hasKeychain, loginKeychain, setReadOnlyUser, voteWeight, setVoteWeight } = useSession()
  const [name, setName] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function keychain() {
    setErr(null)
    setBusy(true)
    try {
      await loginKeychain(name)
      onClose()
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="why" onClick={onClose}>
      <div className="why__sheet" onClick={(e) => e.stopPropagation()}>
        <h3>Sign in</h3>
        <input
          className="login__input login__input--full"
          placeholder="hive username"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        {err && <p className="state__err">{err}</p>}

        <button className="btn btn--full" disabled={busy || !name.trim()} onClick={keychain}>
          {busy ? 'Check Keychain…' : 'Sign in with Hive Keychain'}
        </button>
        {!hasKeychain && (
          <p className="login__hint">
            Keychain not detected. Install the{' '}
            <a href="https://hive-keychain.com" target="_blank" rel="noreferrer">browser extension</a>, or continue read-only.
          </p>
        )}
        <button
          className="btn btn--ghost btn--full"
          disabled={!name.trim()}
          onClick={() => {
            setReadOnlyUser(name)
            onClose()
          }}
        >
          Continue read-only (browse my feed)
        </button>

        <div className="setting">
          <label className="setting__label">
            Default upvote weight <strong>{voteWeight}%</strong>
          </label>
          <input
            className="setting__range"
            type="range"
            min={1}
            max={100}
            value={voteWeight}
            onChange={(e) => setVoteWeight(Number(e.target.value))}
          />
        </div>
      </div>
    </div>
  )
}
