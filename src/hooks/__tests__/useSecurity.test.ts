import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import React from 'react'
import { useSecurityEvents, useActiveSessions, useSecurityMetrics, useTerminateSession, useTrustDevice, useRevokeDevice, useLogSecurityEvent } from '../useSecurity'
import { securityService } from '@/services/securityService'

// Mock the security service
vi.mock('@/services/securityService', () => ({
  securityService: {
    getSecurityEvents: vi.fn(),
    getActiveSessions: vi.fn(),
    getSecurityMetrics: vi.fn(),
    getDeviceFingerprints: vi.fn(),
    terminateSession: vi.fn(),
    trustDevice: vi.fn(),
    revokeDevice: vi.fn(),
    logSecurityEvent: vi.fn()
  }
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })
  
  return ({ children }: { children: React.ReactNode }) => 
    React.createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useSecurity hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useSecurityEvents', () => {
    it('should fetch security events successfully', async () => {
      const mockEvents = [
        {
          id: 'event-1',
          type: 'login_success' as const,
          userId: 'user-1',
          userEmail: 'user@example.com',
          timestamp: '2024-01-01T10:00:00Z',
          ip: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          details: {},
          severity: 'low' as const
        }
      ]

      vi.mocked(securityService.getSecurityEvents).mockResolvedValue(mockEvents)

      const { result } = renderHook(() => useSecurity().useSecurityEvents(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockEvents)
      expect(securityService.getSecurityEvents).toHaveBeenCalledTimes(1)
    })

    it('should handle security events fetch error', async () => {
      vi.mocked(securityService.getSecurityEvents).mockRejectedValue(new Error('Unauthorized'))

      const { result } = renderHook(() => useSecurity().useSecurityEvents(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeInstanceOf(Error)
    })
  })

  describe('useActiveSessions', () => {
    it('should fetch active sessions successfully', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          userId: 'user-1',
          userEmail: 'user@example.com',
          loginTime: '2024-01-01T09:00:00Z',
          lastActivity: '2024-01-01T10:00:00Z',
          ip: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          isActive: true
        }
      ]

      vi.mocked(securityService.getActiveSessions).mockResolvedValue(mockSessions)

      const { result } = renderHook(() => useSecurity().useActiveSessions(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockSessions)
    })
  })

  describe('useSecurityMetrics', () => {
    it('should fetch security metrics successfully', async () => {
      const mockMetrics = {
        totalSessions: 150,
        activeSessions: 45,
        failedLogins24h: 12,
        securityEvents24h: 234,
        riskScore: 25,
        complianceStatus: 'compliant' as const
      }

      vi.mocked(securityService.getSecurityMetrics).mockResolvedValue(mockMetrics)

      const { result } = renderHook(() => useSecurity().useSecurityMetrics(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockMetrics)
    })
  })

  describe('useTerminateSession', () => {
    it('should terminate session successfully', async () => {
      vi.mocked(securityService.terminateSession).mockResolvedValue({ success: true })

      const { result } = renderHook(() => useSecurity().useTerminateSession(), {
        wrapper: createWrapper()
      })

      result.current.mutate('session-1')

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(securityService.terminateSession).toHaveBeenCalledWith('session-1')
    })
  })

  describe('useTrustDevice', () => {
    it('should trust device successfully', async () => {
      vi.mocked(securityService.trustDevice).mockResolvedValue({ success: true })

      const { result } = renderHook(() => useSecurity().useTrustDevice(), {
        wrapper: createWrapper()
      })

      result.current.mutate('device-1')

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(securityService.trustDevice).toHaveBeenCalledWith('device-1')
    })
  })

  describe('useRevokeDevice', () => {
    it('should revoke device successfully', async () => {
      vi.mocked(securityService.revokeDevice).mockResolvedValue({ success: true })

      const { result } = renderHook(() => useSecurity().useRevokeDevice(), {
        wrapper: createWrapper()
      })

      result.current.mutate('device-1')

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(securityService.revokeDevice).toHaveBeenCalledWith('device-1')
    })
  })

  describe('useLogSecurityEvent', () => {
    it('should log security event successfully', async () => {
      const mockEvent = {
        type: 'login_success' as const,
        userId: 'user-1',
        userEmail: 'user@example.com',
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        details: {},
        severity: 'low' as const
      }

      vi.mocked(securityService.logSecurityEvent).mockResolvedValue({ success: true })

      const { result } = renderHook(() => useSecurity().useLogSecurityEvent(), {
        wrapper: createWrapper()
      })

      result.current.mutate(mockEvent)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(securityService.logSecurityEvent).toHaveBeenCalledWith(mockEvent)
    })
  })
})