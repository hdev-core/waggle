import { useState } from 'react'
import type { FypPost } from '../lib/types'
import { excerpt, payoutOf, displayReputation, parseMeta } from '../lib/post'
import { useSession } from '../lib/session'
import { Hero } from './Hero'
import { CommentSheet } from './CommentSheet'

function Action({ icon, label, count, active, busy, onClick }: {
  icon: string; label: string; count?: number; active?: boolean; busy?: boolean; onClick?: () => void
}) {
  return (
    <button className={`action ${active ? 'action--on' : ''}`} onClick={onClick} aria-label={label} disabled={busy}>
      <span className="action__icon">{busy ? '…' : icon}</span>
      {count != null && <span className="action__count">{count}</span>}
    </button>
  )
}

type Busy = null | 'vote' | 'reblog' | 'follow' | 'comment'

export function FeedCard({ post, onNeedAuth }: { post: FypPost; onNeedAuth: () => void }) {
  const { signer, voteWeight } = useSession()
  const meta = parseMeta(post)
  const rep = displayReputation(post.author_reputation)
  const baseVotes = post.active_votes?.length ?? 0

  const [liked, setLiked] = useState(false)
  const [reblogged, setReblogged] = useState(false)
  const [followed, setFollowed] = useState(false)
  const [busy, setBusy] = useState<Busy>(null)
  const [showWhy, setShowWhy] = useState(false)
  const [showComment, setShowComment] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  function flash(msg: string) {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2200)
  }

  // Optimistic action wrapper: flips UI immediately, rolls back on failure.
  async function act(kind: Exclude<Busy, null>, run: () => Promise<void>, optimistic: () => void, rollback: () => void) {
    if (!signer) return onNeedAuth()
    setBusy(kind)
    optimistic()
    try {
      await run()
      flash(`${kind === 'vote' ? 'Upvoted' : kind === 'reblog' ? 'Reblogged' : kind === 'follow' ? 'Following' : 'Commented'} ✓`)
    } catch (e) {
      rollback()
      flash((e as Error).message)
    } finally {
      setBusy(null)
    }
  }

  const onLike = () =>
    liked
      ? undefined // M2: no un-vote yet (vote weight 0 = removal, added later)
      : act('vote', () => signer!.vote(post.author, post.permlink, voteWeight), () => setLiked(true), () => setLiked(false))

  const onReblog = () =>
    act('reblog', () => signer!.reblog(post.author, post.permlink), () => setReblogged(true), () => setReblogged(false))

  const onFollow = () =>
    act('follow', () => signer!.follow(post.author), () => setFollowed(true), () => setFollowed(false))

  return (
    <section className="card" onDoubleClick={onLike}>
      <Hero post={post} title={post.title} />
      {liked && <div className="card__heart">♥</div>}

      <div className="card__overlay">
        <div className="card__meta">
          {post.community_title && <span className="chip">{post.community_title}</span>}
          {post.fyp?.source && <span className={`chip chip--${post.fyp.source}`}>{post.fyp.source === 'personalized' ? 'For You' : 'Discover'}</span>}
        </div>
        <h2 className="card__title">{post.title}</h2>
        <p className="card__excerpt">{excerpt(post.body)}</p>
        <div className="card__author">
          <span className="card__handle">@{post.author}</span>
          {rep != null && <span className="card__rep">({rep})</span>}
          <span className="card__payout">${payoutOf(post).toFixed(2)}</span>
        </div>
        {meta.tags && <div className="card__tags">{meta.tags.slice(0, 3).map((t) => <span key={t} className="tag">#{t}</span>)}</div>}
      </div>

      <div className="card__rail">
        <Action icon={liked ? '♥' : '♡'} label="Upvote" count={baseVotes + (liked ? 1 : 0)} active={liked} busy={busy === 'vote'} onClick={onLike} />
        <Action icon="💬" label="Comment" count={post.children} onClick={() => setShowComment(true)} />
        <Action icon="🔁" label="Reblog" active={reblogged} busy={busy === 'reblog'} onClick={onReblog} />
        <Action icon={followed ? '✓' : '＋'} label="Follow author" active={followed} busy={busy === 'follow'} onClick={onFollow} />
        <Action icon="？" label="Why this post" onClick={() => setShowWhy((v) => !v)} />
      </div>

      {toast && <div className="toast">{toast}</div>}

      {showComment && (
        <CommentSheet
          author={post.author}
          permlink={post.permlink}
          childrenCount={post.children ?? 0}
          onClose={() => setShowComment(false)}
          onSubmit={(body) =>
            act('comment', () => signer!.comment(post.author, post.permlink, body), () => {}, () => {})
          }
        />
      )}

      {showWhy && post.fyp && (
        <div className="why" onClick={() => setShowWhy(false)}>
          <div className="why__sheet" onClick={(e) => e.stopPropagation()}>
            <h3>Why you're seeing this</h3>
            <Bar label="Relevance" v={post.fyp.score_relevance} w={0.4} />
            <Bar label="Recency" v={post.fyp.score_recency} w={0.3} />
            <Bar label="Engagement" v={post.fyp.score_engagement} w={0.2} />
            <Bar label="Credibility" v={post.fyp.score_credibility} w={0.1} />
            {post.fyp.community_boost_applied && <p className="why__boost">×1.2 community boost (you subscribe)</p>}
            <p className="why__score">Final score {(post.fyp.final_score * 100).toFixed(0)}/100{post.fyp.rank ? ` · rank #${post.fyp.rank}` : ''}</p>
          </div>
        </div>
      )}
    </section>
  )
}

function Bar({ label, v, w }: { label: string; v: number | null; w: number }) {
  const pct = v == null ? 0 : Math.round(v * 100)
  return (
    <div className="bar">
      <span className="bar__label">{label} <em>×{w}</em></span>
      <span className="bar__track"><span className="bar__fill" style={{ width: `${pct}%` }} /></span>
      <span className="bar__val">{v == null ? '—' : pct}</span>
    </div>
  )
}
