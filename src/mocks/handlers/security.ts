import { http, HttpResponse } from 'msw'
import { SecurityEvent, ActiveSession, SecurityMetrics, DeviceFingerprint } from '../../services/securityService'

// Mock data
let securityEvents: SecurityEvent[] = [
  {
    id: '1',
    type: 'login_success',
    userId: '1',
    userEmail: 'admin@company.com',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    details: { loginMethod: 'password' },
    severity: 'low',
    location: 'New York, US'
  },
  {
    id: '2',
    type: 'login_failed',
    userId: '2',
    userEmail: 'user@company.com',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    ip: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    details: { reason: 'invalid_password', attempts: 3 },
    severity: 'medium',
    location: 'London, UK'
  },
  {
    id: '3',
    type: 'suspicious_activity',
    userId: '3',
    userEmail: 'manager@company.com',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    ip: '10.0.0.50',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
    details: { reason: 'unusual_location', previousLocation: 'New York', currentLocation: 'Tokyo' },
    severity: 'high',
    location: 'Tokyo, JP'
  }
]

const activeSessions: ActiveSession[] = [
  {
    id: 'sess_1',
    userId: '1',
    userEmail: 'admin@company.com',
    loginTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    lastActivity: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    location: 'New York, US',
    isActive: true
  },
  {
    id: 'sess_2',
    userId: '2',
    userEmail: 'user@company.com',
    loginTime: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    lastActivity: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    ip: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    location: 'London, UK',
    isActive: true
  }
]

let deviceFingerprints: DeviceFingerprint[] = [
  {
    id: 'device_1',
    userId: '1',
    deviceHash: 'hash_123456',
    firstSeen: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    lastSeen: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    trusted: true,
    deviceInfo: {
      browser: 'Chrome 120.0.0.0',
      os: 'Windows 10',
      screen: '1920x1080',
      timezone: 'America/New_York'
    }
  },
  {
    id: 'device_2',
    userId: '2',
    deviceHash: 'hash_789012',
    firstSeen: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    lastSeen: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    trusted: false,
    deviceInfo: {
      browser: 'Safari 17.0',
      os: 'macOS 14.0',
      screen: '2560x1600',
      timezone: 'Europe/London'
    }
  }
]

export const securityHandlers = [
  // Get security events
  http.get('/api/security/events', ({ request }) => {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    const type = url.searchParams.get('type')
    const severity = url.searchParams.get('severity')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    let filteredEvents = [...securityEvents]

    if (userId) {
      filteredEvents = filteredEvents.filter(event => event.userId === userId)
    }
    if (type) {
      filteredEvents = filteredEvents.filter(event => event.type === type)
    }
    if (severity) {
      filteredEvents = filteredEvents.filter(event => event.severity === severity)
    }

    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedEvents = filteredEvents.slice(startIndex, endIndex)

    return HttpResponse.json({
      data: paginatedEvents,
      meta: {
        total: filteredEvents.length,
        page,
        limit,
        totalPages: Math.ceil(filteredEvents.length / limit)
      }
    })
  }),

  // Log security event
  http.post('/api/security/events', async ({ request }) => {
    const event = await request.json() as Omit<SecurityEvent, 'id' | 'timestamp'>
    const newEvent: SecurityEvent = {
      ...event,
      id: `evt_${Date.now()}`,
      timestamp: new Date().toISOString()
    }
    securityEvents.unshift(newEvent)
    return HttpResponse.json({ data: newEvent })
  }),

  // Get active sessions
  http.get('/api/security/sessions', ({ request }) => {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')

    let filteredSessions = activeSessions.filter(session => session.isActive)
    if (userId) {
      filteredSessions = filteredSessions.filter(session => session.userId === userId)
    }

    return HttpResponse.json({ data: filteredSessions })
  }),

  // Terminate session
  http.delete('/api/security/sessions/:sessionId', ({ params }) => {
    const { sessionId } = params
    const sessionIndex = activeSessions.findIndex(session => session.id === sessionId)
    
    if (sessionIndex === -1) {
      return HttpResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    activeSessions[sessionIndex].isActive = false
    return HttpResponse.json({ message: 'Session terminated successfully' })
  }),

  // Get security metrics
  http.get('/api/security/metrics', () => {
    const now = new Date()
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const recentEvents = securityEvents.filter(event => 
      new Date(event.timestamp) > last24Hours
    )
    const failedLogins = recentEvents.filter(event => event.type === 'login_failed').length
    const activeSessionsCount = activeSessions.filter(session => session.isActive).length

    const metrics: SecurityMetrics = {
      totalSessions: activeSessionsCount,
      activeSessions: activeSessionsCount,
      failedLogins24h: failedLogins,
      securityEvents24h: recentEvents.length,
      riskScore: Math.min(100, failedLogins * 10 + recentEvents.filter(e => e.severity === 'high').length * 20),
      complianceStatus: failedLogins > 10 ? 'non_compliant' : failedLogins > 5 ? 'warning' : 'compliant'
    }

    return HttpResponse.json({ data: metrics })
  }),

  // Get device fingerprints
  http.get('/api/security/devices', ({ request }) => {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')

    let filteredDevices = [...deviceFingerprints]
    if (userId) {
      filteredDevices = filteredDevices.filter(device => device.userId === userId)
    }

    return HttpResponse.json({ data: filteredDevices })
  }),

  // Trust device
  http.post('/api/security/devices/:deviceId/trust', ({ params }) => {
    const { deviceId } = params
    const deviceIndex = deviceFingerprints.findIndex(device => device.id === deviceId)
    
    if (deviceIndex === -1) {
      return HttpResponse.json({ error: 'Device not found' }, { status: 404 })
    }

    deviceFingerprints[deviceIndex].trusted = true
    return HttpResponse.json({ data: deviceFingerprints[deviceIndex] })
  }),

  // Revoke device
  http.delete('/api/security/devices/:deviceId', ({ params }) => {
    const { deviceId } = params
    const deviceIndex = deviceFingerprints.findIndex(device => device.id === deviceId)
    
    if (deviceIndex === -1) {
      return HttpResponse.json({ error: 'Device not found' }, { status: 404 })
    }

    deviceFingerprints.splice(deviceIndex, 1)
    return HttpResponse.json({ message: 'Device revoked successfully' })
  })
]