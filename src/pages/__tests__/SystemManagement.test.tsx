import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import SystemManagement from '@/pages/SystemManagement'

// Mock hooks
vi.mock('@/hooks/useAnalytics', () => ({
  useAnalytics: () => ({
    getSystemMetrics: vi.fn(() => ({
      uptime: '99.9%',
      activeUsers: 45,
      storageUsed: '2.3 GB',
      lastBackup: '2024-02-20T10:00:00Z'
    })),
    getSystemLogs: vi.fn(() => [
      { id: '1', level: 'info', message: 'User login successful', timestamp: '2024-02-20T14:30:00Z' },
      { id: '2', level: 'error', message: 'Database connection failed', timestamp: '2024-02-20T14:25:00Z' }
    ]),
    loading: false,
    error: null
  })
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1', name: 'System Admin', role: 'admin' },
    isAuthenticated: true
  })
}))

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('SystemManagement Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders system management page', () => {
    renderWithRouter(<SystemManagement />)
    
    expect(screen.getByText(/system management/i)).toBeInTheDocument()
  })

  it('displays system metrics', () => {
    renderWithRouter(<SystemManagement />)
    
    expect(screen.getByText(/uptime/i)).toBeInTheDocument()
    expect(screen.getByText('99.9%')).toBeInTheDocument()
    expect(screen.getByText(/active users/i)).toBeInTheDocument()
    expect(screen.getByText('45')).toBeInTheDocument()
  })

  it('shows storage information', () => {
    renderWithRouter(<SystemManagement />)
    
    expect(screen.getByText(/storage used/i)).toBeInTheDocument()
    expect(screen.getByText('2.3 GB')).toBeInTheDocument()
  })

  it('displays backup status', () => {
    renderWithRouter(<SystemManagement />)
    
    expect(screen.getByText(/last backup/i)).toBeInTheDocument()
    expect(screen.getByText(/feb 20.*10:00/i)).toBeInTheDocument()
  })

  it('shows system logs', () => {
    renderWithRouter(<SystemManagement />)
    
    expect(screen.getByText(/system logs/i)).toBeInTheDocument()
    expect(screen.getByText('User login successful')).toBeInTheDocument()
    expect(screen.getByText('Database connection failed')).toBeInTheDocument()
  })

  it('displays log levels', () => {
    renderWithRouter(<SystemManagement />)
    
    expect(screen.getByText(/info/i)).toBeInTheDocument()
    expect(screen.getByText(/error/i)).toBeInTheDocument()
  })

  it('provides backup controls', () => {
    renderWithRouter(<SystemManagement />)
    
    expect(screen.getByText(/create backup/i)).toBeInTheDocument()
    expect(screen.getByText(/restore backup/i)).toBeInTheDocument()
  })

  it('handles backup creation', async () => {
    renderWithRouter(<SystemManagement />)
    
    const backupButton = screen.getByText(/create backup/i)
    fireEvent.click(backupButton)
    
    expect(screen.getByText(/backup in progress/i)).toBeInTheDocument()
  })

  it('shows user management section', () => {
    renderWithRouter(<SystemManagement />)
    
    expect(screen.getByText(/user management/i)).toBeInTheDocument()
    expect(screen.getByText(/active sessions/i)).toBeInTheDocument()
  })

  it('displays security settings', () => {
    renderWithRouter(<SystemManagement />)
    
    expect(screen.getByText(/security settings/i)).toBeInTheDocument()
    expect(screen.getByText(/password policy/i)).toBeInTheDocument()
    expect(screen.getByText(/session timeout/i)).toBeInTheDocument()
  })

  it('provides system configuration options', () => {
    renderWithRouter(<SystemManagement />)
    
    expect(screen.getByText(/system configuration/i)).toBeInTheDocument()
    expect(screen.getByText(/email settings/i)).toBeInTheDocument()
    expect(screen.getByText(/notification preferences/i)).toBeInTheDocument()
  })

  it('shows maintenance mode toggle', () => {
    renderWithRouter(<SystemManagement />)
    
    expect(screen.getByText(/maintenance mode/i)).toBeInTheDocument()
    expect(screen.getByRole('switch')).toBeInTheDocument()
  })

  it('handles maintenance mode toggle', () => {
    renderWithRouter(<SystemManagement />)
    
    const maintenanceToggle = screen.getByRole('switch')
    fireEvent.click(maintenanceToggle)
    
    expect(screen.getByText(/maintenance mode.*enabled/i)).toBeInTheDocument()
  })

  it('displays database status', () => {
    renderWithRouter(<SystemManagement />)
    
    expect(screen.getByText(/database status/i)).toBeInTheDocument()
    expect(screen.getByText(/connection.*healthy/i)).toBeInTheDocument()
  })

  it('shows log filtering options', () => {
    renderWithRouter(<SystemManagement />)
    
    expect(screen.getByText(/filter logs/i)).toBeInTheDocument()
    expect(screen.getByText(/all levels/i)).toBeInTheDocument()
  })

  it('handles log level filtering', () => {
    renderWithRouter(<SystemManagement />)
    
    const filterSelect = screen.getByText(/all levels/i)
    fireEvent.click(filterSelect)
    
    expect(screen.getByText(/error only/i)).toBeInTheDocument()
  })

  it('provides system health check', () => {
    renderWithRouter(<SystemManagement />)
    
    const healthCheckButton = screen.getByText(/run health check/i)
    fireEvent.click(healthCheckButton)
    
    expect(screen.getByText(/health check.*running/i)).toBeInTheDocument()
  })

  it('displays performance metrics', () => {
    renderWithRouter(<SystemManagement />)
    
    expect(screen.getByText(/performance/i)).toBeInTheDocument()
    expect(screen.getByText(/cpu usage/i)).toBeInTheDocument()
    expect(screen.getByText(/memory usage/i)).toBeInTheDocument()
  })

  it('shows API rate limits', () => {
    renderWithRouter(<SystemManagement />)
    
    expect(screen.getByText(/api rate limits/i)).toBeInTheDocument()
    expect(screen.getByText(/requests per minute/i)).toBeInTheDocument()
  })

  it('handles loading state', () => {
    vi.mocked(require('@/hooks/useAnalytics').useAnalytics).mockReturnValue({
      getSystemMetrics: vi.fn(() => null),
      getSystemLogs: vi.fn(() => []),
      loading: true,
      error: null
    })

    renderWithRouter(<SystemManagement />)
    
    expect(screen.getByText(/loading system data/i)).toBeInTheDocument()
  })

  it('displays error state', () => {
    vi.mocked(require('@/hooks/useAnalytics').useAnalytics).mockReturnValue({
      getSystemMetrics: vi.fn(() => null),
      getSystemLogs: vi.fn(() => []),
      loading: false,
      error: 'Failed to load system data'
    })

    renderWithRouter(<SystemManagement />)
    
    expect(screen.getByText(/error loading system data/i)).toBeInTheDocument()
  })

  it('requires admin permissions', () => {
    vi.mocked(require('@/contexts/AuthContext').useAuth).mockReturnValue({
      user: { id: '1', name: 'Regular User', role: 'employee' },
      isAuthenticated: true
    })

    renderWithRouter(<SystemManagement />)
    
    expect(screen.getByText(/access denied/i)).toBeInTheDocument()
  })

  it('provides audit trail', () => {
    renderWithRouter(<SystemManagement />)
    
    expect(screen.getByText(/audit trail/i)).toBeInTheDocument()
    expect(screen.getByText(/system changes/i)).toBeInTheDocument()
  })

  it('shows integration status', () => {
    renderWithRouter(<SystemManagement />)
    
    expect(screen.getByText(/integrations/i)).toBeInTheDocument()
    expect(screen.getByText(/email service/i)).toBeInTheDocument()
    expect(screen.getByText(/backup service/i)).toBeInTheDocument()
  })
})