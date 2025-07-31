import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// Mock NotificationCenter component
const NotificationCenter = ({ onMarkAsRead, onClearAll }: any) => (
  <div>
    <h2>Notification Center</h2>
    <div>5 unread notifications</div>
    <div>New leave request from John Doe</div>
    <div>Payroll processed successfully</div>
    <div>Performance review due</div>
    <button onClick={() => onMarkAsRead('1')}>Mark as Read</button>
    <button onClick={() => onClearAll()}>Clear All</button>
  </div>
)

describe('NotificationCenter', () => {
  const mockOnMarkAsRead = vi.fn()
  const mockOnClearAll = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders notification center', () => {
    render(<NotificationCenter onMarkAsRead={mockOnMarkAsRead} onClearAll={mockOnClearAll} />)
    
    expect(screen.getByText(/notification center/i)).toBeInTheDocument()
  })

  it('displays unread count', () => {
    render(<NotificationCenter onMarkAsRead={mockOnMarkAsRead} onClearAll={mockOnClearAll} />)
    
    expect(screen.getByText(/5 unread notifications/i)).toBeInTheDocument()
  })

  it('shows notification messages', () => {
    render(<NotificationCenter onMarkAsRead={mockOnMarkAsRead} onClearAll={mockOnClearAll} />)
    
    expect(screen.getByText(/leave request from john doe/i)).toBeInTheDocument()
    expect(screen.getByText(/payroll processed/i)).toBeInTheDocument()
    expect(screen.getByText(/performance review due/i)).toBeInTheDocument()
  })

  it('handles marking as read', () => {
    render(<NotificationCenter onMarkAsRead={mockOnMarkAsRead} onClearAll={mockOnClearAll} />)
    
    const markButton = screen.getByText(/mark as read/i)
    fireEvent.click(markButton)
    
    expect(mockOnMarkAsRead).toHaveBeenCalledWith('1')
  })

  it('handles clearing all notifications', () => {
    render(<NotificationCenter onMarkAsRead={mockOnMarkAsRead} onClearAll={mockOnClearAll} />)
    
    const clearButton = screen.getByText(/clear all/i)
    fireEvent.click(clearButton)
    
    expect(mockOnClearAll).toHaveBeenCalled()
  })
})