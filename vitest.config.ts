import { defineConfig } from 'vitest/config'

// Unit tests run in Node (pure logic, no DOM). Contract tests (tests/contract)
// hit the live testapi / 3Speak APIs and are opt-in via `npm run test:contract`
// so the default `npm test` stays fast and offline-safe.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    testTimeout: 10000,
  },
})
