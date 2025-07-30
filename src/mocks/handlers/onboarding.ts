import { http, delay } from 'msw'
import { 
  generateOnboardingTasks,
  generateOnboardingWorkflows,
  generateOnboardingSessions,
  generateOnboardingChecklists,
  OnboardingTask,
  OnboardingWorkflow,
  OnboardingSession,
  OnboardingChecklist
} from '../data/onboarding'
import { mockEmployees } from '../data/employees'
import { mockDepartments } from '../data/departments'

// Generate mock data
const employeeIds = mockEmployees.map(emp => emp.id)
const departmentIds = mockDepartments.map(dept => dept.id)

const tasks = generateOnboardingTasks(20)
const workflows = generateOnboardingWorkflows(departmentIds)
const sessions = generateOnboardingSessions(employeeIds, workflows.map(w => w.id), 30)
const checklists = generateOnboardingChecklists(departmentIds)

export const onboardingHandlers = [
  // Get onboarding workflows
  http.get('/api/onboarding/workflows', async ({ request }) => {
    await delay(Math.random() * 300 + 100)
    
    const url = new URL(request.url)
    const departmentId = url.searchParams.get('departmentId')
    const status = url.searchParams.get('status')
    
    let filtered = [...workflows]
    
    if (departmentId) {
      filtered = filtered.filter(workflow => workflow.departmentId === departmentId)
    }
    
    if (status) {
      filtered = filtered.filter(workflow => workflow.status === status)
    }
    
    return Response.json({
      data: filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      message: 'Onboarding workflows retrieved successfully'
    })
  }),

  // Get workflow by ID
  http.get('/api/onboarding/workflows/:id', async ({ params }) => {
    await delay(Math.random() * 200 + 50)
    
    const workflow = workflows.find(w => w.id === params.id)
    
    if (!workflow) {
      return new Response('Onboarding workflow not found', { status: 404 })
    }
    
    return Response.json({
      data: workflow,
      message: 'Onboarding workflow retrieved successfully'
    })
  }),

  // Create workflow
  http.post('/api/onboarding/workflows', async ({ request }) => {
    await delay(Math.random() * 400 + 100)
    
    const data = await request.json() as Partial<OnboardingWorkflow>
    
    const newWorkflow: OnboardingWorkflow = {
      id: `workflow-${workflows.length + 1}`,
      name: data.name!,
      description: data.description || '',
      departmentId: data.departmentId!,
      durationDays: data.durationDays || 30,
      tasks: data.tasks || [],
      status: 'active',
      version: 1,
      createdBy: data.createdBy!,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    workflows.push(newWorkflow)
    
    return Response.json({
      data: newWorkflow,
      message: 'Onboarding workflow created successfully'
    })
  }),

  // Update workflow
  http.put('/api/onboarding/workflows/:id', async ({ params, request }) => {
    await delay(Math.random() * 400 + 100)
    
    const data = await request.json() as Partial<OnboardingWorkflow>
    const workflowIndex = workflows.findIndex(w => w.id === params.id)
    
    if (workflowIndex === -1) {
      return new Response('Onboarding workflow not found', { status: 404 })
    }
    
    const updatedWorkflow = {
      ...workflows[workflowIndex],
      ...data,
      version: workflows[workflowIndex].version + 1,
      updatedAt: new Date().toISOString(),
    }
    
    workflows[workflowIndex] = updatedWorkflow
    
    return Response.json({
      data: updatedWorkflow,
      message: 'Onboarding workflow updated successfully'
    })
  }),

  // Delete workflow
  http.delete('/api/onboarding/workflows/:id', async ({ params }) => {
    await delay(Math.random() * 300 + 100)
    
    const workflowIndex = workflows.findIndex(w => w.id === params.id)
    
    if (workflowIndex === -1) {
      return new Response('Onboarding workflow not found', { status: 404 })
    }
    
    workflows.splice(workflowIndex, 1)
    
    return Response.json({
      message: 'Onboarding workflow deleted successfully'
    })
  }),

  // Get onboarding tasks
  http.get('/api/onboarding/tasks', async ({ request }) => {
    await delay(Math.random() * 300 + 100)
    
    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    const status = url.searchParams.get('status')
    
    let filtered = [...tasks]
    
    if (category) {
      filtered = filtered.filter(task => task.category === category)
    }
    
    if (status) {
      filtered = filtered.filter(task => task.status === status)
    }
    
    return Response.json({
      data: filtered.sort((a, b) => a.order - b.order),
      message: 'Onboarding tasks retrieved successfully'
    })
  }),

  // Get task by ID
  http.get('/api/onboarding/tasks/:id', async ({ params }) => {
    await delay(Math.random() * 200 + 50)
    
    const task = tasks.find(t => t.id === params.id)
    
    if (!task) {
      return new Response('Onboarding task not found', { status: 404 })
    }
    
    return Response.json({
      data: task,
      message: 'Onboarding task retrieved successfully'
    })
  }),

  // Create task
  http.post('/api/onboarding/tasks', async ({ request }) => {
    await delay(Math.random() * 400 + 100)
    
    const data = await request.json() as Partial<OnboardingTask>
    
    const newTask: OnboardingTask = {
      id: `task-${tasks.length + 1}`,
      title: data.title!,
      description: data.description || '',
      category: data.category || 'general',
      type: data.type || 'manual',
      estimatedDuration: data.estimatedDuration || 60,
      order: data.order || tasks.length + 1,
      isRequired: data.isRequired ?? true,
      dependencies: data.dependencies || [],
      assignedTo: data.assignedTo,
      instructions: data.instructions || '',
      resources: data.resources || [],
      completionCriteria: data.completionCriteria || [],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    tasks.push(newTask)
    
    return Response.json({
      data: newTask,
      message: 'Onboarding task created successfully'
    })
  }),

  // Update task
  http.put('/api/onboarding/tasks/:id', async ({ params, request }) => {
    await delay(Math.random() * 400 + 100)
    
    const data = await request.json() as Partial<OnboardingTask>
    const taskIndex = tasks.findIndex(t => t.id === params.id)
    
    if (taskIndex === -1) {
      return new Response('Onboarding task not found', { status: 404 })
    }
    
    const updatedTask = {
      ...tasks[taskIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    
    tasks[taskIndex] = updatedTask
    
    return Response.json({
      data: updatedTask,
      message: 'Onboarding task updated successfully'
    })
  }),

  // Get onboarding sessions
  http.get('/api/onboarding/sessions', async ({ request }) => {
    await delay(Math.random() * 300 + 100)
    
    const url = new URL(request.url)
    const employeeId = url.searchParams.get('employeeId')
    const status = url.searchParams.get('status')
    const workflowId = url.searchParams.get('workflowId')
    
    let filtered = [...sessions]
    
    if (employeeId) {
      filtered = filtered.filter(session => session.employeeId === employeeId)
    }
    
    if (status) {
      filtered = filtered.filter(session => session.status === status)
    }
    
    if (workflowId) {
      filtered = filtered.filter(session => session.workflowId === workflowId)
    }
    
    return Response.json({
      data: filtered.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()),
      message: 'Onboarding sessions retrieved successfully'
    })
  }),

  // Get session by ID
  http.get('/api/onboarding/sessions/:id', async ({ params }) => {
    await delay(Math.random() * 200 + 50)
    
    const session = sessions.find(s => s.id === params.id)
    
    if (!session) {
      return new Response('Onboarding session not found', { status: 404 })
    }
    
    return Response.json({
      data: session,
      message: 'Onboarding session retrieved successfully'
    })
  }),

  // Create session
  http.post('/api/onboarding/sessions', async ({ request }) => {
    await delay(Math.random() * 400 + 100)
    
    const data = await request.json() as Partial<OnboardingSession>
    
    const newSession: OnboardingSession = {
      id: `session-${sessions.length + 1}`,
      employeeId: data.employeeId!,
      workflowId: data.workflowId!,
      buddyId: data.buddyId,
      managerId: data.managerId,
      startDate: data.startDate || new Date().toISOString(),
      expectedEndDate: data.expectedEndDate!,
      actualEndDate: data.actualEndDate,
      status: 'in_progress',
      progress: 0,
      taskProgress: [],
      feedback: [],
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    sessions.push(newSession)
    
    return Response.json({
      data: newSession,
      message: 'Onboarding session created successfully'
    })
  }),

  // Update session
  http.put('/api/onboarding/sessions/:id', async ({ params, request }) => {
    await delay(Math.random() * 400 + 100)
    
    const data = await request.json() as Partial<OnboardingSession>
    const sessionIndex = sessions.findIndex(s => s.id === params.id)
    
    if (sessionIndex === -1) {
      return new Response('Onboarding session not found', { status: 404 })
    }
    
    const updatedSession = {
      ...sessions[sessionIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    
    if (data.status === 'completed' && !updatedSession.actualEndDate) {
      updatedSession.actualEndDate = new Date().toISOString()
    }
    
    sessions[sessionIndex] = updatedSession
    
    return Response.json({
      data: updatedSession,
      message: 'Onboarding session updated successfully'
    })
  }),

  // Update task progress in session
  http.put('/api/onboarding/sessions/:id/tasks/:taskId', async ({ params, request }) => {
    await delay(Math.random() * 300 + 100)
    
    const { status, notes, completedAt } = await request.json() as {
      status: 'not_started' | 'in_progress' | 'completed' | 'skipped'
      notes?: string
      completedAt?: string
    }
    
    const sessionIndex = sessions.findIndex(s => s.id === params.id)
    
    if (sessionIndex === -1) {
      return new Response('Onboarding session not found', { status: 404 })
    }
    
    const session = sessions[sessionIndex]
    const taskProgressIndex = session.taskProgress.findIndex(tp => tp.taskId === params.taskId)
    
    if (taskProgressIndex === -1) {
      // Create new task progress
      session.taskProgress.push({
        taskId: params.taskId!,
        status,
        startedAt: new Date().toISOString(),
        completedAt: status === 'completed' ? (completedAt || new Date().toISOString()) : undefined,
        notes: notes || '',
      })
    } else {
      // Update existing task progress
      session.taskProgress[taskProgressIndex] = {
        ...session.taskProgress[taskProgressIndex],
        status,
        completedAt: status === 'completed' ? (completedAt || new Date().toISOString()) : undefined,
        notes: notes || session.taskProgress[taskProgressIndex].notes,
      }
    }
    
    // Update overall progress
    const completedTasks = session.taskProgress.filter(tp => tp.status === 'completed').length
    const totalTasks = session.taskProgress.length
    session.progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
    
    session.updatedAt = new Date().toISOString()
    
    sessions[sessionIndex] = session
    
    return Response.json({
      data: session,
      message: 'Task progress updated successfully'
    })
  }),

  // Add feedback to session
  http.post('/api/onboarding/sessions/:id/feedback', async ({ params, request }) => {
    await delay(Math.random() * 300 + 100)
    
    const feedbackData = await request.json() as {
      providerId: string
      type: 'buddy' | 'manager' | 'hr' | 'self'
      rating: number
      comments: string
    }
    
    const sessionIndex = sessions.findIndex(s => s.id === params.id)
    
    if (sessionIndex === -1) {
      return new Response('Onboarding session not found', { status: 404 })
    }
    
    const feedback = {
      id: `feedback-${Date.now()}`,
      ...feedbackData,
      providedAt: new Date().toISOString(),
    }
    
    sessions[sessionIndex].feedback.push(feedback)
    sessions[sessionIndex].updatedAt = new Date().toISOString()
    
    return Response.json({
      data: feedback,
      message: 'Feedback added successfully'
    })
  }),

  // Get onboarding checklists
  http.get('/api/onboarding/checklists', async ({ request }) => {
    await delay(Math.random() * 300 + 100)
    
    const url = new URL(request.url)
    const departmentId = url.searchParams.get('departmentId')
    
    let filtered = [...checklists]
    
    if (departmentId) {
      filtered = filtered.filter(checklist => checklist.departmentId === departmentId)
    }
    
    return Response.json({
      data: filtered,
      message: 'Onboarding checklists retrieved successfully'
    })
  }),

  // Get checklist by ID
  http.get('/api/onboarding/checklists/:id', async ({ params }) => {
    await delay(Math.random() * 200 + 50)
    
    const checklist = checklists.find(c => c.id === params.id)
    
    if (!checklist) {
      return new Response('Onboarding checklist not found', { status: 404 })
    }
    
    return Response.json({
      data: checklist,
      message: 'Onboarding checklist retrieved successfully'
    })
  }),

  // Get onboarding analytics
  http.get('/api/onboarding/analytics', async ({ request }) => {
    await delay(Math.random() * 400 + 100)
    
    const url = new URL(request.url)
    const departmentId = url.searchParams.get('departmentId')
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')
    
    let filteredSessions = [...sessions]
    
    if (departmentId) {
      filteredSessions = filteredSessions.filter(session => {
        const workflow = workflows.find(w => w.id === session.workflowId)
        return workflow?.departmentId === departmentId
      })
    }
    
    if (startDate) {
      filteredSessions = filteredSessions.filter(session => session.startDate >= startDate)
    }
    
    if (endDate) {
      filteredSessions = filteredSessions.filter(session => session.startDate <= endDate)
    }
    
    const analytics = {
      totalSessions: filteredSessions.length,
      completedSessions: filteredSessions.filter(s => s.status === 'completed').length,
      inProgressSessions: filteredSessions.filter(s => s.status === 'in_progress').length,
      averageCompletionTime: calculateAverageCompletionTime(filteredSessions),
      completionRate: filteredSessions.length > 0 
        ? (filteredSessions.filter(s => s.status === 'completed').length / filteredSessions.length) * 100 
        : 0,
      averageProgress: filteredSessions.length > 0 
        ? filteredSessions.reduce((sum, s) => sum + s.progress, 0) / filteredSessions.length 
        : 0,
      feedbackStats: calculateFeedbackStats(filteredSessions),
      commonDelays: identifyCommonDelays(filteredSessions),
      departmentPerformance: calculateDepartmentPerformance(filteredSessions, workflows),
    }
    
    return Response.json({
      data: analytics,
      message: 'Onboarding analytics retrieved successfully'
    })
  }),
]

// Helper functions for analytics
function calculateAverageCompletionTime(sessions: OnboardingSession[]): number {
  const completedSessions = sessions.filter(s => s.status === 'completed' && s.actualEndDate)
  
  if (completedSessions.length === 0) return 0
  
  const totalDays = completedSessions.reduce((sum, session) => {
    const start = new Date(session.startDate)
    const end = new Date(session.actualEndDate!)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return sum + days
  }, 0)
  
  return totalDays / completedSessions.length
}

function calculateFeedbackStats(sessions: OnboardingSession[]) {
  const allFeedback = sessions.flatMap(s => s.feedback)
  
  if (allFeedback.length === 0) {
    return { averageRating: 0, totalFeedback: 0, byType: {} }
  }
  
  const averageRating = allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length
  const byType = allFeedback.reduce((acc, f) => {
    acc[f.type] = (acc[f.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  return {
    averageRating,
    totalFeedback: allFeedback.length,
    byType,
  }
}

function identifyCommonDelays(sessions: OnboardingSession[]): Array<{ task: string; averageDelay: number }> {
  // This would analyze task completion times vs expected times
  // For now, return mock data
  return [
    { task: 'IT Setup', averageDelay: 2.5 },
    { task: 'Badge Creation', averageDelay: 1.8 },
    { task: 'Manager Meeting', averageDelay: 3.2 },
  ]
}

function calculateDepartmentPerformance(sessions: OnboardingSession[], workflows: OnboardingWorkflow[]) {
  const departmentStats = workflows.reduce((acc, workflow) => {
    const workflowSessions = sessions.filter(s => s.workflowId === workflow.id)
    const completed = workflowSessions.filter(s => s.status === 'completed').length
    
    acc[workflow.departmentId] = {
      total: workflowSessions.length,
      completed,
      completionRate: workflowSessions.length > 0 ? (completed / workflowSessions.length) * 100 : 0,
      averageProgress: workflowSessions.length > 0 
        ? workflowSessions.reduce((sum, s) => sum + s.progress, 0) / workflowSessions.length 
        : 0,
    }
    
    return acc
  }, {} as Record<string, any>)
  
  return departmentStats
}