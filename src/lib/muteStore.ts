import { useSyncExternalStore } from 'react'

// Global mute preference shared by every video card. Toggling sound on one card
// applies to all — the next video keeps the same setting (TikTok behavior).
// Persisted so the choice survives reloads. Defaults to muted (autoplay policy).
const KEY = 'hivefy.muted'
let muted = (localStorage.getItem(KEY) ?? 'true') !== 'false'
const listeners = new Set<() => void>()

export function setMuted(v: boolean) {
  if (v === muted) return
  muted = v
  localStorage.setItem(KEY, String(v))
  listeners.forEach((l) => l())
}

export function useMuted(): [boolean, (v: boolean) => void] {
  const value = useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => muted,
  )
  return [value, setMuted]
}
