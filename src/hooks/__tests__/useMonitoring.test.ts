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
          status: 'healthy' as const,
          score: 95,
          checks: [
            {
              id: 'db-check',
              name: 'Database',
              category: 'performance' as const,
              status: 'pass' as const,
              message: 'Database is healthy',
              lastRun: '2024-01-01T10:00:00Z',
              duration: 150
            }
          ],
          lastUpdated: '2024-01-01T10:00:00Z'
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
          cpu: {
            usage: 45.2,
            cores: 8,
            loadAverage: [1.2, 1.5, 1.8]
          },
          memory: {
            used: 4.2,
            total: 16,
            percentage: 67.8,
            heap: {
              used: 2.1,
              total: 4.0
            }
          },
          storage: {
            database: {
              size: 1024,
              connections: 15,
              queryTime: 25.3
            },
            localStorage: {
              used: 500,
              quota: 1000,
              percentage: 50
            }
          },
          network: {
            latency: 12.5,
            throughput: 850,
            activeConnections: 42,
            failedRequests: 2
          },
          application: {
            responseTime: 150.3,
            errorRate: 0.1,
            activeUsers: 245,
            sessionsActive: 89
          },
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
            title: 'High CPU Usage',
            type: 'warning' as const,
            category: 'performance' as const,
            source: 'system-monitor',
            status: 'active' as const,
            message: 'High CPU usage detected',
            timestamp: '2024-01-01T10:00:00Z',
            createdAt: '2024-01-01T10:00:00Z',
            acknowledged: false
          }
        ]
      }

      vi.mocked(monitoringService.getAlerts).mockResolvedValue(mockAlerts)

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