import { http, HttpResponse } from 'msw'
import { 
  generateAttendanceRecords,
  mockWorkSchedules,
  AttendanceRecord,
  WorkSchedule
} from '../data/attendance'
import { mockEmployees } from '../data/employees'

let attendanceRecords = generateAttendanceRecords(mockEmployees.map(emp => emp.id))
let workSchedules = [...mockWorkSchedules]

export const attendanceHandlers = [
  // Attendance Records
  http.get('/api/attendance/records', ({ request }) => {
    const url = new URL(request.url)
    const employeeId = url.searchParams.get('employeeId')
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')
    const status = url.searchParams.get('status')

    let filteredRecords = attendanceRecords

    if (employeeId) {
      filteredRecords = filteredRecords.filter(record => record.employeeId === employeeId)
    }

    if (startDate && endDate) {
      filteredRecords = filteredRecords.filter(record => 
        new Date(record.date) >= new Date(startDate) &&
        new Date(record.date) <= new Date(endDate)
      )
    }

    if (status) {
      filteredRecords = filteredRecords.filter(record => record.status === status)
    }

    return HttpResponse.json({ data: filteredRecords })
  }),

  http.get('/api/attendance/records/:id', ({ params }) => {
    const record = attendanceRecords.find(r => r.id === params.id)
    if (!record) {
      return HttpResponse.json({ error: 'Attendance record not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: record })
  }),

  http.post('/api/attendance/records', async ({ request }) => {
    const newRecordData = await request.json() as Partial<AttendanceRecord>
    const newRecord: AttendanceRecord = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...newRecordData
    } as AttendanceRecord

    attendanceRecords.push(newRecord)
    return HttpResponse.json({ data: newRecord }, { status: 201 })
  }),

  http.put('/api/attendance/records/:id', async ({ params, request }) => {
    const recordIndex = attendanceRecords.findIndex(r => r.id === params.id)
    if (recordIndex === -1) {
      return HttpResponse.json({ error: 'Attendance record not found' }, { status: 404 })
    }

    const updates = await request.json() as Partial<AttendanceRecord>
    attendanceRecords[recordIndex] = {
      ...attendanceRecords[recordIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    return HttpResponse.json({ data: attendanceRecords[recordIndex] })
  }),

  // Clock In/Out
  http.post('/api/attendance/clock-in', async ({ request }) => {
    const { employeeId, location, notes } = await request.json() as { 
      employeeId: string, 
      location?: string, 
      notes?: string 
    }

    const today = new Date().toISOString().split('T')[0]
    const existingRecord = attendanceRecords.find(r => 
      r.employeeId === employeeId && r.date === today
    )

    if (existingRecord && existingRecord.clockIn) {
      return HttpResponse.json({ error: 'Already clocked in today' }, { status: 400 })
    }

    const clockInTime = new Date().toISOString()
    
    if (existingRecord) {
      existingRecord.clockIn = clockInTime
      existingRecord.status = 'present'
      existingRecord.location = location
      existingRecord.notes = notes
      existingRecord.updatedAt = new Date().toISOString()
      return HttpResponse.json({ data: existingRecord })
    } else {
      const newRecord: AttendanceRecord = {
        id: crypto.randomUUID(),
        employeeId,
        date: today,
        clockIn: clockInTime,
        clockOut: null,
        breakStart: null,
        breakEnd: null,
        totalHours: 0,
        overtimeHours: 0,
        status: 'present',
        location,
        notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      attendanceRecords.push(newRecord)
      return HttpResponse.json({ data: newRecord }, { status: 201 })
    }
  }),

  http.post('/api/attendance/clock-out', async ({ request }) => {
    const { employeeId, notes } = await request.json() as { 
      employeeId: string, 
      notes?: string 
    }

    const today = new Date().toISOString().split('T')[0]
    const recordIndex = attendanceRecords.findIndex(r => 
      r.employeeId === employeeId && r.date === today
    )

    if (recordIndex === -1 || !attendanceRecords[recordIndex].clockIn) {
      return HttpResponse.json({ error: 'Must clock in first' }, { status: 400 })
    }

    const record = attendanceRecords[recordIndex]
    if (record.clockOut) {
      return HttpResponse.json({ error: 'Already clocked out today' }, { status: 400 })
    }

    const clockOutTime = new Date().toISOString()
    const clockInTime = new Date(record.clockIn!)
    const totalHours = (new Date(clockOutTime).getTime() - clockInTime.getTime()) / (1000 * 60 * 60)

    record.clockOut = clockOutTime
    record.totalHours = Math.round(totalHours * 100) / 100
    record.overtimeHours = Math.max(0, totalHours - 8)
    record.notes = notes || record.notes
    record.updatedAt = new Date().toISOString()

    return HttpResponse.json({ data: record })
  }),

  // Work Schedules
  http.get('/api/attendance/schedules', ({ request }) => {
    const url = new URL(request.url)
    const employeeId = url.searchParams.get('employeeId')

    let filteredSchedules = workSchedules

    if (employeeId) {
      filteredSchedules = filteredSchedules.filter(schedule => schedule.employeeId === employeeId)
    }

    return HttpResponse.json({ data: filteredSchedules })
  }),

  http.post('/api/attendance/schedules', async ({ request }) => {
    const newScheduleData = await request.json() as Partial<WorkSchedule>
    const newSchedule: WorkSchedule = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...newScheduleData
    } as WorkSchedule

    workSchedules.push(newSchedule)
    return HttpResponse.json({ data: newSchedule }, { status: 201 })
  }),

  http.put('/api/attendance/schedules/:id', async ({ params, request }) => {
    const scheduleIndex = workSchedules.findIndex(s => s.id === params.id)
    if (scheduleIndex === -1) {
      return HttpResponse.json({ error: 'Work schedule not found' }, { status: 404 })
    }

    const updates = await request.json() as Partial<WorkSchedule>
    workSchedules[scheduleIndex] = {
      ...workSchedules[scheduleIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    return HttpResponse.json({ data: workSchedules[scheduleIndex] })
  }),

  // Attendance Statistics
  http.get('/api/attendance/stats', ({ request }) => {
    const url = new URL(request.url)
    const employeeId = url.searchParams.get('employeeId')
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')
    const month = url.searchParams.get('month')
    const year = url.searchParams.get('year')

    let filteredRecords = attendanceRecords

    if (employeeId) {
      filteredRecords = filteredRecords.filter(r => r.employeeId === employeeId)
    }

    if (startDate && endDate) {
      filteredRecords = filteredRecords.filter(r => 
        new Date(r.date) >= new Date(startDate) &&
        new Date(r.date) <= new Date(endDate)
      )
    }

    if (month && year) {
      filteredRecords = filteredRecords.filter(r => {
        const recordDate = new Date(r.date)
        return recordDate.getMonth() === parseInt(month) - 1 && 
               recordDate.getFullYear() === parseInt(year)
      })
    }

    const stats = {
      totalDays: filteredRecords.length,
      present: filteredRecords.filter(r => r.status === 'present').length,
      absent: filteredRecords.filter(r => r.status === 'absent').length,
      late: filteredRecords.filter(r => r.status === 'late').length,
      halfDay: filteredRecords.filter(r => r.status === 'half_day').length,
      totalHours: filteredRecords.reduce((sum, r) => sum + r.totalHours, 0),
      totalOvertimeHours: filteredRecords.reduce((sum, r) => sum + r.overtimeHours, 0),
      averageHours: filteredRecords.length > 0 
        ? filteredRecords.reduce((sum, r) => sum + r.totalHours, 0) / filteredRecords.length 
        : 0,
      attendanceRate: filteredRecords.length > 0 
        ? (filteredRecords.filter(r => r.status === 'present').length / filteredRecords.length) * 100 
        : 0
    }

    return HttpResponse.json({ data: stats })
  }),

  // Today's Attendance Summary
  http.get('/api/attendance/today', () => {
    const today = new Date().toISOString().split('T')[0]
    const todayRecords = attendanceRecords.filter(r => r.date === today)

    const summary = {
      totalEmployees: mockEmployees.length,
      present: todayRecords.filter(r => r.status === 'present').length,
      absent: mockEmployees.length - todayRecords.length,
      late: todayRecords.filter(r => r.status === 'late').length,
      onBreak: todayRecords.filter(r => r.breakStart && !r.breakEnd).length,
      records: todayRecords
    }

    return HttpResponse.json({ data: summary })
  })
]