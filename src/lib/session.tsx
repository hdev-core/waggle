import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { KeychainSigner, hasKeychain, type Signer } from './hive'
import type { AuthPrompt, HiveAuthSession } from './hiveauth'

// HiveAuth pulls in crypto-js — load it on demand so it never weighs down first
// paint (only needed when a user signs in via, or restores, a HiveAuth session).
const loadHiveAuth = () => import('./hiveauth').then((m) => m.HiveAuthSigner)

const VOTE_KEY = 'hivefy.voteWeight'
const USER_KEY = 'hivefy.username'
const HA_KEY = 'hivefy.hiveauth' // persisted HiveAuth session {username, token, expire, key}

interface SessionState {
  username: string | null
  signer: Signer | null
  hasKeychain: boolean
  voteWeight: number // 1..100, default 100, adjustable
  setVoteWeight: (pct: number) => void
  loginKeychain: (username: string) => Promise<Signer>
  loginHiveAuth: (username: string) => Promise<Signer>
  setReadOnlyUser: (username: string) => void // read personalized feed w/o signing
  logout: () => void
  authPrompt: AuthPrompt | null // pending HiveAuth QR / wallet-approval prompt
  cancelAuth: () => void
}

const Ctx = createContext<SessionState | null>(null)

function loadHA(): HiveAuthSession | null {
  try {
    const raw = localStorage.getItem(HA_KEY)
    if (!raw) return null
    const s = JSON.parse(raw) as HiveAuthSession
    if (s.token && s.expire && s.expire > Date.now()) return s
  } catch {
    /* ignore */
  }
  localStorage.removeItem(HA_KEY)
  return null
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem(USER_KEY))
  const [signer, setSigner] = useState<Signer | null>(null)
  const [authPrompt, setAuthPrompt] = useState<AuthPrompt | null>(null)
  const [voteWeight, setVoteWeightState] = useState<number>(() => {
    const v = Number(localStorage.getItem(VOTE_KEY))
    return v >= 1 && v <= 100 ? v : 100
  })

  // Restore a still-valid HiveAuth session on load so the user stays signed in
  // (and can act) without re-scanning the QR every visit.
  useEffect(() => {
    const saved = loadHA()
    if (saved) {
      loadHiveAuth().then((HiveAuthSigner) => {
        setSigner(new HiveAuthSigner(saved.username, setAuthPrompt, saved))
        setUsername(saved.username)
      })
    }
  }, [])

  const value = useMemo<SessionState>(
    () => ({
      username,
      signer,
      hasKeychain: hasKeychain(),
      voteWeight,
      authPrompt,
      cancelAuth: () => setAuthPrompt(null),
      setVoteWeight: (pct) => {
        const clamped = Math.max(1, Math.min(100, Math.round(pct)))
        localStorage.setItem(VOTE_KEY, String(clamped))
        setVoteWeightState(clamped)
      },
      loginKeychain: async (name) => {
        const s = new KeychainSigner()
        const { username: u } = await s.login(name)
        localStorage.setItem(USER_KEY, u)
        localStorage.removeItem(HA_KEY)
        setSigner(s)
        setUsername(u)
        return s
      },
      loginHiveAuth: async (name) => {
        const HiveAuthSigner = await loadHiveAuth()
        const s = new HiveAuthSigner(name, setAuthPrompt)
        const { username: u } = await s.login()
        localStorage.setItem(USER_KEY, u)
        localStorage.setItem(HA_KEY, JSON.stringify(s.session))
        setSigner(s)
        setUsername(u)
        return s
      },
      setReadOnlyUser: (name) => {
        const u = name.trim().replace(/^@/, '').toLowerCase()
        if (u) {
          localStorage.setItem(USER_KEY, u)
          setUsername(u)
        }
      },
      logout: () => {
        localStorage.removeItem(USER_KEY)
        localStorage.removeItem(HA_KEY)
        setSigner(null)
        setUsername(null)
        setAuthPrompt(null)
      },
    }),
    [username, signer, voteWeight, authPrompt],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useSession(): SessionState {
  const v = useContext(Ctx)
  if (!v) throw new Error('useSession outside SessionProvider')
  return v
}
