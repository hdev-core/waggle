import { useState } from 'react'
import { useSession } from '../lib/session'
import { isTouchDevice } from '../lib/platform'

// Lazy auth sheet. Two real sign-in paths that both enable on-chain actions:
//   • Hive Keychain (browser extension / Keychain mobile in-app browser)
//   • HiveAuth (QR on desktop, deep link on mobile) — the universal option
// Plus a read-only username (personalized feed, no signing).
export function LoginSheet({ onClose }: { onClose: () => void }) {
  const { hasKeychain, loginKeychain, loginHiveAuth, setReadOnlyUser, voteWeight, setVoteWeight } = useSession()
  const touch = isTouchDevice()
  const [name, setName] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState<null | 'keychain' | 'hiveauth'>(null)

  async function go(method: 'keychain' | 'hiveauth') {
    setErr(null)
    setBusy(method)
    try {
      await (method === 'keychain' ? loginKeychain(name) : loginHiveAuth(name))
      onClose()
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setBusy(null)
    }
  }

  const disabled = !!busy || !name.trim()

  return (
    <div className="why" onClick={onClose}>
      <div className="why__sheet" onClick={(e) => e.stopPropagation()}>
        <h3>Sign in</h3>
        <input
          className="login__input login__input--full"
          placeholder="hive username"
          value={name}
          onChange={(e) => setName(e.target.value.trim())}
          autoCapitalize="none"
          autoCorrect="off"
          autoFocus
        />
        {err && <p className="state__err">{err}</p>}

        {/* Keychain first when it's actually available (desktop ext / KC mobile). */}
        {hasKeychain && (
          <button className="btn btn--full" disabled={disabled} onClick={() => go('keychain')}>
            {busy === 'keychain' ? 'Check Keychain…' : 'Sign in with Hive Keychain'}
          </button>
        )}

        {/* HiveAuth works everywhere — QR on desktop, deep link on mobile. */}
        <button
          className={`btn btn--full ${hasKeychain ? 'btn--ghost' : ''}`}
          disabled={disabled}
          onClick={() => go('hiveauth')}
        >
          {busy === 'hiveauth' ? 'Starting HiveAuth…' : 'Sign in with HiveAuth'}
        </button>
        {!hasKeychain && (
          <p className="login__hint">
            HiveAuth lets you approve in a wallet app on your phone. On desktop you can also{' '}
            <a href="https://hive-keychain.com" target="_blank" rel="noreferrer">install Keychain</a>.
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
          Continue read-only (just browse my feed)
        </button>

        {!touch && (
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
        )}
      </div>
    </div>
  )
}
