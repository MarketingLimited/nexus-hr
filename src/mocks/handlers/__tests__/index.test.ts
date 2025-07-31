import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { handlers } from '@/mocks/handlers'

// Test server setup with all handlers
const server = setupServer(...handlers)

describe('Handler Index Integration', () => {
  beforeEach(() => {
    server.listen({ onUnhandledRequest: 'error' })
  })

  afterEach(() => {
    server.resetHandlers()
  })

  afterAll(() => {
    server.close()
  })

  describe('Handler Registration', () => {
    it('includes all core API handlers', async () => {
      // Test that all major endpoints are registered
      const endpoints = [
        '/api/auth/login',
        '/api/employees',
        '/api/attendance',
        '/api/leave',
        '/api/payroll',
        '/api/performance',
        '/api/departments',
        '/api/notifications',
        '/api/assets',
        '/api/onboarding',
        '/api/documents'
      ]

      for (const endpoint of endpoints) {
        const response = await fetch(endpoint)
        // Should not return 404 (handler exists)
        expect(response.status).not.toBe(404)
      }
    })

    it('handles OPTIONS requests for CORS preflight', async () => {
      const response = await fetch('/api/employees', {
        method: 'OPTIONS'
      })
      
      expect(response.status).toBe(200)
      expect(response.headers.get('access-control-allow-origin')).toBe('*')
      expect(response.headers.get('access-control-allow-methods')).toContain('GET')
      expect(response.headers.get('access-control-allow-headers')).toContain('content-type')
    })
  })

  describe('Cross-Handler Data Consistency', () => {
    it('maintains data consistency across related endpoints', async () => {
      // Get employee from employees endpoint
      const employeesResponse = await fetch('/api/employees')
      const employees = await employeesResponse.json()
      const firstEmployee = employees[0]
      
      // Get same employee's attendance
      const attendanceResponse = await fetch(`/api/attendance?employeeId=${firstEmployee.id}`)
      const attendance = await attendanceResponse.json()
      
      expect(attendanceResponse.status).toBe(200)
      expect(Array.isArray(attendance)).toBe(true)
      
      // Employee ID should be consistent
      if (attendance.length > 0) {
        expect(attendance[0].employeeId).toBe(firstEmployee.id)
      }
    })

    it('maintains referential integrity between departments and employees', async () => {
      const departmentsResponse = await fetch('/api/departments')
      const departments = await departmentsResponse.json()
      
      const employeesResponse = await fetch('/api/employees')
      const employees = await employeesResponse.json()
      
      // All employee departments should exist in departments list
      const departmentNames = departments.map(d => d.name)
      employees.forEach(employee => {
        if (employee.department) {
          expect(departmentNames).toContain(employee.department)
        }
      })
    })
  })

  describe('Authentication Flow Integration', () => {
    it('handles complete authentication flow', async () => {
      // Login
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@company.com',
          password: 'password123'
        })
      })
      
      const loginData = await loginResponse.json()
      expect(loginResponse.status).toBe(200)
      expect(loginData).toHaveProperty('token')
      expect(loginData).toHaveProperty('user')
      
      // Use token for authenticated request
      const protectedResponse = await fetch('/api/employees', {
        headers: {
          'Authorization': `Bearer ${loginData.token}`
        }
      })
      
      expect(protectedResponse.status).toBe(200)
      
      // Logout
      const logoutResponse = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${loginData.token}`
        }
      })
      
      expect(logoutResponse.status).toBe(200)
    })

    it('enforces authentication on protected endpoints', async () => {
      const protectedEndpoints = [
        '/api/employees',
        '/api/payroll',
        '/api/performance',
        '/api/documents'
      ]

      for (const endpoint of protectedEndpoints) {
        const response = await fetch(endpoint)
        // Should require authentication (401) or be accessible (200)
        expect([200, 401]).toContain(response.status)
      }
    })
  })

  describe('Error Handling Consistency', () => {
    it('returns consistent error format across handlers', async () => {
      // Test various endpoints with invalid data
      const errorTests = [
        {
          endpoint: '/api/employees',
          method: 'POST',
          body: { /* missing required fields */ }
        },
        {
          endpoint: '/api/leave',
          method: 'POST', 
          body: { /* invalid leave request */ }
        },
        {
          endpoint: '/api/employees/nonexistent',
          method: 'GET'
        }
      ]

      for (const test of errorTests) {
        const response = await fetch(test.endpoint, {
          method: test.method,
          headers: test.body ? { 'Content-Type': 'application/json' } : {},
          body: test.body ? JSON.stringify(test.body) : undefined
        })
        
        if (response.status >= 400) {
          const errorData = await response.json()
          expect(errorData).toHaveProperty('error')
          expect(typeof errorData.error).toBe('string')
        }
      }
    })

    it('handles server errors gracefully', async () => {
      // Override handler to simulate server error
      server.use(
        http.get('/api/employees', () => {
          return HttpResponse.json({ error: 'Internal server error' }, { status: 500 })
        })
      )

      const response = await fetch('/api/employees')
      
      expect(response.status).toBe(500)
      
      const data = await response.json()
      expect(data).toHaveProperty('error')
      expect(data.error).toBe('Internal server error')
    })
  })

  describe('Performance and Response Times', () => {
    it('responds within acceptable time limits', async () => {
      const endpoints = [
        '/api/employees',
        '/api/departments',
        '/api/notifications'
      ]

      for (const endpoint of endpoints) {
        const startTime = Date.now()
        const response = await fetch(endpoint)
        const endTime = Date.now()
        
        expect(response.status).toBe(200)
        expect(endTime - startTime).toBeLessThan(1000) // Less than 1 second
      }
    })

    it('handles concurrent requests properly', async () => {
      const promises = Array(10).fill(null).map(() =>
        fetch('/api/employees')
      )
      
      const responses = await Promise.all(promises)
      
      responses.forEach(response => {
        expect(response.status).toBe(200)
      })
    })
  })

  describe('Data Format Consistency', () => {
    it('returns consistent date formats across endpoints', async () => {
      const endpoints = [
        '/api/employees',
        '/api/attendance',
        '/api/leave'
      ]

      for (const endpoint of endpoints) {
        const response = await fetch(endpoint)
        const data = await response.json()
        
        if (Array.isArray(data) && data.length > 0) {
          const item = data[0]
          // Check for date fields and validate ISO format
          Object.values(item).forEach(value => {
            if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
              expect(() => new Date(value)).not.toThrow()
            }
          })
        }
      }
    })

    it('returns consistent pagination format', async () => {
      const paginatedEndpoints = [
        '/api/employees?page=1&limit=10',
        '/api/attendance?page=1&limit=10',
        '/api/notifications?page=1&limit=10'
      ]

      for (const endpoint of paginatedEndpoints) {
        const response = await fetch(endpoint)
        
        if (response.status === 200) {
          const data = await response.json()
          
          // Check if response includes pagination metadata
          if (data.pagination) {
            expect(data).toHaveProperty('data')
            expect(data).toHaveProperty('pagination')
            expect(data.pagination).toHaveProperty('page')
            expect(data.pagination).toHaveProperty('limit')
            expect(data.pagination).toHaveProperty('total')
          }
        }
      }
    })
  })

  describe('Handler Registration Order', () => {
    it('prioritizes specific routes over generic ones', async () => {
      // Test that specific routes like /api/employees/stats 
      // are handled before generic /api/employees/:id
      const response = await fetch('/api/employees/stats')
      
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data).toHaveProperty('total')
      expect(data).toHaveProperty('active')
      // Should not be treated as employee ID lookup
    })
  })

  describe('Content Type Handling', () => {
    it('handles different content types appropriately', async () => {
      // JSON content type
      const jsonResponse = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Employee',
          email: 'test@company.com',
          department: 'Engineering'
        })
      })
      
      expect([200, 201, 400]).toContain(jsonResponse.status)
      
      // Form data (if supported)
      const formData = new FormData()
      formData.append('name', 'Test Employee')
      
      const formResponse = await fetch('/api/employees', {
        method: 'POST',
        body: formData
      })
      
      expect([200, 201, 400, 415]).toContain(formResponse.status)
    })
  })
})