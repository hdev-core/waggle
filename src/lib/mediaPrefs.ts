import { useSyncExternalStore } from 'react'

// Global playback preferences shared by every video card: mute, volume (0..1),
// and speed. Toggling on one card applies to all and the next video keeps the
// setting (TikTok behavior). Persisted so choices survive reloads.
export interface MediaPrefs {
  muted: boolean
  volume: number // 0..1
  speed: number // 1 | 1.5 | 2
}

const KEY = 'hivefy.media'

function load(): MediaPrefs {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) || '{}')
    return {
      muted: p.muted ?? true,
      volume: typeof p.volume === 'number' ? Math.min(1, Math.max(0, p.volume)) : 1,
      speed: [1, 1.5, 2].includes(p.speed) ? p.speed : 1,
    }
  } catch {
    return { muted: true, volume: 1, speed: 1 }
  }
}

let prefs = load()
const listeners = new Set<() => void>()

function set(patch: Partial<MediaPrefs>) {
  prefs = { ...prefs, ...patch }
  localStorage.setItem(KEY, JSON.stringify(prefs))
  listeners.forEach((l) => l())
}

export function useMediaPrefs() {
  const value = useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => prefs,
  )
  return {
    ...value,
    setMuted: (m: boolean) => set({ muted: m }),
    // Raising the volume implicitly unmutes; dragging to zero mutes.
    setVolume: (v: number) => set({ volume: Math.min(1, Math.max(0, v)), muted: v <= 0 }),
    cycleSpeed: () => set({ speed: value.speed === 1 ? 1.5 : value.speed === 1.5 ? 2 : 1 }),
  }
}
