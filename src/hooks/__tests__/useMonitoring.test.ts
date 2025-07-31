import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import React from 'react'
import { useSystemHealth, usePerformanceMetrics, useSystemAlerts, useCreateAlertRule, useRunDiagnostics } from '../useMonitoring'
import { monitoringService } from '@/services/monitoringService'

// Mock the monitoring service
vi.mock('@/services/monitoringService', () => ({
  monitoringService: {
    getSystemHealth: vi.fn(),
    getPerformanceMetrics: vi.fn(),
    getSystemAlerts: vi.fn(),
    createAlertRule: vi.fn(),
    runDiagnostics: vi.fn()
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

describe('useMonitoring hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useSystemHealth', () => {
    it('should fetch system health successfully', async () => {
      const mockHealth = {
        data: {
          status: 'healthy',
          uptime: 99.5,
          lastCheck: '2024-01-01T10:00:00Z',
          services: [
            { name: 'Database', status: 'healthy' },
            { name: 'API', status: 'healthy' }
          ]
        }
      }

      vi.mocked(monitoringService.getSystemHealth).mockResolvedValue(mockHealth)

      const { result } = renderHook(() => useSystemHealth(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockHealth)
    })
  })

  describe('usePerformanceMetrics', () => {
    it('should fetch performance metrics successfully', async () => {
      const mockMetrics = {
        data: {
          cpuUsage: 45.2,
          memoryUsage: 67.8,
          diskUsage: 23.1,
          networkLatency: 12.5,
          responseTime: 150.3,
          timestamp: '2024-01-01T10:00:00Z'
        }
      }

      vi.mocked(monitoringService.getPerformanceMetrics).mockResolvedValue(mockMetrics)

      const { result } = renderHook(() => usePerformanceMetrics('1h'), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockMetrics)
    })
  })

  describe('useSystemAlerts', () => {
    it('should fetch system alerts successfully', async () => {
      const mockAlerts = {
        data: [
          {
            id: 'alert-1',
            type: 'warning',
            message: 'High CPU usage detected',
            timestamp: '2024-01-01T10:00:00Z',
            acknowledged: false
          }
        ]
      }

      vi.mocked(monitoringService.getSystemAlerts).mockResolvedValue(mockAlerts)

      const { result } = renderHook(() => useSystemAlerts(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockAlerts)
    })
  })
})