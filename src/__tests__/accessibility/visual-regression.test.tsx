import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../../contexts/AuthContext'
import { takeSnapshot } from '../../test-utils/visual-testing-helpers'
import { Button } from '../../components/ui/button'

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('Visual Regression Tests', () => {
  beforeEach(() => { vi.clearAllMocks() })
  afterEach(() => { cleanup() })

  it('should maintain visual consistency for Button component', async () => {
    const { container } = render(<Button>Test Button</Button>)
    const snapshot = await takeSnapshot(container, { name: 'button-test', viewport: { width: 1200, height: 800 }, threshold: 0.1 })
    expect(snapshot).toMatchSnapshot('button-test.png')
  })
})