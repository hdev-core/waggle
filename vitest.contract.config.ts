import { defineConfig } from 'vitest/config'

// Contract tests hit the live testapi FYP API + 3Speak API. Run explicitly via
// `npm run test:contract`; they need network and can be flaky if the upstream
// data shifts, so they're kept out of the default unit run.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/contract/**/*.test.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    retry: 1,
  },
})
