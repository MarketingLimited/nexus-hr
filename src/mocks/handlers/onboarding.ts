import { http, delay } from 'msw'
import { 
  generateOnboardingWorkflows, 
  generateOnboardingTasks, 
  generateOnboardingSessions,
  OnboardingWorkflow,
  OnboardingTask,
  OnboardingSession,
  OnboardingTaskProgress,
  OnboardingFeedback
} from '../data/onboarding'
import { mockEmployees } from '../data/employees'
import { mockDepartments } from '../data/departments'

// Generate mock data
const employeeIds = mockEmployees.map(emp => emp.id)
const departmentIds = mockDepartments.map(dept => dept.id)
const workflows = generateOnboardingWorkflows(departmentIds)
const tasks = generateOnboardingTasks(50)
const sessions = generateOnboardingSessions(employeeIds, workflows.map(w => w.id))

export const onboardingHandlers = [
  // Get onboarding workflows
  http.get('/api/onboarding/workflows', async ({ request }) => {
    await delay(Math.random() * 300 + 100)
    
    const url = new URL(request.url)
    const departmentId = url.searchParams.get('departmentId')
    const isActive = url.searchParams.get('isActive')
    
    let filtered = [...workflows]
    
    if (departmentId) {
      filtered = filtered.filter(workflow => workflow.departmentId === departmentId)
    }
    
    if (isActive !== null) {
      const activeStatus = isActive === 'true'
      filtered = filtered.filter(workflow => workflow.isActive === activeStatus)
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

  // Create onboarding workflow
  http.post('/api/onboarding/workflows', async ({ request }) => {
    await delay(Math.random() * 400 + 100)
    
    const data = await request.json() as Partial<OnboardingWorkflow>
    
    const newWorkflow: OnboardingWorkflow = {
      id: `workflow-${workflows.length + 1}`,
      name: data.name!,
      description: data.description || '',
      departmentId: data.departmentId!,
      duration: data.duration || 30,
      tasks: data.tasks || [],
      isActive: data.isActive !== undefined ? data.isActive : true,
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

  // Update onboarding workflow
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
      updatedAt: new Date().toISOString(),
    }
    
    workflows[workflowIndex] = updatedWorkflow
    
    return Response.json({
      data: updatedWorkflow,
      message: 'Onboarding workflow updated successfully'
    })
  }),

  // Delete onboarding workflow
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
    const workflowId = url.searchParams.get('workflowId')
    const category = url.searchParams.get('category')
    const type = url.searchParams.get('type')
    
    let filtered = [...tasks]
    
    if (category) {
      filtered = filtered.filter(task => task.category === category)
    }
    
    if (type) {
      filtered = filtered.filter(task => task.type === type)
    }
    
    return Response.json({
      data: filtered.sort((a, b) => a.dueDate - b.dueDate),
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

  // Create onboarding task
  http.post('/api/onboarding/tasks', async ({ request }) => {
    await delay(Math.random() * 400 + 100)
    
    const data = await request.json() as Partial<OnboardingTask>
    
    const newTask: OnboardingTask = {
      id: `task-${tasks.length + 1}`,
      title: data.title!,
      description: data.description || '',
      type: data.type || 'document',
      category: data.category || 'hr',
      dueDate: data.dueDate || 1,
      priority: data.priority || 'medium',
      assignedTo: data.assignedTo || 'employee',
      dependencies: data.dependencies || [],
      resources: data.resources || {
        documents: [],
        links: [],
        contacts: []
      },
      estimatedHours: data.estimatedHours || 1,
      isRequired: data.isRequired !== undefined ? data.isRequired : true,
      createdAt: new Date().toISOString(),
    }
    
    tasks.push(newTask)
    
    return Response.json({
      data: newTask,
      message: 'Onboarding task created successfully'
    })
  }),

  // Update onboarding task
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
    }
    
    tasks[taskIndex] = updatedTask
    
    return Response.json({
      data: updatedTask,
      message: 'Onboarding task updated successfully'
    })
  }),

  // Delete onboarding task
  http.delete('/api/onboarding/tasks/:id', async ({ params }) => {
    await delay(Math.random() * 300 + 100)
    
    const taskIndex = tasks.findIndex(t => t.id === params.id)
    
    if (taskIndex === -1) {
      return new Response('Onboarding task not found', { status: 404 })
    }
    
    tasks.splice(taskIndex, 1)
    
    return Response.json({
      message: 'Onboarding task deleted successfully'
    })
  }),

  // Get onboarding sessions
  http.get('/api/onboarding/sessions', async ({ request }) => {
    await delay(Math.random() * 300 + 100)
    
    const url = new URL(request.url)
    const employeeId = url.searchParams.get('employeeId')
    const workflowId = url.searchParams.get('workflowId')
    const status = url.searchParams.get('status')
    const assignedMentor = url.searchParams.get('assignedMentor')
    
    let filtered = [...sessions]
    
    if (employeeId) {
      filtered = filtered.filter(session => session.employeeId === employeeId)
    }
    
    if (workflowId) {
      filtered = filtered.filter(session => session.workflowId === workflowId)
    }
    
    if (status) {
      filtered = filtered.filter(session => session.status === status)
    }
    
    if (assignedMentor) {
      filtered = filtered.filter(session => session.assignedMentor === assignedMentor)
    }
    
    return Response.json({
      data: filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
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

  // Create onboarding session
  http.post('/api/onboarding/sessions', async ({ request }) => {
    await delay(Math.random() * 400 + 100)
    
    const data = await request.json() as Partial<OnboardingSession>
    
    const newSession: OnboardingSession = {
      id: `session-${sessions.length + 1}`,
      employeeId: data.employeeId!,
      workflowId: data.workflowId!,
      startDate: data.startDate || new Date().toISOString(),
      expectedEndDate: data.expectedEndDate!,
      actualEndDate: null,
      status: 'not_started',
      progress: 0,
      currentPhase: data.currentPhase || 'preparation',
      assignedMentor: data.assignedMentor || null,
      tasks: data.tasks || [],
      feedback: data.feedback || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    sessions.push(newSession)
    
    return Response.json({
      data: newSession,
      message: 'Onboarding session created successfully'
    })
  }),

  // Update onboarding session
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
    
    sessions[sessionIndex] = updatedSession
    
    return Response.json({
      data: updatedSession,
      message: 'Onboarding session updated successfully'
    })
  }),

  // Update task progress in session
  http.put('/api/onboarding/sessions/:id/task-progress', async ({ params, request }) => {
    await delay(Math.random() * 400 + 100)
    
    const data = await request.json() as Partial<OnboardingTaskProgress>
    const sessionIndex = sessions.findIndex(s => s.id === params.id)
    
    if (sessionIndex === -1) {
      return new Response('Onboarding session not found', { status: 404 })
    }
    
    const session = sessions[sessionIndex]
    const taskId = data.taskId
    const taskIndex = session.tasks.findIndex(t => t.taskId === taskId)
    
    if (taskIndex === -1) {
      // Add new task progress
      session.tasks.push({
        taskId: taskId!,
        status: data.status || 'in_progress',
        startedAt: new Date().toISOString(),
        completedAt: data.status === 'completed' ? new Date().toISOString() : null,
        assignedTo: data.assignedTo || session.employeeId,
        notes: data.notes || null,
        attachments: data.attachments || [],
        feedback: data.feedback || null,
        hoursSpent: data.hoursSpent || 0,
      })
    } else {
      // Update existing task progress
      const taskProgress = session.tasks[taskIndex]
      session.tasks[taskIndex] = {
        ...taskProgress,
        ...data,
        completedAt: data.status === 'completed' ? new Date().toISOString() : taskProgress.completedAt,
      }
    }
    
    // Update overall progress
    const completedTasks = session.tasks.filter(t => t.status === 'completed').length
    const totalTasks = session.tasks.length
    session.progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    
    sessions[sessionIndex] = {
      ...session,
      updatedAt: new Date().toISOString(),
    }
    
    return Response.json({
      data: sessions[sessionIndex],
      message: 'Task progress updated successfully'
    })
  }),

  // Add feedback to session
  http.post('/api/onboarding/sessions/:id/feedback', async ({ params, request }) => {
    await delay(Math.random() * 400 + 100)
    
    const data = await request.json() as Partial<OnboardingFeedback>
    const sessionIndex = sessions.findIndex(s => s.id === params.id)
    
    if (sessionIndex === -1) {
      return new Response('Onboarding session not found', { status: 404 })
    }
    
    const session = sessions[sessionIndex]
    
    const newFeedback: OnboardingFeedback = {
      id: `feedback-${Date.now()}`,
      sessionId: params.id as string,
      type: data.type || 'weekly',
      rating: data.rating || 5,
      comments: data.comments || '',
      submittedBy: data.submittedBy!,
      submittedAt: new Date().toISOString(),
      areas: data.areas || {
        clarity: 5,
        support: 5,
        resources: 5,
        timeline: 5,
        overall: 5
      }
    }
    
    session.feedback.push(newFeedback)
    
    sessions[sessionIndex] = {
      ...session,
      updatedAt: new Date().toISOString(),
    }
    
    return Response.json({
      data: newFeedback,
      message: 'Feedback added successfully'
    })
  }),

  // Complete onboarding session
  http.put('/api/onboarding/sessions/:id/complete', async ({ params }) => {
    await delay(Math.random() * 400 + 100)
    
    const sessionIndex = sessions.findIndex(s => s.id === params.id)
    
    if (sessionIndex === -1) {
      return new Response('Onboarding session not found', { status: 404 })
    }
    
    const updatedSession = {
      ...sessions[sessionIndex],
      status: 'completed' as const,
      actualEndDate: new Date().toISOString(),
      progress: 100,
      updatedAt: new Date().toISOString(),
    }
    
    sessions[sessionIndex] = updatedSession
    
    return Response.json({
      data: updatedSession,
      message: 'Onboarding session completed successfully'
    })
  }),

  // Get onboarding analytics
  http.get('/api/onboarding/analytics', async ({ request }) => {
    await delay(Math.random() * 400 + 200)
    
    const url = new URL(request.url)
    const departmentId = url.searchParams.get('departmentId')
    const period = url.searchParams.get('period')
    
    let filteredSessions = [...sessions]
    
    if (departmentId) {
      // Filter by department through workflow
      const departmentWorkflows = workflows.filter(w => w.departmentId === departmentId).map(w => w.id)
      filteredSessions = filteredSessions.filter(s => departmentWorkflows.includes(s.workflowId))
    }
    
    // Calculate analytics
    const analytics = {
      sessions: {
        total: filteredSessions.length,
        completed: filteredSessions.filter(s => s.status === 'completed').length,
        inProgress: filteredSessions.filter(s => s.status === 'in_progress').length,
        notStarted: filteredSessions.filter(s => s.status === 'not_started').length,
        onHold: filteredSessions.filter(s => s.status === 'on_hold').length,
        cancelled: filteredSessions.filter(s => s.status === 'cancelled').length,
        averageProgress: filteredSessions.length > 0 
          ? filteredSessions.reduce((sum, s) => sum + s.progress, 0) / filteredSessions.length 
          : 0,
      },
      workflows: {
        total: workflows.length,
        active: workflows.filter(w => w.isActive).length,
        inactive: workflows.filter(w => !w.isActive).length,
        averageDuration: workflows.length > 0 
          ? workflows.reduce((sum, w) => sum + w.duration, 0) / workflows.length 
          : 0,
      },
      tasks: {
        total: tasks.length,
        required: tasks.filter(t => t.isRequired).length,
        optional: tasks.filter(t => !t.isRequired).length,
        averageHours: tasks.length > 0 
          ? tasks.reduce((sum, t) => sum + t.estimatedHours, 0) / tasks.length 
          : 0,
      },
      completion: {
        rate: filteredSessions.length > 0 
          ? (filteredSessions.filter(s => s.status === 'completed').length / filteredSessions.length) * 100 
          : 0,
        averageTime: filteredSessions.filter(s => s.actualEndDate).length > 0 
          ? filteredSessions
              .filter(s => s.actualEndDate)
              .reduce((sum, s) => {
                const days = Math.ceil((new Date(s.actualEndDate!).getTime() - new Date(s.startDate).getTime()) / (1000 * 60 * 60 * 24))
                return sum + days
              }, 0) / filteredSessions.filter(s => s.actualEndDate).length
          : 0,
      }
    }
    
    return Response.json({
      data: analytics,
      message: 'Onboarding analytics retrieved successfully'
    })
  }),
]