import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  notificationService, 
  type NotificationFilters, 
  type AlertFilters,
  type NotificationStats 
} from '../services/notificationService'
import type { Notification, NotificationPreference, SystemAlert } from '../mocks/data/notifications'

// Query Keys
export const notificationKeys = {
  all: ['notifications'] as const,
  notifications: () => [...notificationKeys.all, 'notifications'] as const,
  notification: (id: string) => [...notificationKeys.notifications(), id] as const,
  preferences: (userId: string) => [...notificationKeys.all, 'preferences', userId] as const,
  stats: (userId?: string) => [...notificationKeys.all, 'stats', userId] as const,
  alerts: () => [...notificationKeys.all, 'alerts'] as const,
  alert: (id: string) => [...notificationKeys.alerts(), id] as const,
  unreadCount: (userId: string) => [...notificationKeys.all, 'unread-count', userId] as const,
  recent: (userId: string, limit: number) => 
    [...notificationKeys.all, 'recent', userId, limit] as const,
}

// Notification Management Hooks
export const useNotifications = (filters?: NotificationFilters) => {
  return useQuery({
    queryKey: notificationKeys.notifications(),
    queryFn: () => notificationService.getNotifications(filters),
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

export const useNotification = (id: string) => {
  return useQuery({
    queryKey: notificationKeys.notification(id),
    queryFn: () => notificationService.getNotification(id),
    enabled: !!id,
  })
}

export const useCreateNotification = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: notificationService.createNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.notifications() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.stats() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount })
    },
  })
}

export const useMarkAsRead = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.notification(id) })
      queryClient.invalidateQueries({ queryKey: notificationKeys.notifications() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.stats() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount })
    },
  })
}

export const useMarkMultipleAsRead = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: notificationService.markMultipleAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.notifications() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.stats() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount })
    },
  })
}

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.notifications() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.stats() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount })
    },
  })
}

export const useDeleteNotification = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: notificationService.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.notifications() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.stats() })
    },
  })
}

// Action Notifications Hooks
export const useSendActionNotification = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: notificationService.sendActionNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.notifications() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.stats() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount })
    },
  })
}

// Notification Preferences Hooks
export const useNotificationPreferences = (userId: string) => {
  return useQuery({
    queryKey: notificationKeys.preferences(userId),
    queryFn: () => notificationService.getNotificationPreferences(userId),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: notificationService.updateNotificationPreferences,
    onSuccess: (_, variables) => {
      if (variables.userId) {
        queryClient.invalidateQueries({ 
          queryKey: notificationKeys.preferences(variables.userId) 
        })
      }
    },
  })
}

// Notification Statistics Hooks
export const useNotificationStats = (userId?: string) => {
  return useQuery({
    queryKey: notificationKeys.stats(userId),
    queryFn: () => notificationService.getNotificationStats(userId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const useUnreadCount = (userId: string) => {
  return useQuery({
    queryKey: notificationKeys.unreadCount(userId),
    queryFn: () => notificationService.getUnreadCount?.(userId),
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  })
}

export const useRecentNotifications = (userId: string, limit: number = 5) => {
  return useQuery({
    queryKey: notificationKeys.recent(userId, limit),
    queryFn: () => notificationService.getRecentNotifications?.(userId, limit),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

// System Alerts Hooks
export const useSystemAlerts = (filters?: AlertFilters) => {
  return useQuery({
    queryKey: notificationKeys.alerts(),
    queryFn: () => notificationService.getSystemAlerts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useSystemAlert = (id: string) => {
  return useQuery({
    queryKey: notificationKeys.alert(id),
    queryFn: () => notificationService.getSystemAlert?.(id),
    enabled: !!id,
  })
}

export const useCreateSystemAlert = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: notificationService.createSystemAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.alerts() })
    },
  })
}

export const useUpdateSystemAlert = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SystemAlert> }) =>
      notificationService.updateSystemAlert(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.alert(variables.id) })
      queryClient.invalidateQueries({ queryKey: notificationKeys.alerts() })
    },
  })
}

export const useDeleteSystemAlert = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: notificationService.deleteSystemAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.alerts() })
    },
  })
}

// Real-time Notification Hooks
export const useNotificationUpdates = (userId: string, enabled: boolean = true) => {
  const queryClient = useQueryClient()
  
  // This hook can be used to set up real-time notification updates
  // For now, it uses polling, but could be enhanced with WebSockets
  return useQuery({
    queryKey: notificationKeys.unreadCount(userId),
    queryFn: () => notificationService.getUnreadCount?.(userId),
    enabled: enabled && !!userId,
    refetchInterval: 30 * 1000, // Poll every 30 seconds
    onSuccess: (data) => {
      // If there are new notifications, invalidate the main notifications query
      if (data && typeof data === 'object' && 'unread' in data && data.unread > 0) {
        queryClient.invalidateQueries({ queryKey: notificationKeys.notifications() })
      }
    },
  })
}

// Bulk Operations Hooks
export const useBulkNotification = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: notificationService.sendBulkNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.notifications() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.stats() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount })
    },
  })
}

export const useScheduleNotification = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: notificationService.scheduleNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.notifications() })
    },
  })
}