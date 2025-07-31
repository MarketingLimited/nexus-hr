import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { setupServer } from 'msw/node'
import { employeeHandlers } from '../employees'

const server = setupServer(...employeeHandlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('Employee Handlers', () => {
  describe('GET /api/employees', () => {
    it('should return paginated employees list', async () => {
      const response = await fetch('/api/employees?page=1&limit=10')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
      expect(data.meta).toBeDefined()
      expect(data.meta.page).toBe(1)
      expect(data.meta.limit).toBe(10)
      expect(data.meta.total).toBeGreaterThan(0)
    })

    it('should filter employees by search term', async () => {
      const response = await fetch('/api/employees?search=John')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })

    it('should filter employees by department', async () => {
      const response = await fetch('/api/employees?department=Engineering')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })

    it('should filter employees by status', async () => {
      const response = await fetch('/api/employees?status=active')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })
  })

  describe('GET /api/employees/:id', () => {
    it('should return specific employee', async () => {
      const response = await fetch('/api/employees/emp-001')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.data.id).toBe('emp-001')
      expect(data.data.name).toBeDefined()
      expect(data.data.email).toBeDefined()
    })

    it('should return 404 for non-existent employee', async () => {
      const response = await fetch('/api/employees/non-existent')

      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data.error).toBe('Employee not found')
    })
  })

  describe('POST /api/employees', () => {
    it('should create new employee', async () => {
      const newEmployee = {
        name: 'Test Employee',
        email: 'test@company.com',
        department: 'Engineering',
        position: 'Developer',
        hireDate: '2024-01-01'
      }

      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmployee)
      })

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data.data.id).toBeDefined()
      expect(data.data.employeeId).toBeDefined()
      expect(data.data.name).toBe(newEmployee.name)
      expect(data.data.email).toBe(newEmployee.email)
    })
  })

  describe('PUT /api/employees/:id', () => {
    it('should update existing employee', async () => {
      const updates = {
        name: 'Updated Name',
        position: 'Senior Developer'
      }

      const response = await fetch('/api/employees/emp-001', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.data.name).toBe(updates.name)
      expect(data.data.position).toBe(updates.position)
    })

    it('should return 404 for non-existent employee', async () => {
      const response = await fetch('/api/employees/non-existent', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test' })
      })

      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data.error).toBe('Employee not found')
    })
  })

  describe('DELETE /api/employees/:id', () => {
    it('should delete employee', async () => {
      const response = await fetch('/api/employees/emp-to-delete', {
        method: 'DELETE'
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.message).toBe('Employee deleted successfully')
    })

    it('should return 404 for non-existent employee', async () => {
      const response = await fetch('/api/employees/non-existent', {
        method: 'DELETE'
      })

      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data.error).toBe('Employee not found')
    })
  })

  describe('GET /api/employees/stats', () => {
    it('should return employee statistics', async () => {
      const response = await fetch('/api/employees/stats')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.data.totalEmployees).toBeGreaterThan(0)
      expect(data.data.byStatus).toBeDefined()
      expect(data.data.byDepartment).toBeDefined()
      expect(data.data.byLocation).toBeDefined()
    })
  })
})