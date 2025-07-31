import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { setupServer } from 'msw/node'
import { leaveHandlers } from '../leave'

const server = setupServer(...leaveHandlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('Leave Handlers', () => {
  describe('GET /api/leave/types', () => {
    it('should return all leave types', async () => {
      const response = await fetch('/api/leave/types')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
      expect(data.data.length).toBeGreaterThan(0)
      
      const leaveType = data.data[0]
      expect(leaveType.id).toBeDefined()
      expect(leaveType.name).toBeDefined()
      expect(leaveType.maxDays).toBeDefined()
      expect(leaveType.carryOverDays).toBeDefined()
    })
  })

  describe('POST /api/leave/types', () => {
    it('should create new leave type', async () => {
      const newLeaveType = {
        name: 'Paternity Leave',
        maxDays: 14,
        carryOverDays: 0,
        requiresApproval: true,
        description: 'Leave for new fathers'
      }

      const response = await fetch('/api/leave/types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLeaveType)
      })

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data.data.id).toBeDefined()
      expect(data.data.name).toBe(newLeaveType.name)
      expect(data.data.maxDays).toBe(newLeaveType.maxDays)
    })
  })

  describe('GET /api/leave/requests', () => {
    it('should return leave requests', async () => {
      const response = await fetch('/api/leave/requests')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
      
      if (data.data.length > 0) {
        const request = data.data[0]
        expect(request.id).toBeDefined()
        expect(request.employeeId).toBeDefined()
        expect(request.leaveTypeId).toBeDefined()
        expect(request.startDate).toBeDefined()
        expect(request.endDate).toBeDefined()
        expect(request.status).toBeDefined()
      }
    })

    it('should filter requests by employee ID', async () => {
      const response = await fetch('/api/leave/requests?employeeId=emp-001')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })

    it('should filter requests by status', async () => {
      const response = await fetch('/api/leave/requests?status=pending')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })

    it('should filter requests by date range', async () => {
      const startDate = '2024-01-01'
      const endDate = '2024-12-31'
      const response = await fetch(`/api/leave/requests?startDate=${startDate}&endDate=${endDate}`)

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })
  })

  describe('GET /api/leave/requests/:id', () => {
    it('should return specific leave request', async () => {
      // First get a request ID
      const listResponse = await fetch('/api/leave/requests')
      const listData = await listResponse.json()
      
      if (listData.data.length > 0) {
        const requestId = listData.data[0].id
        const response = await fetch(`/api/leave/requests/${requestId}`)

        expect(response.ok).toBe(true)
        const data = await response.json()
        expect(data.data.id).toBe(requestId)
      }
    })

    it('should return 404 for non-existent request', async () => {
      const response = await fetch('/api/leave/requests/non-existent')

      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data.error).toBe('Leave request not found')
    })
  })

  describe('POST /api/leave/requests', () => {
    it('should create new leave request', async () => {
      const newRequest = {
        employeeId: 'emp-001',
        leaveTypeId: 'leave-type-001',
        startDate: '2024-02-15',
        endDate: '2024-02-16',
        reason: 'Personal leave',
        emergencyContact: 'John Doe - 555-0123'
      }

      const response = await fetch('/api/leave/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRequest)
      })

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data.data.id).toBeDefined()
      expect(data.data.employeeId).toBe(newRequest.employeeId)
      expect(data.data.status).toBe('pending')
      expect(data.data.totalDays).toBe(2)
    })
  })

  describe('PUT /api/leave/requests/:id', () => {
    it('should update existing leave request', async () => {
      // First create a request
      const newRequest = {
        employeeId: 'emp-001',
        leaveTypeId: 'leave-type-001',
        startDate: '2024-02-20',
        endDate: '2024-02-21',
        reason: 'Medical appointment'
      }

      const createResponse = await fetch('/api/leave/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRequest)
      })
      const createData = await createResponse.json()
      const requestId = createData.data.id

      const updates = {
        reason: 'Updated medical appointment',
        emergencyContact: 'Jane Doe - 555-0456'
      }

      const response = await fetch(`/api/leave/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.data.reason).toBe(updates.reason)
      expect(data.data.emergencyContact).toBe(updates.emergencyContact)
    })
  })

  describe('POST /api/leave/requests/:id/approve', () => {
    it('should approve leave request', async () => {
      // First create a request
      const newRequest = {
        employeeId: 'emp-001',
        leaveTypeId: 'leave-type-001',
        startDate: '2024-03-01',
        endDate: '2024-03-02',
        reason: 'Vacation'
      }

      const createResponse = await fetch('/api/leave/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRequest)
      })
      const createData = await createResponse.json()
      const requestId = createData.data.id

      const approval = {
        approverId: 'manager-001',
        comment: 'Approved for vacation'
      }

      const response = await fetch(`/api/leave/requests/${requestId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(approval)
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.data.status).toBe('approved')
      expect(data.data.approverId).toBe(approval.approverId)
      expect(data.data.approvalComment).toBe(approval.comment)
    })
  })

  describe('POST /api/leave/requests/:id/reject', () => {
    it('should reject leave request', async () => {
      // First create a request
      const newRequest = {
        employeeId: 'emp-001',
        leaveTypeId: 'leave-type-001',
        startDate: '2024-03-15',
        endDate: '2024-03-16',
        reason: 'Personal'
      }

      const createResponse = await fetch('/api/leave/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRequest)
      })
      const createData = await createResponse.json()
      const requestId = createData.data.id

      const rejection = {
        approverId: 'manager-001',
        comment: 'Insufficient leave balance'
      }

      const response = await fetch(`/api/leave/requests/${requestId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rejection)
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.data.status).toBe('rejected')
      expect(data.data.approverId).toBe(rejection.approverId)
      expect(data.data.approvalComment).toBe(rejection.comment)
    })
  })

  describe('GET /api/leave/balances', () => {
    it('should return leave balances', async () => {
      const response = await fetch('/api/leave/balances')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
      
      if (data.data.length > 0) {
        const balance = data.data[0]
        expect(balance.id).toBeDefined()
        expect(balance.employeeId).toBeDefined()
        expect(balance.leaveTypeId).toBeDefined()
        expect(balance.totalDays).toBeDefined()
        expect(balance.usedDays).toBeDefined()
        expect(balance.remainingDays).toBeDefined()
      }
    })

    it('should filter balances by employee ID', async () => {
      const response = await fetch('/api/leave/balances?employeeId=emp-001')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })

    it('should filter balances by year', async () => {
      const response = await fetch('/api/leave/balances?year=2024')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })
  })

  describe('GET /api/leave/stats', () => {
    it('should return leave statistics', async () => {
      const response = await fetch('/api/leave/stats?year=2024')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.data.totalRequests).toBeGreaterThanOrEqual(0)
      expect(data.data.approvedRequests).toBeGreaterThanOrEqual(0)
      expect(data.data.pendingRequests).toBeGreaterThanOrEqual(0)
      expect(data.data.rejectedRequests).toBeGreaterThanOrEqual(0)
      expect(data.data.totalDays).toBeGreaterThanOrEqual(0)
      expect(Array.isArray(data.data.byLeaveType)).toBe(true)
    })
  })
})