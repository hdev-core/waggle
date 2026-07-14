import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { App } from './App'
import { SessionProvider } from './lib/session'
import './styles.css'

// Every deploy replaces the hashed asset files and DELETES the old ones. A tab
// that was loaded from a previous build (or a cached index.html) still points at
// the old hashes, so a lazy chunk — e.g. the HiveAuth signer, only fetched when
// you press Sign in — 404s with "Failed to fetch dynamically imported module".
// Vite fires `vite:preloadError` in that case; reload once to pick up the fresh
// asset manifest. The timestamp guard prevents a reload loop if the chunk is
// genuinely missing (e.g. a broken deploy) rather than merely stale.
const RELOAD_KEY = 'waggle.chunkReloadAt'
window.addEventListener('vite:preloadError', (e) => {
  const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0)
  if (Date.now() - last < 30_000) return // already tried recently — let the error surface
  e.preventDefault()
  sessionStorage.setItem(RELOAD_KEY, String(Date.now()))
  window.location.reload()
})

const qc = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false } },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <SessionProvider>
        <App />
      </SessionProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
