import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listCommunities, communityIdFromName, avatarUrl } from '../lib/hiveRpc'
import { postInterests } from '../lib/api'
import { buildInterestsMessage } from '../lib/interests'
import { useSession } from '../lib/session'

const MAX = 50

// Cold-start onboarding: a new user with no interest vector picks communities
// they like. We submit the numeric community_ids to POST /v1/fyp/interests; the
// ranker then bootstraps their interest vector on its next cycle. The feed keeps
// working (falls back to global) meanwhile.
export function InterestPicker({ username, onClose, onSaved }: {
  username: string
  onClose: () => void
  onSaved: () => void
}) {
  const { data: communities, isLoading, isError, refetch } = useQuery({
    queryKey: ['communities'],
    queryFn: () => listCommunities(80),
    staleTime: 60 * 60_000,
  })

  const { signer, loginKeychain } = useSession()
  const [sel, setSel] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  function toggle(name: string) {
    setSel((s) => {
      const n = new Set(s)
      if (n.has(name)) n.delete(name)
      else if (n.size < MAX) n.add(name)
      return n
    })
  }

  async function save() {
    setSaving(true)
    setErr(null)
    try {
      const ids = [...sel].map(communityIdFromName).filter((n) => Number.isFinite(n))
      // Saving interests is an authenticated write: prove control of the account
      // by signing the challenge with the posting key (Keychain). Sign in first
      // if the user was only browsing read-only.
      const s = signer ?? (await loginKeychain(username))
      const timestamp = Math.floor(Date.now() / 1000)
      const signature = await s.sign(buildInterestsMessage(username, timestamp, ids))
      await postInterests({ username, communities: ids, timestamp, signature })
      setSaved(true)
      setTimeout(onSaved, 1400)
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="picker">
      <div className="picker__head">
        <div>
          <h2>Pick your interests</h2>
          <p className="picker__sub">Choose a few communities to personalize your For You feed.</p>
        </div>
        <button className="picker__skip" onClick={onClose}>Skip</button>
      </div>

      {saved ? (
        <div className="picker__done">
          <div className="picker__check">✓</div>
          <h3>You're all set!</h3>
          <p className="picker__sub">Your feed will personalize within a few minutes as we learn what you like.</p>
        </div>
      ) : (
        <>
          <div className="picker__grid">
            {isLoading && <p className="comments__muted">Loading communities…</p>}
            {isError && (
              <p className="comments__muted">
                Couldn't load communities. <button className="linkbtn" onClick={() => refetch()}>Retry</button>
              </p>
            )}
            {communities?.map((c) => {
              const on = sel.has(c.name)
              return (
                <button key={c.name} className={`ctile ${on ? 'ctile--on' : ''}`} onClick={() => toggle(c.name)}>
                  <img className="ctile__avatar" src={avatarUrl(c.name)} alt="" loading="lazy" />
                  <span className="ctile__title">{c.title}</span>
                  <span className="ctile__subs">{c.subscribers.toLocaleString()} subs</span>
                  {on && <span className="ctile__badge">✓</span>}
                </button>
              )
            })}
          </div>

          <div className="picker__foot">
            {err && <p className="state__err">{err}</p>}
            <button className="btn btn--full" disabled={sel.size < 1 || saving} onClick={save}>
              {saving ? 'Check Keychain…' : sel.size ? `Sign & personalize (${sel.size})` : 'Select at least one'}
            </button>
            <p className="login__hint">Saving is signed with Hive Keychain to prove it's your account — no transaction, no fee.</p>
          </div>
        </>
      )}
    </div>
  )
}
