import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Onboarding from '@/pages/Onboarding'

// Mock hooks
vi.mock('@/hooks/useOnboarding', () => ({
  useOnboarding: () => ({
    getCurrentStep: vi.fn(() => 2),
    getWorkflowSteps: vi.fn(() => [
      { id: '1', title: 'Welcome', completed: true, required: true },
      { id: '2', title: 'Personal Information', completed: false, required: true },
      { id: '3', title: 'Documents Upload', completed: false, required: true },
      { id: '4', title: 'Training Modules', completed: false, required: false }
    ]),
    completeStep: vi.fn().mockResolvedValue({ success: true }),
    getProgress: vi.fn(() => ({ completed: 1, total: 4, percentage: 25 })),
    loading: false,
    error: null
  })
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1', name: 'New Employee', role: 'employee' },
    isAuthenticated: true
  })
}))

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('Onboarding Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders onboarding page', () => {
    renderWithRouter(<Onboarding />)
    
    expect(screen.getByText(/welcome to onboarding/i)).toBeInTheDocument()
  })

  it('displays onboarding progress', () => {
    renderWithRouter(<Onboarding />)
    
    expect(screen.getByText(/25%/)).toBeInTheDocument()
    expect(screen.getByText(/1.*of.*4/)).toBeInTheDocument()
  })

  it('shows workflow steps', () => {
    renderWithRouter(<Onboarding />)
    
    expect(screen.getByText('Welcome')).toBeInTheDocument()
    expect(screen.getByText('Personal Information')).toBeInTheDocument()
    expect(screen.getByText('Documents Upload')).toBeInTheDocument()
    expect(screen.getByText('Training Modules')).toBeInTheDocument()
  })

  it('highlights current step', () => {
    renderWithRouter(<Onboarding />)
    
    const currentStep = screen.getByText('Personal Information')
    expect(currentStep.closest('.current-step')).toBeInTheDocument()
  })

  it('shows completed steps', () => {
    renderWithRouter(<Onboarding />)
    
    const welcomeStep = screen.getByText('Welcome')
    expect(welcomeStep.closest('.completed')).toBeInTheDocument()
  })

  it('displays step requirements', () => {
    renderWithRouter(<Onboarding />)
    
    expect(screen.getAllByText(/required/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/optional/i)).toBeInTheDocument()
  })

  it('handles step completion', async () => {
    const mockComplete = vi.fn().mockResolvedValue({ success: true })
    vi.mocked(require('@/hooks/useOnboarding').useOnboarding).mockReturnValue({
      getCurrentStep: vi.fn(() => 2),
      getWorkflowSteps: vi.fn(() => [
        { id: '2', title: 'Personal Information', completed: false, required: true }
      ]),
      completeStep: mockComplete,
      getProgress: vi.fn(() => ({ completed: 1, total: 4, percentage: 25 })),
      loading: false,
      error: null
    })

    renderWithRouter(<Onboarding />)
    
    const continueButton = screen.getByText(/continue/i)
    fireEvent.click(continueButton)
    
    await waitFor(() => {
      expect(mockComplete).toHaveBeenCalledWith('2')
    })
  })

  it('provides step navigation', () => {
    renderWithRouter(<Onboarding />)
    
    expect(screen.getByText(/previous/i)).toBeInTheDocument()
    expect(screen.getByText(/next/i)).toBeInTheDocument()
  })

  it('displays step-specific content', () => {
    renderWithRouter(<Onboarding />)
    
    // Personal Information step content
    expect(screen.getByText(/personal details/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    renderWithRouter(<Onboarding />)
    
    const continueButton = screen.getByText(/continue/i)
    fireEvent.click(continueButton)
    
    expect(screen.getByText(/please fill all required fields/i)).toBeInTheDocument()
  })

  it('saves progress automatically', async () => {
    renderWithRouter(<Onboarding />)
    
    const nameInput = screen.getByLabelText(/full name/i)
    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    
    // Auto-save should trigger
    await waitFor(() => {
      expect(screen.getByText(/progress saved/i)).toBeInTheDocument()
    })
  })

  it('shows help and guidance', () => {
    renderWithRouter(<Onboarding />)
    
    const helpButton = screen.getByText(/need help/i)
    fireEvent.click(helpButton)
    
    expect(screen.getByText(/contact hr/i)).toBeInTheDocument()
  })

  it('displays estimated completion time', () => {
    renderWithRouter(<Onboarding />)
    
    expect(screen.getByText(/estimated time.*10 minutes/i)).toBeInTheDocument()
  })

  it('handles document upload step', () => {
    vi.mocked(require('@/hooks/useOnboarding').useOnboarding).mockReturnValue({
      getCurrentStep: vi.fn(() => 3),
      getWorkflowSteps: vi.fn(() => [
        { id: '3', title: 'Documents Upload', completed: false, required: true }
      ]),
      completeStep: vi.fn(),
      getProgress: vi.fn(() => ({ completed: 2, total: 4, percentage: 50 })),
      loading: false,
      error: null
    })

    renderWithRouter(<Onboarding />)
    
    expect(screen.getByText(/upload required documents/i)).toBeInTheDocument()
    expect(screen.getByText(/id verification/i)).toBeInTheDocument()
    expect(screen.getByText(/tax forms/i)).toBeInTheDocument()
  })

  it('shows loading state', () => {
    vi.mocked(require('@/hooks/useOnboarding').useOnboarding).mockReturnValue({
      getCurrentStep: vi.fn(() => null),
      getWorkflowSteps: vi.fn(() => []),
      completeStep: vi.fn(),
      getProgress: vi.fn(() => ({ completed: 0, total: 0, percentage: 0 })),
      loading: true,
      error: null
    })

    renderWithRouter(<Onboarding />)
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('displays error state', () => {
    vi.mocked(require('@/hooks/useOnboarding').useOnboarding).mockReturnValue({
      getCurrentStep: vi.fn(() => null),
      getWorkflowSteps: vi.fn(() => []),
      completeStep: vi.fn(),
      getProgress: vi.fn(() => ({ completed: 0, total: 0, percentage: 0 })),
      loading: false,
      error: 'Failed to load onboarding data'
    })

    renderWithRouter(<Onboarding />)
    
    expect(screen.getByText(/error loading onboarding/i)).toBeInTheDocument()
  })

  it('celebrates workflow completion', () => {
    vi.mocked(require('@/hooks/useOnboarding').useOnboarding).mockReturnValue({
      getCurrentStep: vi.fn(() => null),
      getWorkflowSteps: vi.fn(() => [
        { id: '1', title: 'Welcome', completed: true, required: true },
        { id: '2', title: 'Personal Information', completed: true, required: true },
        { id: '3', title: 'Documents Upload', completed: true, required: true },
        { id: '4', title: 'Training Modules', completed: true, required: false }
      ]),
      completeStep: vi.fn(),
      getProgress: vi.fn(() => ({ completed: 4, total: 4, percentage: 100 })),
      loading: false,
      error: null
    })

    renderWithRouter(<Onboarding />)
    
    expect(screen.getByText(/congratulations/i)).toBeInTheDocument()
    expect(screen.getByText(/onboarding complete/i)).toBeInTheDocument()
  })

  it('provides access to company resources', () => {
    renderWithRouter(<Onboarding />)
    
    expect(screen.getByText(/company handbook/i)).toBeInTheDocument()
    expect(screen.getByText(/org chart/i)).toBeInTheDocument()
    expect(screen.getByText(/benefits guide/i)).toBeInTheDocument()
  })

  it('allows step skipping for optional items', () => {
    renderWithRouter(<Onboarding />)
    
    const skipButton = screen.getByText(/skip this step/i)
    expect(skipButton).toBeInTheDocument()
  })

  it('redirects completed users', () => {
    vi.mocked(require('@/hooks/useOnboarding').useOnboarding).mockReturnValue({
      getCurrentStep: vi.fn(() => null),
      getWorkflowSteps: vi.fn(() => []),
      completeStep: vi.fn(),
      getProgress: vi.fn(() => ({ completed: 4, total: 4, percentage: 100 })),
      loading: false,
      error: null,
      isCompleted: true
    })

    renderWithRouter(<Onboarding />)
    
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
  })
})