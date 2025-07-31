import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, afterAll } from 'vitest'
import { server } from './test-utils/msw-server'
import { setupTestEnvironment } from './test-utils'
import { expect } from 'vitest'
import { toHaveNoViolations } from 'jest-axe'

// Extend expect with jest-axe matchers
expect.extend(toHaveNoViolations)

// Runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup()
})

// Establish API mocking before all tests.
let cleanupEnv: () => void
beforeAll(() => {
  cleanupEnv = setupTestEnvironment()
  server.listen({ onUnhandledRequest: 'error' })
})

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers())

// Clean up after the tests are finished.
afterAll(() => {
  cleanupEnv && cleanupEnv()
  server.close()
})