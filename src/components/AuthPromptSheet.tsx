import { useEffect, useState } from 'react'
import { useSession } from '../lib/session'

// Overlay for a pending HiveAuth interaction:
//  • kind 'auth' → show a QR (scan with a Hive wallet on desktop) + an "Open
//    wallet app" deep link (tap on mobile).
//  • kind 'sign' → the app already has a session; tell the user to approve the
//    action in their wallet.
export function AuthPromptSheet() {
  const { authPrompt, cancelAuth } = useSession()
  const [qr, setQr] = useState<string | null>(null)
  const [left, setLeft] = useState<number>(0)

  const uri = authPrompt?.kind === 'auth' ? authPrompt.uri : undefined
  const expire = authPrompt?.expire

  useEffect(() => {
    if (!uri) {
      setQr(null)
      return
    }
    let live = true
    import('qrcode')
      .then(({ default: QRCode }) => QRCode.toDataURL(uri, { margin: 1, width: 220 }))
      .then((d) => live && setQr(d))
      .catch(() => live && setQr(null))
    return () => {
      live = false
    }
  }, [uri])

  // Countdown to the request timeout.
  useEffect(() => {
    if (!expire) return
    const tick = () => setLeft(Math.max(0, Math.round((expire - Date.now()) / 1000)))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [expire])

  if (!authPrompt) return null

  return (
    <div className="why" onClick={cancelAuth}>
      <div className="why__sheet auth" onClick={(e) => e.stopPropagation()}>
        {authPrompt.kind === 'auth' ? (
          <>
            <h3>Sign in with HiveAuth</h3>
            <p className="auth__hint">
              Scan with a Hive wallet app (e.g. Hive Keychain mobile), or tap below on your phone.
            </p>
            <div className="auth__qr">
              {qr ? <img src={qr} alt="HiveAuth QR code" width={220} height={220} /> : <div className="auth__qrwait" />}
            </div>
            {uri && (
              <a className="btn btn--full" href={uri}>
                Open my Hive wallet app
              </a>
            )}
          </>
        ) : (
          <>
            <h3>Approve in your wallet</h3>
            <div className="auth__spinner" />
            <p className="auth__hint">
              Open your Hive wallet app and approve the <strong>{authPrompt.action ?? 'action'}</strong> request.
            </p>
          </>
        )}
        {left > 0 && <p className="auth__timer">Expires in {left}s</p>}
        <button className="btn btn--ghost btn--full" onClick={cancelAuth}>
          Cancel
        </button>
      </div>
    </div>
  )
}
