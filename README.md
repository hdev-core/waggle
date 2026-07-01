# 🐝 Waggle

A TikTok-style **"For You" feed for Hive**, powered by the **HAF_FYP** ranking
API. Full-screen vertical swipe through personalized, ranked Hive content;
engagement (likes / reblogs / comments / follows) is signed on-chain client-side
via Hive Keychain and flows back into the ranker.

> The name: a bee's *waggle dance* is how the hive tells everyone where the good
> stuff is — which is exactly what a discovery feed does.

**Live:** https://hdev-core.github.io/waggle/

## Features

- **Vertical scroll-snap feed** — one post per viewport, swipe to advance
- **For You** (personalized) and **Discover** (global) feeds from live HAF_FYP
- **Hybrid cards** — hero image / YouTube / 3Speak / mp4 when present, else a
  gradient text-card, so every post renders
- **Full-post reader** with sanitized Hive markdown/HTML (marked + DOMPurify),
  proxied images, `@mention` links, and Condenser layout classes
- **Comments** — read existing threads (with expandable nested replies) and post
- **On-chain actions** via Keychain — upvote (with a per-vote % picker), reblog,
  follow, comment; optimistic UI
- **Cold-start interest picker** — new users pick communities to seed their feed
  (an authenticated, posting-key-signed write)
- **Content safety** — NSFW / muted / low-rated posts are blurred with a reveal
- **"Why this?"** — per-post ranking-signal breakdown
- Installable PWA

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
```

By default it hits the live HAF_FYP on testapi. Set `VITE_USE_MOCK=true` to
render the bundled sample feed with no backend.

```bash
cp .env.example .env.local   # then edit as needed
```

## Configuration

| Env var | Purpose |
|---------|---------|
| `VITE_FYP_BASE` | HAF_FYP PostgREST base (feeds/profile). Default: testapi. |
| `VITE_FYP_ADMIN_BASE` | HAF_FYP FastAPI overlay (interests). **Separate path** from feeds. |
| `VITE_HIVE_RPC` | Hive RPC node for reading comments (public, CORS-open). |
| `VITE_USE_MOCK` | `true` to use the bundled sample feed offline. |
| `PAGES_BASE` | Build-time base path for GitHub Pages (`/waggle/`), `/` for custom domain. |

## Architecture

Waggle is a pure client of HAF_FYP + Hive:

- **Reads** — feeds/profile from HAF_FYP (`bridge.get_ranked_posts` shape + a
  nested `fyp` object of ranking signals); comments from a Hive RPC node.
- **Writes** — built and signed client-side with Hive Keychain, broadcast to Hive
  (votes/reblogs/comments/follows). The cold-start interest write is signed with
  the posting key and verified server-side. No backend of its own; no key custody.

## Deploy

Static SPA on **GitHub Pages** via `.github/workflows/deploy-pages.yml` — every
push to `main` builds and publishes `dist`. Production API config is set in the
workflow (overridable via repo Variables). A custom domain just needs a `CNAME`
and `PAGES_BASE=/`.

## Layout

```
src/
  lib/       api, hive (signing), hiveRpc (comments), markdown, post helpers,
             session, usePostActions, interests, platform, types
  components/ FeedPager, FeedCard, Hero, PostReader, CommentSheet, VoteWeightSheet,
             InterestPicker, LoginSheet, ErrorBoundary, icons
  App.tsx    tabs + cold-start + login orchestration
```

## Status

Beta (desktop + Keychain). Mobile is browse-only until HiveAuth mobile signing
lands. See `../waggle-go-live-plan.md` for the launch plan.
