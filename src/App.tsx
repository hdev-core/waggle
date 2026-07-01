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
  const savedKey = `hivefy.interestsSaved.${username}`

  // Auto-offer the picker once per user (persisted), then leave a CTA banner —
  // unless the user already saved interests (personalization is just pending a
  // ranker cycle, so don't keep nagging while has_vector is still false).
  useEffect(() => {
    if (coldStart && !localStorage.getItem(seenKey) && !localStorage.getItem(savedKey)) setShowPicker(true)
  }, [coldStart, seenKey, savedKey])

  function dismissPicker(saved = false) {
    localStorage.setItem(seenKey, '1')
    if (saved) localStorage.setItem(savedKey, '1')
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
        <div className="tabs">
          <button className={`tab ${kind === 'foryou' ? 'tab--on' : ''}`} onClick={chooseForYou}>
            For You
          </button>
          <button className={`tab ${kind === 'discover' ? 'tab--on' : ''}`} onClick={() => setKind('discover')}>
            Discover
          </button>
        </div>
        <button className="topbar__acct" onClick={() => (username ? logout() : setShowLogin(true))}>
          {username ? `@${username}${signer ? '' : ' (read-only)'}` : 'Sign in'}
        </button>
      </header>

      <FeedPager kind={kind} username={username} onNeedAuth={() => setShowLogin(true)} />

      {/* Cold-start nudge on the For You tab — only if skipped, not after saving */}
      {kind === 'foryou' && coldStart && !showPicker && !localStorage.getItem(savedKey) && (
        <button className="cta-banner" onClick={() => setShowPicker(true)}>
          ✨ Personalize your feed — pick your interests
        </button>
      )}

      {showLogin && <LoginSheet onClose={() => setShowLogin(false)} />}

      {showPicker && username && (
        <InterestPicker
          username={username}
          onClose={() => dismissPicker(false)}
          onSaved={() => {
            dismissPicker(true)
            setKind('foryou')
            qc.invalidateQueries({ queryKey: ['profile', username] })
            qc.invalidateQueries({ queryKey: ['feed'] })
          }}
        />
      )}
    </div>
  )
}
