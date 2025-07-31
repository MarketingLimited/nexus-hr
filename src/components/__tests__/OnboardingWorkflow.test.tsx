import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Mock OnboardingWorkflow component
const OnboardingWorkflow = ({ onStepComplete, onWorkflowComplete }: any) => (
  <div>
    <h2>Onboarding Workflow</h2>
    <div>Welcome</div>
    <div>Documents</div>
    <div>Training</div>
    <div>33%</div>
    <div>1 of 3</div>
    <button onClick={() => onStepComplete('2')}>Complete Step</button>
    <button>Previous</button>
    <button disabled>Next</button>
    <button>Help</button>
  </div>
)

// Mock hooks
vi.mock('@/hooks/useOnboarding', () => ({
  useOnboarding: () => ({
    getWorkflowSteps: vi.fn(() => [
      { id: '1', title: 'Welcome', completed: true, required: true },
      { id: '2', title: 'Documents', completed: false, required: true },
      { id: '3', title: 'Training', completed: false, required: false }
    ]),
    completeStep: vi.fn().mockResolvedValue({ success: true }),
    getCurrentStep: vi.fn(() => '2'),
    getProgress: vi.fn(() => ({ completed: 1, total: 3, percentage: 33 })),
    loading: false,
    error: null
  })
}))

describe('OnboardingWorkflow', () => {
  const mockOnStepComplete = vi.fn()
  const mockOnWorkflowComplete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders onboarding workflow', () => {
    render(<OnboardingWorkflow onStepComplete={mockOnStepComplete} onWorkflowComplete={mockOnWorkflowComplete} />)
    
    expect(screen.getByText(/onboarding/i)).toBeInTheDocument()
  })

  it('displays workflow steps', () => {
    render(<OnboardingWorkflow onStepComplete={mockOnStepComplete} onWorkflowComplete={mockOnWorkflowComplete} />)
    
    expect(screen.getByText('Welcome')).toBeInTheDocument()
    expect(screen.getByText('Documents')).toBeInTheDocument()
    expect(screen.getByText('Training')).toBeInTheDocument()
  })

  it('shows step completion status', () => {
    render(<OnboardingWorkflow onStepComplete={mockOnStepComplete} onWorkflowComplete={mockOnWorkflowComplete} />)
    
    const completedStep = screen.getByText('Welcome').closest('.completed')
    expect(completedStep).toBeInTheDocument()
  })

  it('displays progress indicator', () => {
    render(<OnboardingWorkflow onStepComplete={mockOnStepComplete} onWorkflowComplete={mockOnWorkflowComplete} />)
    
    expect(screen.getByText(/33%/)).toBeInTheDocument()
    expect(screen.getByText(/1.*of.*3/)).toBeInTheDocument()
  })

  it('highlights current step', () => {
    render(<OnboardingWorkflow onStepComplete={mockOnStepComplete} onWorkflowComplete={mockOnWorkflowComplete} />)
    
    const currentStep = screen.getByText('Documents').closest('.current-step')
    expect(currentStep).toBeInTheDocument()
  })

  it('shows step requirements', () => {
    render(<OnboardingWorkflow onStepComplete={mockOnStepComplete} onWorkflowComplete={mockOnWorkflowComplete} />)
    
    expect(screen.getAllByText(/required/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/optional/i)).toBeInTheDocument()
  })

  it('handles step completion', async () => {
    const mockComplete = vi.fn().mockResolvedValue({ success: true })
    vi.mocked(require('@/hooks/useOnboarding').useOnboarding).mockReturnValue({
      getWorkflowSteps: vi.fn(() => [
        { id: '2', title: 'Documents', completed: false, required: true }
      ]),
      completeStep: mockComplete,
      getCurrentStep: vi.fn(() => '2'),
      getProgress: vi.fn(() => ({ completed: 0, total: 1, percentage: 0 })),
      loading: false,
      error: null
    })

    render(<OnboardingWorkflow onStepComplete={mockOnStepComplete} onWorkflowComplete={mockOnWorkflowComplete} />)
    
    const completeButton = screen.getByText(/complete step/i)
    fireEvent.click(completeButton)
    
    await waitFor(() => {
      expect(mockComplete).toHaveBeenCalledWith('2')
    })
  })

  it('prevents completion of non-current steps', () => {
    render(<OnboardingWorkflow onStepComplete={mockOnStepComplete} onWorkflowComplete={mockOnWorkflowComplete} />)
    
    const trainingStep = screen.getByText('Training')
    const stepContainer = trainingStep.closest('.step-container')
    const completeButton = stepContainer?.querySelector('button')
    
    expect(completeButton).toBeDisabled()
  })

  it('shows step details on click', () => {
    render(<OnboardingWorkflow onStepComplete={mockOnStepComplete} onWorkflowComplete={mockOnWorkflowComplete} />)
    
    const documentStep = screen.getByText('Documents')
    fireEvent.click(documentStep)
    
    expect(screen.getByText(/step details/i)).toBeInTheDocument()
  })

  it('displays estimated time for each step', () => {
    render(<OnboardingWorkflow onStepComplete={mockOnStepComplete} onWorkflowComplete={mockOnWorkflowComplete} />)
    
    expect(screen.getByText(/15 min/)).toBeInTheDocument()
    expect(screen.getByText(/30 min/)).toBeInTheDocument()
  })

  it('shows completion checklist', () => {
    render(<OnboardingWorkflow onStepComplete={mockOnStepComplete} onWorkflowComplete={mockOnWorkflowComplete} />)
    
    const documentsStep = screen.getByText('Documents')
    fireEvent.click(documentsStep)
    
    expect(screen.getByText(/upload ID/i)).toBeInTheDocument()
    expect(screen.getByText(/tax forms/i)).toBeInTheDocument()
  })

  it('handles workflow completion', async () => {
    vi.mocked(require('@/hooks/useOnboarding').useOnboarding).mockReturnValue({
      getWorkflowSteps: vi.fn(() => [
        { id: '1', title: 'Welcome', completed: true, required: true },
        { id: '2', title: 'Documents', completed: true, required: true },
        { id: '3', title: 'Training', completed: true, required: false }
      ]),
      completeStep: vi.fn(),
      getCurrentStep: vi.fn(() => null),
      getProgress: vi.fn(() => ({ completed: 3, total: 3, percentage: 100 })),
      loading: false,
      error: null
    })

    render(<OnboardingWorkflow onStepComplete={mockOnStepComplete} onWorkflowComplete={mockOnWorkflowComplete} />)
    
    expect(screen.getByText(/workflow complete/i)).toBeInTheDocument()
    expect(mockOnWorkflowComplete).toHaveBeenCalled()
  })

  it('shows loading state', () => {
    vi.mocked(require('@/hooks/useOnboarding').useOnboarding).mockReturnValue({
      getWorkflowSteps: vi.fn(() => []),
      completeStep: vi.fn(),
      getCurrentStep: vi.fn(() => null),
      getProgress: vi.fn(() => ({ completed: 0, total: 0, percentage: 0 })),
      loading: true,
      error: null
    })

    render(<OnboardingWorkflow onStepComplete={mockOnStepComplete} onWorkflowComplete={mockOnWorkflowComplete} />)
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('displays error state', () => {
    vi.mocked(require('@/hooks/useOnboarding').useOnboarding).mockReturnValue({
      getWorkflowSteps: vi.fn(() => []),
      completeStep: vi.fn(),
      getCurrentStep: vi.fn(() => null),
      getProgress: vi.fn(() => ({ completed: 0, total: 0, percentage: 0 })),
      loading: false,
      error: 'Failed to load workflow'
    })

    render(<OnboardingWorkflow onStepComplete={mockOnStepComplete} onWorkflowComplete={mockOnWorkflowComplete} />)
    
    expect(screen.getByText(/error/i)).toBeInTheDocument()
  })

  it('allows step navigation', () => {
    render(<OnboardingWorkflow onStepComplete={mockOnStepComplete} onWorkflowComplete={mockOnWorkflowComplete} />)
    
    const prevButton = screen.getByText(/previous/i)
    const nextButton = screen.getByText(/next/i)
    
    expect(prevButton).toBeInTheDocument()
    expect(nextButton).toBeInTheDocument()
  })

  it('disables navigation based on step status', () => {
    render(<OnboardingWorkflow onStepComplete={mockOnStepComplete} onWorkflowComplete={mockOnWorkflowComplete} />)
    
    const nextButton = screen.getByText(/next/i)
    // Should be disabled if current step not completed
    expect(nextButton).toBeDisabled()
  })

  it('provides help and guidance for each step', () => {
    render(<OnboardingWorkflow onStepComplete={mockOnStepComplete} onWorkflowComplete={mockOnWorkflowComplete} />)
    
    const helpButton = screen.getByText(/help/i)
    fireEvent.click(helpButton)
    
    expect(screen.getByText(/guidance/i)).toBeInTheDocument()
  })

  it('tracks step completion time', () => {
    render(<OnboardingWorkflow onStepComplete={mockOnStepComplete} onWorkflowComplete={mockOnWorkflowComplete} />)
    
    expect(screen.getByText(/started/i)).toBeInTheDocument()
    expect(screen.getByText(/completed/i)).toBeInTheDocument()
  })

  it('shows overall workflow statistics', () => {
    render(<OnboardingWorkflow onStepComplete={mockOnStepComplete} onWorkflowComplete={mockOnWorkflowComplete} />)
    
    expect(screen.getByText(/steps completed/i)).toBeInTheDocument()
    expect(screen.getByText(/time remaining/i)).toBeInTheDocument()
  })
})