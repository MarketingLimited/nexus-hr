import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../../contexts/AuthContext'
import { 
  renderWithA11yAudit, 
  expectNoA11yViolations,
  testKeyboardNavigation,
  testAriaAttributes,
  runAccessibilityTestSuite
} from '../../test-utils/accessibility-helpers'

// Components to test
import { Header } from '../../components/layout/Header'
import Sidebar from '../../components/layout/Sidebar'
import { LoginForm } from '../../components/auth/LoginForm'
import StatsCard from '../../components/dashboard/StatsCard'
import EmployeeList from '../../components/employees/EmployeeList'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Input } from '../../components/ui/input'

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('Accessibility Audit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Accessibility Tests', () => {
    it('should have no accessibility violations in Button component', async () => {
      const result = await renderWithA11yAudit(<Button>Test Button</Button>)
      expect(result.a11yResults.violations).toHaveLength(0)
    })

    it('should have no accessibility violations in Card component', async () => {
      const result = await renderWithA11yAudit(
        <Card><div>Test Card Content</div></Card>
      )
      expect(result.a11yResults.violations).toHaveLength(0)
    })

    it('should have no accessibility violations in LoginForm component', async () => {
      const result = await renderWithA11yAudit(
        <TestWrapper><LoginForm /></TestWrapper>
      )
      expect(result.a11yResults.violations).toHaveLength(0)
    })
  })

  describe('Keyboard Navigation Tests', () => {
    it('should support proper keyboard navigation in Button component', async () => {
      const { container } = render(<Button>Test Button</Button>)
      const navigation = await testKeyboardNavigation(container)
      expect(navigation.focusableElements).toHaveLength(1)
    })
  })

  describe('ARIA Attributes Tests', () => {
    it('should have proper ARIA attributes in Button component', async () => {
      const { container } = render(<Button aria-label="Test button">Test Button</Button>)
      const ariaTest = testAriaAttributes(container)
      expect(ariaTest.elementsWithAriaLabels.length).toBeGreaterThan(0)
    })
  })
})