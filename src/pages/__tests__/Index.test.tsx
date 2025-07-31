import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test-utils'
import Index from '../Index'

// Mock the dashboard components
vi.mock('@/components/dashboard/StatsCard', () => ({
  default: ({ title, value }: any) => (
    <div data-testid="stats-card">
      <h3>{title}</h3>
      <p>{value}</p>
    </div>
  )
}))

vi.mock('@/components/dashboard/QuickActions', () => ({
  default: () => <div data-testid="quick-actions">Quick Actions Component</div>
}))

vi.mock('@/components/dashboard/RecentActivity', () => ({
  default: () => <div data-testid="recent-activity">Recent Activity Component</div>
}))

describe('Index Page', () => {
  describe('Page Rendering', () => {
    it('renders the main dashboard page', () => {
      render(<Index />)
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    it('displays components', () => {
      render(<Index />)
      
      expect(screen.getByTestId('quick-actions')).toBeInTheDocument()
      expect(screen.getByTestId('recent-activity')).toBeInTheDocument()
    })

    it('has proper page structure', () => {
      render(<Index />)
      
      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    })
  })
})