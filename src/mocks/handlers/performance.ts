import { http, HttpResponse } from 'msw'
import { 
  generatePerformanceReviews,
  generateGoals,
  generateFeedback,
  PerformanceReview,
  Goal,
  Feedback
} from '../data/performance'
import { mockEmployees } from '../data/employees'

let performanceReviews = generatePerformanceReviews(mockEmployees.map(emp => emp.id))
let goals = generateGoals(mockEmployees.map(emp => emp.id))
let feedback = generateFeedback(mockEmployees.map(emp => emp.id))

export const performanceHandlers = [
  // Performance Reviews
  http.get('/api/performance/reviews', ({ request }) => {
    const url = new URL(request.url)
    const employeeId = url.searchParams.get('employeeId')
    const reviewerId = url.searchParams.get('reviewerId')
    const year = url.searchParams.get('year')
    const quarter = url.searchParams.get('quarter')
    const status = url.searchParams.get('status')

    let filteredReviews = performanceReviews

    if (employeeId) {
      filteredReviews = filteredReviews.filter(review => review.employeeId === employeeId)
    }

    if (reviewerId) {
      filteredReviews = filteredReviews.filter(review => review.reviewerId === reviewerId)
    }

    if (year) {
      filteredReviews = filteredReviews.filter(review => review.year === parseInt(year))
    }

    if (quarter) {
      filteredReviews = filteredReviews.filter(review => review.quarter === quarter)
    }

    if (status) {
      filteredReviews = filteredReviews.filter(review => review.status === status)
    }

    return HttpResponse.json({ data: filteredReviews })
  }),

  http.get('/api/performance/reviews/:id', ({ params }) => {
    const review = performanceReviews.find(r => r.id === params.id)
    if (!review) {
      return HttpResponse.json({ error: 'Performance review not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: review })
  }),

  http.post('/api/performance/reviews', async ({ request }) => {
    const newReviewData = await request.json() as Partial<PerformanceReview>
    const newReview: PerformanceReview = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...newReviewData
    } as PerformanceReview

    performanceReviews.push(newReview)
    return HttpResponse.json({ data: newReview }, { status: 201 })
  }),

  http.put('/api/performance/reviews/:id', async ({ params, request }) => {
    const reviewIndex = performanceReviews.findIndex(r => r.id === params.id)
    if (reviewIndex === -1) {
      return HttpResponse.json({ error: 'Performance review not found' }, { status: 404 })
    }

    const updates = await request.json() as Partial<PerformanceReview>
    performanceReviews[reviewIndex] = {
      ...performanceReviews[reviewIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    return HttpResponse.json({ data: performanceReviews[reviewIndex] })
  }),

  // Goals
  http.get('/api/performance/goals', ({ request }) => {
    const url = new URL(request.url)
    const employeeId = url.searchParams.get('employeeId')
    const status = url.searchParams.get('status')
    const year = url.searchParams.get('year')

    let filteredGoals = goals

    if (employeeId) {
      filteredGoals = filteredGoals.filter(goal => goal.employeeId === employeeId)
    }

    if (status) {
      filteredGoals = filteredGoals.filter(goal => goal.status === status)
    }

    if (year) {
      filteredGoals = filteredGoals.filter(goal => 
        new Date(goal.targetDate).getFullYear() === parseInt(year)
      )
    }

    return HttpResponse.json({ data: filteredGoals })
  }),

  http.get('/api/performance/goals/:id', ({ params }) => {
    const goal = goals.find(g => g.id === params.id)
    if (!goal) {
      return HttpResponse.json({ error: 'Goal not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: goal })
  }),

  http.post('/api/performance/goals', async ({ request }) => {
    const newGoalData = await request.json() as Partial<Goal>
    const newGoal: Goal = {
      id: crypto.randomUUID(),
      progress: 0,
      status: 'in_progress',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...newGoalData
    } as Goal

    goals.push(newGoal)
    return HttpResponse.json({ data: newGoal }, { status: 201 })
  }),

  http.put('/api/performance/goals/:id', async ({ params, request }) => {
    const goalIndex = goals.findIndex(g => g.id === params.id)
    if (goalIndex === -1) {
      return HttpResponse.json({ error: 'Goal not found' }, { status: 404 })
    }

    const updates = await request.json() as Partial<Goal>
    goals[goalIndex] = {
      ...goals[goalIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    return HttpResponse.json({ data: goals[goalIndex] })
  }),

  // Feedback
  http.get('/api/performance/feedback', ({ request }) => {
    const url = new URL(request.url)
    const employeeId = url.searchParams.get('employeeId')
    const giverId = url.searchParams.get('giverId')
    const type = url.searchParams.get('type')

    let filteredFeedback = feedback

    if (employeeId) {
      filteredFeedback = filteredFeedback.filter(f => f.employeeId === employeeId)
    }

    if (giverId) {
      filteredFeedback = filteredFeedback.filter(f => f.giverId === giverId)
    }

    if (type) {
      filteredFeedback = filteredFeedback.filter(f => f.type === type)
    }

    return HttpResponse.json({ data: filteredFeedback })
  }),

  http.post('/api/performance/feedback', async ({ request }) => {
    const newFeedbackData = await request.json() as Partial<Feedback>
    const newFeedback: Feedback = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...newFeedbackData
    } as Feedback

    feedback.push(newFeedback)
    return HttpResponse.json({ data: newFeedback }, { status: 201 })
  }),

  // Performance Analytics
  http.get('/api/performance/analytics', ({ request }) => {
    const url = new URL(request.url)
    const year = parseInt(url.searchParams.get('year') || new Date().getFullYear().toString())
    const employeeId = url.searchParams.get('employeeId')

    let filteredReviews = performanceReviews.filter(r => r.year === year)
    let filteredGoals = goals.filter(g => new Date(g.targetDate).getFullYear() === year)

    if (employeeId) {
      filteredReviews = filteredReviews.filter(r => r.employeeId === employeeId)
      filteredGoals = filteredGoals.filter(g => g.employeeId === employeeId)
    }

    const analytics = {
      reviewCompletion: {
        completed: filteredReviews.filter(r => r.status === 'completed').length,
        pending: filteredReviews.filter(r => r.status === 'pending').length,
        inProgress: filteredReviews.filter(r => r.status === 'in_progress').length,
        total: filteredReviews.length,
        completionRate: filteredReviews.length > 0 
          ? (filteredReviews.filter(r => r.status === 'completed').length / filteredReviews.length) * 100 
          : 0
      },
      goalProgress: {
        completed: filteredGoals.filter(g => g.status === 'completed').length,
        inProgress: filteredGoals.filter(g => g.status === 'in_progress').length,
        notStarted: filteredGoals.filter(g => g.status === 'not_started').length,
        overdue: filteredGoals.filter(g => g.status === 'overdue').length,
        total: filteredGoals.length,
        averageProgress: filteredGoals.length > 0 
          ? filteredGoals.reduce((sum, g) => sum + g.progress, 0) / filteredGoals.length 
          : 0
      },
      averageRatings: {
        overall: filteredReviews.length > 0 
          ? filteredReviews.reduce((sum, r) => sum + r.overallRating, 0) / filteredReviews.length 
          : 0,
        technical: filteredReviews.length > 0 
          ? filteredReviews.reduce((sum, r) => sum + r.technicalSkills, 0) / filteredReviews.length 
          : 0,
        communication: filteredReviews.length > 0 
          ? filteredReviews.reduce((sum, r) => sum + r.communicationSkills, 0) / filteredReviews.length 
          : 0,
        leadership: filteredReviews.length > 0 
          ? filteredReviews.reduce((sum, r) => sum + r.leadershipSkills, 0) / filteredReviews.length 
          : 0
      }
    }

    return HttpResponse.json({ data: analytics })
  }),

  // Performance Metrics
  http.get('/api/performance/metrics', ({ request }) => {
    const url = new URL(request.url)
    const employeeId = url.searchParams.get('employeeId')
    const department = url.searchParams.get('department')

    let filteredMetrics = performanceMetrics

    if (employeeId) {
      filteredMetrics = filteredMetrics.filter(m => m.employeeId === employeeId)
    }

    if (department) {
      filteredMetrics = filteredMetrics.filter(m => m.department === department)
    }

    return HttpResponse.json({ data: filteredMetrics })
  })
]