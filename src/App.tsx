import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { FeedKind } from './lib/types'
import { fetchProfile, type FypProfile } from './lib/api'
import { FeedPager } from './components/FeedPager'
import { LoginSheet } from './components/LoginSheet'
import { AuthPromptSheet } from './components/AuthPromptSheet'
import { InterestPicker } from './components/InterestPicker'
import { useSession } from './lib/session'

export function App() {
  const { username, signer, logout } = useSession()
  const qc = useQueryClient()
  const [kind, setKind] = useState<FeedKind>('discover')
  const [showLogin, setShowLogin] = useState(false)
  const [showPicker, setShowPicker] = useState(false)

  const seenKey = `hivefy.pickerSeen.${username}`
  const savedKey = `hivefy.interestsSaved.${username}`

  // After onboarding the ranker builds the interest vector asynchronously. Poll
  // the profile so we can flip the feed to personalized the instant it's ready,
  // instead of leaving the user on the global fallthrough until a manual refresh.
  const POLL_MS = 15000
  const POLL_WINDOW_MS = 5 * 60 * 1000 // stop polling ~5 min after saving
  const savedAt = username ? Number(localStorage.getItem(savedKey)) || 0 : 0
  const withinPollWindow = savedAt > 0 && Date.now() - savedAt < POLL_WINDOW_MS

  // Cold-start detection: a signed-in / named user with no interest vector yet.
  const { data: profile } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => fetchProfile(username!),
    enabled: !!username,
    refetchInterval: (query) => {
      const d = query.state.data as FypProfile | null | undefined
      const sAt = username ? Number(localStorage.getItem(savedKey)) || 0 : 0
      const waiting = sAt > 0 && Date.now() - sAt < POLL_WINDOW_MS
      return waiting && d != null && !d.has_vector ? POLL_MS : false
    },
  })
  const coldStart = !!username && profile != null && !profile.has_vector
  // While a recent save's vector is still building, show a "personalizing" state.
  const personalizing = coldStart && withinPollWindow

  // Flip the feed to personalized the moment the vector lands (false → true).
  const flippedRef = useRef(false)
  useEffect(() => {
    flippedRef.current = false
  }, [username])
  useEffect(() => {
    if (withinPollWindow && profile?.has_vector && !flippedRef.current) {
      flippedRef.current = true
      qc.invalidateQueries({ queryKey: ['feed'] })
    }
  }, [profile?.has_vector, withinPollWindow, qc])

  // Auto-offer the picker once per user (persisted), then leave a CTA banner —
  // unless the user already saved interests (personalization is just pending a
  // ranker cycle, so don't keep nagging while has_vector is still false).
  useEffect(() => {
    if (coldStart && !localStorage.getItem(seenKey) && !localStorage.getItem(savedKey)) setShowPicker(true)
  }, [coldStart, seenKey, savedKey])

  function dismissPicker(saved = false) {
    localStorage.setItem(seenKey, '1')
    if (saved) localStorage.setItem(savedKey, String(Date.now())) // timestamp → poll window
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

      {/* After saving, show live "personalizing" status until the vector lands */}
      {kind === 'foryou' && personalizing && (
        <div className="cta-banner cta-banner--pending">
          <span className="cta-spinner" /> Personalizing your feed…
        </div>
      )}

      {showLogin && <LoginSheet onClose={() => setShowLogin(false)} />}

      {/* HiveAuth QR / wallet-approval overlay (driven by session.authPrompt) */}
      <AuthPromptSheet />

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
