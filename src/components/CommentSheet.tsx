import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getReplies, commentPayout, timeAgo, avatarUrl, type HiveComment } from '../lib/hiveRpc'
import { excerpt, displayReputation } from '../lib/post'

// Bottom sheet showing a post's existing comments (read from a Hive node) plus a
// composer. Replies are direct children; `children > 0` hints at deeper threads.
export function CommentSheet({
  author,
  permlink,
  childrenCount,
  onClose,
  onSubmit,
}: {
  author: string
  permlink: string
  childrenCount: number
  onClose: () => void
  onSubmit: (body: string) => Promise<void> | void
}) {
  const [body, setBody] = useState('')
  const [posting, setPosting] = useState(false)

  const { data: comments, isLoading, isError, refetch } = useQuery({
    queryKey: ['replies', author, permlink],
    queryFn: () => getReplies(author, permlink),
    staleTime: 30_000,
  })

  async function submit() {
    if (!body.trim()) return
    setPosting(true)
    try {
      await onSubmit(body.trim())
      setBody('')
      // Give the chain a moment, then refresh the thread to show the new reply.
      setTimeout(() => refetch(), 3500)
    } finally {
      setPosting(false)
    }
  }

  return (
    <div className="why" onClick={onClose}>
      <div className="why__sheet sheet--tall" onClick={(e) => e.stopPropagation()}>
        <div className="sheet__grip" />
        <h3>{childrenCount > 0 ? `${childrenCount} comment${childrenCount === 1 ? '' : 's'}` : 'Comments'}</h3>

        <div className="comments">
          {isLoading && <p className="comments__muted">Loading comments…</p>}
          {isError && (
            <p className="comments__muted">
              Couldn't load comments. <button className="linkbtn" onClick={() => refetch()}>Retry</button>
            </p>
          )}
          {comments && comments.length === 0 && (
            <p className="comments__muted">No comments yet — be the first.</p>
          )}
          {comments?.map((c) => <CommentRow key={`${c.author}/${c.permlink}`} c={c} />)}
        </div>

        <div className="composer__wrap">
          <textarea
            className="composer"
            rows={2}
            placeholder={`Reply to @${author}…`}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <div className="composer__row">
            <button className="btn btn--ghost" onClick={onClose}>Close</button>
            <button className="btn" disabled={!body.trim() || posting} onClick={submit}>
              {posting ? 'Posting…' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CommentRow({ c, depth = 0 }: { c: HiveComment; depth?: number }) {
  const [open, setOpen] = useState(false)
  const rep = displayReputation(c.author_reputation)

  // Load this comment's own replies only when expanded (lazy, cached).
  const { data: kids, isLoading } = useQuery({
    queryKey: ['replies', c.author, c.permlink],
    queryFn: () => getReplies(c.author, c.permlink),
    enabled: open && c.children > 0,
    staleTime: 30_000,
  })

  return (
    <div className="comment">
      <img className="comment__avatar" src={avatarUrl(c.author)} alt="" loading="lazy" />
      <div className="comment__main">
        <div className="comment__head">
          <span className="comment__author">@{c.author}</span>
          {rep != null && <span className="comment__rep">({rep})</span>}
          <span className="comment__dot">·</span>
          <span className="comment__age">{timeAgo(c.created)}</span>
        </div>
        <p className="comment__body">{excerpt(c.body, 500)}</p>
        <div className="comment__foot">
          <span>▲ {c.net_votes}</span>
          <span>${commentPayout(c).toFixed(2)}</span>
          {c.children > 0 && (
            <button className="linkbtn" onClick={() => setOpen((o) => !o)}>
              {open ? 'Hide replies' : `↳ ${c.children} repl${c.children === 1 ? 'y' : 'ies'}`}
            </button>
          )}
        </div>

        {open && c.children > 0 && (
          <div className="comment__kids">
            {isLoading && <p className="comments__muted">Loading replies…</p>}
            {kids?.map((k) => (
              <CommentRow key={`${k.author}/${k.permlink}`} c={k} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
