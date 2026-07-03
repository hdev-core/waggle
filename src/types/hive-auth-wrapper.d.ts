declare module 'hive-auth-wrapper' {
  // Minimal typing for the HiveAuth Service (HAS) wrapper. The wrapper mutates
  // the passed `auth` object, setting token/expire/key on successful auth.
  interface HASAuth {
    username: string
    token?: string
    expire?: number
    key?: string
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type Cb = (evt: any) => void
  interface HAS {
    setOptions(o: { host?: string; auth_key_secret?: string }): void
    status(): unknown
    connect(): Promise<void>
    authenticate(auth: HASAuth, appData: unknown, challengeData?: unknown, cbWait?: Cb): Promise<{ data: { token: string; expire: number } }>
    broadcast(auth: HASAuth, keyType: string, ops: unknown[], cbWait?: Cb): Promise<unknown>
    challenge(auth: HASAuth, challengeData: unknown, cbWait?: Cb): Promise<{ data: { challenge: string; pubkey: string } }>
  }
  const HAS: HAS
  export default HAS
}
