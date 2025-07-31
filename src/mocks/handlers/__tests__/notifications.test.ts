import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { setupServer } from 'msw/node'
import { notificationHandlers } from '../notifications'

const server = setupServer(...notificationHandlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('Notification Handlers', () => {
  describe('GET /api/notifications', () => {
    it('should return notifications list', async () => {
      const response = await fetch('/api/notifications', {
        headers: { 'Authorization': 'Bearer valid-token' }
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
      expect(data.pagination).toBeDefined()
    })

    it('should filter notifications by type', async () => {
      const response = await fetch('/api/notifications?type=leave_request', {
        headers: { 'Authorization': 'Bearer valid-token' }
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })

    it('should filter notifications by read status', async () => {
      const response = await fetch('/api/notifications?read=false', {
        headers: { 'Authorization': 'Bearer valid-token' }
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(Array.isArray(data.data)).toBe(true)
    })

    it('should support pagination', async () => {
      const response = await fetch('/api/notifications?page=1&limit=10', {
        headers: { 'Authorization': 'Bearer valid-token' }
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.pagination.page).toBe(1)
      expect(data.pagination.limit).toBe(10)
    })
  })

  describe('POST /api/notifications', () => {
    it('should create a new notification', async () => {
      const newNotification = {
        type: 'leave_request',
        title: 'New Leave Request',
        message: 'John Doe has submitted a leave request',
        recipientId: 'user1'
      }

      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token'
        },
        body: JSON.stringify(newNotification)
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.id).toBeDefined()
      expect(data.type).toBe('leave_request')
      expect(data.title).toBe('New Leave Request')
      expect(data.read).toBe(false)
    })

    it('should require authorization', async () => {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })

      expect(response.status).toBe(401)
    })
  })

  describe('PUT /api/notifications/:id/read', () => {
    it('should mark notification as read', async () => {
      const response = await fetch('/api/notifications/notification1/read', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        }
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.message).toBe('Notification marked as read')
    })

    it('should handle non-existent notification', async () => {
      const response = await fetch('/api/notifications/nonexistent/read', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        }
      })

      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data.error).toBe('Notification not found')
    })
  })

  describe('PUT /api/notifications/mark-all-read', () => {
    it('should mark all notifications as read', async () => {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        }
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.message).toBe('All notifications marked as read')
      expect(data.updatedCount).toBeDefined()
    })
  })

  describe('DELETE /api/notifications/:id', () => {
    it('should delete a notification', async () => {
      const response = await fetch('/api/notifications/notification1', {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer valid-token' }
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.message).toBe('Notification deleted successfully')
    })

    it('should handle non-existent notification', async () => {
      const response = await fetch('/api/notifications/nonexistent', {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer valid-token' }
      })

      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data.error).toBe('Notification not found')
    })
  })

  describe('GET /api/notifications/stats', () => {
    it('should return notification statistics', async () => {
      const response = await fetch('/api/notifications/stats', {
        headers: { 'Authorization': 'Bearer valid-token' }
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.total).toBeDefined()
      expect(data.unread).toBeDefined()
      expect(data.byType).toBeDefined()
    })
  })

  describe('POST /api/notifications/send-bulk', () => {
    it('should send bulk notifications', async () => {
      const bulkNotification = {
        type: 'system_announcement',
        title: 'System Maintenance',
        message: 'System will be down for maintenance',
        recipientIds: ['user1', 'user2', 'user3']
      }

      const response = await fetch('/api/notifications/send-bulk', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token'
        },
        body: JSON.stringify(bulkNotification)
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.message).toBe('Bulk notifications sent successfully')
      expect(data.sentCount).toBe(3)
    })

    it('should require admin authorization for bulk send', async () => {
      const response = await fetch('/api/notifications/send-bulk', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer user-token'
        },
        body: JSON.stringify({})
      })

      expect(response.status).toBe(403)
      const data = await response.json()
      expect(data.error).toBe('Insufficient permissions')
    })
  })

  describe('GET /api/notifications/preferences', () => {
    it('should return user notification preferences', async () => {
      const response = await fetch('/api/notifications/preferences', {
        headers: { 'Authorization': 'Bearer valid-token' }
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.emailNotifications).toBeDefined()
      expect(data.pushNotifications).toBeDefined()
      expect(data.notificationTypes).toBeDefined()
    })
  })

  describe('PUT /api/notifications/preferences', () => {
    it('should update notification preferences', async () => {
      const preferences = {
        emailNotifications: true,
        pushNotifications: false,
        notificationTypes: {
          leave_requests: true,
          payroll_updates: false,
          system_announcements: true
        }
      }

      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify(preferences)
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.message).toBe('Preferences updated successfully')
      expect(data.preferences).toEqual(preferences)
    })
  })
})