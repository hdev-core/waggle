import { describe, it, expect } from 'vitest'
import { buildInterestsMessage } from './interests'

// This string is verified against the backend byte-for-byte (haf_fyp
// auth.build_message). If it changes, signed-interests auth breaks — so these
// assertions are intentionally exact.
describe('buildInterestsMessage', () => {
  it('produces the canonical challenge with sorted, de-duped ids', () => {
    expect(buildInterestsMessage('alice', 1751000000, [3, 1, 2])).toBe('hivefy:interests:v1:alice:1751000000:1,2,3')
  })

  it('de-duplicates community ids', () => {
    expect(buildInterestsMessage('bob', 42, [5, 5, 1])).toBe('hivefy:interests:v1:bob:42:1,5')
  })

  it('handles an empty community set', () => {
    expect(buildInterestsMessage('carol', 7, [])).toBe('hivefy:interests:v1:carol:7:')
  })

  it('is stable regardless of input order (replay-binding)', () => {
    const a = buildInterestsMessage('u', 100, [9, 4, 7])
    const b = buildInterestsMessage('u', 100, [7, 9, 4])
    expect(a).toBe(b)
  })
})
