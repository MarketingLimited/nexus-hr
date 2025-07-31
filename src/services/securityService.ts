export interface SecurityEvent {
  id: string
  type: 'login_success' | 'login_failed' | 'password_change' | 'role_change' | 'permission_change' | 'suspicious_activity'
  userId: string
  userEmail: string
  timestamp: string
  ip: string
  userAgent: string
  details: Record<string, any>
  severity: 'low' | 'medium' | 'high' | 'critical'
  location?: string
}

export interface ActiveSession {
  id: string
  userId: string
  userEmail: string
  loginTime: string
  lastActivity: string
  ip: string
  userAgent: string
  location?: string
  isActive: boolean
}

export interface SecurityMetrics {
  totalSessions: number
  activeSessions: number
  failedLogins24h: number
  securityEvents24h: number
  riskScore: number
  complianceStatus: 'compliant' | 'warning' | 'non_compliant'
}

export interface DeviceFingerprint {
  id: string
  userId: string
  deviceHash: string
  firstSeen: string
  lastSeen: string
  trusted: boolean
  deviceInfo: {
    browser: string
    os: string
    screen: string
    timezone: string
  }
}

class SecurityService {
  async getSecurityEvents(params?: {
    userId?: string
    type?: string
    severity?: string
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.set(key, value.toString())
        }
      })
    }
    
    const response = await fetch(`/api/security/events?${searchParams}`)
    if (!response.ok) throw new Error('Failed to fetch security events')
    return response.json()
  }

  async getActiveSessions(userId?: string) {
    const params = userId ? `?userId=${userId}` : ''
    const response = await fetch(`/api/security/sessions${params}`)
    if (!response.ok) throw new Error('Failed to fetch active sessions')
    return response.json()
  }

  async terminateSession(sessionId: string) {
    const response = await fetch(`/api/security/sessions/${sessionId}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to terminate session')
    return response.json()
  }

  async getSecurityMetrics() {
    const response = await fetch('/api/security/metrics')
    if (!response.ok) throw new Error('Failed to fetch security metrics')
    return response.json()
  }

  async getDeviceFingerprints(userId: string) {
    const response = await fetch(`/api/security/devices?userId=${userId}`)
    if (!response.ok) throw new Error('Failed to fetch device fingerprints')
    return response.json()
  }

  async trustDevice(deviceId: string) {
    const response = await fetch(`/api/security/devices/${deviceId}/trust`, {
      method: 'POST'
    })
    if (!response.ok) throw new Error('Failed to trust device')
    return response.json()
  }

  async revokeDevice(deviceId: string) {
    const response = await fetch(`/api/security/devices/${deviceId}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to revoke device')
    return response.json()
  }

  async logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>) {
    const response = await fetch('/api/security/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    })
    if (!response.ok) throw new Error('Failed to log security event')
    return response.json()
  }
}

export const securityService = new SecurityService()