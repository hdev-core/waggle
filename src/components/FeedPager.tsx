import { useEffect, useRef } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import type { FeedKind, FypPost } from '../lib/types'
import { fetchGlobalFeed, fetchPersonalizedFeed } from '../lib/api'
import { FeedCard } from './FeedCard'
import { ErrorBoundary } from './ErrorBoundary'

const PAGE_SIZE = 20

type PageParam = { mode: 'foryou' | 'global'; page: number }

// CSS scroll-snap vertical pager with infinite scroll. Pages fetch lazily as the
// bottom sentinel nears the viewport. When a personalized feed runs out (short
// page), it falls through into the global feed so the feed never dead-ends;
// posts are de-duplicated across the boundary.
export function FeedPager({ kind, username, onNeedAuth }: { kind: FeedKind; username: string | null; onNeedAuth: () => void }) {
  const startMode: PageParam['mode'] = kind === 'foryou' && username ? 'foryou' : 'global'

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
    initialPageParam: { mode: startMode, page: 1 } as PageParam,
    queryFn: ({ pageParam }) =>
      pageParam.mode === 'foryou' && username
        ? fetchPersonalizedFeed(username, pageParam.page, PAGE_SIZE)
        : fetchGlobalFeed(pageParam.page, PAGE_SIZE),
    getNextPageParam: (lastPage, _all, lastParam): PageParam | undefined => {
      // >= (not ==): page 1 may be padded with injected sample videos, so a full
      // page can exceed PAGE_SIZE. A short page still signals end-of-source.
      if (lastPage.length >= PAGE_SIZE) return { mode: lastParam.mode, page: lastParam.page + 1 }
      // Short page = end of this source. Personalized falls through to global.
      if (lastParam.mode === 'foryou') return { mode: 'global', page: 1 }
      return undefined
    },
  })

  const sentinelRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage()
      },
      { rootMargin: '250% 0px' },
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

  // De-dupe across pages and the foryou→global boundary.
  const seen = new Set<string>()
  const posts: FypPost[] = []
  for (const p of data?.pages.flat() ?? []) {
    const key = `${p.author}/${p.permlink}`
    if (!seen.has(key)) {
      seen.add(key)
      posts.push(p)
    }
  }
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
