import { useQuery } from '@tanstack/react-query'
import type { FeedKind } from '../lib/types'
import { fetchGlobalFeed, fetchPersonalizedFeed } from '../lib/api'
import { FeedCard } from './FeedCard'

// CSS scroll-snap vertical pager — one full-viewport post per snap point.
// Native, dependency-free, and gives the TikTok swipe-up feel for free.
export function FeedPager({ kind, username, onNeedAuth }: { kind: FeedKind; username: string | null; onNeedAuth: () => void }) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['feed', kind, username],
    queryFn: () =>
      kind === 'foryou' && username
        ? fetchPersonalizedFeed(username)
        : fetchGlobalFeed(),
  })

  if (isLoading) return <div className="state">Loading the feed…</div>
  if (isError)
    return (
      <div className="state">
        <p>Couldn't reach HAF_FYP.</p>
        <pre className="state__err">{String((error as Error)?.message)}</pre>
        <button className="btn" onClick={() => refetch()}>Retry</button>
      </div>
    )
  if (!data?.length) return <div className="state">No posts yet.</div>

  return (
    <div className="pager">
      {data.map((post) => (
        <div className="pager__slide" key={`${post.author}/${post.permlink}`}>
          <FeedCard post={post} onNeedAuth={onNeedAuth} />
        </div>
      ))}
    </div>
  )
}
