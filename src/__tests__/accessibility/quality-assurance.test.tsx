import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../../contexts/AuthContext'
import { runAccessibilityTestSuite } from '../../test-utils/accessibility-helpers'
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

describe('Quality Assurance Tests', () => {
  beforeEach(() => { vi.clearAllMocks() })
  afterEach(() => { cleanup() })

  it('should meet quality standards for Button component', async () => {
    const { container } = render(<Button>Test Button</Button>)
    const a11yResults = await runAccessibilityTestSuite(container)
    expect(a11yResults.summary.criticalIssues).toBe(0)
  })
})