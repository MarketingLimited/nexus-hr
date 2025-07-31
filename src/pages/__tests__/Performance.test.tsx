import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@/test-utils'
import { userEvent } from '@testing-library/user-event'
import Performance from '../Performance'

// Mock the performance hooks
vi.mock('@/hooks/usePerformance', () => ({
  usePerformanceAnalytics: () => ({
    data: { overallRating: 4.2, completionRate: 89 },
    isLoading: false
  }),
  usePerformanceReviews: () => ({
    data: { data: [] },
    isLoading: false
  }),
  useGoals: () => ({
    data: { data: [] },
    isLoading: false
  })
}))

// Mock child components
vi.mock('@/components/performance/PerformanceReviews', () => ({
  default: () => <div data-testid="performance-reviews">Performance Reviews</div>
}))

vi.mock('@/components/performance/GoalTracking', () => ({
  default: () => <div data-testid="goal-tracking">Goal Tracking</div>
}))

vi.mock('@/components/performance/FeedbackSystem', () => ({
  default: () => <div data-testid="feedback-system">Feedback System</div>
}))

vi.mock('@/components/performance/PerformanceAnalytics', () => ({
  default: () => <div data-testid="performance-analytics">Performance Analytics</div>
}))

describe('Performance Page', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the performance page with header and sections', () => {
      render(<Performance />)

      expect(screen.getByText('Performance Management')).toBeInTheDocument()
      expect(screen.getByText('Track and manage employee performance')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /start review/i })).toBeInTheDocument()
    })

    it('displays performance statistics cards', () => {
      render(<Performance />)

      expect(screen.getByText('Reviews Completed')).toBeInTheDocument()
      expect(screen.getByText('89%')).toBeInTheDocument()
      expect(screen.getByText('Avg. Rating')).toBeInTheDocument()
      expect(screen.getByText('4.2')).toBeInTheDocument()
      expect(screen.getByText('Goals Achieved')).toBeInTheDocument()
      expect(screen.getByText('76%')).toBeInTheDocument()
      expect(screen.getByText('Due This Week')).toBeInTheDocument()
      expect(screen.getByText('12')).toBeInTheDocument()
    })

    it('renders tab navigation correctly', () => {
      render(<Performance />)

      expect(screen.getByRole('tab', { name: /overview/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /reviews/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /goals/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /feedback/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /analytics/i })).toBeInTheDocument()
    })
  })

  describe('Tab Navigation', () => {
    it('switches between tabs correctly', async () => {
      render(<Performance />)

      const reviewsTab = screen.getByRole('tab', { name: /reviews/i })
      await user.click(reviewsTab)

      await waitFor(() => {
        expect(screen.getByTestId('performance-reviews')).toBeInTheDocument()
      })

      const goalsTab = screen.getByRole('tab', { name: /goals/i })
      await user.click(goalsTab)

      await waitFor(() => {
        expect(screen.getByTestId('goal-tracking')).toBeInTheDocument()
      })
    })
  })
})