import { useState } from 'react'
import type { FeedKind } from './lib/types'
import { FeedPager } from './components/FeedPager'
import { LoginSheet } from './components/LoginSheet'
import { useSession } from './lib/session'

export function App() {
  const { username, signer, logout } = useSession()
  const [kind, setKind] = useState<FeedKind>('discover')
  const [showLogin, setShowLogin] = useState(false)

  function chooseForYou() {
    if (username) setKind('foryou')
    else setShowLogin(true) // need a username (typed or signed) for a personal feed
  }

  return (
    <div className="app">
      <header className="topbar">
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

      {showLogin && <LoginSheet onClose={() => setShowLogin(false)} />}
    </div>
  )
}
