import { useState } from 'react'
import type { FypPost } from './types'
import { useSession } from './session'
import { telemetry } from './telemetry'

export type Busy = null | 'vote' | 'reblog' | 'follow' | 'comment'

// Shared on-chain action state + handlers for a post, so the feed card and the
// full-post reader stay in sync on one implementation (optimistic + rollback).
export function usePostActions(post: FypPost, onNeedAuth: () => void) {
  const { signer, voteWeight } = useSession()
  const [liked, setLiked] = useState(false)
  const [reblogged, setReblogged] = useState(false)
  const [followed, setFollowed] = useState(false)
  const [busy, setBusy] = useState<Busy>(null)
  const [toast, setToast] = useState<string | null>(null)

  function flash(msg: string) {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2200)
  }

  async function act(kind: Exclude<Busy, null>, run: () => Promise<void>, optimistic: () => void, rollback: () => void) {
    if (!signer) return onNeedAuth()
    setBusy(kind)
    optimistic()
    try {
      await run()
      telemetry.action({ postId: post.fyp?.post_id, kind })
      flash(`${kind === 'vote' ? 'Upvoted' : kind === 'reblog' ? 'Reblogged' : kind === 'follow' ? 'Following' : 'Commented'} ✓`)
    } catch (e) {
      rollback()
      flash((e as Error).message)
    } finally {
      setBusy(null)
    }
  }

  // Upvote at an explicit weight (used by the per-vote % picker). Allows
  // re-voting at a new weight since Hive permits vote changes.
  const vote = (weightPct: number) =>
    act('vote', () => signer!.vote(post.author, post.permlink, weightPct), () => setLiked(true), () => setLiked(false))

  // Quick upvote at the user's default weight (double-tap). No-op if already voted.
  const onLike = () => (liked ? undefined : vote(voteWeight))

  const onReblog = () =>
    act('reblog', () => signer!.reblog(post.author, post.permlink), () => setReblogged(true), () => setReblogged(false))

  const onFollow = () =>
    act('follow', () => signer!.follow(post.author), () => setFollowed(true), () => setFollowed(false))

  const submitComment = (body: string) =>
    act('comment', () => signer!.comment(post.author, post.permlink, body), () => {}, () => {})

  return { signer, liked, reblogged, followed, busy, toast, defaultWeight: voteWeight, vote, onLike, onReblog, onFollow, submitComment }
}
