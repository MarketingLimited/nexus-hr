import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { setupServer } from 'msw/node'
import { authHandlers } from '../auth'

const server = setupServer(...authHandlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('Auth Handlers', () => {
  describe('POST /api/auth/login', () => {
    it('should authenticate user with valid credentials', async () => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@company.com',
          password: 'admin123'
        })
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.user).toBeDefined()
      expect(data.token).toBeDefined()
      expect(data.refreshToken).toBeDefined()
      expect(data.user.email).toBe('admin@company.com')
    })

    it('should reject invalid credentials', async () => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'invalid@email.com',
          password: 'wrongpassword'
        })
      })

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error).toBe('Invalid credentials')
    })

    it('should handle missing credentials', async () => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Email and password required')
    })
  })

  describe('POST /api/auth/logout', () => {
    it('should logout user successfully', async () => {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        }
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.message).toBe('Logged out successfully')
    })

    it('should handle missing authorization header', async () => {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error).toBe('No token provided')
    })
  })

  describe('GET /api/auth/users', () => {
    it('should return users list', async () => {
      const response = await fetch('/api/auth/users', {
        headers: { 'Authorization': 'Bearer admin-token' }
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })

    it('should filter users by role', async () => {
      const response = await fetch('/api/auth/users?role=admin', {
        headers: { 'Authorization': 'Bearer admin-token' }
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })
  })

  describe('GET /api/auth/roles', () => {
    it('should return available roles', async () => {
      const response = await fetch('/api/auth/roles', {
        headers: { 'Authorization': 'Bearer admin-token' }
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
      expect(data.data).toContain('admin')
      expect(data.data).toContain('manager')
      expect(data.data).toContain('employee')
    })
  })
})