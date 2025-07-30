import { http, HttpResponse } from 'msw'
import { 
  generateUsers,
  generateSessions,
  roles,
  User,
  Session,
  Permission
} from '../data/auth'
import { mockEmployees } from '../data/employees'

let users = generateUsers(50)
let userSessions = generateSessions(users.map(u => u.id))
let userRoles = [...roles]

// Default admin user for testing
const adminUser = users.find(u => u.role.name === 'Admin') || users[0]

export const authHandlers = [
  // Authentication
  http.post('/api/auth/login', async ({ request }) => {
    const { email, password } = await request.json() as { email: string, password: string }
    
    const user = users.find(u => u.email === email && u.isActive === true)
    
    if (!user) {
      return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // In a real app, you'd verify the password hash
    // For demo purposes, we'll accept any password for existing users
    
    // Create session
    const session: UserSession = {
      id: crypto.randomUUID(),
      userId: user.id,
      token: `token_${crypto.randomUUID()}`,
      refreshToken: `refresh_${crypto.randomUUID()}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      ipAddress: '127.0.0.1',
      userAgent: 'Mock Browser'
    }

    userSessions.push(session)

    // Update last login
    const userIndex = users.findIndex(u => u.id === user.id)
    users[userIndex] = {
      ...users[userIndex],
      lastLogin: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return HttpResponse.json({
      data: {
        user: {
          ...user,
          lastLogin: users[userIndex].lastLogin
        },
        session: {
          token: session.token,
          refreshToken: session.refreshToken,
          expiresAt: session.expiresAt
        }
      }
    })
  }),

  http.post('/api/auth/logout', async ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return HttpResponse.json({ error: 'No authorization header' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const sessionIndex = userSessions.findIndex(s => s.token === token)
    
    if (sessionIndex !== -1) {
      userSessions.splice(sessionIndex, 1)
    }

    return HttpResponse.json({ message: 'Logged out successfully' })
  }),

  http.post('/api/auth/refresh', async ({ request }) => {
    const { refreshToken } = await request.json() as { refreshToken: string }
    
    const sessionIndex = userSessions.findIndex(s => s.refreshToken === refreshToken)
    if (sessionIndex === -1) {
      return HttpResponse.json({ error: 'Invalid refresh token' }, { status: 401 })
    }

    const session = userSessions[sessionIndex]
    const newToken = `token_${crypto.randomUUID()}`
    const newRefreshToken = `refresh_${crypto.randomUUID()}`
    const newExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    userSessions[sessionIndex] = {
      ...session,
      token: newToken,
      refreshToken: newRefreshToken,
      expiresAt: newExpiresAt,
      lastActivity: new Date().toISOString()
    }

    return HttpResponse.json({
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
        expiresAt: newExpiresAt
      }
    })
  }),

  // Get current user
  http.get('/api/auth/me', ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return HttpResponse.json({ error: 'No authorization header' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const session = userSessions.find(s => s.token === token)
    
    if (!session) {
      return HttpResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    if (new Date(session.expiresAt) < new Date()) {
      return HttpResponse.json({ error: 'Token expired' }, { status: 401 })
    }

    const user = users.find(u => u.id === session.userId)
    if (!user) {
      return HttpResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update last activity
    const sessionIndex = userSessions.findIndex(s => s.id === session.id)
    userSessions[sessionIndex] = {
      ...session,
      lastActivity: new Date().toISOString()
    }

    return HttpResponse.json({ data: user })
  }),

  // User Management
  http.get('/api/auth/users', ({ request }) => {
    const url = new URL(request.url)
    const role = url.searchParams.get('role')
    const status = url.searchParams.get('status')
    const search = url.searchParams.get('search')

    let filteredUsers = users

    if (role) {
      filteredUsers = filteredUsers.filter(u => u.role === role)
    }

    if (status) {
      filteredUsers = filteredUsers.filter(u => u.status === status)
    }

    if (search) {
      filteredUsers = filteredUsers.filter(u => 
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.employeeId?.toLowerCase().includes(search.toLowerCase())
      )
    }

    return HttpResponse.json({ data: filteredUsers })
  }),

  http.get('/api/auth/users/:id', ({ params }) => {
    const user = users.find(u => u.id === params.id)
    if (!user) {
      return HttpResponse.json({ error: 'User not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: user })
  }),

  http.post('/api/auth/users', async ({ request }) => {
    const newUserData = await request.json() as Partial<User>
    const newUser: User = {
      id: crypto.randomUUID(),
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...newUserData
    } as User

    users.push(newUser)
    return HttpResponse.json({ data: newUser }, { status: 201 })
  }),

  http.put('/api/auth/users/:id', async ({ params, request }) => {
    const userIndex = users.findIndex(u => u.id === params.id)
    if (userIndex === -1) {
      return HttpResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const updates = await request.json() as Partial<User>
    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    return HttpResponse.json({ data: users[userIndex] })
  }),

  http.delete('/api/auth/users/:id', ({ params }) => {
    const userIndex = users.findIndex(u => u.id === params.id)
    if (userIndex === -1) {
      return HttpResponse.json({ error: 'User not found' }, { status: 404 })
    }

    users.splice(userIndex, 1)
    return HttpResponse.json({ message: 'User deleted successfully' })
  }),

  // Password Management
  http.post('/api/auth/change-password', async ({ request }) => {
    const { currentPassword, newPassword } = await request.json() as {
      currentPassword: string
      newPassword: string
    }

    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return HttpResponse.json({ error: 'No authorization header' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const session = userSessions.find(s => s.token === token)
    
    if (!session) {
      return HttpResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // In a real app, you'd verify the current password
    // For demo purposes, we'll just update the password hash
    const userIndex = users.findIndex(u => u.id === session.userId)
    if (userIndex === -1) {
      return HttpResponse.json({ error: 'User not found' }, { status: 404 })
    }

    users[userIndex] = {
      ...users[userIndex],
      passwordHash: `hashed_${newPassword}`, // Mock hash
      updatedAt: new Date().toISOString()
    }

    return HttpResponse.json({ message: 'Password changed successfully' })
  }),

  http.post('/api/auth/forgot-password', async ({ request }) => {
    const { email } = await request.json() as { email: string }
    
    const user = users.find(u => u.email === email)
    if (!user) {
      return HttpResponse.json({ error: 'Email not found' }, { status: 404 })
    }

    // In a real app, you'd send an email with reset link
    const resetToken = crypto.randomUUID()
    
    return HttpResponse.json({ 
      message: 'Password reset link sent to email',
      resetToken // In real app, this would be sent via email
    })
  }),

  // Roles and Permissions
  http.get('/api/auth/roles', () => {
    return HttpResponse.json({ data: userRoles })
  }),

  http.get('/api/auth/permissions', ({ request }) => {
    const url = new URL(request.url)
    const role = url.searchParams.get('role')

    if (role) {
      const userRole = userRoles.find(r => r.name === role)
      if (!userRole) {
        return HttpResponse.json({ error: 'Role not found' }, { status: 404 })
      }
      return HttpResponse.json({ data: userRole.permissions })
    }

    // Return all unique permissions
    const allPermissions = Array.from(
      new Set(userRoles.flatMap(role => role.permissions))
    )
    
    return HttpResponse.json({ data: allPermissions })
  }),

  // User Sessions
  http.get('/api/auth/sessions', ({ request }) => {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')

    let filteredSessions = userSessions

    if (userId) {
      filteredSessions = filteredSessions.filter(s => s.userId === userId)
    }

    return HttpResponse.json({ data: filteredSessions })
  }),

  http.delete('/api/auth/sessions/:id', ({ params }) => {
    const sessionIndex = userSessions.findIndex(s => s.id === params.id)
    if (sessionIndex === -1) {
      return HttpResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    userSessions.splice(sessionIndex, 1)
    return HttpResponse.json({ message: 'Session terminated successfully' })
  })
]