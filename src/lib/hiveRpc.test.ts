import { describe, it, expect } from 'vitest'
import { communityIdFromName, avatarUrl } from './hiveRpc'

describe('communityIdFromName', () => {
  it('derives the numeric suffix of a hive-NNNN community (matches the FYP processor)', () => {
    expect(communityIdFromName('hive-163772')).toBe(163772)
    expect(communityIdFromName('hive-1')).toBe(1)
  })
  it('is NaN for a non-community name (filtered out by callers)', () => {
    expect(Number.isNaN(communityIdFromName('leo'))).toBe(true)
  })
})

describe('avatarUrl', () => {
  it('builds the Hive avatar URL', () => {
    expect(avatarUrl('alice')).toBe('https://images.hive.blog/u/alice/avatar/small')
    expect(avatarUrl('alice', 'medium')).toBe('https://images.hive.blog/u/alice/avatar/medium')
  })
})
