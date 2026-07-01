import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { FeedKind } from './lib/types'
import { fetchProfile } from './lib/api'
import { FeedPager } from './components/FeedPager'
import { LoginSheet } from './components/LoginSheet'
import { InterestPicker } from './components/InterestPicker'
import { useSession } from './lib/session'

export function App() {
  const { username, signer, logout } = useSession()
  const qc = useQueryClient()
  const [kind, setKind] = useState<FeedKind>('discover')
  const [showLogin, setShowLogin] = useState(false)
  const [showPicker, setShowPicker] = useState(false)

  // Cold-start detection: a signed-in / named user with no interest vector yet.
  const { data: profile } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => fetchProfile(username!),
    enabled: !!username,
  })
  const coldStart = !!username && profile != null && !profile.has_vector
  const seenKey = `hivefy.pickerSeen.${username}`

  // Auto-offer the picker once per user (persisted), then leave a CTA banner.
  useEffect(() => {
    if (coldStart && !localStorage.getItem(seenKey)) setShowPicker(true)
  }, [coldStart, seenKey])

  function dismissPicker() {
    localStorage.setItem(seenKey, '1')
    setShowPicker(false)
  }

  function chooseForYou() {
    if (username) setKind('foryou')
    else setShowLogin(true)
  }

  return (
    <div className="app">
      <header className="topbar">
        <span className="brand">Waggle</span>
        <button className={`tab ${kind === 'foryou' ? 'tab--on' : ''}`} onClick={chooseForYou}>
          For You
        </button>
        <button className={`tab ${kind === 'discover' ? 'tab--on' : ''}`} onClick={() => setKind('discover')}>
          Discover
        </button>
        <button className="topbar__acct" onClick={() => (username ? logout() : setShowLogin(true))}>
          {username ? `@${username}${signer ? '' : ' (read-only)'}` : 'Sign in'}
        </button>
      </header>

      <FeedPager kind={kind} username={username} onNeedAuth={() => setShowLogin(true)} />

      {/* Cold-start nudge on the For You tab if the picker was skipped */}
      {kind === 'foryou' && coldStart && !showPicker && (
        <button className="cta-banner" onClick={() => setShowPicker(true)}>
          ✨ Personalize your feed — pick your interests
        </button>
      )}

      {showLogin && <LoginSheet onClose={() => setShowLogin(false)} />}

      {showPicker && username && (
        <InterestPicker
          username={username}
          onClose={dismissPicker}
          onSaved={() => {
            dismissPicker()
            setKind('foryou')
            qc.invalidateQueries({ queryKey: ['profile', username] })
            qc.invalidateQueries({ queryKey: ['feed'] })
          }}
        />
      )}
    </div>
  )
}
