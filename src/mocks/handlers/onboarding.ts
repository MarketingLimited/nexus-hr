import { http, HttpResponse } from 'msw'
import { 
  generateOnboardingWorkflows,
  generateOnboardingTasks,
  generateDocuments,
  OnboardingWorkflow,
  OnboardingTask,
  Document
} from '../data/onboarding'
import { mockEmployees } from '../data/employees'

let onboardingWorkflows = generateOnboardingWorkflows()
let onboardingTasks = generateOnboardingTasks(onboardingWorkflows.map(w => w.id))
let documents = generateDocuments(mockEmployees.map(emp => emp.id))

export const onboardingHandlers = [
  // Onboarding Workflows
  http.get('/api/onboarding/workflows', ({ request }) => {
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const department = url.searchParams.get('department')

    let filteredWorkflows = onboardingWorkflows

    if (status) {
      filteredWorkflows = filteredWorkflows.filter(w => w.status === status)
    }

    if (department) {
      filteredWorkflows = filteredWorkflows.filter(w => w.department === department)
    }

    return HttpResponse.json({ data: filteredWorkflows })
  }),

  http.get('/api/onboarding/workflows/:id', ({ params }) => {
    const workflow = onboardingWorkflows.find(w => w.id === params.id)
    if (!workflow) {
      return HttpResponse.json({ error: 'Onboarding workflow not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: workflow })
  }),

  http.post('/api/onboarding/workflows', async ({ request }) => {
    const newWorkflowData = await request.json() as Partial<OnboardingWorkflow>
    const newWorkflow: OnboardingWorkflow = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...newWorkflowData
    } as OnboardingWorkflow

    onboardingWorkflows.push(newWorkflow)
    return HttpResponse.json({ data: newWorkflow }, { status: 201 })
  }),

  http.put('/api/onboarding/workflows/:id', async ({ params, request }) => {
    const workflowIndex = onboardingWorkflows.findIndex(w => w.id === params.id)
    if (workflowIndex === -1) {
      return HttpResponse.json({ error: 'Onboarding workflow not found' }, { status: 404 })
    }

    const updates = await request.json() as Partial<OnboardingWorkflow>
    onboardingWorkflows[workflowIndex] = {
      ...onboardingWorkflows[workflowIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    return HttpResponse.json({ data: onboardingWorkflows[workflowIndex] })
  }),

  // Onboarding Tasks
  http.get('/api/onboarding/tasks', ({ request }) => {
    const url = new URL(request.url)
    const workflowId = url.searchParams.get('workflowId')
    const status = url.searchParams.get('status')
    const assignedTo = url.searchParams.get('assignedTo')
    const category = url.searchParams.get('category')

    let filteredTasks = onboardingTasks

    if (workflowId) {
      filteredTasks = filteredTasks.filter(t => t.workflowId === workflowId)
    }

    if (status) {
      filteredTasks = filteredTasks.filter(t => t.status === status)
    }

    if (assignedTo) {
      filteredTasks = filteredTasks.filter(t => t.assignedTo === assignedTo)
    }

    if (category) {
      filteredTasks = filteredTasks.filter(t => t.category === category)
    }

    return HttpResponse.json({ data: filteredTasks })
  }),

  http.get('/api/onboarding/tasks/:id', ({ params }) => {
    const task = onboardingTasks.find(t => t.id === params.id)
    if (!task) {
      return HttpResponse.json({ error: 'Onboarding task not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: task })
  }),

  http.post('/api/onboarding/tasks', async ({ request }) => {
    const newTaskData = await request.json() as Partial<OnboardingTask>
    const newTask: OnboardingTask = {
      id: crypto.randomUUID(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...newTaskData
    } as OnboardingTask

    onboardingTasks.push(newTask)
    return HttpResponse.json({ data: newTask }, { status: 201 })
  }),

  http.put('/api/onboarding/tasks/:id', async ({ params, request }) => {
    const taskIndex = onboardingTasks.findIndex(t => t.id === params.id)
    if (taskIndex === -1) {
      return HttpResponse.json({ error: 'Onboarding task not found' }, { status: 404 })
    }

    const updates = await request.json() as Partial<OnboardingTask>
    onboardingTasks[taskIndex] = {
      ...onboardingTasks[taskIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    return HttpResponse.json({ data: onboardingTasks[taskIndex] })
  }),

  // Complete Task
  http.post('/api/onboarding/tasks/:id/complete', async ({ params, request }) => {
    const taskIndex = onboardingTasks.findIndex(t => t.id === params.id)
    if (taskIndex === -1) {
      return HttpResponse.json({ error: 'Onboarding task not found' }, { status: 404 })
    }

    const { completedBy, notes } = await request.json() as { 
      completedBy: string, 
      notes?: string 
    }

    onboardingTasks[taskIndex] = {
      ...onboardingTasks[taskIndex],
      status: 'completed',
      completedBy,
      completedAt: new Date().toISOString(),
      notes,
      updatedAt: new Date().toISOString()
    }

    return HttpResponse.json({ data: onboardingTasks[taskIndex] })
  }),

  // Documents
  http.get('/api/onboarding/documents', ({ request }) => {
    const url = new URL(request.url)
    const employeeId = url.searchParams.get('employeeId')
    const category = url.searchParams.get('category')
    const status = url.searchParams.get('status')

    let filteredDocuments = documents

    if (employeeId) {
      filteredDocuments = filteredDocuments.filter(d => d.employeeId === employeeId)
    }

    if (category) {
      filteredDocuments = filteredDocuments.filter(d => d.category === category)
    }

    if (status) {
      filteredDocuments = filteredDocuments.filter(d => d.status === status)
    }

    return HttpResponse.json({ data: filteredDocuments })
  }),

  http.get('/api/onboarding/documents/:id', ({ params }) => {
    const document = documents.find(d => d.id === params.id)
    if (!document) {
      return HttpResponse.json({ error: 'Document not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: document })
  }),

  http.post('/api/onboarding/documents', async ({ request }) => {
    const newDocumentData = await request.json() as Partial<Document>
    const newDocument: Document = {
      id: crypto.randomUUID(),
      status: 'pending',
      uploadedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...newDocumentData
    } as Document

    documents.push(newDocument)
    return HttpResponse.json({ data: newDocument }, { status: 201 })
  }),

  http.put('/api/onboarding/documents/:id', async ({ params, request }) => {
    const documentIndex = documents.findIndex(d => d.id === params.id)
    if (documentIndex === -1) {
      return HttpResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const updates = await request.json() as Partial<Document>
    documents[documentIndex] = {
      ...documents[documentIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    return HttpResponse.json({ data: documents[documentIndex] })
  }),

  // Approve/Reject Document
  http.post('/api/onboarding/documents/:id/approve', async ({ params, request }) => {
    const documentIndex = documents.findIndex(d => d.id === params.id)
    if (documentIndex === -1) {
      return HttpResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const { approvedBy, comments } = await request.json() as { 
      approvedBy: string, 
      comments?: string 
    }

    documents[documentIndex] = {
      ...documents[documentIndex],
      status: 'approved',
      approvedBy,
      approvedAt: new Date().toISOString(),
      comments,
      updatedAt: new Date().toISOString()
    }

    return HttpResponse.json({ data: documents[documentIndex] })
  }),

  http.post('/api/onboarding/documents/:id/reject', async ({ params, request }) => {
    const documentIndex = documents.findIndex(d => d.id === params.id)
    if (documentIndex === -1) {
      return HttpResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const { rejectedBy, comments } = await request.json() as { 
      rejectedBy: string, 
      comments: string 
    }

    documents[documentIndex] = {
      ...documents[documentIndex],
      status: 'rejected',
      approvedBy: rejectedBy,
      approvedAt: new Date().toISOString(),
      comments,
      updatedAt: new Date().toISOString()
    }

    return HttpResponse.json({ data: documents[documentIndex] })
  }),

  // Onboarding Statistics
  http.get('/api/onboarding/stats', ({ request }) => {
    const url = new URL(request.url)
    const month = url.searchParams.get('month')
    const year = url.searchParams.get('year')

    let filteredWorkflows = onboardingWorkflows

    if (month && year) {
      filteredWorkflows = filteredWorkflows.filter(w => {
        const workflowDate = new Date(w.createdAt)
        return workflowDate.getMonth() === parseInt(month) - 1 && 
               workflowDate.getFullYear() === parseInt(year)
      })
    }

    const stats = {
      totalWorkflows: filteredWorkflows.length,
      active: filteredWorkflows.filter(w => w.status === 'active').length,
      completed: filteredWorkflows.filter(w => w.status === 'completed').length,
      onHold: filteredWorkflows.filter(w => w.status === 'on_hold').length,
      totalTasks: onboardingTasks.length,
      completedTasks: onboardingTasks.filter(t => t.status === 'completed').length,
      pendingTasks: onboardingTasks.filter(t => t.status === 'pending').length,
      inProgressTasks: onboardingTasks.filter(t => t.status === 'in_progress').length,
      completionRate: onboardingTasks.length > 0 
        ? (onboardingTasks.filter(t => t.status === 'completed').length / onboardingTasks.length) * 100 
        : 0,
      averageCompletionTime: filteredWorkflows
        .filter(w => w.status === 'completed' && w.completedAt)
        .reduce((sum, w) => {
          const start = new Date(w.createdAt)
          const end = new Date(w.completedAt!)
          return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        }, 0) / Math.max(1, filteredWorkflows.filter(w => w.status === 'completed').length)
    }

    return HttpResponse.json({ data: stats })
  })
]