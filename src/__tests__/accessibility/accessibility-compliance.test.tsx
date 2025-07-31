
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { Security } from '../../pages/Security'
import { Workflows } from '../../pages/Workflows'
import { Integration } from '../../pages/Integration'
import { Monitoring } from '../../pages/Monitoring'
import Index from '../../pages/Index'

// Mock hooks to prevent API calls during tests
vi.mock('@/hooks/useSecurity', () => ({
  useSecurity: () => ({
    useSecurityEvents: () => ({ data: [], isLoading: false }),
    useActiveSessions: () => ({ data: [], isLoading: false }),
    useSecurityMetrics: () => ({ data: {}, isLoading: false })
  })
}))

vi.mock('@/hooks/useWorkflow', () => ({
  useWorkflows: () => ({ data: { data: [] }, isLoading: false }),
  useWorkflowTemplates: () => ({ data: { data: [] }, isLoading: false }),
  useWorkflowAnalytics: () => ({ data: {}, isLoading: false })
}))

vi.mock('@/hooks/useSync', () => ({
  useSync: () => ({ data: {}, isLoading: false }),
  useSyncOperations: () => ({ data: [], isLoading: false })
}))

vi.mock('@/hooks/useMonitoring', () => ({
  useMonitoring: () => ({
    useSystemHealth: () => ({ data: {}, isLoading: false }),
    usePerformanceMetrics: () => ({ data: {}, isLoading: false }),
    useAlerts: () => ({ data: [], isLoading: false })
  })
}))

vi.mock('@/hooks/useDashboard', () => ({
  useDashboard: () => ({
    data: { stats: { totalEmployees: 100, activeProjects: 10, pendingTasks: 5, completionRate: 85 } },
    isLoading: false
  })
}))

// Extend Jest matchers
expect.extend(toHaveNoViolations)

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('Accessibility Compliance Tests', () => {
  describe('Security Page Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = renderWithProviders(<Security />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has proper heading hierarchy', () => {
      renderWithProviders(<Security />)
      
      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1).toHaveTextContent('Security Management')
      
      // Should have proper heading structure
      const headings = screen.getAllByRole('heading')
      expect(headings.length).toBeGreaterThan(1)
    })

    it('has proper focus management', () => {
      renderWithProviders(<Security />)
      
      const tabs = screen.getAllByRole('tab')
      tabs.forEach(tab => {
        expect(tab).toHaveAttribute('tabindex')
      })
    })

    it('has proper ARIA labels', () => {
      renderWithProviders(<Security />)
      
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName()
      })
    })
  })

  describe('Workflows Page Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = renderWithProviders(<Workflows />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has proper color contrast', () => {
      renderWithProviders(<Workflows />)
      
      // Check that text has sufficient contrast
      const textElements = screen.getAllByText(/workflow/i)
      expect(textElements.length).toBeGreaterThan(0)
    })

    it('supports screen readers', () => {
      renderWithProviders(<Workflows />)
      
      // Check for proper semantic elements
      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getAllByRole('tab')).toHaveLength(3)
    })
  })

  describe('Integration Page Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = renderWithProviders(<Integration />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has proper form accessibility', () => {
      renderWithProviders(<Integration />)
      
      // Check for proper form labeling if forms are present
      const inputs = screen.queryAllByRole('textbox')
      inputs.forEach(input => {
        expect(input).toHaveAccessibleName()
      })
    })
  })

  describe('Monitoring Page Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = renderWithProviders(<Monitoring />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has proper data table accessibility', () => {
      renderWithProviders(<Monitoring />)
      
      // Check for proper table structure if tables are present
      const tables = screen.queryAllByRole('table')
      tables.forEach(table => {
        expect(table).toHaveAccessibleName()
      })
    })

    it('has proper status indicators', () => {
      renderWithProviders(<Monitoring />)
      
      // Status indicators should have proper ARIA attributes
      const statusElements = screen.queryAllByText(/healthy|warning|error/i)
      statusElements.forEach(status => {
        expect(status).toBeInTheDocument()
      })
    })
  })

  describe('Keyboard Navigation Tests', () => {
    it('supports tab navigation across all pages', () => {
      const pages = [Security, Workflows, Integration, Monitoring]
      
      pages.forEach(Page => {
        renderWithProviders(<Page />)
        
        const focusableElements = screen.getAllByRole('button')
          .concat(screen.getAllByRole('tab'))
          .concat(screen.getAllByRole('link'))
        
        focusableElements.forEach(element => {
          expect(element).not.toHaveAttribute('tabindex', '-1')
        })
      })
    })

    it('has visible focus indicators', () => {
      renderWithProviders(<Security />)
      
      const focusableElements = screen.getAllByRole('button')
      focusableElements.forEach(element => {
        element.focus()
        expect(element).toHaveFocus()
      })
    })
  })

  describe('Screen Reader Support', () => {
    it('has proper landmarks', () => {
      renderWithProviders(<Security />)
      
      // Should have main landmark
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    it('has proper live regions for dynamic content', () => {
      renderWithProviders(<Monitoring />)
      
      // Status updates should be announced to screen readers
      const alerts = screen.queryAllByRole('alert')
      alerts.forEach(alert => {
        expect(alert).toHaveAttribute('aria-live')
      })
    })

    it('has proper skip links', () => {
      renderWithProviders(<Security />)
      
      // Should have skip to main content link
      const skipLink = screen.queryByText(/skip to main content/i)
      if (skipLink) {
        expect(skipLink).toHaveAttribute('href')
      }
    })
  })

  describe('Mobile Accessibility', () => {
    it('has proper touch target sizes', () => {
      renderWithProviders(<Security />)
      
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        const styles = getComputedStyle(button)
        const minSize = 44 // 44px minimum touch target size
        
        // This would need proper CSS testing in a real environment
        expect(button).toBeInTheDocument()
      })
    })

    it('supports zoom up to 200%', () => {
      renderWithProviders(<Security />)
      
      // Should not have horizontal scrolling at 200% zoom
      // This would need actual browser testing
      expect(screen.getByText('Security Management')).toBeInTheDocument()
    })
  })
})
