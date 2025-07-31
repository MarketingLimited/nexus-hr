import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import React from 'react'
import { useSync, useSyncOperations, useSyncConflicts, useStartSync, useResolveConflict } from '../useSync'
import { syncService } from '@/services/syncService'

// Mock the sync service
vi.mock('@/services/syncService', () => ({
  syncService: {
    getStats: vi.fn(),
    getOperations: vi.fn(),
    getConflicts: vi.fn(),
    startSync: vi.fn(),
    resolveConflict: vi.fn(),
    queueOperation: vi.fn()
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

describe('useSync hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useSync', () => {
    it('should fetch sync stats successfully', async () => {
      const mockStats = {
        lastSync: '2024-01-01T10:00:00Z',
        totalOperations: 150,
        pendingOperations: 5,
        successfulOperations: 140,
        failedOperations: 5
      }

      vi.mocked(syncService.getStats).mockResolvedValue(mockStats)

      const { result } = renderHook(() => useSync(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockStats)
      expect(syncService.getStats).toHaveBeenCalledTimes(1)
    })

    it('should handle sync stats fetch error', async () => {
      vi.mocked(syncService.getStats).mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useSync(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeInstanceOf(Error)
    })
  })

  describe('useSyncOperations', () => {
    it('should fetch sync operations successfully', async () => {
      const mockOperations = [
        { id: '1', type: 'employee_update', status: 'completed' },
        { id: '2', type: 'leave_request', status: 'pending' }
      ]

      vi.mocked(syncService.getOperations).mockResolvedValue(mockOperations)

      const { result } = renderHook(() => useSyncOperations(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockOperations)
    })
  })

  describe('useSyncConflicts', () => {
    it('should fetch sync conflicts successfully', async () => {
      const mockConflicts = [
        { id: '1', entityType: 'employee', conflictType: 'update' }
      ]

      vi.mocked(syncService.getConflicts).mockResolvedValue(mockConflicts)

      const { result } = renderHook(() => useSyncConflicts(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockConflicts)
    })
  })

  describe('useStartSync', () => {
    it('should start sync successfully', async () => {
      vi.mocked(syncService.startSync).mockResolvedValue({ success: true })

      const { result } = renderHook(() => useStartSync(), {
        wrapper: createWrapper()
      })

      result.current.mutate()

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(syncService.startSync).toHaveBeenCalledTimes(1)
    })
  })

  describe('useResolveConflict', () => {
    it('should resolve conflict successfully', async () => {
      vi.mocked(syncService.resolveConflict).mockResolvedValue({ success: true })

      const { result } = renderHook(() => useResolveConflict(), {
        wrapper: createWrapper()
      })

      result.current.mutate({
        conflictId: 'conflict-1',
        resolution: 'merge'
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(syncService.resolveConflict).toHaveBeenCalledWith('conflict-1', 'merge')
    })
  })
})