import { useRef, useState, type ReactNode } from 'react'
import type { FypPost } from '../lib/types'
import { excerpt, payoutOf, displayReputation, metaTags, contentWarning } from '../lib/post'
import { usePostActions } from '../lib/usePostActions'
import { useImpression } from '../lib/useImpression'
import { telemetry, type PostMeta } from '../lib/telemetry'
import { Hero } from './Hero'
import { CommentSheet } from './CommentSheet'
import { PostReader } from './PostReader'
import { VoteWeightSheet } from './VoteWeightSheet'
import { IconHeart, IconComment, IconReblog, IconFollow, IconInfo } from './icons'

function formatCount(n?: number): string | null {
  if (n == null) return null
  if (n < 1000) return String(n)
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0)}k`
  return `${(n / 1_000_000).toFixed(1)}m`
}

function Action({ icon, label, count, active, busy, onClick }: {
  icon: ReactNode; label: string; count?: number; active?: boolean; busy?: boolean; onClick?: () => void
}) {
  return (
    <button className={`action ${active ? 'action--on' : ''} ${busy ? 'action--busy' : ''}`} onClick={onClick} aria-label={label} disabled={busy}>
      <span className="action__icon">{icon}</span>
      {count != null && <span className="action__count">{formatCount(count)}</span>}
    </button>
  )
}

export function FeedCard({ post, onNeedAuth }: { post: FypPost; onNeedAuth: () => void }) {
  const tags = metaTags(post)
  const rep = displayReputation(post.author_reputation)
  const baseVotes = post.active_votes?.length ?? 0

  const { signer, liked, reblogged, followed, busy, toast, defaultWeight, vote, onLike, onReblog, onFollow, submitComment } = usePostActions(post, onNeedAuth)
  const [showWhy, setShowWhy] = useState(false)
  const [showComment, setShowComment] = useState(false)
  const [showReader, setShowReader] = useState(false)
  const [showVote, setShowVote] = useState(false)
  const [revealed, setRevealed] = useState(false)

  // Rail heart opens the % picker (or prompts login); double-tap quick-votes.
  const openVote = () => (signer ? setShowVote(true) : onNeedAuth())

  // Telemetry (#12): impression while this card is the active slide + reader opens.
  const cardRef = useRef<HTMLElement>(null)
  const meta: PostMeta = { postId: post.fyp?.post_id, rank: post.fyp?.rank, source: post.fyp?.source, algoVersion: post.fyp?.algorithm_version }
  useImpression(cardRef, meta)
  const openReader = () => {
    telemetry.open(meta)
    setShowReader(true)
  }

  // Blur + collapse NSFW / muted / low-rated posts until the user opts in.
  const warning = contentWarning(post)
  const gated = !!warning && !revealed

  return (
    <section className="card" ref={cardRef} onDoubleClick={gated ? undefined : onLike}>
      <Hero post={post} title={post.title} blurred={gated} meta={meta} />
      {liked && !gated && <div className="card__heart">♥</div>}

      {gated && (
        <div className="gate">
          <div className="gate__icon">🚫</div>
          <h3 className="gate__label">{warning!.label}</h3>
          <p className="gate__sub">@{post.author}</p>
          <button className="btn" onClick={() => setRevealed(true)}>View anyway</button>
        </div>
      )}

      {!gated && (<>
      <div className="card__overlay">
        <div className="card__meta">
          {post.community_title && <span className="chip">{post.community_title}</span>}
          {post.fyp?.source && <span className={`chip chip--${post.fyp.source}`}>{post.fyp.source === 'personalized' ? 'For You' : 'Discover'}</span>}
        </div>
        <h2 className="card__title" onClick={openReader}>{post.title}</h2>
        <p className="card__excerpt" onClick={openReader}>
          {excerpt(post.body)} <span className="card__more">Read more</span>
        </p>
        <div className="card__author">
          <span className="card__handle">@{post.author}</span>
          {rep != null && <span className="card__rep">({rep})</span>}
          <span className="card__payout">${payoutOf(post).toFixed(2)}</span>
        </div>
        {tags.length > 0 && <div className="card__tags">{tags.slice(0, 3).map((t) => <span key={t} className="tag">#{t}</span>)}</div>}
      </div>

      <div className="card__rail">
        <Action icon={<IconHeart filled={liked} />} label="Upvote" count={baseVotes + (liked ? 1 : 0)} active={liked} busy={busy === 'vote'} onClick={openVote} />
        <Action icon={<IconComment />} label="Comment" count={post.children} onClick={() => setShowComment(true)} />
        <Action icon={<IconReblog />} label="Reblog" active={reblogged} busy={busy === 'reblog'} onClick={onReblog} />
        <Action icon={<IconFollow filled={followed} />} label="Follow author" active={followed} busy={busy === 'follow'} onClick={onFollow} />
        <Action icon={<IconInfo />} label="Why this post" onClick={() => setShowWhy((v) => !v)} />
      </div>
      </>)}

      {toast && <div className="toast">{toast}</div>}

      {showVote && (
        <VoteWeightSheet
          defaultWeight={defaultWeight}
          busy={busy === 'vote'}
          onClose={() => setShowVote(false)}
          onConfirm={(pct) => {
            vote(pct)
            setShowVote(false)
          }}
        />
      )}

      {showReader && <PostReader post={post} onClose={() => setShowReader(false)} onNeedAuth={onNeedAuth} />}

      {showComment && (
        <CommentSheet
          author={post.author}
          permlink={post.permlink}
          childrenCount={post.children ?? 0}
          onClose={() => setShowComment(false)}
          onSubmit={submitComment}
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
