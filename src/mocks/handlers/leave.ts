import { http, HttpResponse } from 'msw'
import { 
  mockLeaveTypes, 
  generateLeaveRequests, 
  generateLeaveBalances,
  LeaveRequest,
  LeaveBalance,
  LeaveType 
} from '../data/leave'
import { mockEmployees } from '../data/employees'

let leaveTypes = [...mockLeaveTypes]
let leaveRequests = generateLeaveRequests(
  mockEmployees.map(emp => emp.id), 
  leaveTypes.map(type => type.id)
)
let leaveBalances = generateLeaveBalances(
  mockEmployees.map(emp => emp.id),
  leaveTypes.map(type => type.id)
)

export const leaveHandlers = [
  // Leave Types
  http.get('/api/leave/types', () => {
    return HttpResponse.json({ data: leaveTypes })
  }),

  http.post('/api/leave/types', async ({ request }) => {
    const newTypeData = await request.json() as Partial<LeaveType>
    const newType: LeaveType = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...newTypeData
    } as LeaveType

    leaveTypes.push(newType)
    return HttpResponse.json({ data: newType }, { status: 201 })
  }),

  // Leave Requests
  http.get('/api/leave/requests', ({ request }) => {
    const url = new URL(request.url)
    const employeeId = url.searchParams.get('employeeId')
    const status = url.searchParams.get('status')
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')

    let filteredRequests = leaveRequests

    if (employeeId) {
      filteredRequests = filteredRequests.filter(req => req.employeeId === employeeId)
    }

    if (status) {
      filteredRequests = filteredRequests.filter(req => req.status === status)
    }

    if (startDate && endDate) {
      filteredRequests = filteredRequests.filter(req => 
        new Date(req.startDate) >= new Date(startDate) &&
        new Date(req.endDate) <= new Date(endDate)
      )
    }

    return HttpResponse.json({ data: filteredRequests })
  }),

  http.get('/api/leave/requests/:id', ({ params }) => {
    const request = leaveRequests.find(req => req.id === params.id)
    if (!request) {
      return HttpResponse.json({ error: 'Leave request not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: request })
  }),

  http.post('/api/leave/requests', async ({ request }) => {
    const newRequestData = await request.json() as Partial<LeaveRequest>
    const startDate = new Date(newRequestData.startDate!)
    const endDate = new Date(newRequestData.endDate!)
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

    const newRequest: LeaveRequest = {
      id: crypto.randomUUID(),
      days,
      status: 'pending',
      approvedBy: null,
      approvedAt: null,
      comments: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...newRequestData
    } as LeaveRequest

    leaveRequests.push(newRequest)
    return HttpResponse.json({ data: newRequest }, { status: 201 })
  }),

  http.put('/api/leave/requests/:id', async ({ params, request }) => {
    const requestIndex = leaveRequests.findIndex(req => req.id === params.id)
    if (requestIndex === -1) {
      return HttpResponse.json({ error: 'Leave request not found' }, { status: 404 })
    }

    const updates = await request.json() as Partial<LeaveRequest>
    leaveRequests[requestIndex] = {
      ...leaveRequests[requestIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    return HttpResponse.json({ data: leaveRequests[requestIndex] })
  }),

  // Approve/Reject leave request
  http.post('/api/leave/requests/:id/approve', async ({ params, request }) => {
    const requestIndex = leaveRequests.findIndex(req => req.id === params.id)
    if (requestIndex === -1) {
      return HttpResponse.json({ error: 'Leave request not found' }, { status: 404 })
    }

    const { approvedBy, comments } = await request.json() as { approvedBy: string, comments?: string }
    
    leaveRequests[requestIndex] = {
      ...leaveRequests[requestIndex],
      status: 'approved',
      approvedBy,
      approvedAt: new Date().toISOString(),
      comments,
      updatedAt: new Date().toISOString()
    }

    return HttpResponse.json({ data: leaveRequests[requestIndex] })
  }),

  http.post('/api/leave/requests/:id/reject', async ({ params, request }) => {
    const requestIndex = leaveRequests.findIndex(req => req.id === params.id)
    if (requestIndex === -1) {
      return HttpResponse.json({ error: 'Leave request not found' }, { status: 404 })
    }

    const { rejectedBy, comments } = await request.json() as { rejectedBy: string, comments: string }
    
    leaveRequests[requestIndex] = {
      ...leaveRequests[requestIndex],
      status: 'rejected',
      approvedBy: rejectedBy,
      approvedAt: new Date().toISOString(),
      comments,
      updatedAt: new Date().toISOString()
    }

    return HttpResponse.json({ data: leaveRequests[requestIndex] })
  }),

  // Leave Balances
  http.get('/api/leave/balances', ({ request }) => {
    const url = new URL(request.url)
    const employeeId = url.searchParams.get('employeeId')
    const year = url.searchParams.get('year')

    let filteredBalances = leaveBalances

    if (employeeId) {
      filteredBalances = filteredBalances.filter(balance => balance.employeeId === employeeId)
    }

    if (year) {
      filteredBalances = filteredBalances.filter(balance => balance.year === parseInt(year))
    }

    return HttpResponse.json({ data: filteredBalances })
  }),

  http.put('/api/leave/balances/:id', async ({ params, request }) => {
    const balanceIndex = leaveBalances.findIndex(balance => balance.id === params.id)
    if (balanceIndex === -1) {
      return HttpResponse.json({ error: 'Leave balance not found' }, { status: 404 })
    }

    const updates = await request.json() as Partial<LeaveBalance>
    leaveBalances[balanceIndex] = {
      ...leaveBalances[balanceIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    return HttpResponse.json({ data: leaveBalances[balanceIndex] })
  }),

  // Leave Statistics
  http.get('/api/leave/stats', ({ request }) => {
    const url = new URL(request.url)
    const year = parseInt(url.searchParams.get('year') || new Date().getFullYear().toString())

    const yearRequests = leaveRequests.filter(req => 
      new Date(req.startDate).getFullYear() === year
    )

    const stats = {
      totalRequests: yearRequests.length,
      pending: yearRequests.filter(req => req.status === 'pending').length,
      approved: yearRequests.filter(req => req.status === 'approved').length,
      rejected: yearRequests.filter(req => req.status === 'rejected').length,
      cancelled: yearRequests.filter(req => req.status === 'cancelled').length,
      totalDays: yearRequests.reduce((sum, req) => sum + req.days, 0),
      byType: leaveTypes.map(type => ({
        type: type.name,
        count: yearRequests.filter(req => req.leaveTypeId === type.id).length,
        days: yearRequests
          .filter(req => req.leaveTypeId === type.id)
          .reduce((sum, req) => sum + req.days, 0)
      }))
    }

    return HttpResponse.json({ data: stats })
  })
]