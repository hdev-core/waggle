# HiveFY

A TikTok-inspired "For You" client for Hive, powered by the **HAF_FYP** ranking
API. Full-screen vertical swipe feed of personalized Hive content; engagement
(likes/reblogs/comments/follows) is signed on-chain client-side via WAX, which
flows back into the ranker.

> Status: **M0 spike** — read-only feed render with hybrid cards. See
> [`../haf-fyp-frontend-plan.md`](../haf-fyp-frontend-plan.md) for the full roadmap.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
```

By default it renders **bundled mock data** (`VITE_USE_MOCK=true`) so the UI works
with no backend. To hit the live FYP:

```bash
cp .env.example .env.local
# set VITE_USE_MOCK=false and VITE_FYP_PROXY_TARGET to the testapi host
npm run dev
```

In dev, `/v1/fyp/*` is proxied (see `vite.config.ts`) so there's no CORS. In
prod, set `VITE_FYP_BASE` to the public FYP origin and add an
`Access-Control-Allow-Origin` header on the FYP nginx.

## What's wired (M0)

- Vertical scroll-snap pager, one post per viewport
- **Hybrid cards:** hero image / YouTube / 3Speak / mp4 when present, else a
  gradient text-card — every FYP post renders
- Overlay: title, excerpt, @author + reputation, payout, community, tags
- Right rail: like / comment / reblog / follow (stubbed) + "Why this?" sheet
  driven by the nested `fyp` signal scores
- For You vs Discover tabs; typed username unlocks the personalized feed

## Next (see plan)

- **M2:** WAX (`@hiveio/wax`) + Keychain/HiveAuth signing → real upvote / reblog
  / comment / follow
- **M3:** full Hive-flavored markdown render, comment drawer, post detail, PWA

## Layout

```
src/
  lib/
    types.ts   FYP response types
    api.ts     feed fetch (+ mock toggle)
    post.ts    media extraction, excerpt, reputation, payout helpers
    mock.ts    sample feed
  components/
    FeedPager.tsx   scroll-snap pager + data fetching
    FeedCard.tsx    one post: media, overlay, action rail, why-sheet
  App.tsx      tabs + username gate
  main.tsx     React Query root
```
