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
const employeeIds = mockEmployees.map(emp => emp.id)
const notifications = generateNotifications(employeeIds, 200)
const notificationPreferences = generateNotificationPreferences(employeeIds)
const systemAlerts = generateSystemAlerts(20)

export const notificationHandlers = [
  // Get notifications
  http.get('/api/notifications', async ({ request }) => {
    await delay(Math.random() * 300 + 100)
    
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    const category = url.searchParams.get('category')
    const isRead = url.searchParams.get('isRead')
    const priority = url.searchParams.get('priority')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    
    let filtered = [...notifications]
    
    if (userId) {
      filtered = filtered.filter(notification => notification.userId === userId)
    }
    
    if (category) {
      filtered = filtered.filter(notification => notification.category === category)
    }
    
    if (isRead !== null) {
      const readStatus = isRead === 'true'
      filtered = filtered.filter(notification => notification.isRead === readStatus)
    }
    
    if (priority) {
      filtered = filtered.filter(notification => notification.priority === priority)
    }
    
    // Pagination
    const total = filtered.length
    const offset = (page - 1) * limit
    const paginatedResults = filtered
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(offset, offset + limit)
    
    return Response.json({
      data: paginatedResults,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
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

  // Create notification
  http.post('/api/notifications', async ({ request }) => {
    await delay(Math.random() * 400 + 100)
    
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
      actionRequired: data.actionRequired || false,
      actionUrl: data.actionUrl || null,
      actionText: data.actionText || null,
      metadata: data.metadata || {},
      expiresAt: data.expiresAt || null,
      createdAt: new Date().toISOString(),
      readAt: null,
    }
    
    notifications.push(newNotification)
    
    return Response.json({
      data: newNotification,
      message: 'Notification created successfully'
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
        }
        updatedNotifications.push(notifications[notificationIndex])
      }
    })
    
    return Response.json({
      data: updatedNotifications,
      message: 'Notifications marked as read'
    })
  }),

  // Mark all notifications as read for user
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
        }
        updatedNotifications.push(notifications[index])
      }
    })
    
    return Response.json({
      data: updatedNotifications,
      message: 'All notifications marked as read'
    })
  }),

  // Delete notification
  http.delete('/api/notifications/:id', async ({ params }) => {
    await delay(Math.random() * 300 + 100)
    
    const notificationIndex = notifications.findIndex(n => n.id === params.id)
    
    if (notificationIndex === -1) {
      return new Response('Notification not found', { status: 404 })
    }
    
    notifications.splice(notificationIndex, 1)
    
    return Response.json({
      message: 'Notification deleted successfully'
    })
  }),

  // Send action notification
  http.post('/api/notifications/action', async ({ request }) => {
    await delay(Math.random() * 400 + 100)
    
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
      actionRequired: true,
      actionUrl: data.actionUrl || null,
      actionText: data.actionText || null,
      metadata: data.metadata || {},
      expiresAt: data.expiresAt || null,
      createdAt: new Date().toISOString(),
      readAt: null,
    }
    
    notifications.push(newNotification)
    
    return Response.json({
      data: newNotification,
      message: 'Action notification created successfully'
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
    
    let preferences = notificationPreferences.filter(p => p.userId === userId)
    
    if (preferences.length === 0) {
      // Return default preferences for all categories
      const categories = ['leave', 'payroll', 'performance', 'attendance', 'system', 'onboarding', 'general']
      preferences = categories.map(category => ({
        id: `pref-${category}-${userId}`,
        userId,
        category,
        emailEnabled: true,
        pushEnabled: true,
        smsEnabled: false,
        frequency: 'immediate' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))
    }
    
    return Response.json({
      data: preferences,
      message: 'Notification preferences retrieved successfully'
    })
  }),

  // Update notification preferences
  http.put('/api/notifications/preferences', async ({ request }) => {
    await delay(Math.random() * 400 + 100)
    
    const data = await request.json() as Partial<NotificationPreference>
    
    const preferencesIndex = notificationPreferences.findIndex(p => p.userId === data.userId && p.category === data.category)
    
    if (preferencesIndex === -1) {
      // Create new preferences
      const newPreferences: NotificationPreference = {
        id: `pref-${notificationPreferences.length + 1}`,
        userId: data.userId!,
        category: data.category || 'general',
        emailEnabled: data.emailEnabled !== undefined ? data.emailEnabled : true,
        pushEnabled: data.pushEnabled !== undefined ? data.pushEnabled : true,
        smsEnabled: data.smsEnabled !== undefined ? data.smsEnabled : false,
        frequency: data.frequency || 'immediate',
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
      const updatedPreference = {
        ...notificationPreferences[preferencesIndex],
        category: data.category,
        emailEnabled: data.emailEnabled,
        pushEnabled: data.pushEnabled,
        smsEnabled: data.smsEnabled,
        frequency: data.frequency,
        updatedAt: new Date().toISOString(),
      }
      
      notificationPreferences[preferencesIndex] = updatedPreference
      
      return Response.json({
        data: updatedPreference,
        message: 'Notification preferences updated successfully'
      })
    }
  }),

  // Get notification statistics
  http.get('/api/notifications/stats', async ({ request }) => {
    await delay(Math.random() * 300 + 100)
    
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    
    let filtered = [...notifications]
    
    if (userId) {
      filtered = filtered.filter(notification => notification.userId === userId)
    }
    
    const stats = {
      total: filtered.length,
      unread: filtered.filter(n => !n.isRead).length,
      read: filtered.filter(n => n.isRead).length,
      actionRequired: filtered.filter(n => n.actionRequired && !n.isRead).length,
      byCategory: {
        leave: filtered.filter(n => n.category === 'leave').length,
        payroll: filtered.filter(n => n.category === 'payroll').length,
        performance: filtered.filter(n => n.category === 'performance').length,
        attendance: filtered.filter(n => n.category === 'attendance').length,
        system: filtered.filter(n => n.category === 'system').length,
        general: filtered.filter(n => n.category === 'general').length,
      },
      byPriority: {
        low: filtered.filter(n => n.priority === 'low').length,
        medium: filtered.filter(n => n.priority === 'medium').length,
        high: filtered.filter(n => n.priority === 'high').length,
        urgent: filtered.filter(n => n.priority === 'urgent').length,
      }
    }
    
    return Response.json({
      data: stats,
      message: 'Notification statistics retrieved successfully'
    })
  }),

  // Get system alerts
  http.get('/api/notifications/alerts', async ({ request }) => {
    await delay(Math.random() * 200 + 50)
    
    const url = new URL(request.url)
    const isActive = url.searchParams.get('isActive')
    const severity = url.searchParams.get('severity')
    
    let filtered = [...systemAlerts]
    
    if (isActive !== null) {
      const activeStatus = isActive === 'true'
      filtered = filtered.filter(alert => alert.isActive === activeStatus)
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
  http.post('/api/notifications/alerts', async ({ request }) => {
    await delay(Math.random() * 400 + 100)
    
    const data = await request.json() as Partial<SystemAlert>
    
    const newAlert: SystemAlert = {
      id: `alert-${systemAlerts.length + 1}`,
      type: data.type || 'announcement',
      severity: data.severity || 'info',
      title: data.title!,
      message: data.message!,
      affectedServices: data.affectedServices || [],
      startTime: data.startTime || new Date().toISOString(),
      endTime: data.endTime || null,
      isActive: data.isActive !== undefined ? data.isActive : true,
      targetAudience: data.targetAudience || 'all',
      createdBy: data.createdBy!,
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
  http.put('/api/notifications/alerts/:id', async ({ params, request }) => {
    await delay(Math.random() * 400 + 100)
    
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
  http.delete('/api/notifications/alerts/:id', async ({ params }) => {
    await delay(Math.random() * 300 + 100)
    
    const alertIndex = systemAlerts.findIndex(a => a.id === params.id)
    
    if (alertIndex === -1) {
      return new Response('System alert not found', { status: 404 })
    }
    
    systemAlerts.splice(alertIndex, 1)
    
    return Response.json({
      message: 'System alert deleted successfully'
    })
  }),
]