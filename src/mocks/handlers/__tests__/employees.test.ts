import { describe, it, expect, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test-utils/msw-server'
import { employeeHandlers } from '../employees'

describe('Employee Handlers', () => {
  beforeEach(() => {
    server.resetHandlers()
  })

  describe('GET /api/employees', () => {
    it('returns list of employees with pagination', async () => {
      server.use(...employeeHandlers)
      
      const response = await fetch('/api/employees?page=1&limit=10')
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('data')
      expect(data).toHaveProperty('meta')
      expect(Array.isArray(data.data)).toBe(true)
      expect(data.meta).toHaveProperty('total')
      expect(data.meta).toHaveProperty('page', 1)
      expect(data.meta).toHaveProperty('limit', 10)
    })

    it('supports search filtering', async () => {
      server.use(...employeeHandlers)
      
      const response = await fetch('/api/employees?search=john')
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            firstName: expect.stringMatching(/john/i)
          })
        ])
      )
    })

    it('supports department filtering', async () => {
      server.use(...employeeHandlers)
      
      const response = await fetch('/api/employees?department=Engineering')
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.data.every((emp: any) => emp.department === 'Engineering')).toBe(true)
    })

    it('supports status filtering', async () => {
      server.use(...employeeHandlers)
      
      const response = await fetch('/api/employees?status=active')
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.data.every((emp: any) => emp.status === 'active')).toBe(true)
    })

    it('handles pagination correctly', async () => {
      server.use(...employeeHandlers)
      
      const response = await fetch('/api/employees?page=2&limit=5')
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.meta.page).toBe(2)
      expect(data.meta.limit).toBe(5)
      expect(data.data.length).toBeLessThanOrEqual(5)
    })

    it('applies delay to simulate network latency', async () => {
      server.use(...employeeHandlers)
      
      const startTime = Date.now()
      await fetch('/api/employees')
      const endTime = Date.now()
      
      expect(endTime - startTime).toBeGreaterThan(100) // At least 100ms delay
    })
  })

  describe('GET /api/employees/:id', () => {
    it('returns employee by ID', async () => {
      server.use(...employeeHandlers)
      
      const response = await fetch('/api/employees/emp-1')
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('data')
      expect(data.data).toHaveProperty('id', 'emp-1')
      expect(data.data).toHaveProperty('firstName')
      expect(data.data).toHaveProperty('lastName')
      expect(data.data).toHaveProperty('email')
    })

    it('returns 404 for non-existent employee', async () => {
      server.use(...employeeHandlers)
      
      const response = await fetch('/api/employees/non-existent')
      
      expect(response.status).toBe(404)
    })
  })

  describe('POST /api/employees', () => {
    it('creates new employee successfully', async () => {
      server.use(...employeeHandlers)
      
      const newEmployee = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@company.com',
        department: 'Marketing',
        position: 'Marketing Manager',
        startDate: '2024-01-15'
      }
      
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmployee)
      })
      const data = await response.json()
      
      expect(response.status).toBe(201)
      expect(data).toHaveProperty('data')
      expect(data.data).toMatchObject({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@company.com'
      })
      expect(data.data).toHaveProperty('id')
      expect(data.data).toHaveProperty('employeeId')
    })

    it('generates unique employee ID and email ID', async () => {
      server.use(...employeeHandlers)
      
      const newEmployee = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@company.com',
        department: 'IT'
      }
      
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmployee)
      })
      const data = await response.json()
      
      expect(data.data.id).toMatch(/^emp-\d+$/)
      expect(data.data.employeeId).toMatch(/^EMP\d{4}$/)
    })

    it('sets default values for optional fields', async () => {
      server.use(...employeeHandlers)
      
      const minimalEmployee = {
        firstName: 'Min',
        lastName: 'User',
        email: 'min@company.com'
      }
      
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(minimalEmployee)
      })
      const data = await response.json()
      
      expect(data.data.status).toBe('active')
      expect(data.data.department).toBe('General')
      expect(data.data.position).toBe('Employee')
      expect(data.data.manager).toBeNull()
    })
  })

  describe('PUT /api/employees/:id', () => {
    it('updates existing employee', async () => {
      server.use(...employeeHandlers)
      
      const updates = {
        firstName: 'Updated',
        lastName: 'Name',
        position: 'Senior Developer'
      }
      
      const response = await fetch('/api/employees/emp-1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.data).toMatchObject(updates)
    })

    it('returns 404 for non-existent employee update', async () => {
      server.use(...employeeHandlers)
      
      const response = await fetch('/api/employees/non-existent', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: 'Test' })
      })
      
      expect(response.status).toBe(404)
    })

    it('preserves unchanged fields during update', async () => {
      server.use(...employeeHandlers)
      
      // First get the original employee
      const getResponse = await fetch('/api/employees/emp-1')
      const originalData = await getResponse.json()
      
      // Update only one field
      const updates = { firstName: 'UpdatedName' }
      const putResponse = await fetch('/api/employees/emp-1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const updatedData = await putResponse.json()
      
      expect(updatedData.data.firstName).toBe('UpdatedName')
      expect(updatedData.data.lastName).toBe(originalData.data.lastName)
      expect(updatedData.data.email).toBe(originalData.data.email)
    })
  })

  describe('DELETE /api/employees/:id', () => {
    it('deletes employee successfully', async () => {
      server.use(...employeeHandlers)
      
      const response = await fetch('/api/employees/emp-1', {
        method: 'DELETE'
      })
      
      expect(response.status).toBe(200)
      
      // Verify employee is deleted by trying to get it
      const getResponse = await fetch('/api/employees/emp-1')
      expect(getResponse.status).toBe(404)
    })

    it('returns 404 for non-existent employee deletion', async () => {
      server.use(...employeeHandlers)
      
      const response = await fetch('/api/employees/non-existent', {
        method: 'DELETE'
      })
      
      expect(response.status).toBe(404)
    })
  })

  describe('Error Handling', () => {
    it('handles malformed JSON in POST request', async () => {
      server.use(...employeeHandlers)
      
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid-json'
      })
      
      expect(response.status).toBe(400)
    })

    it('simulates server errors occasionally', async () => {
      // This would test error simulation if implemented
      server.use(...employeeHandlers)
      
      // Multiple requests to potentially trigger error simulation
      const requests = Array.from({ length: 10 }, () => 
        fetch('/api/employees')
      )
      
      const responses = await Promise.all(requests)
      const statuses = responses.map(r => r.status)
      
      // Most should be successful
      const successCount = statuses.filter(s => s === 200).length
      expect(successCount).toBeGreaterThan(7)
    })
  })

  describe('Data Validation', () => {
    it('returns proper employee data structure', async () => {
      server.use(...employeeHandlers)
      
      const response = await fetch('/api/employees/emp-1')
      const data = await response.json()
      
      expect(data.data).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          employeeId: expect.any(String),
          firstName: expect.any(String),
          lastName: expect.any(String),
          email: expect.any(String),
          department: expect.any(String),
          position: expect.any(String),
          status: expect.oneOf(['active', 'inactive', 'terminated']),
          avatar: expect.any(String),
          phone: expect.any(String),
          startDate: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        })
      )
    })

    it('maintains data consistency across operations', async () => {
      server.use(...employeeHandlers)
      
      // Create employee
      const newEmployee = {
        firstName: 'Consistency',
        lastName: 'Test',
        email: 'consistency@test.com'
      }
      
      const createResponse = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmployee)
      })
      const createdData = await createResponse.json()
      const employeeId = createdData.data.id
      
      // Get employee
      const getResponse = await fetch(`/api/employees/${employeeId}`)
      const getData = await getResponse.json()
      
      expect(getData.data.firstName).toBe('Consistency')
      expect(getData.data.email).toBe('consistency@test.com')
    })
  })
})