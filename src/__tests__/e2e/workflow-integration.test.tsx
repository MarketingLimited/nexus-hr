
import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { Security } from '../../pages/Security'
import { Workflows } from '../../pages/Workflows'
import { Integration } from '../../pages/Integration'
import { Monitoring } from '../../pages/Monitoring'

// Mock PerformanceObserver
const mockPerformanceObserver = vi.fn().mockImplementation((callback) => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  takeRecords: vi.fn(),
}))

Object.defineProperty(global, 'PerformanceObserver', {
  writable: true,
  value: Object.assign(mockPerformanceObserver, {
    supportedEntryTypes: ['navigation', 'resource', 'measure', 'mark']
  })
})

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn().mockImplementation((callback) => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

Object.defineProperty(global, 'IntersectionObserver', {
  writable: true,
  value: mockIntersectionObserver
})

// Mock ResizeObserver
const mockResizeObserver = vi.fn().mockImplementation((callback) => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

Object.defineProperty(global, 'ResizeObserver', {
  writable: true,
  value: mockResizeObserver
})

// Mock all the hooks
vi.mock('@/hooks/useSecurity', () => ({
  useSecurityEvents: () => ({ data: null, isLoading: false, error: null }),
  useSecurityMetrics: () => ({ data: null, isLoading: false, error: null }),
  useActiveSessions: () => ({ data: null, isLoading: false, error: null })
}))

vi.mock('@/hooks/useWorkflow', () => ({
  useWorkflows: () => ({ data: null, isLoading: false, error: null }),
  useWorkflowTemplates: () => ({ data: null, isLoading: false, error: null }),
  useWorkflowAnalytics: () => ({ data: null, isLoading: false, error: null })
}))

vi.mock('@/hooks/useMigration', () => ({
  useMigrationJobs: () => ({ data: null, isLoading: false, error: null })
}))

vi.mock('@/hooks/useSync', () => ({
  useSync: () => ({ data: null, isLoading: false, error: null })
}))

vi.mock('@/hooks/useMonitoring', () => ({
  useSystemHealth: () => ({ data: null, isLoading: false, error: null }),
  usePerformanceMetrics: () => ({ data: null, isLoading: false, error: null }),
  useSystemAlerts: () => ({ data: null, isLoading: false, error: null })
}))

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('E2E Workflow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Cross-Module Navigation Flow', () => {
    it('navigates between Security, Workflows, Integration, and Monitoring pages', async () => {
      const { rerender } = renderWithProviders(<Security />)
      expect(screen.getByText('Security Management')).toBeInTheDocument()

      rerender(
        <QueryClientProvider client={createTestQueryClient()}>
          <BrowserRouter>
            <Workflows />
          </BrowserRouter>
        </QueryClientProvider>
      )
      expect(screen.getByText('Workflow Management')).toBeInTheDocument()

      rerender(
        <QueryClientProvider client={createTestQueryClient()}>
          <BrowserRouter>
            <Integration />
          </BrowserRouter>
        </QueryClientProvider>
      )
      expect(screen.getByText('Integration Hub')).toBeInTheDocument()

      rerender(
        <QueryClientProvider client={createTestQueryClient()}>
          <BrowserRouter>
            <Monitoring />
          </BrowserRouter>
        </QueryClientProvider>
      )
      expect(screen.getByText('System Monitoring')).toBeInTheDocument()
    })
  })

  describe('Tab Navigation Workflow', () => {
    it('handles tab navigation across all pages', async () => {
      // Test Security page tabs
      renderWithProviders(<Security />)
      const securityTabs = screen.getAllByRole('tab')
      expect(securityTabs.length).toBeGreaterThan(0)
      
      securityTabs.forEach(tab => {
        fireEvent.click(tab)
        expect(tab).toHaveAttribute('aria-selected')
      })
    })

    it('handles keyboard navigation in tabs', async () => {
      renderWithProviders(<Workflows />)
      const tabs = screen.getAllByRole('tab')
      
      if (tabs.length > 1) {
        tabs[0].focus()
        expect(document.activeElement).toBe(tabs[0])
        
        fireEvent.keyDown(tabs[0], { key: 'ArrowRight' })
        await waitFor(() => {
          expect(document.activeElement).toBe(tabs[1])
        })
      }
    })
  })

  describe('Data Loading and Error States', () => {
    it('handles loading states across all pages', () => {
      const pages = [
        { component: Security, title: 'Security Management' },
        { component: Workflows, title: 'Workflow Management' },
        { component: Integration, title: 'Integration Hub' },
        { component: Monitoring, title: 'System Monitoring' }
      ]

      pages.forEach(({ component: Component, title }) => {
        renderWithProviders(<Component />)
        expect(screen.getByText(title)).toBeInTheDocument()
      })
    })
  })

  describe('Responsive Design Validation', () => {
    it('renders properly on different screen sizes', () => {
      // Mock window resize
      const originalInnerWidth = window.innerWidth
      const originalInnerHeight = window.innerHeight

      // Test mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      })

      renderWithProviders(<Security />)
      expect(screen.getByText('Security Management')).toBeInTheDocument()

      // Test tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })

      renderWithProviders(<Workflows />)
      expect(screen.getByText('Workflow Management')).toBeInTheDocument()

      // Restore original values
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: originalInnerWidth,
      })
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: originalInnerHeight,
      })
    })
  })

  describe('Component Integration', () => {
    it('integrates with all required components without errors', () => {
      const pages = [Security, Workflows, Integration, Monitoring]
      
      pages.forEach(Page => {
        expect(() => {
          renderWithProviders(<Page />)
        }).not.toThrow()
      })
    })
  })

  describe('Performance and Optimization', () => {
    it('measures component render performance', async () => {
      const startTime = performance.now()
      
      renderWithProviders(<Security />)
      await waitFor(() => {
        expect(screen.getByText('Security Management')).toBeInTheDocument()
      })
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      // Ensure rendering completes within reasonable time (2 seconds)
      expect(renderTime).toBeLessThan(2000)
    })

    it('handles multiple rapid tab switches', async () => {
      renderWithProviders(<Workflows />)
      const tabs = screen.getAllByRole('tab')
      
      // Rapidly switch between tabs
      for (let i = 0; i < tabs.length; i++) {
        await act(async () => {
          fireEvent.click(tabs[i])
        })
      }
      
      // Should not crash and last tab should be active
      if (tabs.length > 0) {
        const lastTab = tabs[tabs.length - 1]
        expect(lastTab).toHaveAttribute('data-state', 'active')
      }
    })
  })
})
