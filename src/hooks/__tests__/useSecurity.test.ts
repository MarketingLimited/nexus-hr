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
      const mockEvents = {
        data: [
          {
            id: 'event-1',
            type: 'login',
            userId: 'user-1',
            timestamp: '2024-01-01T10:00:00Z',
            severity: 'info',
            description: 'User logged in successfully'
          }
        ],
        total: 1
      }

      vi.mocked(securityService.getSecurityEvents).mockResolvedValue(mockEvents)

      const { result } = renderHook(() => useSecurityEvents(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockEvents)
    })
  })

  describe('useActiveSessions', () => {
    it('should fetch active sessions successfully', async () => {
      const mockSessions = {
        data: [
          {
            id: 'session-1',
            userId: 'user-1',
            deviceId: 'device-1',
            ipAddress: '192.168.1.1',
            userAgent: 'Mozilla/5.0...',
            loginTime: '2024-01-01T09:00:00Z',
            lastActivity: '2024-01-01T10:00:00Z',
            location: 'New York, US'
          }
        ]
      }

      vi.mocked(securityService.getActiveSessions).mockResolvedValue(mockSessions)

      const { result } = renderHook(() => useActiveSessions(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockSessions)
    })
  })
})