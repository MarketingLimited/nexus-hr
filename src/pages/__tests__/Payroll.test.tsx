import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@/test-utils'
import { userEvent } from '@testing-library/user-event'
import Payroll from '../Payroll'

// Mock the payroll hooks
vi.mock('@/hooks/usePayroll', () => ({
  usePayrollStats: () => ({
    data: {
      monthlyTotal: 284000,
      monthlyGrowth: 2.1,
      avgSalary: 65000,
      daysToNext: 5,
      taxDeductions: 42000
    },
    isLoading: false
  }),
  usePayrollStatus: () => ({
    data: {
      currentPeriod: 'December 2024 Payroll',
      processingPeriod: 'Dec 1-31, 2024',
      status: 'in-progress',
      steps: [
        { name: 'Salary calculations', status: 'completed' },
        { name: 'Tax calculations', status: 'completed' },
        { name: 'Overtime processing', status: 'in-progress' },
        { name: 'Final approval', status: 'pending' }
      ]
    },
    isLoading: false
  }),
  usePayrollHistory: () => ({
    data: {
      data: [
        {
          id: '1',
          period: 'November 2024',
          processedDate: '2024-11-30T12:00:00Z',
          totalAmount: 278000,
          status: 'completed'
        },
        {
          id: '2',
          period: 'October 2024',
          processedDate: '2024-10-31T12:00:00Z',
          totalAmount: 275000,
          status: 'completed'
        }
      ]
    },
    isLoading: false
  })
}))

// Mock child components
vi.mock('@/components/payroll/PayrollProcessing', () => ({
  default: () => <div data-testid="payroll-processing">Payroll Processing</div>
}))

vi.mock('@/components/payroll/SalaryStructure', () => ({
  default: () => <div data-testid="salary-structure">Salary Structure</div>
}))

vi.mock('@/components/payroll/PayslipGenerator', () => ({
  default: () => <div data-testid="payslip-generator">Payslip Generator</div>
}))

vi.mock('@/components/payroll/TaxCalculator', () => ({
  default: () => <div data-testid="tax-calculator">Tax Calculator</div>
}))

describe('Payroll Page', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the payroll page with header and main sections', () => {
      render(<Payroll />)

      // Check header
      expect(screen.getByText('Payroll Management')).toBeInTheDocument()
      expect(screen.getByText('Process payroll and manage compensation')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /run payroll/i })).toBeInTheDocument()
    })

    it('displays payroll statistics cards', () => {
      render(<Payroll />)

      // Check stats cards
      expect(screen.getByText('Monthly Payroll')).toBeInTheDocument()
      expect(screen.getByText('$284,000')).toBeInTheDocument()
      expect(screen.getByText('Avg. Salary')).toBeInTheDocument()
      expect(screen.getByText('$65,000')).toBeInTheDocument()
      expect(screen.getByText('Next Payroll')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByText('Tax Deductions')).toBeInTheDocument()
      expect(screen.getByText('$42,000')).toBeInTheDocument()
    })

    it('renders tab navigation correctly', () => {
      render(<Payroll />)

      expect(screen.getByRole('tab', { name: /overview/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /processing/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /salary structure/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /payslips/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /tax calculator/i })).toBeInTheDocument()
    })

    it('shows current payroll status in overview tab', () => {
      render(<Payroll />)

      expect(screen.getByText('Current Payroll Status')).toBeInTheDocument()
      expect(screen.getByText('December 2024 Payroll')).toBeInTheDocument()
      expect(screen.getByText('Processing period: Dec 1-31, 2024')).toBeInTheDocument()
      expect(screen.getByText('In Progress')).toBeInTheDocument()
    })

    it('displays payroll history section', () => {
      render(<Payroll />)

      expect(screen.getByText('Payroll History')).toBeInTheDocument()
      expect(screen.getByText('November 2024')).toBeInTheDocument()
      expect(screen.getByText('October 2024')).toBeInTheDocument()
    })
  })

  describe('Statistics Display', () => {
    it('formats monetary values correctly', () => {
      render(<Payroll />)

      // Check formatted values
      expect(screen.getByText('$284,000')).toBeInTheDocument()
      expect(screen.getByText('$65,000')).toBeInTheDocument()
      expect(screen.getByText('$42,000')).toBeInTheDocument()
    })

    it('shows growth indicators and percentages', () => {
      render(<Payroll />)

      expect(screen.getByText('+2.1% from last month')).toBeInTheDocument()
      expect(screen.getByText('Per employee')).toBeInTheDocument()
      expect(screen.getByText('Days remaining')).toBeInTheDocument()
      expect(screen.getByText('This month')).toBeInTheDocument()
    })
  })

  describe('Payroll Status Section', () => {
    it('displays current payroll processing status', () => {
      render(<Payroll />)

      expect(screen.getByText('December 2024 Payroll')).toBeInTheDocument()
      expect(screen.getByText('Processing period: Dec 1-31, 2024')).toBeInTheDocument()
      
      const statusBadge = screen.getByText('In Progress')
      expect(statusBadge).toBeInTheDocument()
    })

    it('shows processing steps with correct status indicators', () => {
      render(<Payroll />)

      expect(screen.getByText('Salary calculations')).toBeInTheDocument()
      expect(screen.getByText('✓ Complete')).toBeInTheDocument()
      expect(screen.getByText('Tax calculations')).toBeInTheDocument()
      expect(screen.getByText('Overtime processing')).toBeInTheDocument()
      expect(screen.getByText('⏳ In Progress')).toBeInTheDocument()
      expect(screen.getByText('Final approval')).toBeInTheDocument()
      expect(screen.getByText('⏸ Pending')).toBeInTheDocument()
    })

    it('renders continue processing button', () => {
      render(<Payroll />)

      const continueButton = screen.getByRole('button', { name: /continue processing/i })
      expect(continueButton).toBeInTheDocument()
      expect(continueButton).not.toBeDisabled()
    })
  })

  describe('Payroll History Section', () => {
    it('displays historical payroll records', () => {
      render(<Payroll />)

      expect(screen.getByText('November 2024')).toBeInTheDocument()
      expect(screen.getByText('October 2024')).toBeInTheDocument()
      expect(screen.getByText('$278,000')).toBeInTheDocument()
      expect(screen.getByText('$275,000')).toBeInTheDocument()
    })

    it('shows formatted dates for payroll history', () => {
      render(<Payroll />)

      // Dates should be formatted properly
      expect(screen.getByText('11/30/2024')).toBeInTheDocument()
      expect(screen.getByText('10/31/2024')).toBeInTheDocument()
    })

    it('displays status badges for completed payrolls', () => {
      render(<Payroll />)

      const completedBadges = screen.getAllByText('completed')
      expect(completedBadges).toHaveLength(2)
    })

    it('renders export reports button', () => {
      render(<Payroll />)

      const exportButton = screen.getByRole('button', { name: /export reports/i })
      expect(exportButton).toBeInTheDocument()
    })
  })

  describe('Tab Navigation', () => {
    it('switches between tabs correctly', async () => {
      render(<Payroll />)

      // Initially overview tab should be active
      expect(screen.getByText('Current Payroll Status')).toBeInTheDocument()

      // Click on processing tab
      const processingTab = screen.getByRole('tab', { name: /processing/i })
      await user.click(processingTab)

      await waitFor(() => {
        expect(screen.getByTestId('payroll-processing')).toBeInTheDocument()
      })

      // Click on salary structure tab
      const salaryTab = screen.getByRole('tab', { name: /salary structure/i })
      await user.click(salaryTab)

      await waitFor(() => {
        expect(screen.getByTestId('salary-structure')).toBeInTheDocument()
      })

      // Click on payslips tab
      const payslipsTab = screen.getByRole('tab', { name: /payslips/i })
      await user.click(payslipsTab)

      await waitFor(() => {
        expect(screen.getByTestId('payslip-generator')).toBeInTheDocument()
      })

      // Click on taxes tab
      const taxesTab = screen.getByRole('tab', { name: /tax calculator/i })
      await user.click(taxesTab)

      await waitFor(() => {
        expect(screen.getByTestId('tax-calculator')).toBeInTheDocument()
      })
    })

    it('shows correct tab content for each tab', async () => {
      render(<Payroll />)

      const tabs = [
        { name: /processing/i, testId: 'payroll-processing' },
        { name: /salary structure/i, testId: 'salary-structure' },
        { name: /payslips/i, testId: 'payslip-generator' },
        { name: /tax calculator/i, testId: 'tax-calculator' }
      ]

      for (const tab of tabs) {
        const tabElement = screen.getByRole('tab', { name: tab.name })
        await user.click(tabElement)

        await waitFor(() => {
          expect(screen.getByTestId(tab.testId)).toBeInTheDocument()
        })
      }
    })
  })

  describe('Interactive Elements', () => {
    it('renders run payroll button in header', () => {
      render(<Payroll />)

      const runPayrollButton = screen.getByRole('button', { name: /run payroll/i })
      expect(runPayrollButton).toBeInTheDocument()
      expect(runPayrollButton.querySelector('svg')).toBeInTheDocument() // Should have icon
    })

    it('shows appropriate icons in buttons and sections', () => {
      render(<Payroll />)

      // Check that buttons have icons
      const runPayrollButton = screen.getByRole('button', { name: /run payroll/i })
      const continueButton = screen.getByRole('button', { name: /continue processing/i })
      const exportButton = screen.getByRole('button', { name: /export reports/i })

      expect(runPayrollButton.querySelector('svg')).toBeInTheDocument()
      expect(continueButton.querySelector('svg')).toBeInTheDocument()
      expect(exportButton.querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('Layout and Design', () => {
    it('has proper grid layout for stats cards', () => {
      render(<Payroll />)

      const statsContainer = screen.getByText('Monthly Payroll').closest('.grid')
      expect(statsContainer).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-4')
    })

    it('maintains proper spacing throughout the page', () => {
      render(<Payroll />)

      const pageContainer = screen.getByText('Payroll Management').closest('div')
      expect(pageContainer).toHaveClass('p-6', 'space-y-6')
    })

    it('uses responsive grid layout for overview content', () => {
      render(<Payroll />)

      const overviewGrid = screen.getByText('Current Payroll Status').closest('.grid')
      expect(overviewGrid).toHaveClass('grid', 'grid-cols-1', 'lg:grid-cols-2')
    })
  })

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<Payroll />)

      const mainHeading = screen.getByRole('heading', { level: 1 })
      expect(mainHeading).toHaveTextContent('Payroll Management')
    })

    it('provides accessible tab navigation', () => {
      render(<Payroll />)

      const tabList = screen.getByRole('tablist')
      const tabs = screen.getAllByRole('tab')

      expect(tabList).toBeInTheDocument()
      expect(tabs).toHaveLength(5)
    })

    it('includes descriptive button labels and content', () => {
      render(<Payroll />)

      expect(screen.getByRole('button', { name: /run payroll/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /continue processing/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /export reports/i })).toBeInTheDocument()
      expect(screen.getByText('Process payroll and manage compensation')).toBeInTheDocument()
    })
  })

  describe('Data Integration', () => {
    it('correctly displays payroll statistics from hooks', () => {
      render(<Payroll />)

      // Verify stats from mocked hooks
      expect(screen.getByText('$284,000')).toBeInTheDocument()
      expect(screen.getByText('$65,000')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByText('$42,000')).toBeInTheDocument()
      expect(screen.getByText('+2.1% from last month')).toBeInTheDocument()
    })

    it('displays current payroll status correctly', () => {
      render(<Payroll />)

      expect(screen.getByText('December 2024 Payroll')).toBeInTheDocument()
      expect(screen.getByText('Dec 1-31, 2024')).toBeInTheDocument()
      expect(screen.getByText('In Progress')).toBeInTheDocument()
    })

    it('shows payroll history data correctly', () => {
      render(<Payroll />)

      expect(screen.getByText('November 2024')).toBeInTheDocument()
      expect(screen.getByText('October 2024')).toBeInTheDocument()
      expect(screen.getByText('$278,000')).toBeInTheDocument()
      expect(screen.getByText('$275,000')).toBeInTheDocument()
    })
  })

  describe('Loading States', () => {
    it('handles successful data loading without showing skeletons', () => {
      render(<Payroll />)

      // Since we're mocking successful data fetches, no skeletons should show
      expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument()
      expect(screen.getByText('$284,000')).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('adapts layout for different screen sizes', () => {
      render(<Payroll />)

      const statsGrid = screen.getByText('Monthly Payroll').closest('.grid')
      expect(statsGrid).toHaveClass('grid-cols-1', 'md:grid-cols-4')

      const tabsList = screen.getByRole('tablist')
      expect(tabsList).toHaveClass('grid', 'w-full', 'grid-cols-5')
    })
  })
})