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
const feedback = generateFeedback(employeeIds, 150)
const performanceMetrics = generatePerformanceMetrics(employeeIds)

export const performanceHandlers = [
  // Get goals
  http.get('/api/performance/goals', async ({ request }) => {
    await delay(Math.random() * 300 + 100)
    
    const url = new URL(request.url)
    const employeeId = url.searchParams.get('employeeId')
    const status = url.searchParams.get('status')
    const category = url.searchParams.get('category')
    
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
      status: 'not_started',
      progress: 0,
      measurableMetrics: data.measurableMetrics || {},
      keyResults: data.keyResults || [],
      milestones: data.milestones || [],
      assignedBy: data.assignedBy!,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    goals.push(newGoal)
    
    return Response.json({
      data: newGoal,
      message: 'Goal created successfully'
    })
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
      filtered = filtered.filter(review => review.reviewPeriod === period)
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
      reviewPeriod: data.reviewPeriod || 'annual',
      startDate: data.startDate!,
      endDate: data.endDate!,
      status: 'draft',
      overallRating: data.overallRating || 3,
      ratings: data.ratings || {},
      strengths: data.strengths || [],
      areasForImprovement: data.areasForImprovement || [],
      achievements: data.achievements || [],
      goals: data.goals || [],
      developmentPlan: data.developmentPlan || [],
      comments: data.comments || '',
      employeeComments: data.employeeComments,
      submittedAt: data.submittedAt,
      acknowledgedAt: data.acknowledgedAt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    performanceReviews.push(newReview)
    
    return Response.json({
      data: newReview,
      message: 'Performance review created successfully'
    })
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
    
    if (data.status === 'submitted' && !updatedReview.submittedAt) {
      updatedReview.submittedAt = new Date().toISOString()
    }
    
    performanceReviews[reviewIndex] = updatedReview
    
    return Response.json({
      data: updatedReview,
      message: 'Performance review updated successfully'
    })
  }),

  // Get feedback
  http.get('/api/performance/feedback', async ({ request }) => {
    await delay(Math.random() * 300 + 100)
    
    const url = new URL(request.url)
    const recipientId = url.searchParams.get('recipientId')
    const providerId = url.searchParams.get('providerId')
    const type = url.searchParams.get('type')
    
    let filtered = [...feedback]
    
    if (recipientId) {
      filtered = filtered.filter(fb => fb.recipientId === recipientId)
    }
    
    if (providerId) {
      filtered = filtered.filter(fb => fb.providerId === providerId)
    }
    
    if (type) {
      filtered = filtered.filter(fb => fb.type === type)
    }
    
    return Response.json({
      data: filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      message: 'Feedback retrieved successfully'
    })
  }),

  // Create feedback
  http.post('/api/performance/feedback', async ({ request }) => {
    await delay(Math.random() * 400 + 100)
    
    const data = await request.json() as Partial<Feedback>
    
    const newFeedback: Feedback = {
      id: `feedback-${feedback.length + 1}`,
      recipientId: data.recipientId!,
      providerId: data.providerId!,
      type: data.type || 'general',
      category: data.category || 'performance',
      subject: data.subject || '',
      message: data.message!,
      rating: data.rating,
      isAnonymous: data.isAnonymous || false,
      isRead: false,
      tags: data.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    feedback.push(newFeedback)
    
    return Response.json({
      data: newFeedback,
      message: 'Feedback created successfully'
    })
  }),

  // Update feedback
  http.put('/api/performance/feedback/:id', async ({ params, request }) => {
    await delay(Math.random() * 400 + 100)
    
    const data = await request.json() as Partial<Feedback>
    const feedbackIndex = feedback.findIndex(fb => fb.id === params.id)
    
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

  // Get performance metrics
  http.get('/api/performance/metrics', async ({ request }) => {
    await delay(Math.random() * 300 + 100)
    
    const url = new URL(request.url)
    const employeeId = url.searchParams.get('employeeId')
    const metricType = url.searchParams.get('metricType')
    
    let filtered = [...performanceMetrics]
    
    if (employeeId) {
      filtered = filtered.filter(metric => metric.employeeId === employeeId)
    }
    
    if (metricType) {
      filtered = filtered.filter(metric => metric.metricType === metricType)
    }
    
    return Response.json({
      data: filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      message: 'Performance metrics retrieved successfully'
    })
  }),

  // Create performance metric
  http.post('/api/performance/metrics', async ({ request }) => {
    await delay(Math.random() * 400 + 100)
    
    const data = await request.json() as Partial<PerformanceMetric>
    
    const newMetric: PerformanceMetric = {
      id: `metric-${performanceMetrics.length + 1}`,
      employeeId: data.employeeId!,
      metricType: data.metricType!,
      period: data.period || 'monthly',
      value: data.value!,
      target: data.target,
      unit: data.unit || '',
      description: data.description || '',
      recordedBy: data.recordedBy!,
      recordedAt: data.recordedAt || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    performanceMetrics.push(newMetric)
    
    return Response.json({
      data: newMetric,
      message: 'Performance metric created successfully'
    })
  }),

  // Get performance analytics
  http.get('/api/performance/analytics', async ({ request }) => {
    await delay(Math.random() * 400 + 100)
    
    const url = new URL(request.url)
    const employeeId = url.searchParams.get('employeeId')
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')
    
    // Calculate analytics based on filtered data
    let filteredGoals = [...goals]
    let filteredReviews = [...performanceReviews]
    let filteredMetrics = [...performanceMetrics]
    
    if (employeeId) {
      filteredGoals = filteredGoals.filter(g => g.employeeId === employeeId)
      filteredReviews = filteredReviews.filter(r => r.employeeId === employeeId)
      filteredMetrics = filteredMetrics.filter(m => m.employeeId === employeeId)
    }
    
    const analytics = {
      goalCompletion: {
        total: filteredGoals.length,
        completed: filteredGoals.filter(g => g.status === 'completed').length,
        inProgress: filteredGoals.filter(g => g.status === 'in_progress').length,
        overdue: filteredGoals.filter(g => g.status === 'overdue').length,
        completionRate: filteredGoals.length > 0 
          ? (filteredGoals.filter(g => g.status === 'completed').length / filteredGoals.length) * 100 
          : 0,
      },
      reviewMetrics: {
        total: filteredReviews.length,
        completed: filteredReviews.filter(r => r.status === 'completed').length,
        pending: filteredReviews.filter(r => r.status === 'draft' || r.status === 'in_progress').length,
        averageRating: filteredReviews.length > 0 
          ? filteredReviews.reduce((sum, r) => sum + r.overallRating, 0) / filteredReviews.length 
          : 0,
      },
      performanceTrends: {
        monthlyProgress: calculateMonthlyProgress(filteredGoals),
        ratingTrends: calculateRatingTrends(filteredReviews),
        metricTrends: calculateMetricTrends(filteredMetrics),
      },
      topPerformers: calculateTopPerformers(filteredReviews),
      improvementAreas: calculateImprovementAreas(filteredReviews),
    }
    
    return Response.json({
      data: analytics,
      message: 'Performance analytics retrieved successfully'
    })
  }),
]

// Helper functions for analytics calculations
function calculateMonthlyProgress(goals: Goal[]) {
  const monthlyData = goals.reduce((acc, goal) => {
    const month = new Date(goal.createdAt).toISOString().slice(0, 7)
    if (!acc[month]) {
      acc[month] = { total: 0, completed: 0 }
    }
    acc[month].total++
    if (goal.status === 'completed') {
      acc[month].completed++
    }
    return acc
  }, {} as Record<string, { total: number; completed: number }>)
  
  return Object.entries(monthlyData).map(([month, data]) => ({
    month,
    progress: data.total > 0 ? (data.completed / data.total) * 100 : 0,
    total: data.total,
    completed: data.completed,
  }))
}

function calculateRatingTrends(reviews: PerformanceReview[]) {
  return reviews
    .filter(r => r.status === 'completed')
    .map(r => ({
      period: r.reviewPeriod,
      rating: r.overallRating,
      date: r.endDate,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

function calculateMetricTrends(metrics: PerformanceMetric[]) {
  const metricTypes = [...new Set(metrics.map(m => m.metricType))]
  
  return metricTypes.map(type => ({
    metricType: type,
    trend: metrics
      .filter(m => m.metricType === type)
      .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
      .map(m => ({
        value: m.value,
        target: m.target,
        date: m.recordedAt,
      })),
  }))
}

function calculateTopPerformers(reviews: PerformanceReview[]) {
  const employeeRatings = reviews
    .filter(r => r.status === 'completed')
    .reduce((acc, review) => {
      if (!acc[review.employeeId]) {
        acc[review.employeeId] = { totalRating: 0, reviewCount: 0 }
      }
      acc[review.employeeId].totalRating += review.overallRating
      acc[review.employeeId].reviewCount++
      return acc
    }, {} as Record<string, { totalRating: number; reviewCount: number }>)
  
  return Object.entries(employeeRatings)
    .map(([employeeId, data]) => ({
      employeeId,
      averageRating: data.totalRating / data.reviewCount,
      reviewCount: data.reviewCount,
    }))
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, 10)
}

function calculateImprovementAreas(reviews: PerformanceReview[]) {
  const allImprovements = reviews
    .flatMap(r => r.areasForImprovement)
    .reduce((acc, area) => {
      acc[area] = (acc[area] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  
  return Object.entries(allImprovements)
    .map(([area, count]) => ({ area, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
}