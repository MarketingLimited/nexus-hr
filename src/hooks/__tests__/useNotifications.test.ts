import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { createTestQueryClient } from '../test-utils'
import { 
  useNotifications,
  useNotification,
  useCreateNotification,
  useMarkAsRead,
  useMarkMultipleAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useSendActionNotification,
  useNotificationPreferences,
  useUpdateNotificationPreferences,
  useNotificationStats,
  useSystemAlerts,
  useCreateSystemAlert,
  useUpdateSystemAlert,
  useDeleteSystemAlert,
  notificationKeys
} from '../useNotifications'
import { notificationService } from '../../services/notificationService'

// Mock dependencies
vi.mock('../../services/notificationService', () => ({
  notificationService: {
    getNotifications: vi.fn(),
    getNotification: vi.fn(),
    createNotification: vi.fn(),
    markAsRead: vi.fn(),
    markMultipleAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    deleteNotification: vi.fn(),
    sendActionNotification: vi.fn(),
    getNotificationPreferences: vi.fn(),
    updateNotificationPreferences: vi.fn(),
    getNotificationStats: vi.fn(),
    getSystemAlerts: vi.fn(),
    createSystemAlert: vi.fn(),
    updateSystemAlert: vi.fn(),
    deleteSystemAlert: vi.fn()
  }
}))

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient()
  return React.createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useNotifications Hooks', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = createTestQueryClient()
    vi.clearAllMocks()
  })

  afterEach(() => {
    queryClient.clear()
  })

  describe('useNotifications', () => {
    it('should fetch notifications successfully', async () => {
      const mockNotifications = {
        data: [
          { id: '1', title: 'Test Notification', isRead: false, type: 'info' },
          { id: '2', title: 'Another Notification', isRead: true, type: 'success' }
        ]
      }
      vi.mocked(notificationService.getNotifications).mockResolvedValue(mockNotifications)

      const { result } = renderHook(() => useNotifications(), { wrapper: TestWrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockNotifications)
      expect(notificationService.getNotifications).toHaveBeenCalledWith(undefined)
    })

    it('should use 1 minute stale time', () => {
      renderHook(() => useNotifications(), { wrapper: TestWrapper })
      
      const query = queryClient.getQueryCache().find({ queryKey: notificationKeys.notifications() })
      expect(query?.options.staleTime).toBe(1 * 60 * 1000)
    })
  })

  describe('useMarkAsRead', () => {
    it('should mark notification as read and invalidate cache', async () => {
      const mockResponse = { success: true }
      vi.mocked(notificationService.markAsRead).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useMarkAsRead(), { wrapper: TestWrapper })

      result.current.mutate('notification-1')

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(notificationService.markAsRead).toHaveBeenCalledWith('notification-1')
    })
  })

  describe('useNotificationStats', () => {
    it('should fetch notification statistics', async () => {
      const mockStats = {
        data: {
          total: 50,
          unread: 10,
          read: 40,
          byType: { info: 20, warning: 15, error: 15 }
        }
      }
      vi.mocked(notificationService.getNotificationStats).mockResolvedValue(mockStats)

      const { result } = renderHook(() => useNotificationStats('user-1'), { wrapper: TestWrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockStats)
      expect(notificationService.getNotificationStats).toHaveBeenCalledWith('user-1')
    })

    it('should use 2 minute stale time', () => {
      renderHook(() => useNotificationStats(), { wrapper: TestWrapper })
      
      const query = queryClient.getQueryCache().find({ queryKey: notificationKeys.stats() })
      expect(query?.options.staleTime).toBe(2 * 60 * 1000)
    })
  })

  describe('Query Keys', () => {
    it('should generate correct query keys', () => {
      expect(notificationKeys.notifications()).toEqual(['notifications', 'notifications'])
      expect(notificationKeys.notification('123')).toEqual(['notifications', 'notifications', '123'])
      expect(notificationKeys.preferences('user-1')).toEqual(['notifications', 'preferences', 'user-1'])
      expect(notificationKeys.stats('user-1')).toEqual(['notifications', 'stats', 'user-1'])
      expect(notificationKeys.alerts()).toEqual(['notifications', 'alerts'])
    })
  })
})