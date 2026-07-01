import { useMemo, useState } from 'react'
import type { FypPost } from '../lib/types'
import { payoutOf, displayReputation, metaTags } from '../lib/post'
import { renderMarkdown } from '../lib/markdown'
import { avatarUrl, timeAgo } from '../lib/hiveRpc'
import { usePostActions } from '../lib/usePostActions'
import { CommentSheet } from './CommentSheet'
import { VoteWeightSheet } from './VoteWeightSheet'
import { IconHeart, IconComment, IconReblog, IconFollow } from './icons'

// Full-post reader as a modal: tap the backdrop (or Back) to close. Renders the
// complete body as sanitised markdown/HTML and carries its own action bar so you
// can like / reblog / follow / comment without returning to the feed.
export function PostReader({ post, onClose, onNeedAuth }: { post: FypPost; onClose: () => void; onNeedAuth: () => void }) {
  const html = useMemo(() => renderMarkdown(post.body), [post.body])
  const tags = metaTags(post)
  const rep = displayReputation(post.author_reputation)
  const baseVotes = post.active_votes?.length ?? 0
  const hiveUrl = post.url ? `https://peakd.com${post.url}` : `https://peakd.com/@${post.author}/${post.permlink}`

  const { signer, liked, reblogged, followed, busy, toast, defaultWeight, vote, onReblog, onFollow, submitComment } = usePostActions(post, onNeedAuth)
  const [showComment, setShowComment] = useState(false)
  const [showVote, setShowVote] = useState(false)

  return (
    <div className="reader" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="reader__panel" onClick={(e) => e.stopPropagation()}>
        <header className="reader__bar">
          <button className="reader__close" onClick={onClose} aria-label="Close">‹ Back</button>
          {post.community_title && <span className="chip">{post.community_title}</span>}
        </header>

        <article className="reader__body">
          <h1 className="reader__title">{post.title}</h1>
          <div className="reader__byline">
            <img className="reader__avatar" src={avatarUrl(post.author, 'medium')} alt="" />
            <div>
              <div className="reader__author">@{post.author}{rep != null && <span className="reader__rep"> ({rep})</span>}</div>
              <div className="reader__sub">{timeAgo(post.created)} ago · ${payoutOf(post).toFixed(2)}</div>
            </div>
          </div>

          <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />

          {tags.length > 0 && (
            <div className="reader__tags">{tags.slice(0, 6).map((t) => <span key={t} className="tag">#{t}</span>)}</div>
          )}
          <a className="reader__ext" href={hiveUrl} target="_blank" rel="noreferrer">View on Hive ↗</a>
        </article>

        <footer className="reader__actions">
          <button className={`rbtn ${liked ? 'rbtn--on' : ''}`} onClick={() => (signer ? setShowVote(true) : onNeedAuth())} disabled={busy === 'vote'}>
            <IconHeart size={22} filled={liked} /> <span>{baseVotes + (liked ? 1 : 0)}</span>
          </button>
          <button className="rbtn" onClick={() => setShowComment(true)}>
            <IconComment size={22} /> <span>{post.children ?? 0}</span>
          </button>
          <button className={`rbtn ${reblogged ? 'rbtn--on' : ''}`} onClick={onReblog} disabled={busy === 'reblog'}>
            <IconReblog size={22} /> <span>Reblog</span>
          </button>
          <button className={`rbtn ${followed ? 'rbtn--on' : ''}`} onClick={onFollow} disabled={busy === 'follow'}>
            <IconFollow size={22} filled={followed} /> <span>{followed ? 'Following' : 'Follow'}</span>
          </button>
        </footer>

        {toast && <div className="toast toast--reader">{toast}</div>}

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
      </div>

      {showComment && (
        <CommentSheet
          author={post.author}
          permlink={post.permlink}
          childrenCount={post.children ?? 0}
          onClose={() => setShowComment(false)}
          onSubmit={submitComment}
        />
      )}
    </div>
  )
}
