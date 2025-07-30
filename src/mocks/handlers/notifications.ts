import { http, delay } from 'msw'
import { 
  generateNotifications,
  generateNotificationPreferences,
  generateSystemAlerts,
  Notification,
  NotificationPreference,
  SystemAlert
} from '../data/notifications'
import { mockEmployees } from '../data/employees'

// Generate mock data
const userIds = mockEmployees.map(emp => emp.id)
const notifications = generateNotifications(userIds, 200)
const notificationPreferences = generateNotificationPreferences(userIds)
const systemAlerts = generateSystemAlerts(20)

export const notificationHandlers = [
  // Get notifications
  http.get('/api/notifications', async ({ request }) => {
    await delay(Math.random() * 300 + 100)
    
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    const isRead = url.searchParams.get('isRead')
    const category = url.searchParams.get('category')
    const priority = url.searchParams.get('priority')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const offset = parseInt(url.searchParams.get('offset') || '0')
    
    let filtered = [...notifications]
    
    if (userId) {
      filtered = filtered.filter(notif => notif.userId === userId)
    }
    
    if (isRead !== null) {
      filtered = filtered.filter(notif => notif.isRead === (isRead === 'true'))
    }
    
    if (category) {
      filtered = filtered.filter(notif => notif.category === category)
    }
    
    if (priority) {
      filtered = filtered.filter(notif => notif.priority === priority)
    }
    
    // Sort by newest first
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    // Apply pagination
    const paginatedResults = filtered.slice(offset, offset + limit)
    
    return Response.json({
      data: paginatedResults,
      meta: {
        total: filtered.length,
        limit,
        offset,
        hasMore: offset + limit < filtered.length,
      },
      message: 'Notifications retrieved successfully'
    })
  }),

  // Get notification by ID
  http.get('/api/notifications/:id', async ({ params }) => {
    await delay(Math.random() * 200 + 50)
    
    const notification = notifications.find(n => n.id === params.id)
    
    if (!notification) {
      return new Response('Notification not found', { status: 404 })
    }
    
    return Response.json({
      data: notification,
      message: 'Notification retrieved successfully'
    })
  }),

  // Mark notification as read
  http.put('/api/notifications/:id/read', async ({ params }) => {
    await delay(Math.random() * 200 + 50)
    
    const notificationIndex = notifications.findIndex(n => n.id === params.id)
    
    if (notificationIndex === -1) {
      return new Response('Notification not found', { status: 404 })
    }
    
    notifications[notificationIndex] = {
      ...notifications[notificationIndex],
      isRead: true,
      readAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    return Response.json({
      data: notifications[notificationIndex],
      message: 'Notification marked as read'
    })
  }),

  // Mark multiple notifications as read
  http.put('/api/notifications/read-multiple', async ({ request }) => {
    await delay(Math.random() * 300 + 100)
    
    const { notificationIds } = await request.json() as { notificationIds: string[] }
    const updatedNotifications: Notification[] = []
    
    notificationIds.forEach(id => {
      const notificationIndex = notifications.findIndex(n => n.id === id)
      if (notificationIndex !== -1) {
        notifications[notificationIndex] = {
          ...notifications[notificationIndex],
          isRead: true,
          readAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        updatedNotifications.push(notifications[notificationIndex])
      }
    })
    
    return Response.json({
      data: updatedNotifications,
      message: `${updatedNotifications.length} notifications marked as read`
    })
  }),

  // Mark all notifications as read for a user
  http.put('/api/notifications/read-all', async ({ request }) => {
    await delay(Math.random() * 300 + 100)
    
    const { userId } = await request.json() as { userId: string }
    const updatedNotifications: Notification[] = []
    
    notifications.forEach((notification, index) => {
      if (notification.userId === userId && !notification.isRead) {
        notifications[index] = {
          ...notification,
          isRead: true,
          readAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        updatedNotifications.push(notifications[index])
      }
    })
    
    return Response.json({
      data: updatedNotifications,
      message: `${updatedNotifications.length} notifications marked as read`
    })
  }),

  // Delete notification
  http.delete('/api/notifications/:id', async ({ params }) => {
    await delay(Math.random() * 200 + 50)
    
    const notificationIndex = notifications.findIndex(n => n.id === params.id)
    
    if (notificationIndex === -1) {
      return new Response('Notification not found', { status: 404 })
    }
    
    notifications.splice(notificationIndex, 1)
    
    return Response.json({
      message: 'Notification deleted successfully'
    })
  }),

  // Create notification
  http.post('/api/notifications', async ({ request }) => {
    await delay(Math.random() * 300 + 100)
    
    const data = await request.json() as Partial<Notification>
    
    const newNotification: Notification = {
      id: `notif-${notifications.length + 1}`,
      userId: data.userId!,
      type: data.type || 'info',
      category: data.category || 'general',
      title: data.title!,
      message: data.message!,
      priority: data.priority || 'medium',
      isRead: false,
      action: data.action,
      metadata: data.metadata || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    notifications.push(newNotification)
    
    return Response.json({
      data: newNotification,
      message: 'Notification created successfully'
    })
  }),

  // Get notification preferences
  http.get('/api/notifications/preferences', async ({ request }) => {
    await delay(Math.random() * 200 + 50)
    
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    
    if (!userId) {
      return new Response('User ID is required', { status: 400 })
    }
    
    const preferences = notificationPreferences.find(p => p.userId === userId)
    
    if (!preferences) {
      // Return default preferences
      const defaultPreferences: NotificationPreference = {
        id: `pref-${notificationPreferences.length + 1}`,
        userId,
        emailEnabled: true,
        pushEnabled: true,
        smsEnabled: false,
        categories: {
          leave: { email: true, push: true, sms: false, frequency: 'immediate' },
          payroll: { email: true, push: true, sms: false, frequency: 'immediate' },
          performance: { email: true, push: false, sms: false, frequency: 'daily' },
          hr: { email: true, push: true, sms: false, frequency: 'immediate' },
          system: { email: false, push: true, sms: false, frequency: 'immediate' },
          general: { email: false, push: true, sms: false, frequency: 'immediate' },
        },
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
        weekendNotifications: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      return Response.json({
        data: defaultPreferences,
        message: 'Default notification preferences retrieved'
      })
    }
    
    return Response.json({
      data: preferences,
      message: 'Notification preferences retrieved successfully'
    })
  }),

  // Update notification preferences
  http.put('/api/notifications/preferences', async ({ request }) => {
    await delay(Math.random() * 300 + 100)
    
    const data = await request.json() as Partial<NotificationPreference>
    
    if (!data.userId) {
      return new Response('User ID is required', { status: 400 })
    }
    
    const preferencesIndex = notificationPreferences.findIndex(p => p.userId === data.userId)
    
    if (preferencesIndex === -1) {
      // Create new preferences
      const newPreferences: NotificationPreference = {
        id: `pref-${notificationPreferences.length + 1}`,
        userId: data.userId,
        emailEnabled: data.emailEnabled ?? true,
        pushEnabled: data.pushEnabled ?? true,
        smsEnabled: data.smsEnabled ?? false,
        categories: data.categories || {},
        quietHoursStart: data.quietHoursStart || '22:00',
        quietHoursEnd: data.quietHoursEnd || '08:00',
        weekendNotifications: data.weekendNotifications ?? false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      notificationPreferences.push(newPreferences)
      
      return Response.json({
        data: newPreferences,
        message: 'Notification preferences created successfully'
      })
    } else {
      // Update existing preferences
      const updatedPreferences = {
        ...notificationPreferences[preferencesIndex],
        ...data,
        updatedAt: new Date().toISOString(),
      }
      
      notificationPreferences[preferencesIndex] = updatedPreferences
      
      return Response.json({
        data: updatedPreferences,
        message: 'Notification preferences updated successfully'
      })
    }
  }),

  // Get system alerts
  http.get('/api/notifications/system-alerts', async ({ request }) => {
    await delay(Math.random() * 200 + 50)
    
    const url = new URL(request.url)
    const isActive = url.searchParams.get('isActive')
    const severity = url.searchParams.get('severity')
    
    let filtered = [...systemAlerts]
    
    if (isActive !== null) {
      filtered = filtered.filter(alert => alert.isActive === (isActive === 'true'))
    }
    
    if (severity) {
      filtered = filtered.filter(alert => alert.severity === severity)
    }
    
    return Response.json({
      data: filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      message: 'System alerts retrieved successfully'
    })
  }),

  // Create system alert
  http.post('/api/notifications/system-alerts', async ({ request }) => {
    await delay(Math.random() * 300 + 100)
    
    const data = await request.json() as Partial<SystemAlert>
    
    const newAlert: SystemAlert = {
      id: `alert-${systemAlerts.length + 1}`,
      type: data.type || 'maintenance',
      severity: data.severity || 'medium',
      title: data.title!,
      message: data.message!,
      affectedServices: data.affectedServices || [],
      isActive: true,
      targetAudience: data.targetAudience || 'all',
      startTime: data.startTime || new Date().toISOString(),
      endTime: data.endTime,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    systemAlerts.push(newAlert)
    
    return Response.json({
      data: newAlert,
      message: 'System alert created successfully'
    })
  }),

  // Update system alert
  http.put('/api/notifications/system-alerts/:id', async ({ params, request }) => {
    await delay(Math.random() * 300 + 100)
    
    const data = await request.json() as Partial<SystemAlert>
    const alertIndex = systemAlerts.findIndex(a => a.id === params.id)
    
    if (alertIndex === -1) {
      return new Response('System alert not found', { status: 404 })
    }
    
    const updatedAlert = {
      ...systemAlerts[alertIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    
    systemAlerts[alertIndex] = updatedAlert
    
    return Response.json({
      data: updatedAlert,
      message: 'System alert updated successfully'
    })
  }),

  // Delete system alert
  http.delete('/api/notifications/system-alerts/:id', async ({ params }) => {
    await delay(Math.random() * 200 + 50)
    
    const alertIndex = systemAlerts.findIndex(a => a.id === params.id)
    
    if (alertIndex === -1) {
      return new Response('System alert not found', { status: 404 })
    }
    
    systemAlerts.splice(alertIndex, 1)
    
    return Response.json({
      message: 'System alert deleted successfully'
    })
  }),

  // Get notification statistics
  http.get('/api/notifications/stats', async ({ request }) => {
    await delay(Math.random() * 300 + 100)
    
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    
    let filtered = [...notifications]
    
    if (userId) {
      filtered = filtered.filter(notif => notif.userId === userId)
    }
    
    const stats = {
      total: filtered.length,
      unread: filtered.filter(n => !n.isRead).length,
      read: filtered.filter(n => n.isRead).length,
      byCategory: filtered.reduce((acc, notif) => {
        acc[notif.category] = (acc[notif.category] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      byPriority: filtered.reduce((acc, notif) => {
        acc[notif.priority] = (acc[notif.priority] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      recentActivity: filtered
        .filter(n => new Date(n.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        .length,
    }
    
    return Response.json({
      data: stats,
      message: 'Notification statistics retrieved successfully'
    })
  }),
]