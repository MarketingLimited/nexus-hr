import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { setupServer } from 'msw/node'
import { onboardingHandlers } from '../onboarding'

const server = setupServer(...onboardingHandlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('Onboarding Handlers', () => {
  describe('GET /api/onboarding/workflows', () => {
    it('should return onboarding workflows list', async () => {
      const response = await fetch('/api/onboarding/workflows', {
        headers: { 'Authorization': 'Bearer valid-token' }
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
      expect(data.pagination).toBeDefined()
    })

    it('should filter workflows by status', async () => {
      const response = await fetch('/api/onboarding/workflows?status=in_progress', {
        headers: { 'Authorization': 'Bearer valid-token' }
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })

    it('should filter workflows by employee', async () => {
      const response = await fetch('/api/onboarding/workflows?employeeId=emp1', {
        headers: { 'Authorization': 'Bearer valid-token' }
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })
  })

  describe('GET /api/onboarding/workflows/:id', () => {
    it('should return a specific workflow', async () => {
      const response = await fetch('/api/onboarding/workflows/workflow1', {
        headers: { 'Authorization': 'Bearer valid-token' }
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.id).toBe('workflow1')
      expect(data.employeeId).toBeDefined()
      expect(data.status).toBeDefined()
      expect(data.steps).toBeDefined()
      expect(Array.isArray(data.steps)).toBe(true)
    })

    it('should return 404 for non-existent workflow', async () => {
      const response = await fetch('/api/onboarding/workflows/nonexistent', {
        headers: { 'Authorization': 'Bearer valid-token' }
      })

      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data.error).toBe('Workflow not found')
    })
  })

  describe('POST /api/onboarding/workflows', () => {
    it('should create a new onboarding workflow', async () => {
      const newWorkflow = {
        employeeId: 'emp123',
        templateId: 'template1',
        startDate: '2024-02-01',
        assignedTo: 'hr1'
      }

      const response = await fetch('/api/onboarding/workflows', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer hr-token'
        },
        body: JSON.stringify(newWorkflow)
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.id).toBeDefined()
      expect(data.employeeId).toBe('emp123')
      expect(data.status).toBe('not_started')
      expect(data.steps).toBeDefined()
    })

    it('should require authorization', async () => {
      const response = await fetch('/api/onboarding/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })

      expect(response.status).toBe(401)
    })
  })

  describe('PUT /api/onboarding/workflows/:id', () => {
    it('should update an existing workflow', async () => {
      const updates = {
        status: 'in_progress',
        currentStep: 2
      }

      const response = await fetch('/api/onboarding/workflows/workflow1', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer hr-token'
        },
        body: JSON.stringify(updates)
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.status).toBe('in_progress')
      expect(data.currentStep).toBe(2)
    })

    it('should return 404 for non-existent workflow', async () => {
      const response = await fetch('/api/onboarding/workflows/nonexistent', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer hr-token'
        },
        body: JSON.stringify({})
      })

      expect(response.status).toBe(404)
    })
  })

  describe('GET /api/onboarding/templates', () => {
    it('should return onboarding templates', async () => {
      const response = await fetch('/api/onboarding/templates', {
        headers: { 'Authorization': 'Bearer valid-token' }
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
      
      if (data.data.length > 0) {
        const template = data.data[0]
        expect(template.id).toBeDefined()
        expect(template.name).toBeDefined()
        expect(template.steps).toBeDefined()
        expect(Array.isArray(template.steps)).toBe(true)
      }
    })

    it('should filter templates by department', async () => {
      const response = await fetch('/api/onboarding/templates?department=engineering', {
        headers: { 'Authorization': 'Bearer valid-token' }
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })
  })

  describe('POST /api/onboarding/templates', () => {
    it('should create a new onboarding template', async () => {
      const newTemplate = {
        name: 'Engineering Onboarding',
        department: 'engineering',
        steps: [
          {
            id: 'step1',
            title: 'Account Setup',
            description: 'Create accounts and access',
            order: 1,
            estimatedDays: 1
          },
          {
            id: 'step2',
            title: 'Team Introduction',
            description: 'Meet the team',
            order: 2,
            estimatedDays: 1
          }
        ]
      }

      const response = await fetch('/api/onboarding/templates', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token'
        },
        body: JSON.stringify(newTemplate)
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.id).toBeDefined()
      expect(data.name).toBe('Engineering Onboarding')
      expect(data.steps).toHaveLength(2)
    })
  })

  describe('POST /api/onboarding/workflows/:id/steps/:stepId/complete', () => {
    it('should complete a workflow step', async () => {
      const response = await fetch('/api/onboarding/workflows/workflow1/steps/step1/complete', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify({
          notes: 'Step completed successfully',
          completedBy: 'hr1'
        })
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.message).toBe('Step completed successfully')
      expect(data.workflow).toBeDefined()
    })

    it('should handle invalid workflow or step', async () => {
      const response = await fetch('/api/onboarding/workflows/invalid/steps/invalid/complete', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify({})
      })

      expect(response.status).toBe(404)
    })
  })

  describe('GET /api/onboarding/stats', () => {
    it('should return onboarding statistics', async () => {
      const response = await fetch('/api/onboarding/stats', {
        headers: { 'Authorization': 'Bearer valid-token' }
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.totalWorkflows).toBeDefined()
      expect(data.activeWorkflows).toBeDefined()
      expect(data.completedWorkflows).toBeDefined()
      expect(data.averageCompletionTime).toBeDefined()
      expect(data.completionRate).toBeDefined()
    })

    it('should filter stats by date range', async () => {
      const response = await fetch('/api/onboarding/stats?startDate=2024-01-01&endDate=2024-12-31', {
        headers: { 'Authorization': 'Bearer valid-token' }
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.totalWorkflows).toBeDefined()
    })
  })

  describe('GET /api/onboarding/checklists', () => {
    it('should return onboarding checklists', async () => {
      const response = await fetch('/api/onboarding/checklists', {
        headers: { 'Authorization': 'Bearer valid-token' }
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })

    it('should filter checklists by workflow', async () => {
      const response = await fetch('/api/onboarding/checklists?workflowId=workflow1', {
        headers: { 'Authorization': 'Bearer valid-token' }
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })
  })

  describe('POST /api/onboarding/checklists/:id/items/:itemId/check', () => {
    it('should check a checklist item', async () => {
      const response = await fetch('/api/onboarding/checklists/checklist1/items/item1/check', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify({
          checked: true,
          checkedBy: 'user1'
        })
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.message).toBe('Checklist item updated successfully')
    })
  })
})