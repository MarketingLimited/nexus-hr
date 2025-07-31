import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import App from '../../App'
import { AuthProvider } from '../../contexts/AuthContext'

// Mock MSW for testing
import { server } from '../../test-utils/msw-server'

// Performance monitoring utilities
const performanceObserver = vi.fn()
global.PerformanceObserver = vi.fn().mockImplementation(() => ({
  observe: performanceObserver,
  disconnect: vi.fn(),
}))

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
        <AuthProvider>
          {component}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('End-to-End Workflow Tests', () => {
  beforeEach(() => {
    server.listen()
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    }
    global.localStorage = localStorageMock as any
  })

  afterEach(() => {
    server.resetHandlers()
    vi.clearAllMocks()
  })

  describe('Employee Management Workflow', () => {
    it('completes full employee lifecycle', async () => {
      const user = userEvent.setup()
      renderWithProviders(<App />)

      // 1. Navigate to employees page
      await user.click(screen.getByText('Employees'))
      await waitFor(() => {
        expect(screen.getByText('Employee Management')).toBeInTheDocument()
      })

      // 2. Add new employee
      await user.click(screen.getByText('Add Employee'))
      
      // Fill employee form
      await user.type(screen.getByLabelText(/first name/i), 'John')
      await user.type(screen.getByLabelText(/last name/i), 'Doe')
      await user.type(screen.getByLabelText(/email/i), 'john.doe@company.com')
      
      await user.click(screen.getByText('Save'))
      
      // 3. Verify employee appears in list
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })

      // 4. View employee profile
      await user.click(screen.getByText('John Doe'))
      await waitFor(() => {
        expect(screen.getByText('Employee Profile')).toBeInTheDocument()
      })

      // 5. Update employee information
      await user.click(screen.getByText('Edit Profile'))
      await user.clear(screen.getByDisplayValue('john.doe@company.com'))
      await user.type(screen.getByLabelText(/email/i), 'john.doe.updated@company.com')
      await user.click(screen.getByText('Save'))

      // 6. Verify update
      await waitFor(() => {
        expect(screen.getByText('john.doe.updated@company.com')).toBeInTheDocument()
      })
    })
  })

  describe('Leave Management Workflow', () => {
    it('completes leave request and approval process', async () => {
      const user = userEvent.setup()
      renderWithProviders(<App />)

      // 1. Navigate to leave management
      await user.click(screen.getByText('Leave Management'))
      await waitFor(() => {
        expect(screen.getByText('Leave Management')).toBeInTheDocument()
      })

      // 2. Submit leave request
      await user.click(screen.getByText('Request Leave'))
      
      // Fill leave request form
      await user.selectOptions(screen.getByLabelText(/leave type/i), 'annual')
      await user.type(screen.getByLabelText(/start date/i), '2024-02-01')
      await user.type(screen.getByLabelText(/end date/i), '2024-02-05')
      await user.type(screen.getByLabelText(/reason/i), 'Family vacation')
      
      await user.click(screen.getByText('Submit Request'))

      // 3. Verify request appears in pending
      await waitFor(() => {
        expect(screen.getByText('Family vacation')).toBeInTheDocument()
        expect(screen.getByText('Pending')).toBeInTheDocument()
      })

      // 4. Manager approves request
      await user.click(screen.getByText('Approve'))
      
      // 5. Verify status change
      await waitFor(() => {
        expect(screen.getByText('Approved')).toBeInTheDocument()
      })

      // 6. Check leave balance update
      await user.click(screen.getByText('Leave Balance'))
      await waitFor(() => {
        expect(screen.getByText(/remaining/i)).toBeInTheDocument()
      })
    })
  })

  describe('Payroll Processing Workflow', () => {
    it('completes payroll cycle', async () => {
      const user = userEvent.setup()
      renderWithProviders(<App />)

      // 1. Navigate to payroll
      await user.click(screen.getByText('Payroll'))
      await waitFor(() => {
        expect(screen.getByText('Payroll Management')).toBeInTheDocument()
      })

      // 2. Start payroll processing
      await user.click(screen.getByText('Process Payroll'))
      
      // 3. Select pay period
      await user.selectOptions(screen.getByLabelText(/pay period/i), '2024-01')
      
      // 4. Review and process
      await user.click(screen.getByText('Calculate'))
      await waitFor(() => {
        expect(screen.getByText(/total payroll/i)).toBeInTheDocument()
      })

      // 5. Generate payslips
      await user.click(screen.getByText('Generate Payslips'))
      await waitFor(() => {
        expect(screen.getByText('Payslips generated successfully')).toBeInTheDocument()
      })

      // 6. Verify completion
      expect(screen.getByText('Completed')).toBeInTheDocument()
    })
  })

  describe('Security Management Workflow', () => {
    it('completes security audit and configuration', async () => {
      const user = userEvent.setup()
      renderWithProviders(<App />)

      // 1. Navigate to security
      await user.click(screen.getByText('Security'))
      await waitFor(() => {
        expect(screen.getByText('Security Management')).toBeInTheDocument()
      })

      // 2. Review security events
      await user.click(screen.getByText('Audit Trail'))
      await waitFor(() => {
        expect(screen.getByText(/security events/i)).toBeInTheDocument()
      })

      // 3. Configure security settings
      await user.click(screen.getByText('Settings'))
      await user.click(screen.getByLabelText(/two-factor authentication/i))
      
      // 4. Save security configuration
      await user.click(screen.getByText('Save Changes'))
      await waitFor(() => {
        expect(screen.getByText('Settings updated successfully')).toBeInTheDocument()
      })

      // 5. Export audit log
      await user.click(screen.getByText('Export Audit Log'))
      await waitFor(() => {
        expect(screen.getByText('Audit log exported')).toBeInTheDocument()
      })
    })
  })

  describe('Workflow Management Process', () => {
    it('creates and executes custom workflow', async () => {
      const user = userEvent.setup()
      renderWithProviders(<App />)

      // 1. Navigate to workflows
      await user.click(screen.getByText('Workflows'))
      await waitFor(() => {
        expect(screen.getByText('Workflow Management')).toBeInTheDocument()
      })

      // 2. Create new workflow
      await user.click(screen.getByText('New Workflow'))
      await user.type(screen.getByLabelText(/workflow name/i), 'Employee Onboarding')
      
      // 3. Add workflow steps
      await user.click(screen.getByText('Add Step'))
      await user.type(screen.getByLabelText(/step name/i), 'Send Welcome Email')
      
      // 4. Save workflow
      await user.click(screen.getByText('Save Workflow'))
      await waitFor(() => {
        expect(screen.getByText('Workflow created successfully')).toBeInTheDocument()
      })

      // 5. Execute workflow
      await user.click(screen.getByText('Execute'))
      await waitFor(() => {
        expect(screen.getByText('Running')).toBeInTheDocument()
      })
    })
  })

  describe('Integration and Data Migration', () => {
    it('completes data migration process', async () => {
      const user = userEvent.setup()
      renderWithProviders(<App />)

      // 1. Navigate to integration hub
      await user.click(screen.getByText('Integration'))
      await waitFor(() => {
        expect(screen.getByText('Integration Hub')).toBeInTheDocument()
      })

      // 2. Start data migration
      await user.click(screen.getByText('New Migration'))
      await user.type(screen.getByLabelText(/migration name/i), 'Legacy Employee Data')
      
      // 3. Configure migration
      await user.selectOptions(screen.getByLabelText(/source system/i), 'legacy-hr')
      await user.selectOptions(screen.getByLabelText(/target system/i), 'new-hr')
      
      // 4. Map fields
      await user.click(screen.getByText('Configure Mapping'))
      // Field mapping configuration would be here
      
      // 5. Execute migration
      await user.click(screen.getByText('Start Migration'))
      await waitFor(() => {
        expect(screen.getByText('Migration started')).toBeInTheDocument()
      })

      // 6. Monitor progress
      await waitFor(() => {
        expect(screen.getByText(/progress/i)).toBeInTheDocument()
      }, { timeout: 5000 })
    })
  })

  describe('Performance Monitoring', () => {
    it('monitors system performance during heavy operations', async () => {
      const user = userEvent.setup()
      renderWithProviders(<App />)

      // Simulate heavy data loading
      const startTime = performance.now()
      
      // Navigate through multiple pages rapidly
      await user.click(screen.getByText('Employees'))
      await user.click(screen.getByText('Payroll'))
      await user.click(screen.getByText('Performance'))
      await user.click(screen.getByText('Monitoring'))
      
      const endTime = performance.now()
      const navigationTime = endTime - startTime

      // Verify performance is acceptable (under 2 seconds)
      expect(navigationTime).toBeLessThan(2000)

      // Check system health indicators
      await waitFor(() => {
        expect(screen.getByText('System Monitoring')).toBeInTheDocument()
      })
    })
  })
})