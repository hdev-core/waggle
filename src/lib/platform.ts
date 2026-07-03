// Coarse pointer / touch primary input ≈ phone/tablet. Used to tailor UI (e.g.
// hide the desktop-only vote-weight slider); mobile can now sign via HiveAuth.
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.('(pointer: coarse)').matches || navigator.maxTouchPoints > 0
}
