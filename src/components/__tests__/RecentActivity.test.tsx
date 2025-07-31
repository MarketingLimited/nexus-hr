import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import RecentActivity from '@/components/dashboard/RecentActivity'

// Mock date-fns
vi.mock('date-fns', () => ({
  formatDistanceToNow: vi.fn(() => '30 minutes ago')
}))

describe('RecentActivity', () => {
  it('renders the component with correct title', () => {
    render(<RecentActivity />)
    expect(screen.getByText('Recent Activity')).toBeInTheDocument()
  })

  it('displays all activity items', () => {
    render(<RecentActivity />)
    
    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument()
    expect(screen.getByText('Mike Chen')).toBeInTheDocument()
    expect(screen.getByText('Emily Davis')).toBeInTheDocument()
    expect(screen.getByText('David Wilson')).toBeInTheDocument()
    expect(screen.getByText('Lisa Brown')).toBeInTheDocument()
  })

  it('shows correct activity actions', () => {
    render(<RecentActivity />)
    
    expect(screen.getByText('submitted leave request')).toBeInTheDocument()
    expect(screen.getByText('completed onboarding task')).toBeInTheDocument()
    expect(screen.getByText('clocked in')).toBeInTheDocument()
    expect(screen.getByText('updated performance goal')).toBeInTheDocument()
    expect(screen.getByText('requested salary review')).toBeInTheDocument()
  })

  it('displays status badges with correct variants', () => {
    render(<RecentActivity />)
    
    const pendingBadges = screen.getAllByText('pending')
    const completedBadge = screen.getByText('completed')
    const activeBadge = screen.getByText('active')
    const updatedBadge = screen.getByText('updated')
    
    expect(pendingBadges).toHaveLength(2)
    expect(completedBadge).toBeInTheDocument()
    expect(activeBadge).toBeInTheDocument()
    expect(updatedBadge).toBeInTheDocument()
  })

  it('renders user avatars with fallbacks', () => {
    render(<RecentActivity />)
    
    // Should render avatar fallbacks with initials
    expect(screen.getByText('SJ')).toBeInTheDocument() // Sarah Johnson
    expect(screen.getByText('MC')).toBeInTheDocument() // Mike Chen
    expect(screen.getByText('ED')).toBeInTheDocument() // Emily Davis
    expect(screen.getByText('DW')).toBeInTheDocument() // David Wilson
    expect(screen.getByText('LB')).toBeInTheDocument() // Lisa Brown
  })

  it('displays relative timestamps', () => {
    render(<RecentActivity />)
    
    // All timestamps should show "30 minutes ago" due to mock
    const timestamps = screen.getAllByText('30 minutes ago')
    expect(timestamps).toHaveLength(5)
  })

  it('applies hover effects to activity items', () => {
    render(<RecentActivity />)
    
    const activityItems = screen.getAllByText('Sarah Johnson')[0].closest('.flex.items-center')
    expect(activityItems).toHaveClass('hover:bg-muted/50', 'transition-colors')
  })

  it('uses proper layout structure', () => {
    render(<RecentActivity />)
    
    // Should have space-y-4 for activity items
    const activityContainer = screen.getByText('Sarah Johnson').closest('.space-y-4')
    expect(activityContainer).toBeInTheDocument()
  })

  it('truncates long user names appropriately', () => {
    render(<RecentActivity />)
    
    const userNames = screen.getAllByText(/Sarah Johnson|Mike Chen|Emily Davis|David Wilson|Lisa Brown/)
    userNames.forEach(name => {
      expect(name).toHaveClass('text-sm', 'font-medium', 'text-foreground', 'truncate')
    })
  })

  it('shows user emails in avatar alt text', () => {
    render(<RecentActivity />)
    
    const avatars = screen.getAllByRole('img')
    expect(avatars[0]).toHaveAttribute('alt', 'Sarah Johnson')
    expect(avatars[1]).toHaveAttribute('alt', 'Mike Chen')
    expect(avatars[2]).toHaveAttribute('alt', 'Emily Davis')
    expect(avatars[3]).toHaveAttribute('alt', 'David Wilson')
    expect(avatars[4]).toHaveAttribute('alt', 'Lisa Brown')
  })

  it('applies correct badge styling based on status', () => {
    render(<RecentActivity />)
    
    const badges = screen.getAllByText(/pending|completed|active|updated/)
    badges.forEach(badge => {
      expect(badge).toHaveClass('text-xs')
    })
  })

  it('maintains consistent item structure', () => {
    render(<RecentActivity />)
    
    const activityItems = document.querySelectorAll('.flex.items-center.space-x-3')
    expect(activityItems).toHaveLength(5)
    
    activityItems.forEach(item => {
      // Each item should have avatar, content, and proper spacing
      const avatar = item.querySelector('.h-8.w-8')
      const content = item.querySelector('.flex-1.min-w-0')
      
      expect(avatar).toBeInTheDocument()
      expect(content).toBeInTheDocument()
    })
  })

  it('renders with card component styling', () => {
    render(<RecentActivity />)
    
    const card = screen.getByText('Recent Activity').closest('.bg-gradient-card')
    expect(card).toHaveClass('border-border/50', 'shadow-shadow-md')
  })

  it('displays activity metadata correctly', () => {
    render(<RecentActivity />)
    
    // Each activity should have both status badge and timestamp
    const metadataContainers = document.querySelectorAll('.flex.items-center.space-x-2.mt-1')
    expect(metadataContainers).toHaveLength(5)
    
    metadataContainers.forEach(container => {
      const badge = container.querySelector('[class*="text-xs"]')
      const timestamp = container.querySelector('.text-xs.text-muted-foreground')
      
      expect(badge).toBeInTheDocument()
      expect(timestamp).toBeInTheDocument()
    })
  })
})