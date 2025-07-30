import { faker } from '@faker-js/faker'

export interface Notification {
  id: string
  userId: string
  type: 'info' | 'warning' | 'error' | 'success'
  category: 'leave' | 'payroll' | 'performance' | 'attendance' | 'system' | 'onboarding' | 'general'
  title: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  isRead: boolean
  actionRequired: boolean
  actionUrl: string | null
  actionText: string | null
  metadata: Record<string, any>
  expiresAt: string | null
  createdAt: string
  readAt: string | null
}

export interface NotificationPreference {
  id: string
  userId: string
  category: string
  emailEnabled: boolean
  pushEnabled: boolean
  smsEnabled: boolean
  frequency: 'immediate' | 'daily' | 'weekly' | 'disabled'
  createdAt: string
  updatedAt: string
}

export interface SystemAlert {
  id: string
  type: 'maintenance' | 'outage' | 'update' | 'security' | 'announcement'
  severity: 'info' | 'warning' | 'critical'
  title: string
  message: string
  affectedServices: string[]
  startTime: string
  endTime: string | null
  isActive: boolean
  targetAudience: 'all' | 'admins' | 'managers' | 'employees'
  createdBy: string
  createdAt: string
  updatedAt: string
}

const notificationTemplates = {
  leave: [
    { title: 'Leave Request Approved', message: 'Your leave request for {dates} has been approved.' },
    { title: 'Leave Request Rejected', message: 'Your leave request for {dates} has been rejected. Reason: {reason}' },
    { title: 'New Leave Request', message: '{employee} has submitted a leave request for {dates}.' },
    { title: 'Leave Balance Low', message: 'Your {leaveType} balance is running low ({remaining} days remaining).' }
  ],
  payroll: [
    { title: 'Payslip Available', message: 'Your payslip for {period} is now available for download.' },
    { title: 'Payroll Processing Complete', message: 'Payroll for {period} has been processed. Payment date: {date}' },
    { title: 'Tax Document Ready', message: 'Your {year} tax documents are ready for download.' },
    { title: 'Salary Adjustment', message: 'Your salary has been adjusted effective {date}. New amount: {amount}' }
  ],
  performance: [
    { title: 'Performance Review Due', message: 'Your performance review is due by {date}. Please complete your self-assessment.' },
    { title: 'Goal Deadline Approaching', message: 'Your goal "{goal}" is due in {days} days.' },
    { title: 'Feedback Received', message: 'You have received new feedback from {reviewer}.' },
    { title: 'Review Completed', message: 'Your performance review has been completed and is available for viewing.' }
  ],
  attendance: [
    { title: 'Missed Clock Out', message: 'You forgot to clock out yesterday. Please update your timesheet.' },
    { title: 'Overtime Approval', message: 'Your overtime request for {date} has been approved.' },
    { title: 'Attendance Policy Update', message: 'The attendance policy has been updated. Please review the changes.' },
    { title: 'Time Off Request', message: '{employee} has requested time off for {date}.' }
  ],
  onboarding: [
    { title: 'Welcome to the Team', message: 'Welcome! Your onboarding journey begins today. Check your tasks.' },
    { title: 'Onboarding Task Due', message: 'Task "{task}" is due by {date}. Complete it in your onboarding portal.' },
    { title: 'Mentor Assigned', message: '{mentor} has been assigned as your onboarding mentor.' },
    { title: 'Onboarding Complete', message: 'Congratulations! You have completed your onboarding process.' }
  ],
  system: [
    { title: 'System Maintenance', message: 'The system will be under maintenance from {start} to {end}.' },
    { title: 'Password Expiry Warning', message: 'Your password will expire in {days} days. Please update it.' },
    { title: 'Account Security Alert', message: 'Unusual login activity detected. Please verify your account.' },
    { title: 'Feature Update', message: 'New features have been added to the system. Check them out!' }
  ]
}

export const generateNotifications = (userIds: string[], count: number = 200): Notification[] => {
  const notifications: Notification[] = []
  
  for (let i = 0; i < count; i++) {
    const category = faker.helpers.arrayElement(['leave', 'payroll', 'performance', 'attendance', 'onboarding', 'system', 'general'])
    const templates = notificationTemplates[category as keyof typeof notificationTemplates] || [
      { title: 'General Notification', message: 'You have a new notification.' }
    ]
    const template = faker.helpers.arrayElement(templates)
    
    const type = faker.helpers.weightedArrayElement([
      { weight: 40, value: 'info' },
      { weight: 30, value: 'success' },
      { weight: 20, value: 'warning' },
      { weight: 10, value: 'error' }
    ])
    
    const priority = faker.helpers.weightedArrayElement([
      { weight: 50, value: 'low' },
      { weight: 30, value: 'medium' },
      { weight: 15, value: 'high' },
      { weight: 5, value: 'urgent' }
    ])
    
    const createdAt = faker.date.past({ years: 1 })
    const isRead = faker.datatype.boolean({ probability: 0.6 })
    
    notifications.push({
      id: faker.string.uuid(),
      userId: faker.helpers.arrayElement(userIds),
      type,
      category,
      title: template.title,
      message: template.message,
      priority,
      isRead,
      actionRequired: faker.datatype.boolean({ probability: 0.3 }),
      actionUrl: faker.helpers.maybe(() => '/dashboard/tasks', { probability: 0.3 }),
      actionText: faker.helpers.maybe(() => 'View Details', { probability: 0.3 }),
      metadata: {
        source: category,
        relatedId: faker.string.uuid(),
        department: faker.helpers.arrayElement(['HR', 'Finance', 'Engineering', 'Operations'])
      },
      expiresAt: faker.helpers.maybe(() => faker.date.future({ years: 1 }).toISOString(), { probability: 0.4 }),
      createdAt: createdAt.toISOString(),
      readAt: isRead ? faker.date.between({ from: createdAt, to: new Date() }).toISOString() : null
    })
  }
  
  return notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export const generateNotificationPreferences = (userIds: string[]): NotificationPreference[] => {
  const categories = ['leave', 'payroll', 'performance', 'attendance', 'system', 'onboarding', 'general']
  const preferences: NotificationPreference[] = []
  
  userIds.forEach(userId => {
    categories.forEach(category => {
      preferences.push({
        id: faker.string.uuid(),
        userId,
        category,
        emailEnabled: faker.datatype.boolean({ probability: 0.8 }),
        pushEnabled: faker.datatype.boolean({ probability: 0.9 }),
        smsEnabled: faker.datatype.boolean({ probability: 0.3 }),
        frequency: faker.helpers.weightedArrayElement([
          { weight: 60, value: 'immediate' },
          { weight: 25, value: 'daily' },
          { weight: 10, value: 'weekly' },
          { weight: 5, value: 'disabled' }
        ]),
        createdAt: faker.date.past({ years: 1 }).toISOString(),
        updatedAt: faker.date.recent().toISOString()
      })
    })
  })
  
  return preferences
}

export const generateSystemAlerts = (count: number = 20): SystemAlert[] => {
  const alertTemplates = [
    {
      type: 'maintenance',
      severity: 'warning',
      title: 'Scheduled System Maintenance',
      message: 'The HR system will be unavailable during scheduled maintenance.',
      affectedServices: ['payroll', 'leave-management', 'attendance']
    },
    {
      type: 'update',
      severity: 'info',
      title: 'System Update Release',
      message: 'New features and improvements have been deployed.',
      affectedServices: ['dashboard', 'reports']
    },
    {
      type: 'security',
      severity: 'critical',
      title: 'Security Update Required',
      message: 'Please update your password as part of our routine security measures.',
      affectedServices: ['authentication']
    },
    {
      type: 'outage',
      severity: 'critical',
      title: 'Service Disruption',
      message: 'We are experiencing technical difficulties with the following services.',
      affectedServices: ['email-notifications', 'reports']
    },
    {
      type: 'announcement',
      severity: 'info',
      title: 'Policy Update',
      message: 'Company policies have been updated. Please review the latest changes.',
      affectedServices: []
    }
  ]
  
  return Array.from({ length: count }, () => {
    const template = faker.helpers.arrayElement(alertTemplates)
    const startTime = faker.date.past({ years: 1 })
    const isActive = faker.datatype.boolean({ probability: 0.2 })
    
    return {
      id: faker.string.uuid(),
      type: template.type as SystemAlert['type'],
      severity: template.severity as SystemAlert['severity'],
      title: template.title,
      message: template.message,
      affectedServices: template.affectedServices,
      startTime: startTime.toISOString(),
      endTime: isActive ? null : faker.date.between({ 
        from: startTime, 
        to: faker.date.future({ years: 1 }) 
      }).toISOString(),
      isActive,
      targetAudience: faker.helpers.arrayElement(['all', 'admins', 'managers', 'employees']),
      createdBy: faker.string.uuid(),
      createdAt: startTime.toISOString(),
      updatedAt: faker.date.recent().toISOString()
    }
  })
}

export const mockSystemAlerts = generateSystemAlerts()