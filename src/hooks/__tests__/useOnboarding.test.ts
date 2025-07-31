import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useOnboarding } from '@/hooks/useOnboarding'

// Mock onboarding service
vi.mock('@/services/onboardingService', () => ({
  getWorkflowSteps: vi.fn(),
  completeStep: vi.fn(),
  updateStepProgress: vi.fn(),
  getOnboardingProgress: vi.fn(),
  createOnboardingPlan: vi.fn()
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useOnboarding', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getWorkflowSteps', () => {
    it('fetches workflow steps successfully', async () => {
      const mockSteps = [
        { id: '1', title: 'Welcome', completed: true, required: true, order: 1 },
        { id: '2', title: 'Documents', completed: false, required: true, order: 2 },
        { id: '3', title: 'Training', completed: false, required: false, order: 3 }
      ]

      vi.mocked(require('@/services/onboardingService').getWorkflowSteps).mockResolvedValue(mockSteps)

      const { result } = renderHook(() => useOnboarding(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.workflowSteps).toEqual(mockSteps)
      })

      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)
    })

    it('handles workflow fetch errors', async () => {
      const mockError = new Error('Failed to fetch workflow')
      vi.mocked(require('@/services/onboardingService').getWorkflowSteps).mockRejectedValue(mockError)

      const { result } = renderHook(() => useOnboarding(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.error).toBeTruthy()
      })

      expect(result.current.workflowSteps).toEqual([])
      expect(result.current.loading).toBe(false)
    })

    it('supports employee-specific workflows', async () => {
      const employeeId = 'emp1'
      const mockSteps = [
        { id: '1', title: 'Welcome', employeeId, completed: false }
      ]

      vi.mocked(require('@/services/onboardingService').getWorkflowSteps).mockResolvedValue(mockSteps)

      const { result } = renderHook(() => useOnboarding(employeeId), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.workflowSteps).toEqual(mockSteps)
      })

      expect(require('@/services/onboardingService').getWorkflowSteps).toHaveBeenCalledWith(employeeId)
    })
  })

  describe('completeStep', () => {
    it('completes step successfully', async () => {
      const stepId = '2'
      const completedStep = { id: '2', completed: true, completedAt: '2024-02-20T10:00:00Z' }

      vi.mocked(require('@/services/onboardingService').completeStep).mockResolvedValue(completedStep)

      const { result } = renderHook(() => useOnboarding(), {
        wrapper: createWrapper()
      })

      await result.current.completeStep(stepId)

      expect(require('@/services/onboardingService').completeStep).toHaveBeenCalledWith(stepId, undefined)
    })

    it('completes step with data', async () => {
      const stepId = '2'
      const stepData = { documentUploads: ['doc1.pdf', 'doc2.pdf'] }
      const completedStep = { id: '2', completed: true, data: stepData }

      vi.mocked(require('@/services/onboardingService').completeStep).mockResolvedValue(completedStep)

      const { result } = renderHook(() => useOnboarding(), {
        wrapper: createWrapper()
      })

      await result.current.completeStep(stepId, stepData)

      expect(require('@/services/onboardingService').completeStep).toHaveBeenCalledWith(stepId, stepData)
    })

    it('handles step completion errors', async () => {
      const stepId = 'invalid'
      const mockError = new Error('Step not found')

      vi.mocked(require('@/services/onboardingService').completeStep).mockRejectedValue(mockError)

      const { result } = renderHook(() => useOnboarding(), {
        wrapper: createWrapper()
      })

      await expect(result.current.completeStep(stepId)).rejects.toThrow('Step not found')
    })
  })

  describe('updateStepProgress', () => {
    it('updates step progress successfully', async () => {
      const stepId = '2'
      const progress = 75
      const updatedStep = { id: '2', progress, lastUpdated: '2024-02-20T10:00:00Z' }

      vi.mocked(require('@/services/onboardingService').updateStepProgress).mockResolvedValue(updatedStep)

      const { result } = renderHook(() => useOnboarding(), {
        wrapper: createWrapper()
      })

      await result.current.updateStepProgress(stepId, progress)

      expect(require('@/services/onboardingService').updateStepProgress).toHaveBeenCalledWith(stepId, progress)
    })

    it('validates progress values', async () => {
      const stepId = '2'
      const invalidProgress = 150 // Over 100%

      const { result } = renderHook(() => useOnboarding(), {
        wrapper: createWrapper()
      })

      await expect(result.current.updateStepProgress(stepId, invalidProgress)).rejects.toThrow('Invalid progress value')
    })
  })

  describe('getOnboardingProgress', () => {
    it('calculates overall progress correctly', async () => {
      const mockSteps = [
        { id: '1', completed: true, required: true },
        { id: '2', completed: false, required: true },
        { id: '3', completed: false, required: false }
      ]

      vi.mocked(require('@/services/onboardingService').getWorkflowSteps).mockResolvedValue(mockSteps)

      const { result } = renderHook(() => useOnboarding(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.workflowSteps).toEqual(mockSteps)
      })

      const progress = result.current.getOnboardingProgress()

      expect(progress).toEqual({
        totalSteps: 3,
        completedSteps: 1,
        requiredSteps: 2,
        completedRequiredSteps: 1,
        overallProgress: 33.33,
        requiredProgress: 50
      })
    })

    it('handles empty workflow', async () => {
      vi.mocked(require('@/services/onboardingService').getWorkflowSteps).mockResolvedValue([])

      const { result } = renderHook(() => useOnboarding(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.workflowSteps).toEqual([])
      })

      const progress = result.current.getOnboardingProgress()

      expect(progress).toEqual({
        totalSteps: 0,
        completedSteps: 0,
        requiredSteps: 0,
        completedRequiredSteps: 0,
        overallProgress: 0,
        requiredProgress: 0
      })
    })
  })

  describe('getCurrentStep', () => {
    it('returns current active step', async () => {
      const mockSteps = [
        { id: '1', completed: true, order: 1 },
        { id: '2', completed: false, order: 2 },
        { id: '3', completed: false, order: 3 }
      ]

      vi.mocked(require('@/services/onboardingService').getWorkflowSteps).mockResolvedValue(mockSteps)

      const { result } = renderHook(() => useOnboarding(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.workflowSteps).toEqual(mockSteps)
      })

      const currentStep = result.current.getCurrentStep()

      expect(currentStep?.id).toBe('2')
    })

    it('returns null when all steps completed', async () => {
      const mockSteps = [
        { id: '1', completed: true, order: 1 },
        { id: '2', completed: true, order: 2 }
      ]

      vi.mocked(require('@/services/onboardingService').getWorkflowSteps).mockResolvedValue(mockSteps)

      const { result } = renderHook(() => useOnboarding(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.workflowSteps).toEqual(mockSteps)
      })

      const currentStep = result.current.getCurrentStep()

      expect(currentStep).toBeNull()
    })
  })

  describe('createOnboardingPlan', () => {
    it('creates custom onboarding plan', async () => {
      const employeeId = 'emp1'
      const planConfig = {
        department: 'Engineering',
        role: 'Software Developer',
        startDate: '2024-03-01'
      }
      const createdPlan = {
        id: 'plan1',
        employeeId,
        steps: [
          { id: '1', title: 'Welcome', required: true },
          { id: '2', title: 'Dev Environment Setup', required: true }
        ]
      }

      vi.mocked(require('@/services/onboardingService').createOnboardingPlan).mockResolvedValue(createdPlan)

      const { result } = renderHook(() => useOnboarding(), {
        wrapper: createWrapper()
      })

      const plan = await result.current.createOnboardingPlan(employeeId, planConfig)

      expect(plan).toEqual(createdPlan)
      expect(require('@/services/onboardingService').createOnboardingPlan).toHaveBeenCalledWith(employeeId, planConfig)
    })
  })

  describe('step navigation', () => {
    it('navigates to next step', async () => {
      const mockSteps = [
        { id: '1', completed: true, order: 1 },
        { id: '2', completed: false, order: 2 },
        { id: '3', completed: false, order: 3 }
      ]

      vi.mocked(require('@/services/onboardingService').getWorkflowSteps).mockResolvedValue(mockSteps)

      const { result } = renderHook(() => useOnboarding(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.workflowSteps).toEqual(mockSteps)
      })

      const nextStep = result.current.getNextStep('1')

      expect(nextStep?.id).toBe('2')
    })

    it('navigates to previous step', async () => {
      const mockSteps = [
        { id: '1', completed: true, order: 1 },
        { id: '2', completed: false, order: 2 }
      ]

      vi.mocked(require('@/services/onboardingService').getWorkflowSteps).mockResolvedValue(mockSteps)

      const { result } = renderHook(() => useOnboarding(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.workflowSteps).toEqual(mockSteps)
      })

      const prevStep = result.current.getPreviousStep('2')

      expect(prevStep?.id).toBe('1')
    })

    it('handles boundary cases for navigation', async () => {
      const mockSteps = [
        { id: '1', completed: true, order: 1 },
        { id: '2', completed: false, order: 2 }
      ]

      vi.mocked(require('@/services/onboardingService').getWorkflowSteps).mockResolvedValue(mockSteps)

      const { result } = renderHook(() => useOnboarding(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.workflowSteps).toEqual(mockSteps)
      })

      const prevOfFirst = result.current.getPreviousStep('1')
      const nextOfLast = result.current.getNextStep('2')

      expect(prevOfFirst).toBeNull()
      expect(nextOfLast).toBeNull()
    })
  })

  describe('step dependencies', () => {
    it('validates step dependencies', async () => {
      const mockSteps = [
        { id: '1', completed: true, dependencies: [] },
        { id: '2', completed: false, dependencies: ['1'] },
        { id: '3', completed: false, dependencies: ['1', '2'] }
      ]

      vi.mocked(require('@/services/onboardingService').getWorkflowSteps).mockResolvedValue(mockSteps)

      const { result } = renderHook(() => useOnboarding(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.workflowSteps).toEqual(mockSteps)
      })

      const canComplete2 = result.current.canCompleteStep('2')
      const canComplete3 = result.current.canCompleteStep('3')

      expect(canComplete2).toBe(true) // Dependency '1' is completed
      expect(canComplete3).toBe(false) // Dependency '2' is not completed
    })
  })
})