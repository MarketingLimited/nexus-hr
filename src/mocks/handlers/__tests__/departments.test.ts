import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { setupServer } from 'msw/node'
import { departmentHandlers } from '../departments'

const server = setupServer(...departmentHandlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('Department Handlers', () => {
  describe('GET /api/departments', () => {
    it('should return all departments', async () => {
      const response = await fetch('/api/departments')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
      expect(data.data.length).toBeGreaterThan(0)
      
      // Check department structure
      const department = data.data[0]
      expect(department.id).toBeDefined()
      expect(department.name).toBeDefined()
      expect(department.description).toBeDefined()
      expect(department.head).toBeDefined()
      expect(department.location).toBeDefined()
    })

    it('should filter departments by search term', async () => {
      const response = await fetch('/api/departments?search=Engineering')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })

    it('should filter departments by location', async () => {
      const response = await fetch('/api/departments?location=New York')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })
  })

  describe('GET /api/departments/:id', () => {
    it('should return specific department', async () => {
      // First get a department ID
      const listResponse = await fetch('/api/departments')
      const listData = await listResponse.json()
      const departmentId = listData.data[0].id

      const response = await fetch(`/api/departments/${departmentId}`)

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.data.id).toBe(departmentId)
      expect(data.data.name).toBeDefined()
    })

    it('should return 404 for non-existent department', async () => {
      const response = await fetch('/api/departments/non-existent')

      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data.error).toBe('Department not found')
    })
  })

  describe('POST /api/departments', () => {
    it('should create new department', async () => {
      const newDepartment = {
        name: 'Research & Development',
        description: 'Innovation and product development',
        head: 'Dr. Jane Smith',
        location: 'San Francisco',
        budget: 2000000,
        employeeCount: 15,
        costCenter: 'CC1234'
      }

      const response = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDepartment)
      })

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data.data.id).toBeDefined()
      expect(data.data.name).toBe(newDepartment.name)
      expect(data.data.description).toBe(newDepartment.description)
      expect(data.data.createdAt).toBeDefined()
      expect(data.data.updatedAt).toBeDefined()
    })
  })

  describe('PUT /api/departments/:id', () => {
    it('should update existing department', async () => {
      // First get a department ID
      const listResponse = await fetch('/api/departments')
      const listData = await listResponse.json()
      const departmentId = listData.data[0].id

      const updates = {
        name: 'Updated Department Name',
        budget: 3000000
      }

      const response = await fetch(`/api/departments/${departmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.data.name).toBe(updates.name)
      expect(data.data.budget).toBe(updates.budget)
      expect(data.data.updatedAt).toBeDefined()
    })

    it('should return 404 for non-existent department', async () => {
      const response = await fetch('/api/departments/non-existent', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test' })
      })

      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data.error).toBe('Department not found')
    })
  })

  describe('DELETE /api/departments/:id', () => {
    it('should delete department', async () => {
      // First create a department to delete
      const newDepartment = {
        name: 'Temporary Department',
        description: 'Department to be deleted',
        head: 'Test Head',
        location: 'Test Location',
        budget: 1000000,
        employeeCount: 5,
        costCenter: 'CC9999'
      }

      const createResponse = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDepartment)
      })
      const createData = await createResponse.json()
      const departmentId = createData.data.id

      const response = await fetch(`/api/departments/${departmentId}`, {
        method: 'DELETE'
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.message).toBe('Department deleted successfully')
    })

    it('should return 404 for non-existent department', async () => {
      const response = await fetch('/api/departments/non-existent', {
        method: 'DELETE'
      })

      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data.error).toBe('Department not found')
    })
  })

  describe('GET /api/departments/hierarchy', () => {
    it('should return department hierarchy', async () => {
      const response = await fetch('/api/departments/hierarchy')

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
      
      // Check hierarchy structure
      if (data.data.length > 0) {
        const parentDept = data.data[0]
        expect(parentDept.department).toBeDefined()
        expect(Array.isArray(parentDept.children)).toBe(true)
      }
    })
  })
})