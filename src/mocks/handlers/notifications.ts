import { http, HttpResponse } from 'msw'
import { 
  generateNotifications,
  Notification
} from '../data/notifications'
import { mockEmployees } from '../data/employees'

let notifications = generateNotifications(mockEmployees.map(emp => emp.id))

export const notificationHandlers = [
  // Get all notifications
  http.get('/api/notifications', ({ request }) => {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    const type = url.searchParams.get('type')
    const priority = url.searchParams.get('priority')
    const read = url.searchParams.get('read')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    let filteredNotifications = notifications

    if (userId) {
      filteredNotifications = filteredNotifications.filter(n => n.userId === userId)
    }

    if (type) {
      filteredNotifications = filteredNotifications.filter(n => n.type === type)
    }

    if (priority) {
      filteredNotifications = filteredNotifications.filter(n => n.priority === priority)
    }

    if (read !== null) {
      const isRead = read === 'true'
      filteredNotifications = filteredNotifications.filter(n => n.read === isRead)
    }

    // Sort by creation date (newest first)
    filteredNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const paginatedNotifications = filteredNotifications.slice(offset, offset + limit)

    return HttpResponse.json({
      data: paginatedNotifications,
      meta: {
        total: filteredNotifications.length,
        offset,
        limit,
        hasMore: offset + limit < filteredNotifications.length
      }
    })
  }),

  // Get notification by ID
  http.get('/api/notifications/:id', ({ params }) => {
    const notification = notifications.find(n => n.id === params.id)
    if (!notification) {
      return HttpResponse.json({ error: 'Notification not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: notification })
  }),

  // Create new notification
  http.post('/api/notifications', async ({ request }) => {
    const newNotificationData = await request.json() as Partial<Notification>
    const newNotification: Notification = {
      id: crypto.randomUUID(),
      read: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...newNotificationData
    } as Notification

    notifications.unshift(newNotification) // Add to beginning for newest first
    return HttpResponse.json({ data: newNotification }, { status: 201 })
  }),

  // Mark notification as read
  http.post('/api/notifications/:id/read', ({ params }) => {
    const notificationIndex = notifications.findIndex(n => n.id === params.id)
    if (notificationIndex === -1) {
      return HttpResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    notifications[notificationIndex] = {
      ...notifications[notificationIndex],
      read: true,
      readAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return HttpResponse.json({ data: notifications[notificationIndex] })
  }),

  // Mark notification as unread
  http.post('/api/notifications/:id/unread', ({ params }) => {
    const notificationIndex = notifications.findIndex(n => n.id === params.id)
    if (notificationIndex === -1) {
      return HttpResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    notifications[notificationIndex] = {
      ...notifications[notificationIndex],
      read: false,
      readAt: undefined,
      updatedAt: new Date().toISOString()
    }

    return HttpResponse.json({ data: notifications[notificationIndex] })
  }),

  // Mark all notifications as read for a user
  http.post('/api/notifications/mark-all-read', async ({ request }) => {
    const { userId } = await request.json() as { userId: string }
    
    const updatedCount = notifications.filter(n => n.userId === userId && !n.read).length
    
    notifications = notifications.map(notification => 
      notification.userId === userId && !notification.read
        ? {
            ...notification,
            read: true,
            readAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        : notification
    )

    return HttpResponse.json({ 
      data: { 
        message: `${updatedCount} notifications marked as read`,
        updatedCount
      } 
    })
  }),

  // Delete notification
  http.delete('/api/notifications/:id', ({ params }) => {
    const notificationIndex = notifications.findIndex(n => n.id === params.id)
    if (notificationIndex === -1) {
      return HttpResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    notifications.splice(notificationIndex, 1)
    return HttpResponse.json({ message: 'Notification deleted successfully' })
  }),

  // Get notification count/summary for a user
  http.get('/api/notifications/summary', ({ request }) => {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')

    if (!userId) {
      return HttpResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const userNotifications = notifications.filter(n => n.userId === userId)
    
    const summary = {
      total: userNotifications.length,
      unread: userNotifications.filter(n => !n.read).length,
      read: userNotifications.filter(n => n.read).length,
      byType: userNotifications.reduce((acc, n) => {
        acc[n.type] = (acc[n.type] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      byPriority: userNotifications.reduce((acc, n) => {
        acc[n.priority] = (acc[n.priority] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      recent: userNotifications
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
    }

    return HttpResponse.json({ data: summary })
  }),

  // Send bulk notifications
  http.post('/api/notifications/bulk', async ({ request }) => {
    const { userIds, notificationData } = await request.json() as {
      userIds: string[]
      notificationData: Omit<Notification, 'id' | 'userId' | 'read' | 'createdAt' | 'updatedAt'>
    }

    const newNotifications = userIds.map(userId => ({
      id: crypto.randomUUID(),
      userId,
      read: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...notificationData
    }))

    notifications.unshift(...newNotifications)

    return HttpResponse.json({ 
      data: { 
        message: `${newNotifications.length} notifications sent`,
        notifications: newNotifications
      } 
    }, { status: 201 })
  })
]