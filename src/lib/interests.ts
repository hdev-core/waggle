// Canonical interests challenge. MUST match haf_fyp auth.build_message exactly,
// byte for byte — the backend rebuilds this string from the request fields and
// verifies the signature against it. Binds username + timestamp + the exact
// community set so a captured request can't be replayed with a different body.
//
// The `hivefy:` prefix predates the rename to Waggle and is part of the signed
// wire format, not branding — do NOT "tidy" it. Changing it here without the
// matching backend change makes every interest write fail signature validation.
export function buildInterestsMessage(username: string, timestamp: number, communities: number[]): string {
  const ids = [...new Set(communities)].sort((a, b) => a - b).join(',')
  return `hivefy:interests:v1:${username}:${timestamp}:${ids}`
}
