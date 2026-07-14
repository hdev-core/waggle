import { describe, it, expect } from 'vitest'
import { buildAuthUri } from './hiveauth'

// Regression guard: the QR/deep-link payload MUST carry `host`. Without it the
// wallet sends its approval to its own default HAS server and our app never
// receives the auth_ack — the user scans the QR and "nothing happens".
describe('buildAuthUri (HiveAuth QR payload)', () => {
  const uri = buildAuthUri('alice', 'uuid-123', 'aes-key-456', 'wss://hive-auth.arcange.eu/')

  it('uses the has://auth_req/ scheme the wallet expects', () => {
    expect(uri.startsWith('has://auth_req/')).toBe(true)
  })

  it('encodes account, uuid, key AND host', () => {
    const payload = JSON.parse(atob(uri.slice('has://auth_req/'.length)))
    expect(payload).toEqual({
      account: 'alice',
      uuid: 'uuid-123',
      key: 'aes-key-456',
      host: 'wss://hive-auth.arcange.eu/',
    })
  })

  it('always includes a non-empty host', () => {
    const payload = JSON.parse(atob(uri.slice('has://auth_req/'.length)))
    expect(payload.host).toBeTruthy()
  })
})
