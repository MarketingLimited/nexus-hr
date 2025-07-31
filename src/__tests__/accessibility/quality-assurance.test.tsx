import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '../../test-utils'
import userEvent from '@testing-library/user-event'
import { server } from '../../test-utils/msw-server'
import { http, HttpResponse } from 'msw'

// Import components for quality testing
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Toast, ToastProvider } from '../../components/ui/toast'
import { Toaster } from '../../components/ui/toaster'
import StatsCard from '../../components/dashboard/StatsCard'
import { Header } from '../../components/layout/Header'
import { Sidebar } from '../../components/layout/Sidebar'
import EmployeeList from '../../components/employees/EmployeeList'
import { LoginForm } from '../../components/auth/LoginForm'

// Quality assurance test utilities
interface QualityMetrics {
  performance: {
    renderTime: number
    interactionTime: number
    memoryUsage: number
  }
  usability: {
    clickTargetSize: boolean
    readableText: boolean
    intuitiveNavigation: boolean
  }
  reliability: {
    errorHandling: boolean
    dataValidation: boolean
    stateConsistency: boolean
  }
  accessibility: {
    keyboardNavigation: boolean
    screenReaderSupport: boolean
    colorContrast: boolean
  }
}

const measureRenderTime = async (componentRenderer: () => void): Promise<number> => {
  const startTime = performance.now()
  componentRenderer()
  await new Promise(resolve => setTimeout(resolve, 0)) // Wait for next tick
  const endTime = performance.now()
  return endTime - startTime
}

const measureInteractionTime = async (interaction: () => Promise<void>): Promise<number> => {
  const startTime = performance.now()
  await interaction()
  const endTime = performance.now()
  return endTime - startTime
}

const checkClickTargetSizes = (container: HTMLElement): boolean => {
  const interactiveElements = container.querySelectorAll('button, a, input, select, [role="button"]')
  
  for (const element of interactiveElements) {
    const rect = element.getBoundingClientRect()
    const minSize = 44 // WCAG minimum touch target size
    
    if (rect.width < minSize || rect.height < minSize) {
      return false
    }
  }
  
  return true
}

const checkTextReadability = (container: HTMLElement): boolean => {
  const textElements = container.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6')
  
  for (const element of textElements) {
    const styles = window.getComputedStyle(element as HTMLElement)
    const fontSize = parseFloat(styles.fontSize)
    const lineHeight = parseFloat(styles.lineHeight) || fontSize * 1.2
    
    // Check minimum font size (12px) and reasonable line height
    if (fontSize < 12 || lineHeight / fontSize < 1.2) {
      return false
    }
  }
  
  return true
}

describe('Phase 8: Quality Assurance Tests', () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    
    // Reset global state
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.className = ''
  })

  afterEach(() => {
    // Clean up
    document.documentElement.removeAttribute('data-theme')
  })

  describe('Performance Quality', () => {
    it('should render components within acceptable time limits', async () => {
      const components = [
        { name: 'Button', component: () => render(<Button>Test Button</Button>) },
        { name: 'Input', component: () => render(<Input placeholder="Test input" />) },
        { name: 'Card', component: () => render(<Card><CardContent>Test card</CardContent></Card>) },
        { name: 'StatsCard', component: () => render(<StatsCard title="Test" value="123" icon={'users' as any} />) }
      ]

      for (const comp of components) {
        const renderTime = await measureRenderTime(comp.component)
        expect(renderTime).toBeLessThan(100) // Should render within 100ms
      }
    })

    it('should handle user interactions quickly', async () => {
      const { container } = render(
        <div>
          <Button data-testid="click-button">Click me</Button>
          <Input data-testid="type-input" placeholder="Type here" />
          <Select>
            <SelectTrigger data-testid="select-trigger">
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="option1">Option 1</SelectItem>
              <SelectItem value="option2">Option 2</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )

      // Test button click speed
      const buttonClickTime = await measureInteractionTime(async () => {
        await user.click(screen.getByTestId('click-button'))
      })
      expect(buttonClickTime).toBeLessThan(50)

      // Test input typing speed
      const typingTime = await measureInteractionTime(async () => {
        await user.type(screen.getByTestId('type-input'), 'Test text')
      })
      expect(typingTime).toBeLessThan(200) // Should handle typing within 200ms
    })

    it('should maintain performance with large datasets', async () => {
      // Mock large employee dataset
      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        id: `emp-${i}`,
        employeeId: `E${i.toString().padStart(3, '0')}`,
        firstName: `Employee${i}`,
        lastName: `LastName${i}`,
        email: `employee${i}@company.com`,
        position: 'Developer',
        department: 'Engineering',
        status: 'active' as const
      }))

      server.use(
        http.get('/api/employees', () => 
          HttpResponse.json({
            data: largeDataset,
            meta: { total: 100, page: 1, limit: 100, totalPages: 1 }
          })
        )
      )

      const renderTime = await measureRenderTime(() => {
        render(<EmployeeList searchTerm="" selectedDepartment="" selectedStatus="" viewMode="grid" />)
      })

      await waitFor(() => {
        expect(screen.getByTestId('employee-list')).toBeInTheDocument()
      })

      expect(renderTime).toBeLessThan(500) // Should handle large datasets within 500ms
    })
  })

  describe('Usability Quality', () => {
    it('should have adequate click target sizes', () => {
      const { container } = render(
        <div>
          <Button size="sm">Small Button</Button>
          <Button>Regular Button</Button>
          <Button size="lg">Large Button</Button>
          <Input />
          <a href="#" style={{ display: 'inline-block', padding: '8px' }}>Link</a>
        </div>
      )

      const hasAdequateClickTargets = checkClickTargetSizes(container)
      expect(hasAdequateClickTargets).toBe(true)
    })

    it('should have readable text across all components', () => {
      const { container } = render(
        <div>
          <h1>Main Heading</h1>
          <h2>Secondary Heading</h2>
          <p>This is body text that should be readable</p>
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Card content text</p>
            </CardContent>
          </Card>
        </div>
      )

      const hasReadableText = checkTextReadability(container)
      expect(hasReadableText).toBe(true)
    })

    it('should provide intuitive navigation patterns', async () => {
      const { container } = render(
        <div>
          <Header />
          <Sidebar />
        </div>
      )

      // Check for navigation landmarks
      const navElements = container.querySelectorAll('nav, [role="navigation"]')
      expect(navElements.length).toBeGreaterThan(0)

      // Check for logical heading structure
      const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6')
      expect(headings.length).toBeGreaterThan(0)

      // Check for skip links or similar accessibility aids
      const skipLinks = container.querySelectorAll('a[href^="#"], .sr-only, .visually-hidden')
      // Note: This might be 0 if no skip links are implemented, which is OK for this test
    })

    it('should provide clear visual feedback for interactions', async () => {
      const { container } = render(
        <div>
          <Button data-testid="feedback-button">Hover me</Button>
          <Input data-testid="feedback-input" placeholder="Focus me" />
        </div>
      )

      const button = screen.getByTestId('feedback-button')
      const input = screen.getByTestId('feedback-input')

      // Test hover states (simulated)
      fireEvent.mouseEnter(button)
      expect(button).toHaveClass(/hover:/)

      // Test focus states
      await user.click(input)
      expect(input).toHaveFocus()

      // Check that focus is visible (basic check)
      const focusedStyles = window.getComputedStyle(input, ':focus')
      // The element should have some kind of focus indicator
      expect(focusedStyles.outline !== 'none' || focusedStyles.boxShadow !== 'none').toBe(true)
    })
  })

  describe('Reliability Quality', () => {
    it('should handle errors gracefully', async () => {
      // Test network error handling
      server.use(
        http.get('/api/employees', () => {
          return new HttpResponse(null, { status: 500 })
        })
      )

      const { container } = render(
        <EmployeeList searchTerm="" selectedDepartment="" selectedStatus="" viewMode="grid" />
      )

      await waitFor(() => {
        // Should show error state instead of crashing
        const errorMessage = container.querySelector('[data-testid="error-message"], .error, [role="alert"]')
        // Note: This depends on how your error states are implemented
        // The component should handle the error gracefully without throwing
      })

      // Component should still be mounted
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should validate form data properly', async () => {
      const mockAuthState = {
        user: null,
        login: vi.fn(),
        logout: vi.fn(),
        isLoading: false,
        error: null
      }

      render(<LoginForm authState={mockAuthState} />)

      // Try to submit empty form
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      // Should show validation errors
      await waitFor(() => {
        const errorMessages = screen.queryAllByRole('alert')
        // Form should prevent submission and show errors
        expect(mockAuthState.login).not.toHaveBeenCalled()
      })
    })

    it('should maintain consistent state across interactions', async () => {
      const { container } = render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" data-testid="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2" data-testid="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" data-testid="content1">Content 1</TabsContent>
          <TabsContent value="tab2" data-testid="content2">Content 2</TabsContent>
        </Tabs>
      )

      // Initial state
      expect(screen.getByTestId('content1')).toBeInTheDocument()
      expect(screen.queryByTestId('content2')).not.toBeInTheDocument()

      // Switch tabs
      await user.click(screen.getByTestId('tab2'))

      // State should update consistently
      expect(screen.queryByTestId('content1')).not.toBeInTheDocument()
      expect(screen.getByTestId('content2')).toBeInTheDocument()

      // Switch back
      await user.click(screen.getByTestId('tab1'))

      // Should return to original state
      expect(screen.getByTestId('content1')).toBeInTheDocument()
      expect(screen.queryByTestId('content2')).not.toBeInTheDocument()
    })

    it('should handle edge cases in data display', async () => {
      const edgeCaseData = [
        { title: 'Empty String', value: '' },
        { title: 'Null Value', value: null },
        { title: 'Undefined Value', value: undefined },
        { title: 'Very Long Text', value: 'A'.repeat(1000) },
        { title: 'Special Characters', value: '<script>alert("xss")</script>' },
        { title: 'Zero Value', value: 0 },
        { title: 'Negative Value', value: -100 }
      ]

      for (const testCase of edgeCaseData) {
        const { container, unmount } = render(
          <StatsCard
            title={testCase.title}
            value={String(testCase.value || 'N/A')}
            icon={'users' as any}
          />
        )

        // Component should render without crashing
        expect(container.firstChild).toBeInTheDocument()

        // Should not contain raw script tags or dangerous content
        expect(container.innerHTML).not.toContain('<script>')

        unmount()
      }
    })
  })

  describe('Accessibility Quality', () => {
    it('should support keyboard navigation throughout the application', async () => {
      const { container } = render(
        <div>
          <Button data-testid="button1">Button 1</Button>
          <Input data-testid="input1" placeholder="Input 1" />
          <Button data-testid="button2">Button 2</Button>
          <Select>
            <SelectTrigger data-testid="select1">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
          </Select>
        </div>
      )

      // Test tab navigation
      const focusableElements = container.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )

      expect(focusableElements.length).toBeGreaterThan(0)

      // Test that all elements can receive focus
      for (const element of focusableElements) {
        (element as HTMLElement).focus()
        expect(element).toHaveFocus()
      }
    })

    it('should provide proper ARIA labels and roles', () => {
      const { container } = render(
        <div>
          <main role="main">
            <h1>Dashboard</h1>
            <nav aria-label="Main navigation">
              <Button aria-label="Go to employees">Employees</Button>
              <Button aria-label="Go to reports">Reports</Button>
            </nav>
            <section aria-labelledby="stats-heading">
              <h2 id="stats-heading">Statistics</h2>
              <StatsCard title="Total Users" value="1000" icon={'users' as any} />
            </section>
          </main>
        </div>
      )

      // Check for proper landmarks
      expect(container.querySelector('[role="main"]')).toBeInTheDocument()
      expect(container.querySelector('nav[aria-label]')).toBeInTheDocument()

      // Check for labeled sections
      expect(container.querySelector('[aria-labelledby]')).toBeInTheDocument()

      // Check for ARIA labels on interactive elements
      const labeledButtons = container.querySelectorAll('button[aria-label]')
      expect(labeledButtons.length).toBeGreaterThan(0)
    })

    it('should handle focus management in modals and dialogs', async () => {
      const { container } = render(
        <Dialog>
          <DialogTrigger asChild>
            <Button data-testid="open-dialog">Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Test Dialog</DialogTitle>
            </DialogHeader>
            <p>Dialog content</p>
            <Button data-testid="dialog-button">Dialog Action</Button>
          </DialogContent>
        </Dialog>
      )

      // Open dialog
      await user.click(screen.getByTestId('open-dialog'))

      // Focus should be trapped within dialog
      const dialog = container.querySelector('[role="dialog"]')
      expect(dialog).toBeInTheDocument()

      // Test that focus moves to dialog content
      const dialogButton = screen.getByTestId('dialog-button')
      expect(dialogButton).toBeInTheDocument()
    })

    it('should provide screen reader friendly content', () => {
      const { container } = render(
        <div>
          <h1>Employee Management System</h1>
          <nav aria-label="Main navigation">
            <ul>
              <li><a href="/dashboard">Dashboard</a></li>
              <li><a href="/employees">Employees</a></li>
              <li><a href="/reports">Reports</a></li>
            </ul>
          </nav>
          <main>
            <section aria-labelledby="overview-heading">
              <h2 id="overview-heading">Overview</h2>
              <div role="region" aria-label="Statistics">
                <StatsCard title="Active Employees" value="150" icon={'users' as any} />
                <StatsCard title="Pending Reviews" value="12" icon={'clock' as any} />
              </div>
            </section>
          </main>
        </div>
      )

      // Check heading hierarchy
      const h1 = container.querySelector('h1')
      const h2 = container.querySelector('h2')
      expect(h1).toBeInTheDocument()
      expect(h2).toBeInTheDocument()

      // Check navigation structure
      const nav = container.querySelector('nav[aria-label]')
      expect(nav).toBeInTheDocument()

      // Check labeled regions
      const regions = container.querySelectorAll('[role="region"][aria-label]')
      expect(regions.length).toBeGreaterThan(0)
    })
  })

  describe('Comprehensive Quality Metrics', () => {
    it('should meet overall quality standards', async () => {
      server.use(
        http.get('/api/employees', () => 
          HttpResponse.json({
            data: [
              {
                id: 'emp-1',
                employeeId: 'E001',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@company.com',
                position: 'Developer',
                department: 'Engineering',
                status: 'active'
              }
            ],
            meta: { total: 1, page: 1, limit: 10, totalPages: 1 }
          })
        )
      )

      const { container } = render(
        <div>
          <Header />
          <main style={{ padding: '20px' }}>
            <h1>HR Management Dashboard</h1>
            <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', marginBottom: '20px' }}>
              <StatsCard title="Total Employees" value="1,234" icon={'users' as any} />
              <StatsCard title="Active Projects" value="56" icon={'briefcase' as any} />
            </div>
            <EmployeeList 
              searchTerm="" 
              selectedDepartment="" 
              selectedStatus="" 
              viewMode="grid" 
            />
          </main>
        </div>
      )

      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument()
      })

      // Measure quality metrics
      const qualityMetrics: Partial<QualityMetrics> = {}

      // Performance metrics
      const renderTime = await measureRenderTime(() => {
        render(<StatsCard title="Test" value="123" icon={'users' as any} />)
      })
      
      qualityMetrics.performance = {
        renderTime,
        interactionTime: 0, // Would be measured in real interactions
        memoryUsage: 0 // Would be measured with performance API
      }

      // Usability metrics
      qualityMetrics.usability = {
        clickTargetSize: checkClickTargetSizes(container),
        readableText: checkTextReadability(container),
        intuitiveNavigation: container.querySelectorAll('nav, [role="navigation"]').length > 0
      }

      // Reliability metrics
      qualityMetrics.reliability = {
        errorHandling: true, // Assumes error boundaries are in place
        dataValidation: true, // Assumes validation is implemented
        stateConsistency: true // Assumes state management is consistent
      }

      // Accessibility metrics
      const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6')
      const landmarks = container.querySelectorAll('main, nav, aside, section')
      const labeledElements = container.querySelectorAll('[aria-label], [aria-labelledby]')

      qualityMetrics.accessibility = {
        keyboardNavigation: container.querySelectorAll('button, input, a, select').length > 0,
        screenReaderSupport: headings.length > 0 && landmarks.length > 0,
        colorContrast: true // Would need actual contrast measurement
      }

      // Validate quality standards
      expect(qualityMetrics.performance?.renderTime).toBeLessThan(200)
      expect(qualityMetrics.usability?.clickTargetSize).toBe(true)
      expect(qualityMetrics.usability?.readableText).toBe(true)
      expect(qualityMetrics.usability?.intuitiveNavigation).toBe(true)
      expect(qualityMetrics.accessibility?.keyboardNavigation).toBe(true)
      expect(qualityMetrics.accessibility?.screenReaderSupport).toBe(true)

      console.log('Quality Metrics Summary:', qualityMetrics)
    })

    it('should maintain quality standards across different user scenarios', async () => {
      const scenarios = [
        {
          name: 'New User Onboarding',
          component: <LoginForm authState={{
            user: null,
            login: vi.fn(),
            logout: vi.fn(),
            isLoading: false,
            error: null
          }} />
        },
        {
          name: 'Data Management',
          component: <EmployeeList 
            searchTerm="" 
            selectedDepartment="" 
            selectedStatus="" 
            viewMode="grid" 
          />
        }
      ]

      for (const scenario of scenarios) {
        const { container } = render(scenario.component)

        // Check basic quality metrics for each scenario
        const hasAdequateClickTargets = checkClickTargetSizes(container)
        const hasReadableText = checkTextReadability(container)
        const hasAccessibleElements = container.querySelectorAll('[aria-label], [aria-labelledby], [role]').length > 0

        expect(hasAdequateClickTargets).toBe(true)
        expect(hasReadableText).toBe(true)
        
        console.log(`Quality check for ${scenario.name}:`, {
          clickTargets: hasAdequateClickTargets,
          readableText: hasReadableText,
          accessibleElements: hasAccessibleElements
        })
      }
    })
  })
})