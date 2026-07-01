import { useEffect, useRef } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import type { FeedKind } from '../lib/types'
import { fetchGlobalFeed, fetchPersonalizedFeed } from '../lib/api'
import { FeedCard } from './FeedCard'
import { ErrorBoundary } from './ErrorBoundary'

const PAGE_SIZE = 20

// CSS scroll-snap vertical pager with infinite scroll. Pages are fetched lazily
// as the bottom sentinel nears the viewport, until HAF_FYP's cached feed runs
// out (a short page → no next page).
export function FeedPager({ kind, username, onNeedAuth }: { kind: FeedKind; username: string | null; onNeedAuth: () => void }) {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['feed', kind, username],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      kind === 'foryou' && username
        ? fetchPersonalizedFeed(username, pageParam, PAGE_SIZE)
        : fetchGlobalFeed(pageParam, PAGE_SIZE),
    // Stop when the last page came back short — that's the end of the cache.
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length + 1 : undefined,
  })

  const sentinelRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage()
      },
      { rootMargin: '250% 0px' }, // prefetch ~2.5 screens early so swiping never stalls
    )
    io.observe(el)
    return () => io.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  if (isLoading) return <div className="state">Loading the feed…</div>
  if (isError)
    return (
      <div className="state">
        <p>Couldn't reach HAF_FYP.</p>
        <pre className="state__err">{String((error as Error)?.message)}</pre>
        <button className="btn" onClick={() => refetch()}>Retry</button>
      </div>
    )

  const posts = data?.pages.flat() ?? []
  if (!posts.length) return <div className="state">No posts yet.</div>

  return (
    <div className="pager">
      {posts.map((post) => (
        <div className="pager__slide" key={`${post.author}/${post.permlink}`}>
          <ErrorBoundary>
            <FeedCard post={post} onNeedAuth={onNeedAuth} />
          </ErrorBoundary>
        </div>
      ))}

      {/* sentinel + end-of-feed slide */}
      <div ref={sentinelRef} className="pager__sentinel" />
      {!hasNextPage && (
        <div className="pager__slide pager__end">
          <p>You're all caught up ✨</p>
          <button className="btn" onClick={() => refetch()}>Refresh feed</button>
        </div>
      )}
      {isFetchingNextPage && <div className="pager__loading">Loading more…</div>}
    </div>
  )
}
