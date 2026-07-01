import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { KeychainSigner, hasKeychain, type Signer } from './hive'

const VOTE_KEY = 'hivefy.voteWeight'
const USER_KEY = 'hivefy.username'

interface SessionState {
  username: string | null
  signer: Signer | null
  hasKeychain: boolean
  voteWeight: number // 1..100, default 100, adjustable
  setVoteWeight: (pct: number) => void
  loginKeychain: (username: string) => Promise<Signer>
  setReadOnlyUser: (username: string) => void // read personalized feed w/o signing
  logout: () => void
}

const Ctx = createContext<SessionState | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem(USER_KEY))
  const [signer, setSigner] = useState<Signer | null>(null)
  const [voteWeight, setVoteWeightState] = useState<number>(() => {
    const v = Number(localStorage.getItem(VOTE_KEY))
    return v >= 1 && v <= 100 ? v : 100
  })

  const value = useMemo<SessionState>(
    () => ({
      username,
      signer,
      hasKeychain: hasKeychain(),
      voteWeight,
      setVoteWeight: (pct) => {
        const clamped = Math.max(1, Math.min(100, Math.round(pct)))
        localStorage.setItem(VOTE_KEY, String(clamped))
        setVoteWeightState(clamped)
      },
      loginKeychain: async (name) => {
        const s = new KeychainSigner()
        const { username: u } = await s.login(name)
        localStorage.setItem(USER_KEY, u)
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
        setSigner(null)
        setUsername(null)
      },
    }),
    [username, signer, voteWeight],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useSession(): SessionState {
  const v = useContext(Ctx)
  if (!v) throw new Error('useSession outside SessionProvider')
  return v
}
