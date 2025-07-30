import { api, ApiResponse, PaginatedResponse } from './api'
import type { Notification, NotificationPreference, SystemAlert } from '../mocks/data/notifications'

export interface NotificationFilters {
  userId?: string
  category?: string
  isRead?: boolean
  priority?: string
  page?: number
  limit?: number
}

export interface AlertFilters {
  isActive?: boolean
  severity?: string
  targetAudience?: string
}

export interface NotificationStats {
  total: number
  unread: number
  read: number
  actionRequired: number
  byCategory: Record<string, number>
  byPriority: Record<string, number>
}

export const notificationService = {
  // Notification Management
  getNotifications: (filters: NotificationFilters = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString())
      }
    })
    
    return api.get<PaginatedResponse<Notification>>(`/notifications?${params}`)
  },

  getNotification: (id: string) => 
    api.get<ApiResponse<Notification>>(`/notifications/${id}`),

  createNotification: (notificationData: Partial<Notification>) => 
    api.post<ApiResponse<Notification>>('/notifications', notificationData),

  markAsRead: (id: string) => 
    api.put<ApiResponse<Notification>>(`/notifications/${id}/read`),

  markMultipleAsRead: (notificationIds: string[]) => 
    api.put<ApiResponse<Notification[]>>('/notifications/read-multiple', { notificationIds }),

  markAllAsRead: (userId: string) => 
    api.put<ApiResponse<Notification[]>>('/notifications/read-all', { userId }),

  deleteNotification: (id: string) => 
    api.delete<ApiResponse<{ message: string }>>(`/notifications/${id}`),

  // Action Notifications
  sendActionNotification: (notificationData: Partial<Notification>) => 
    api.post<ApiResponse<Notification>>('/notifications/action', notificationData),

  // Notification Preferences
  getNotificationPreferences: (userId: string) => 
    api.get<ApiResponse<NotificationPreference[]>>(`/notifications/preferences?userId=${userId}`),

  updateNotificationPreferences: (preferencesData: Partial<NotificationPreference>) => 
    api.put<ApiResponse<NotificationPreference>>('/notifications/preferences', preferencesData),

  // Notification Statistics
  getNotificationStats: (userId?: string) => {
    const params = userId ? `?userId=${userId}` : ''
    return api.get<ApiResponse<NotificationStats>>(`/notifications/stats${params}`)
  },

  // System Alerts
  getSystemAlerts: (filters: AlertFilters = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString())
      }
    })
    
    return api.get<ApiResponse<SystemAlert[]>>(`/notifications/alerts?${params}`)
  },

  createSystemAlert: (alertData: Partial<SystemAlert>) => 
    api.post<ApiResponse<SystemAlert>>('/notifications/alerts', alertData),

  updateSystemAlert: (id: string, alertData: Partial<SystemAlert>) => 
    api.put<ApiResponse<SystemAlert>>(`/notifications/alerts/${id}`, alertData),

  deleteSystemAlert: (id: string) => 
    api.delete<ApiResponse<{ message: string }>>(`/notifications/alerts/${id}`)
}