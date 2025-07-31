import { http, HttpResponse } from 'msw'
import type { Workflow, WorkflowStep, WorkflowTemplate, WorkflowAnalytics } from '../../services/workflowService'

// Mock data
let workflows: Workflow[] = [
  {
    id: 'wf_001',
    name: 'Employee Onboarding - John Doe',
    type: 'employee_onboarding',
    status: 'active',
    steps: [
      {
        id: 'step_001',
        name: 'Create Employee Record',
        type: 'automated',
        status: 'completed',
        metadata: { employeeId: 'emp_001' }
      },
      {
        id: 'step_002',
        name: 'IT Equipment Assignment',
        type: 'manual',
        status: 'in_progress',
        assignedTo: 'it_admin',
        dueDate: '2024-08-05T10:00:00Z'
      },
      {
        id: 'step_003',
        name: 'HR Approval',
        type: 'approval',
        status: 'pending',
        assignedTo: 'hr_manager',
        dependencies: ['step_002']
      }
    ],
    currentStep: 'step_002',
    initiatedBy: 'hr_user',
    entityId: 'emp_001',
    entityType: 'employee',
    createdAt: '2024-08-01T09:00:00Z',
    updatedAt: '2024-08-03T14:30:00Z'
  },
  {
    id: 'wf_002',
    name: 'Leave Request - Jane Smith',
    type: 'leave_approval',
    status: 'completed',
    steps: [
      {
        id: 'step_004',
        name: 'Submit Request',
        type: 'automated',
        status: 'completed'
      },
      {
        id: 'step_005',
        name: 'Manager Approval',
        type: 'approval',
        status: 'completed',
        assignedTo: 'manager_001'
      },
      {
        id: 'step_006',
        name: 'HR Final Review',
        type: 'approval',
        status: 'completed',
        assignedTo: 'hr_manager'
      }
    ],
    initiatedBy: 'emp_002',
    entityId: 'leave_001',
    entityType: 'leave',
    createdAt: '2024-07-25T10:00:00Z',
    updatedAt: '2024-07-28T16:00:00Z',
    completedAt: '2024-07-28T16:00:00Z'
  }
]

let workflowTemplates: WorkflowTemplate[] = [
  {
    id: 'tpl_001',
    name: 'Standard Employee Onboarding',
    description: 'Complete onboarding process for new employees',
    type: 'employee_onboarding',
    steps: [
      {
        name: 'Create Employee Record',
        type: 'automated',
        dependencies: []
      },
      {
        name: 'IT Equipment Assignment',
        type: 'manual',
        assignedTo: 'it_admin',
        dependencies: []
      },
      {
        name: 'HR Documentation Review',
        type: 'approval',
        assignedTo: 'hr_manager',
        dependencies: ['IT Equipment Assignment']
      },
      {
        name: 'Manager Introduction',
        type: 'manual',
        dependencies: ['HR Documentation Review']
      }
    ],
    isActive: true,
    createdBy: 'system',
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'tpl_002',
    name: 'Leave Approval Process',
    description: 'Standard leave request approval workflow',
    type: 'leave_approval',
    steps: [
      {
        name: 'Submit Request',
        type: 'automated',
        dependencies: []
      },
      {
        name: 'Manager Approval',
        type: 'approval',
        dependencies: ['Submit Request']
      },
      {
        name: 'HR Final Review',
        type: 'approval',
        dependencies: ['Manager Approval']
      }
    ],
    isActive: true,
    createdBy: 'hr_admin',
    createdAt: '2024-02-01T00:00:00Z'
  }
]

export const workflowHandlers = [
  // Get workflows
  http.get('/api/workflows', ({ request }) => {
    const url = new URL(request.url)
    const status = url.searchParams.getAll('status')
    const type = url.searchParams.getAll('type')
    const assignedTo = url.searchParams.get('assignedTo')

    let filtered = workflows

    if (status.length > 0) {
      filtered = filtered.filter(w => status.includes(w.status))
    }

    if (type.length > 0) {
      filtered = filtered.filter(w => type.includes(w.type))
    }

    if (assignedTo) {
      filtered = filtered.filter(w => 
        w.assignedTo === assignedTo || 
        w.steps.some(s => s.assignedTo === assignedTo)
      )
    }

    return HttpResponse.json({
      data: filtered,
      success: true
    })
  }),

  // Get workflow by ID
  http.get('/api/workflows/:id', ({ params }) => {
    const { id } = params
    const workflow = workflows.find(w => w.id === id)

    if (!workflow) {
      return HttpResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: workflow, success: true })
  }),

  // Create workflow
  http.post('/api/workflows', async ({ request }) => {
    const workflowData = await request.json() as Partial<Workflow>
    
    const newWorkflow: Workflow = {
      id: `wf_${Date.now()}`,
      name: workflowData.name || 'Untitled Workflow',
      type: workflowData.type || 'custom',
      status: 'draft',
      steps: workflowData.steps || [],
      initiatedBy: workflowData.initiatedBy || 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...workflowData
    }

    workflows.push(newWorkflow)
    return HttpResponse.json({ data: newWorkflow, success: true })
  }),

  // Update workflow
  http.put('/api/workflows/:id', async ({ params, request }) => {
    const { id } = params
    const updates = await request.json() as Partial<Workflow>
    
    const workflowIndex = workflows.findIndex(w => w.id === id)
    if (workflowIndex === -1) {
      return HttpResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    workflows[workflowIndex] = {
      ...workflows[workflowIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    return HttpResponse.json({ data: workflows[workflowIndex], success: true })
  }),

  // Delete workflow
  http.delete('/api/workflows/:id', ({ params }) => {
    const { id } = params
    const workflowIndex = workflows.findIndex(w => w.id === id)
    
    if (workflowIndex === -1) {
      return HttpResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    workflows.splice(workflowIndex, 1)
    return HttpResponse.json({ data: { message: 'Workflow deleted successfully' }, success: true })
  }),

  // Start workflow from template
  http.post('/api/workflows/start', async ({ request }) => {
    const { templateId, entityId, entityType, metadata } = await request.json() as {
      templateId: string
      entityId: string
      entityType: string
      metadata?: Record<string, any>
    }

    const template = workflowTemplates.find(t => t.id === templateId)
    if (!template) {
      return HttpResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    const newWorkflow: Workflow = {
      id: `wf_${Date.now()}`,
      name: `${template.name} - ${entityId}`,
      type: template.type as Workflow['type'],
      status: 'active',
      steps: template.steps.map((step, index) => ({
        id: `step_${Date.now()}_${index}`,
        ...step,
        status: index === 0 ? 'in_progress' : 'pending'
      })),
      currentStep: template.steps.length > 0 ? `step_${Date.now()}_0` : undefined,
      initiatedBy: 'system',
      entityId,
      entityType,
      metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    workflows.push(newWorkflow)
    return HttpResponse.json({ data: newWorkflow, success: true })
  }),

  // Complete workflow step
  http.put('/api/workflows/:workflowId/steps/:stepId/complete', async ({ params, request }) => {
    const { workflowId, stepId } = params
    const data = await request.json() as Record<string, any>

    const workflow = workflows.find(w => w.id === workflowId)
    if (!workflow) {
      return HttpResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    const stepIndex = workflow.steps.findIndex(s => s.id === stepId)
    if (stepIndex === -1) {
      return HttpResponse.json({ error: 'Step not found' }, { status: 404 })
    }

    // Complete current step
    workflow.steps[stepIndex].status = 'completed'
    workflow.steps[stepIndex].metadata = { ...workflow.steps[stepIndex].metadata, ...data }

    // Find next step
    const nextStep = workflow.steps.find(s => 
      s.status === 'pending' && 
      (!s.dependencies || s.dependencies.every(dep => 
        workflow.steps.find(step => step.name === dep)?.status === 'completed'
      ))
    )

    if (nextStep) {
      nextStep.status = 'in_progress'
      workflow.currentStep = nextStep.id
    } else {
      // Check if all steps are completed
      const allCompleted = workflow.steps.every(s => 
        s.status === 'completed' || s.status === 'skipped'
      )
      
      if (allCompleted) {
        workflow.status = 'completed'
        workflow.completedAt = new Date().toISOString()
        workflow.currentStep = undefined
      }
    }

    workflow.updatedAt = new Date().toISOString()
    return HttpResponse.json({ data: workflow, success: true })
  }),

  // Skip workflow step
  http.put('/api/workflows/:workflowId/steps/:stepId/skip', async ({ params, request }) => {
    const { workflowId, stepId } = params
    const { reason } = await request.json() as { reason: string }

    const workflow = workflows.find(w => w.id === workflowId)
    if (!workflow) {
      return HttpResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    const stepIndex = workflow.steps.findIndex(s => s.id === stepId)
    if (stepIndex === -1) {
      return HttpResponse.json({ error: 'Step not found' }, { status: 404 })
    }

    workflow.steps[stepIndex].status = 'skipped'
    workflow.steps[stepIndex].metadata = { 
      ...workflow.steps[stepIndex].metadata, 
      skipReason: reason 
    }

    workflow.updatedAt = new Date().toISOString()
    return HttpResponse.json({ data: workflow, success: true })
  }),

  // Pause workflow
  http.put('/api/workflows/:id/pause', async ({ params, request }) => {
    const { id } = params
    const { reason } = await request.json() as { reason?: string }

    const workflowIndex = workflows.findIndex(w => w.id === id)
    if (workflowIndex === -1) {
      return HttpResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    workflows[workflowIndex].status = 'paused'
    workflows[workflowIndex].metadata = {
      ...workflows[workflowIndex].metadata,
      pauseReason: reason,
      pausedAt: new Date().toISOString()
    }
    workflows[workflowIndex].updatedAt = new Date().toISOString()

    return HttpResponse.json({ data: workflows[workflowIndex], success: true })
  }),

  // Resume workflow
  http.put('/api/workflows/:id/resume', ({ params }) => {
    const { id } = params

    const workflowIndex = workflows.findIndex(w => w.id === id)
    if (workflowIndex === -1) {
      return HttpResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    workflows[workflowIndex].status = 'active'
    workflows[workflowIndex].updatedAt = new Date().toISOString()

    return HttpResponse.json({ data: workflows[workflowIndex], success: true })
  }),

  // Cancel workflow
  http.put('/api/workflows/:id/cancel', async ({ params, request }) => {
    const { id } = params
    const { reason } = await request.json() as { reason: string }

    const workflowIndex = workflows.findIndex(w => w.id === id)
    if (workflowIndex === -1) {
      return HttpResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    workflows[workflowIndex].status = 'cancelled'
    workflows[workflowIndex].metadata = {
      ...workflows[workflowIndex].metadata,
      cancelReason: reason,
      cancelledAt: new Date().toISOString()
    }
    workflows[workflowIndex].updatedAt = new Date().toISOString()

    return HttpResponse.json({ data: workflows[workflowIndex], success: true })
  }),

  // Get workflow templates
  http.get('/api/workflows/templates', () => {
    return HttpResponse.json({
      data: workflowTemplates,
      success: true
    })
  }),

  // Get workflow template by ID
  http.get('/api/workflows/templates/:id', ({ params }) => {
    const { id } = params
    const template = workflowTemplates.find(t => t.id === id)

    if (!template) {
      return HttpResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: template, success: true })
  }),

  // Create workflow template
  http.post('/api/workflows/templates', async ({ request }) => {
    const templateData = await request.json() as Partial<WorkflowTemplate>
    
    const newTemplate: WorkflowTemplate = {
      id: `tpl_${Date.now()}`,
      name: templateData.name || 'Untitled Template',
      description: templateData.description || '',
      type: templateData.type || 'custom',
      steps: templateData.steps || [],
      isActive: templateData.isActive !== false,
      createdBy: templateData.createdBy || 'system',
      createdAt: new Date().toISOString()
    }

    workflowTemplates.push(newTemplate)
    return HttpResponse.json({ data: newTemplate, success: true })
  }),

  // Get workflow analytics
  http.get('/api/workflows/analytics', ({ request }) => {
    const url = new URL(request.url)
    const dateRange = url.searchParams.get('dateRange')
    const type = url.searchParams.getAll('type')

    let filtered = workflows
    
    if (type.length > 0) {
      filtered = filtered.filter(w => type.includes(w.type))
    }

    const analytics: WorkflowAnalytics = {
      totalWorkflows: filtered.length,
      completedWorkflows: filtered.filter(w => w.status === 'completed').length,
      averageCompletionTime: 2.5, // days
      bottlenecks: [
        {
          stepName: 'HR Approval',
          averageTime: 48,
          count: 15
        },
        {
          stepName: 'IT Equipment Assignment',
          averageTime: 24,
          count: 12
        }
      ],
      completionRates: [
        { type: 'employee_onboarding', rate: 0.85 },
        { type: 'leave_approval', rate: 0.95 },
        { type: 'payroll_cycle', rate: 0.98 }
      ]
    }

    return HttpResponse.json({ data: analytics, success: true })
  })
]