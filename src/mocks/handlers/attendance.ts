import { http, delay } from 'msw'
import { 
  generateAttendanceRecords, 
  generateWorkSchedules, 
  generateTimeOffRequests,
  mockAttendancePolicies,
  AttendanceRecord,
  WorkSchedule,
  TimeOffRequest,
  AttendancePolicy
} from '../data/attendance'
import { mockEmployees } from '../data/employees'

// Generate mock data
const employeeIds = mockEmployees.map(emp => emp.id)
const attendanceRecords = generateAttendanceRecords(employeeIds, 90)
const workSchedules = generateWorkSchedules(employeeIds)
const timeOffRequests = generateTimeOffRequests(employeeIds, 50)

export const attendanceHandlers = [
  // Get attendance records
  http.get('/api/attendance/records', async ({ request }) => {
    await delay(Math.random() * 300 + 100)
    
    const url = new URL(request.url)
    const employeeId = url.searchParams.get('employeeId')
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')
    const status = url.searchParams.get('status')
    
    let filtered = [...attendanceRecords]
    
    if (employeeId) {
      filtered = filtered.filter(record => record.employeeId === employeeId)
    }
    
    if (startDate) {
      filtered = filtered.filter(record => record.date >= startDate)
    }
    
    if (endDate) {
      filtered = filtered.filter(record => record.date <= endDate)
    }
    
    if (status) {
      filtered = filtered.filter(record => record.status === status)
    }
    
    return Response.json({
      data: filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      message: 'Attendance records retrieved successfully'
    })
  }),

  // Get attendance record by ID
  http.get('/api/attendance/records/:id', async ({ params }) => {
    await delay(Math.random() * 200 + 50)
    
    const record = attendanceRecords.find(r => r.id === params.id)
    
    if (!record) {
      return new Response('Attendance record not found', { status: 404 })
    }
    
    return Response.json({
      data: record,
      message: 'Attendance record retrieved successfully'
    })
  }),

  // Create attendance record (clock in/out)
  http.post('/api/attendance/records', async ({ request }) => {
    await delay(Math.random() * 400 + 100)
    
    const data = await request.json() as Partial<AttendanceRecord>
    
    const newRecord: AttendanceRecord = {
      id: `record-${attendanceRecords.length + 1}`,
      employeeId: data.employeeId!,
      date: data.date || new Date().toISOString().split('T')[0],
      clockIn: data.clockIn,
      clockOut: data.clockOut,
      breakStart: data.breakStart,
      breakEnd: data.breakEnd,
      totalHours: data.totalHours || 0,
      overtimeHours: data.overtimeHours || 0,
      status: data.status || 'present',
      location: data.location || 'Office',
      notes: data.notes,
      approvedBy: data.approvedBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    attendanceRecords.push(newRecord)
    
    return Response.json({
      data: newRecord,
      message: 'Attendance record created successfully'
    })
  }),

  // Update attendance record
  http.put('/api/attendance/records/:id', async ({ params, request }) => {
    await delay(Math.random() * 400 + 100)
    
    const data = await request.json() as Partial<AttendanceRecord>
    const recordIndex = attendanceRecords.findIndex(r => r.id === params.id)
    
    if (recordIndex === -1) {
      return new Response('Attendance record not found', { status: 404 })
    }
    
    const updatedRecord = {
      ...attendanceRecords[recordIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    
    attendanceRecords[recordIndex] = updatedRecord
    
    return Response.json({
      data: updatedRecord,
      message: 'Attendance record updated successfully'
    })
  }),

  // Delete attendance record
  http.delete('/api/attendance/records/:id', async ({ params }) => {
    await delay(Math.random() * 300 + 100)
    
    const recordIndex = attendanceRecords.findIndex(r => r.id === params.id)
    
    if (recordIndex === -1) {
      return new Response('Attendance record not found', { status: 404 })
    }
    
    attendanceRecords.splice(recordIndex, 1)
    
    return Response.json({
      message: 'Attendance record deleted successfully'
    })
  }),

  // Get work schedules
  http.get('/api/attendance/schedules', async ({ request }) => {
    await delay(Math.random() * 300 + 100)
    
    const url = new URL(request.url)
    const employeeId = url.searchParams.get('employeeId')
    
    let filtered = [...workSchedules]
    
    if (employeeId) {
      filtered = filtered.filter(schedule => schedule.employeeId === employeeId)
    }
    
    return Response.json({
      data: filtered,
      message: 'Work schedules retrieved successfully'
    })
  }),

  // Create work schedule
  http.post('/api/attendance/schedules', async ({ request }) => {
    await delay(Math.random() * 400 + 100)
    
    const data = await request.json() as Partial<WorkSchedule>
    
    const newSchedule: WorkSchedule = {
      id: `schedule-${workSchedules.length + 1}`,
      employeeId: data.employeeId!,
      scheduleType: 'fixed',
      workingDays: data.workingDays || [],
      startTime: data.startTime || '09:00',
      endTime: data.endTime || '17:00',
      breakDuration: data.breakDuration || 60,
      timezone: data.timezone || 'UTC',
      effectiveFrom: data.effectiveFrom || new Date().toISOString(),
      effectiveTo: data.effectiveTo,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    workSchedules.push(newSchedule)
    
    return Response.json({
      data: newSchedule,
      message: 'Work schedule created successfully'
    })
  }),

  // Update work schedule
  http.put('/api/attendance/schedules/:id', async ({ params, request }) => {
    await delay(Math.random() * 400 + 100)
    
    const data = await request.json() as Partial<WorkSchedule>
    const scheduleIndex = workSchedules.findIndex(s => s.id === params.id)
    
    if (scheduleIndex === -1) {
      return new Response('Work schedule not found', { status: 404 })
    }
    
    const updatedSchedule = {
      ...workSchedules[scheduleIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    
    workSchedules[scheduleIndex] = updatedSchedule
    
    return Response.json({
      data: updatedSchedule,
      message: 'Work schedule updated successfully'
    })
  }),

  // Get time off requests
  http.get('/api/attendance/time-off', async ({ request }) => {
    await delay(Math.random() * 300 + 100)
    
    const url = new URL(request.url)
    const employeeId = url.searchParams.get('employeeId')
    const status = url.searchParams.get('status')
    
    let filtered = [...timeOffRequests]
    
    if (employeeId) {
      filtered = filtered.filter(request => request.employeeId === employeeId)
    }
    
    if (status) {
      filtered = filtered.filter(request => request.status === status)
    }
    
    return Response.json({
      data: filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      message: 'Time off requests retrieved successfully'
    })
  }),

  // Create time off request
  http.post('/api/attendance/time-off', async ({ request }) => {
    await delay(Math.random() * 400 + 100)
    
    const data = await request.json() as Partial<TimeOffRequest>
    
    const newRequest: TimeOffRequest = {
      id: `timeoff-${timeOffRequests.length + 1}`,
      employeeId: data.employeeId!,
      type: data.type || 'sick',
      startDate: data.startDate!,
      endDate: data.endDate!,
      reason: data.reason || '',
      status: 'pending',
      appliedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    timeOffRequests.push(newRequest)
    
    return Response.json({
      data: newRequest,
      message: 'Time off request created successfully'
    })
  }),

  // Update time off request status
  http.put('/api/attendance/time-off/:id', async ({ params, request }) => {
    await delay(Math.random() * 400 + 100)
    
    const data = await request.json() as Partial<TimeOffRequest>
    const requestIndex = timeOffRequests.findIndex(r => r.id === params.id)
    
    if (requestIndex === -1) {
      return new Response('Time off request not found', { status: 404 })
    }
    
    const updatedRequest = {
      ...timeOffRequests[requestIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    
    if (data.status === 'approved') {
      updatedRequest.approvedAt = new Date().toISOString()
    }
    
    timeOffRequests[requestIndex] = updatedRequest
    
    return Response.json({
      data: updatedRequest,
      message: 'Time off request updated successfully'
    })
  }),

  // Get attendance policies
  http.get('/api/attendance/policies', async () => {
    await delay(Math.random() * 200 + 50)
    
    return Response.json({
      data: mockAttendancePolicies,
      message: 'Attendance policies retrieved successfully'
    })
  }),

  // Get attendance statistics
  http.get('/api/attendance/stats', async ({ request }) => {
    await delay(Math.random() * 300 + 100)
    
    const url = new URL(request.url)
    const employeeId = url.searchParams.get('employeeId')
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')
    
    let filtered = [...attendanceRecords]
    
    if (employeeId) {
      filtered = filtered.filter(record => record.employeeId === employeeId)
    }
    
    if (startDate) {
      filtered = filtered.filter(record => record.date >= startDate)
    }
    
    if (endDate) {
      filtered = filtered.filter(record => record.date <= endDate)
    }
    
    const stats = {
      totalDays: filtered.length,
      presentDays: filtered.filter(r => r.status === 'present').length,
      absentDays: filtered.filter(r => r.status === 'absent').length,
      lateDays: filtered.filter(r => r.status === 'late').length,
      totalHours: filtered.reduce((sum, r) => sum + r.totalHours, 0),
      overtimeHours: filtered.reduce((sum, r) => sum + r.overtimeHours, 0),
      averageHoursPerDay: filtered.length > 0 
        ? filtered.reduce((sum, r) => sum + r.totalHours, 0) / filtered.length 
        : 0,
      attendanceRate: filtered.length > 0 
        ? (filtered.filter(r => r.status === 'present' || r.status === 'late').length / filtered.length) * 100 
        : 0,
    }
    
    return Response.json({
      data: stats,
      message: 'Attendance statistics retrieved successfully'
    })
  }),
]