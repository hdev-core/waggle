import { hasKeychain } from './hive'

// Coarse pointer / touch primary input ≈ phone/tablet.
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.('(pointer: coarse)').matches || navigator.maxTouchPoints > 0
}

// A mobile visitor with no Keychain extension can't sign yet (HiveAuth is a
// post-beta milestone). We browse-gate the sign-in UX for them instead of
// pushing a Keychain flow that can't complete.
export function isMobileNoKeychain(): boolean {
  return isTouchDevice() && !hasKeychain()
}
