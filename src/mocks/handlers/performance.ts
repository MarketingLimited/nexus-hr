import { http, delay } from 'msw'
import { 
  generateGoals, 
  generatePerformanceReviews, 
  generateFeedback, 
  generatePerformanceMetrics,
  Goal,
  PerformanceReview,
  Feedback,
  PerformanceMetric
} from '../data/performance'
import { mockEmployees } from '../data/employees'

// Generate mock data
const employeeIds = mockEmployees.map(emp => emp.id)
const goals = generateGoals(employeeIds, 100)
const performanceReviews = generatePerformanceReviews(employeeIds, 50)
const feedback = generateFeedback(employeeIds, 200)
const performanceMetrics = generatePerformanceMetrics(employeeIds)

export const performanceHandlers = [
  // Get goals
  http.get('/api/performance/goals', async ({ request }) => {
    await delay(Math.random() * 300 + 100)
    
    const url = new URL(request.url)
    const employeeId = url.searchParams.get('employeeId')
    const status = url.searchParams.get('status')
    const category = url.searchParams.get('category')
    const priority = url.searchParams.get('priority')
    
    let filtered = [...goals]
    
    if (employeeId) {
      filtered = filtered.filter(goal => goal.employeeId === employeeId)
    }
    
    if (status) {
      filtered = filtered.filter(goal => goal.status === status)
    }
    
    if (category) {
      filtered = filtered.filter(goal => goal.category === category)
    }
    
    if (priority) {
      filtered = filtered.filter(goal => goal.priority === priority)
    }
    
    return Response.json({
      data: filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      message: 'Goals retrieved successfully'
    })
  }),

  // Get goal by ID
  http.get('/api/performance/goals/:id', async ({ params }) => {
    await delay(Math.random() * 200 + 50)
    
    const goal = goals.find(g => g.id === params.id)
    
    if (!goal) {
      return new Response('Goal not found', { status: 404 })
    }
    
    return Response.json({
      data: goal,
      message: 'Goal retrieved successfully'
    })
  }),

  // Create goal
  http.post('/api/performance/goals', async ({ request }) => {
    await delay(Math.random() * 400 + 100)
    
    const data = await request.json() as Partial<Goal>
    
    const newGoal: Goal = {
      id: `goal-${goals.length + 1}`,
      employeeId: data.employeeId!,
      title: data.title!,
      description: data.description || '',
      category: data.category || 'performance',
      priority: data.priority || 'medium',
      targetDate: data.targetDate!,
      status: 'not-started',
      progress: 0,
      metrics: data.metrics || [],
      createdBy: data.createdBy!,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    goals.push(newGoal)
    
    return Response.json(
      { data: newGoal, message: 'Goal created successfully' },
      { status: 201 }
    )
  }),

  // Update goal
  http.put('/api/performance/goals/:id', async ({ params, request }) => {
    await delay(Math.random() * 400 + 100)
    
    const data = await request.json() as Partial<Goal>
    const goalIndex = goals.findIndex(g => g.id === params.id)
    
    if (goalIndex === -1) {
      return new Response('Goal not found', { status: 404 })
    }
    
    const updatedGoal = {
      ...goals[goalIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    
    goals[goalIndex] = updatedGoal
    
    return Response.json({
      data: updatedGoal,
      message: 'Goal updated successfully'
    })
  }),

  // Delete goal
  http.delete('/api/performance/goals/:id', async ({ params }) => {
    await delay(Math.random() * 300 + 100)
    
    const goalIndex = goals.findIndex(g => g.id === params.id)
    
    if (goalIndex === -1) {
      return new Response('Goal not found', { status: 404 })
    }
    
    goals.splice(goalIndex, 1)
    
    return Response.json({
      message: 'Goal deleted successfully'
    })
  }),

  // Get performance reviews
  http.get('/api/performance/reviews', async ({ request }) => {
    await delay(Math.random() * 300 + 100)
    
    const url = new URL(request.url)
    const employeeId = url.searchParams.get('employeeId')
    const reviewerId = url.searchParams.get('reviewerId')
    const status = url.searchParams.get('status')
    const period = url.searchParams.get('period')
    const type = url.searchParams.get('type')
    
    let filtered = [...performanceReviews]
    
    if (employeeId) {
      filtered = filtered.filter(review => review.employeeId === employeeId)
    }
    
    if (reviewerId) {
      filtered = filtered.filter(review => review.reviewerId === reviewerId)
    }
    
    if (status) {
      filtered = filtered.filter(review => review.status === status)
    }
    
    if (period) {
      filtered = filtered.filter(review => review.period === period)
    }
    
    if (type) {
      filtered = filtered.filter(review => review.type === type)
    }
    
    return Response.json({
      data: filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      message: 'Performance reviews retrieved successfully'
    })
  }),

  // Get performance review by ID
  http.get('/api/performance/reviews/:id', async ({ params }) => {
    await delay(Math.random() * 200 + 50)
    
    const review = performanceReviews.find(r => r.id === params.id)
    
    if (!review) {
      return new Response('Performance review not found', { status: 404 })
    }
    
    return Response.json({
      data: review,
      message: 'Performance review retrieved successfully'
    })
  }),

  // Create performance review
  http.post('/api/performance/reviews', async ({ request }) => {
    await delay(Math.random() * 400 + 100)
    
    const data = await request.json() as Partial<PerformanceReview>
    
    const newReview: PerformanceReview = {
      id: `review-${performanceReviews.length + 1}`,
      employeeId: data.employeeId!,
      reviewerId: data.reviewerId!,
      period: data.period!,
      type: data.type || 'annual',
      status: 'draft',
      overallRating: data.overallRating || 0,
      competencies: data.competencies || [],
      goals: data.goals || [],
      feedback: data.feedback || {
        strengths: [],
        improvements: [],
        developmentPlan: ''
      },
      selfAssessment: data.selfAssessment || null,
      reviewDate: data.reviewDate!,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    performanceReviews.push(newReview)
    
    return Response.json(
      { data: newReview, message: 'Performance review created successfully' },
      { status: 201 }
    )
  }),

  // Update performance review
  http.put('/api/performance/reviews/:id', async ({ params, request }) => {
    await delay(Math.random() * 400 + 100)
    
    const data = await request.json() as Partial<PerformanceReview>
    const reviewIndex = performanceReviews.findIndex(r => r.id === params.id)
    
    if (reviewIndex === -1) {
      return new Response('Performance review not found', { status: 404 })
    }
    
    const updatedReview = {
      ...performanceReviews[reviewIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    
    performanceReviews[reviewIndex] = updatedReview
    
    return Response.json({
      data: updatedReview,
      message: 'Performance review updated successfully'
    })
  }),

  // Submit performance review
  http.put('/api/performance/reviews/:id/submit', async ({ params, request }) => {
    await delay(Math.random() * 400 + 100)

    const reviewIndex = performanceReviews.findIndex(r => r.id === params.id)
    
    if (reviewIndex === -1) {
      return new Response('Performance review not found', { status: 404 })
    }
    
    const submission = await request.json() as Partial<PerformanceReview>

    const updatedReview = {
      ...performanceReviews[reviewIndex],
      ...submission,
      status: 'submitted' as const,
      updatedAt: new Date().toISOString(),
    }
    
    performanceReviews[reviewIndex] = updatedReview
    
    return Response.json({
      data: updatedReview,
      message: 'Performance review submitted successfully'
    })
  }),

  // Delete performance review
  http.delete('/api/performance/reviews/:id', async ({ params }) => {
    await delay(Math.random() * 300 + 100)
    
    const reviewIndex = performanceReviews.findIndex(r => r.id === params.id)
    
    if (reviewIndex === -1) {
      return new Response('Performance review not found', { status: 404 })
    }
    
    performanceReviews.splice(reviewIndex, 1)
    
    return Response.json({
      message: 'Performance review deleted successfully'
    })
  }),

  // Get feedback
  http.get('/api/performance/feedback', async ({ request }) => {
    await delay(Math.random() * 300 + 100)
    
    const url = new URL(request.url)
    const fromEmployeeId = url.searchParams.get('fromEmployeeId')
    const toEmployeeId = url.searchParams.get('toEmployeeId')
    const type = url.searchParams.get('type')
    const category = url.searchParams.get('category')
    const status = url.searchParams.get('status')
    
    let filtered = [...feedback]
    
    if (fromEmployeeId) {
      filtered = filtered.filter(f => f.fromEmployeeId === fromEmployeeId)
    }
    
    if (toEmployeeId) {
      filtered = filtered.filter(f => f.toEmployeeId === toEmployeeId)
    }
    
    if (type) {
      filtered = filtered.filter(f => f.type === type)
    }
    
    if (category) {
      filtered = filtered.filter(f => f.category === category)
    }
    
    if (status) {
      filtered = filtered.filter(f => f.status === status)
    }
    
    return Response.json({
      data: filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      message: 'Feedback retrieved successfully'
    })
  }),

  // Get feedback by ID
  http.get('/api/performance/feedback/:id', async ({ params }) => {
    await delay(Math.random() * 200 + 50)
    
    const feedbackItem = feedback.find(f => f.id === params.id)
    
    if (!feedbackItem) {
      return new Response('Feedback not found', { status: 404 })
    }
    
    return Response.json({
      data: feedbackItem,
      message: 'Feedback retrieved successfully'
    })
  }),

  // Create feedback
  http.post('/api/performance/feedback', async ({ request }) => {
    await delay(Math.random() * 400 + 100)
    
    const data = await request.json() as Partial<Feedback>
    
    const newFeedback: Feedback = {
      id: `feedback-${feedback.length + 1}`,
      fromEmployeeId: data.fromEmployeeId!,
      toEmployeeId: data.toEmployeeId!,
      type: data.type || 'peer',
      category: data.category || 'performance',
      rating: data.rating || 3,
      comments: data.comments || '',
      anonymous: data.anonymous !== undefined ? data.anonymous : false,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    feedback.push(newFeedback)

    return Response.json(
      { data: newFeedback, message: 'Feedback created successfully' },
      { status: 201 }
    )
  }),

  // Update feedback
  http.put('/api/performance/feedback/:id', async ({ params, request }) => {
    await delay(Math.random() * 400 + 100)
    
    const data = await request.json() as Partial<Feedback>
    const feedbackIndex = feedback.findIndex(f => f.id === params.id)
    
    if (feedbackIndex === -1) {
      return new Response('Feedback not found', { status: 404 })
    }
    
    const updatedFeedback = {
      ...feedback[feedbackIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    
    feedback[feedbackIndex] = updatedFeedback
    
    return Response.json({
      data: updatedFeedback,
      message: 'Feedback updated successfully'
    })
  }),

  // Submit feedback
  http.put('/api/performance/feedback/:id/submit', async ({ params }) => {
    await delay(Math.random() * 400 + 100)
    
    const feedbackIndex = feedback.findIndex(f => f.id === params.id)
    
    if (feedbackIndex === -1) {
      return new Response('Feedback not found', { status: 404 })
    }
    
    const updatedFeedback = {
      ...feedback[feedbackIndex],
      status: 'submitted' as const,
      updatedAt: new Date().toISOString(),
    }
    
    feedback[feedbackIndex] = updatedFeedback
    
    return Response.json({
      data: updatedFeedback,
      message: 'Feedback submitted successfully'
    })
  }),

  // Delete feedback
  http.delete('/api/performance/feedback/:id', async ({ params }) => {
    await delay(Math.random() * 300 + 100)
    
    const feedbackIndex = feedback.findIndex(f => f.id === params.id)
    
    if (feedbackIndex === -1) {
      return new Response('Feedback not found', { status: 404 })
    }
    
    feedback.splice(feedbackIndex, 1)
    
    return Response.json({
      message: 'Feedback deleted successfully'
    })
  }),

  // Get performance metrics
  http.get('/api/performance/metrics', async ({ request }) => {
    await delay(Math.random() * 300 + 100)
    
    const url = new URL(request.url)
    const employeeId = url.searchParams.get('employeeId')
    const period = url.searchParams.get('period')
    
    let filtered = [...performanceMetrics]
    
    if (employeeId) {
      filtered = filtered.filter(metric => metric.employeeId === employeeId)
    }
    
    if (period) {
      filtered = filtered.filter(metric => metric.period === period)
    }
    
    return Response.json({
      data: filtered.sort((a, b) => new Date(b.period).getTime() - new Date(a.period).getTime()),
      message: 'Performance metrics retrieved successfully'
    })
  }),

  // Get performance metrics by ID
  http.get('/api/performance/metrics/:id', async ({ params }) => {
    await delay(Math.random() * 200 + 50)
    
    const metric = performanceMetrics.find(m => m.id === params.id)
    
    if (!metric) {
      return new Response('Performance metric not found', { status: 404 })
    }
    
    return Response.json({
      data: metric,
      message: 'Performance metric retrieved successfully'
    })
  }),

  // Get performance analytics
  http.get('/api/performance/analytics', async ({ request }) => {
    await delay(Math.random() * 400 + 200)
    
    const url = new URL(request.url)
    const employeeId = url.searchParams.get('employeeId')
    const departmentId = url.searchParams.get('departmentId')
    const period = url.searchParams.get('period')
    
    let filteredGoals = [...goals]
    let filteredReviews = [...performanceReviews]
    let filteredFeedback = [...feedback]
    let filteredMetrics = [...performanceMetrics]
    
    if (employeeId) {
      filteredGoals = filteredGoals.filter(g => g.employeeId === employeeId)
      filteredReviews = filteredReviews.filter(r => r.employeeId === employeeId)
      filteredFeedback = filteredFeedback.filter(f => f.toEmployeeId === employeeId)
      filteredMetrics = filteredMetrics.filter(m => m.employeeId === employeeId)
    }
    
    // Calculate analytics
    const analytics = {
      goalStats: {
        total: filteredGoals.length,
        completed: filteredGoals.filter(g => g.status === 'completed').length,
        inProgress: filteredGoals.filter(g => g.status === 'in_progress').length,
        overdue: filteredGoals.filter(g => g.status === 'overdue').length,
        averageProgress: filteredGoals.length > 0
          ? filteredGoals.reduce((sum, g) => sum + g.progress, 0) / filteredGoals.length
          : 0,
      },
      reviewStats: {
        total: filteredReviews.length,
        completed: filteredReviews.filter(r => r.status === 'completed').length,
        pending: filteredReviews.filter(r => r.status === 'pending').length,
        inProgress: filteredReviews.filter(r => r.status === 'in_progress').length,
        averageRating: filteredReviews.length > 0
          ? filteredReviews.reduce((sum, r) => sum + r.overallRating, 0) / filteredReviews.length
          : 0,
      },
      feedbackStats: {
        total: filteredFeedback.length,
        submitted: filteredFeedback.filter(f => f.status === 'submitted').length,
        acknowledged: filteredFeedback.filter(f => f.status === 'acknowledged').length,
        averageRating: filteredFeedback.length > 0
          ? filteredFeedback.reduce((sum, f) => sum + f.rating, 0) / filteredFeedback.length
          : 0,
      },
      averageRating: filteredReviews.length > 0
        ? filteredReviews.reduce((sum, r) => sum + r.overallRating, 0) / filteredReviews.length
        : 0,
      completionRate: filteredGoals.length > 0
        ? (filteredGoals.filter(g => g.status === 'completed').length / filteredGoals.length) * 100
        : 0
    }
    
    return Response.json({
      data: analytics,
      message: 'Performance analytics retrieved successfully'
    })
  }),
]