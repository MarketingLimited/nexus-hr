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
    getAlerts: vi.fn(),
    getDashboards: vi.fn(),
    getLogs: vi.fn(),
    createAlertRule: vi.fn(),
    updateAlertRule: vi.fn(),
    deleteAlertRule: vi.fn(),
    acknowledgeAlert: vi.fn(),
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
        status: 'healthy' as const,
        uptime: 99.9,
        lastCheck: '2024-01-01T10:00:00Z',
        services: [
          { name: 'database', status: 'healthy' },
          { name: 'api', status: 'healthy' }
        ]
      }

      vi.mocked(monitoringService.getSystemHealth).mockResolvedValue(mockHealth)

      const { result } = renderHook(() => useMonitoring().useSystemHealth(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockHealth)
      expect(monitoringService.getSystemHealth).toHaveBeenCalledTimes(1)
    })

    it('should handle system health fetch error', async () => {
      vi.mocked(monitoringService.getSystemHealth).mockRejectedValue(new Error('Service unavailable'))

      const { result } = renderHook(() => useMonitoring().useSystemHealth(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeInstanceOf(Error)
    })
  })

  describe('usePerformanceMetrics', () => {
    it('should fetch performance metrics successfully', async () => {
      const mockMetrics = {
        cpuUsage: 45.2,
        memoryUsage: 67.8,
        diskUsage: 23.4,
        networkLatency: 12.5,
        responseTime: 156.7,
        timestamp: '2024-01-01T10:00:00Z'
      }

      vi.mocked(monitoringService.getPerformanceMetrics).mockResolvedValue(mockMetrics)

      const { result } = renderHook(() => useMonitoring().usePerformanceMetrics(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockMetrics)
    })
  })

  describe('useAlerts', () => {
    it('should fetch alerts successfully', async () => {
      const mockAlerts = [
        {
          id: 'alert-1',
          type: 'warning',
          message: 'High CPU usage detected',
          timestamp: '2024-01-01T10:00:00Z',
          acknowledged: false
        }
      ]

      vi.mocked(monitoringService.getAlerts).mockResolvedValue(mockAlerts)

      const { result } = renderHook(() => useMonitoring().useAlerts(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockAlerts)
    })
  })

  describe('useCreateAlertRule', () => {
    it('should create alert rule successfully', async () => {
      const mockRule = {
        id: 'rule-1',
        name: 'High CPU Alert',
        condition: 'cpu_usage > 80',
        enabled: true
      }

      vi.mocked(monitoringService.createAlertRule).mockResolvedValue(mockRule)

      const { result } = renderHook(() => useMonitoring().useCreateAlertRule(), {
        wrapper: createWrapper()
      })

      result.current.mutate({
        name: 'High CPU Alert',
        condition: 'cpu_usage > 80',
        enabled: true
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(monitoringService.createAlertRule).toHaveBeenCalledWith({
        name: 'High CPU Alert',
        condition: 'cpu_usage > 80',
        enabled: true
      })
    })
  })

  describe('useRunDiagnostics', () => {
    it('should run diagnostics successfully', async () => {
      const mockDiagnostics = {
        overall: 'healthy',
        checks: [
          { name: 'database_connection', status: 'pass' },
          { name: 'api_response_time', status: 'pass' }
        ]
      }

      vi.mocked(monitoringService.runDiagnostics).mockResolvedValue(mockDiagnostics)

      const { result } = renderHook(() => useMonitoring().useRunDiagnostics(), {
        wrapper: createWrapper()
      })

      result.current.mutate()

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockDiagnostics)
    })
  })
})