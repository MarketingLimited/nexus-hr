import { describe, it, expect, beforeEach } from 'vitest'
import { server } from '@/test-utils/msw-server'
import { authHandlers } from '../auth'

describe('Auth Handlers', () => {
  beforeEach(() => {
    server.resetHandlers()
    // Clear any stored session state
    if (typeof window !== 'undefined') {
      localStorage.clear()
      sessionStorage.clear()
    }
  })

  describe('POST /api/auth/login', () => {
    it('authenticates user with valid credentials', async () => {
      server.use(...authHandlers)
      
      const credentials = {
        email: 'admin@company.com',
        password: 'admin123'
      }
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('data')
      expect(data.data).toHaveProperty('user')
      expect(data.data).toHaveProperty('token')
      expect(data.data.user).toMatchObject({
        email: 'admin@company.com',
        role: 'admin'
      })
    })

    it('rejects invalid credentials', async () => {
      server.use(...authHandlers)
      
      const credentials = {
        email: 'admin@company.com',
        password: 'wrongpassword'
      }
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })
      
      expect(response.status).toBe(401)
    })

    it('rejects non-existent user', async () => {
      server.use(...authHandlers)
      
      const credentials = {
        email: 'nonexistent@company.com',
        password: 'password123'
      }
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })
      
      expect(response.status).toBe(401)
    })

    it('handles missing email field', async () => {
      server.use(...authHandlers)
      
      const credentials = {
        password: 'admin123'
      }
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })
      
      expect(response.status).toBe(400)
    })

    it('handles missing password field', async () => {
      server.use(...authHandlers)
      
      const credentials = {
        email: 'admin@company.com'
      }
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })
      
      expect(response.status).toBe(400)
    })

    it('authenticates different user types', async () => {
      server.use(...authHandlers)
      
      // Test HR user
      const hrCredentials = {
        email: 'hr@company.com',
        password: 'hr123'
      }
      
      const hrResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hrCredentials)
      })
      const hrData = await hrResponse.json()
      
      expect(hrResponse.status).toBe(200)
      expect(hrData.data.user.role).toBe('hr')
      
      // Test Employee user
      const empCredentials = {
        email: 'employee@company.com',
        password: 'emp123'
      }
      
      const empResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(empCredentials)
      })
      const empData = await empResponse.json()
      
      expect(empResponse.status).toBe(200)
      expect(empData.data.user.role).toBe('employee')
    })

    it('applies delay to simulate network latency', async () => {
      server.use(...authHandlers)
      
      const credentials = {
        email: 'admin@company.com',
        password: 'admin123'
      }
      
      const startTime = Date.now()
      await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })
      const endTime = Date.now()
      
      expect(endTime - startTime).toBeGreaterThan(200) // At least 200ms delay
    })
  })

  describe('POST /api/auth/logout', () => {
    it('logs out user successfully', async () => {
      server.use(...authHandlers)
      
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json' 
        }
      })
      
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data).toHaveProperty('message', 'Logged out successfully')
    })

    it('handles logout without authorization header', async () => {
      server.use(...authHandlers)
      
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      // Should still succeed for logout
      expect(response.status).toBe(200)
    })
  })

  describe('GET /api/auth/me', () => {
    it('returns current user with valid token', async () => {
      server.use(...authHandlers)
      
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': 'Bearer valid-token' }
      })
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('data')
      expect(data.data).toHaveProperty('id')
      expect(data.data).toHaveProperty('email')
      expect(data.data).toHaveProperty('role')
    })

    it('returns 401 with invalid token', async () => {
      server.use(...authHandlers)
      
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': 'Bearer invalid-token' }
      })
      
      expect(response.status).toBe(401)
    })

    it('returns 401 without authorization header', async () => {
      server.use(...authHandlers)
      
      const response = await fetch('/api/auth/me')
      
      expect(response.status).toBe(401)
    })
  })

  describe('POST /api/auth/refresh', () => {
    it('refreshes token successfully', async () => {
      server.use(...authHandlers)
      
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json' 
        }
      })
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('data')
      expect(data.data).toHaveProperty('token')
      expect(data.data).toHaveProperty('user')
    })

    it('rejects refresh with invalid token', async () => {
      server.use(...authHandlers)
      
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 
          'Authorization': 'Bearer invalid-token',
          'Content-Type': 'application/json' 
        }
      })
      
      expect(response.status).toBe(401)
    })
  })

  describe('Data Structure Validation', () => {
    it('returns proper user data structure on login', async () => {
      server.use(...authHandlers)
      
      const credentials = {
        email: 'admin@company.com',
        password: 'admin123'
      }
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })
      const data = await response.json()
      
      expect(data.data.user).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          email: expect.any(String),
          firstName: expect.any(String),
          lastName: expect.any(String),
          role: expect.oneOf(['admin', 'hr', 'manager', 'employee']),
          avatar: expect.any(String),
          permissions: expect.any(Array)
        })
      )
    })

    it('includes proper token format', async () => {
      server.use(...authHandlers)
      
      const credentials = {
        email: 'admin@company.com',
        password: 'admin123'
      }
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })
      const data = await response.json()
      
      expect(data.data.token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/)
    })
  })

  describe('Error Handling', () => {
    it('handles malformed JSON in login request', async () => {
      server.use(...authHandlers)
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid-json'
      })
      
      expect(response.status).toBe(400)
    })

    it('provides appropriate error messages', async () => {
      server.use(...authHandlers)
      
      const credentials = {
        email: 'admin@company.com',
        password: 'wrongpassword'
      }
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })
      const data = await response.json()
      
      expect(response.status).toBe(401)
      expect(data).toHaveProperty('message')
      expect(typeof data.message).toBe('string')
    })
  })

  describe('Security Features', () => {
    it('does not expose sensitive information in responses', async () => {
      server.use(...authHandlers)
      
      const credentials = {
        email: 'admin@company.com',
        password: 'admin123'
      }
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })
      const data = await response.json()
      
      expect(data.data.user).not.toHaveProperty('password')
      expect(data.data.user).not.toHaveProperty('passwordHash')
    })
  })
})