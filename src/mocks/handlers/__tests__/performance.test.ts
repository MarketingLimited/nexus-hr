import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { setupServer } from 'msw/node'
import { performanceHandlers } from '../performance'

const server = setupServer(...performanceHandlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('Performance Handlers', () => {
  describe('GET /api/performance/goals', () => {
    it('should return performance goals', async () => {
      const response = await fetch('/api/performance/goals')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
      
      if (data.data.length > 0) {
        const goal = data.data[0]
        expect(goal.id).toBeDefined()
        expect(goal.employeeId).toBeDefined()
        expect(goal.title).toBeDefined()
        expect(goal.description).toBeDefined()
        expect(goal.status).toBeDefined()
        expect(goal.priority).toBeDefined()
      }
    })

    it('should filter goals by employee ID', async () => {
      const response = await fetch('/api/performance/goals?employeeId=emp-001')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })

    it('should filter goals by status', async () => {
      const response = await fetch('/api/performance/goals?status=in-progress')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })

    it('should filter goals by category', async () => {
      const response = await fetch('/api/performance/goals?category=professional')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })

    it('should filter goals by priority', async () => {
      const response = await fetch('/api/performance/goals?priority=high')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })
  })

  describe('POST /api/performance/goals', () => {
    it('should create new performance goal', async () => {
      const newGoal = {
        employeeId: 'emp-001',
        title: 'Complete React Training',
        description: 'Finish advanced React course and build a project',
        targetDate: '2024-06-30',
        category: 'professional',
        priority: 'high',
        metrics: ['Course completion', 'Project deployment']
      }

      const response = await fetch('/api/performance/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGoal)
      })

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data.data.id).toBeDefined()
      expect(data.data.employeeId).toBe(newGoal.employeeId)
      expect(data.data.title).toBe(newGoal.title)
      expect(data.data.status).toBe('not-started')
    })
  })

  describe('GET /api/performance/reviews', () => {
    it('should return performance reviews', async () => {
      const response = await fetch('/api/performance/reviews')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
      
      if (data.data.length > 0) {
        const review = data.data[0]
        expect(review.id).toBeDefined()
        expect(review.employeeId).toBeDefined()
        expect(review.reviewerId).toBeDefined()
        expect(review.period).toBeDefined()
        expect(review.status).toBeDefined()
        expect(review.type).toBeDefined()
      }
    })

    it('should filter reviews by employee ID', async () => {
      const response = await fetch('/api/performance/reviews?employeeId=emp-001')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })

    it('should filter reviews by reviewer ID', async () => {
      const response = await fetch('/api/performance/reviews?reviewerId=manager-001')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })

    it('should filter reviews by status', async () => {
      const response = await fetch('/api/performance/reviews?status=completed')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })

    it('should filter reviews by period', async () => {
      const response = await fetch('/api/performance/reviews?period=2024-Q1')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })

    it('should filter reviews by type', async () => {
      const response = await fetch('/api/performance/reviews?type=annual')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })
  })

  describe('POST /api/performance/reviews', () => {
    it('should create new performance review', async () => {
      const newReview = {
        employeeId: 'emp-001',
        reviewerId: 'manager-001',
        period: '2024-Q2',
        type: 'quarterly',
        dueDate: '2024-07-15'
      }

      const response = await fetch('/api/performance/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview)
      })

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data.data.id).toBeDefined()
      expect(data.data.employeeId).toBe(newReview.employeeId)
      expect(data.data.reviewerId).toBe(newReview.reviewerId)
      expect(data.data.status).toBe('draft')
    })
  })

  describe('PUT /api/performance/reviews/:id/submit', () => {
    it('should submit performance review', async () => {
      // First create a review
      const newReview = {
        employeeId: 'emp-001',
        reviewerId: 'manager-001',
        period: '2024-Q3',
        type: 'quarterly'
      }

      const createResponse = await fetch('/api/performance/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview)
      })
      const createData = await createResponse.json()
      const reviewId = createData.data.id

      const submission = {
        overallRating: 4.2,
        strengths: ['Good technical skills', 'Team collaboration'],
        areasForImprovement: ['Communication', 'Time management'],
        goals: ['Improve presentation skills'],
        comments: 'Strong performance overall'
      }

      const response = await fetch(`/api/performance/reviews/${reviewId}/submit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission)
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.data.status).toBe('submitted')
      expect(data.data.overallRating).toBe(submission.overallRating)
    })
  })

  describe('GET /api/performance/feedback', () => {
    it('should return feedback list', async () => {
      const response = await fetch('/api/performance/feedback')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
      
      if (data.data.length > 0) {
        const feedback = data.data[0]
        expect(feedback.id).toBeDefined()
        expect(feedback.fromEmployeeId).toBeDefined()
        expect(feedback.toEmployeeId).toBeDefined()
        expect(feedback.type).toBeDefined()
        expect(feedback.category).toBeDefined()
        expect(feedback.status).toBeDefined()
      }
    })

    it('should filter feedback by from employee', async () => {
      const response = await fetch('/api/performance/feedback?fromEmployeeId=emp-001')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })

    it('should filter feedback by to employee', async () => {
      const response = await fetch('/api/performance/feedback?toEmployeeId=emp-002')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })

    it('should filter feedback by type', async () => {
      const response = await fetch('/api/performance/feedback?type=peer')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })

    it('should filter feedback by category', async () => {
      const response = await fetch('/api/performance/feedback?category=technical')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })

    it('should filter feedback by status', async () => {
      const response = await fetch('/api/performance/feedback?status=submitted')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })
  })

  describe('POST /api/performance/feedback', () => {
    it('should create new feedback', async () => {
      const newFeedback = {
        fromEmployeeId: 'emp-001',
        toEmployeeId: 'emp-002',
        type: 'peer',
        category: 'collaboration',
        content: 'Great teamwork and communication skills',
        rating: 4.5
      }

      const response = await fetch('/api/performance/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFeedback)
      })

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data.data.id).toBeDefined()
      expect(data.data.fromEmployeeId).toBe(newFeedback.fromEmployeeId)
      expect(data.data.toEmployeeId).toBe(newFeedback.toEmployeeId)
      expect(data.data.status).toBe('draft')
    })
  })

  describe('GET /api/performance/metrics', () => {
    it('should return performance metrics', async () => {
      const response = await fetch('/api/performance/metrics')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
      
      if (data.data.length > 0) {
        const metric = data.data[0]
        expect(metric.id).toBeDefined()
        expect(metric.employeeId).toBeDefined()
        expect(metric.period).toBeDefined()
        expect(metric.kpis).toBeDefined()
      }
    })

    it('should filter metrics by employee ID', async () => {
      const response = await fetch('/api/performance/metrics?employeeId=emp-001')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })

    it('should filter metrics by period', async () => {
      const response = await fetch('/api/performance/metrics?period=2024-Q1')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })
  })

  describe('GET /api/performance/analytics', () => {
    it('should return performance analytics', async () => {
      const response = await fetch('/api/performance/analytics')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.data.goalStats).toBeDefined()
      expect(data.data.reviewStats).toBeDefined()
      expect(data.data.feedbackStats).toBeDefined()
      expect(data.data.averageRating).toBeGreaterThanOrEqual(0)
      expect(data.data.completionRate).toBeGreaterThanOrEqual(0)
    })

    it('should filter analytics by employee ID', async () => {
      const response = await fetch('/api/performance/analytics?employeeId=emp-001')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.data).toBeDefined()
    })

    it('should filter analytics by department ID', async () => {
      const response = await fetch('/api/performance/analytics?departmentId=dept-001')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.data).toBeDefined()
    })

    it('should filter analytics by period', async () => {
      const response = await fetch('/api/performance/analytics?period=2024-Q1')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.data).toBeDefined()
    })
  })
})