import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { setupServer } from 'msw/node'
import { attendanceHandlers } from '../attendance'

const server = setupServer(...attendanceHandlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('Attendance Handlers', () => {
  describe('GET /api/attendance/records', () => {
    it('should return attendance records', async () => {
      const response = await fetch('/api/attendance/records')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
      
      if (data.data.length > 0) {
        const record = data.data[0]
        expect(record.id).toBeDefined()
        expect(record.employeeId).toBeDefined()
        expect(record.date).toBeDefined()
        expect(record.clockIn).toBeDefined()
        expect(record.status).toBeDefined()
      }
    })

    it('should filter records by employee ID', async () => {
      const response = await fetch('/api/attendance/records?employeeId=emp-001')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })

    it('should filter records by date range', async () => {
      const startDate = '2024-01-01'
      const endDate = '2024-01-31'
      const response = await fetch(`/api/attendance/records?startDate=${startDate}&endDate=${endDate}`)

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })

    it('should filter records by status', async () => {
      const response = await fetch('/api/attendance/records?status=present')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })
  })

  describe('GET /api/attendance/records/:id', () => {
    it('should return specific attendance record', async () => {
      // First get a record ID
      const listResponse = await fetch('/api/attendance/records')
      const listData = await listResponse.json()
      
      if (listData.data.length > 0) {
        const recordId = listData.data[0].id
        const response = await fetch(`/api/attendance/records/${recordId}`)

        expect(response.ok).toBe(true)
        const data = await response.json()
        expect(data.data.id).toBe(recordId)
      }
    })

    it('should return 404 for non-existent record', async () => {
      const response = await fetch('/api/attendance/records/non-existent')

      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data.error).toBe('Attendance record not found')
    })
  })

  describe('POST /api/attendance/records', () => {
    it('should create new attendance record', async () => {
      const newRecord = {
        employeeId: 'emp-001',
        date: '2024-01-15',
        clockIn: '09:00:00',
        clockOut: '17:00:00',
        status: 'present',
        workingHours: 8,
        overtime: 0
      }

      const response = await fetch('/api/attendance/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord)
      })

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data.data.id).toBeDefined()
      expect(data.data.employeeId).toBe(newRecord.employeeId)
      expect(data.data.date).toBe(newRecord.date)
      expect(data.data.status).toBe(newRecord.status)
    })
  })

  describe('PUT /api/attendance/records/:id', () => {
    it('should update existing attendance record', async () => {
      // First create a record
      const newRecord = {
        employeeId: 'emp-001',
        date: '2024-01-16',
        clockIn: '09:00:00',
        status: 'present'
      }

      const createResponse = await fetch('/api/attendance/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord)
      })
      const createData = await createResponse.json()
      const recordId = createData.data.id

      const updates = {
        clockOut: '17:30:00',
        workingHours: 8.5,
        overtime: 0.5
      }

      const response = await fetch(`/api/attendance/records/${recordId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.data.clockOut).toBe(updates.clockOut)
      expect(data.data.workingHours).toBe(updates.workingHours)
    })
  })

  describe('GET /api/attendance/schedules', () => {
    it('should return work schedules', async () => {
      const response = await fetch('/api/attendance/schedules')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
      
      if (data.data.length > 0) {
        const schedule = data.data[0]
        expect(schedule.id).toBeDefined()
        expect(schedule.employeeId).toBeDefined()
        expect(schedule.dayOfWeek).toBeDefined()
        expect(schedule.startTime).toBeDefined()
        expect(schedule.endTime).toBeDefined()
      }
    })

    it('should filter schedules by employee ID', async () => {
      const response = await fetch('/api/attendance/schedules?employeeId=emp-001')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })
  })

  describe('GET /api/attendance/stats', () => {
    it('should return attendance statistics', async () => {
      const response = await fetch('/api/attendance/stats')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.data.totalRecords).toBeGreaterThanOrEqual(0)
      expect(data.data.presentCount).toBeGreaterThanOrEqual(0)
      expect(data.data.absentCount).toBeGreaterThanOrEqual(0)
      expect(data.data.lateCount).toBeGreaterThanOrEqual(0)
      expect(data.data.attendanceRate).toBeGreaterThanOrEqual(0)
    })

    it('should filter stats by employee ID', async () => {
      const response = await fetch('/api/attendance/stats?employeeId=emp-001')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.data).toBeDefined()
    })

    it('should filter stats by date range', async () => {
      const startDate = '2024-01-01'
      const endDate = '2024-01-31'
      const response = await fetch(`/api/attendance/stats?startDate=${startDate}&endDate=${endDate}`)

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.data).toBeDefined()
    })
  })
})