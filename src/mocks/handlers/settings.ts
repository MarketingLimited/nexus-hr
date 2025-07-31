import { http, HttpResponse } from 'msw'
import { SystemSettings, SecuritySettings, NotificationSettings, BackupSettings } from '../../services/settingsService'

// Mock data
const mockSystemSettings: SystemSettings = {
  id: 'sys-001',
  companyName: 'HRM System Enterprise',
  timezone: 'UTC-05:00 (Eastern Time)',
  currency: 'USD ($)',
  darkMode: false,
  autoSave: true,
  defaultUserRole: 'Employee',
  passwordMinLength: 8,
  requireSpecialChars: true,
  requireNumbers: true,
  userRegistration: false,
  sessionTimeout: 60,
  twoFactorAuth: false,
  loginAttemptLimit: true,
  dataEncryption: true,
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: true,
  weeklyReports: true,
  notificationEmail: 'admin@company.com',
  activeDirectorySync: false,
  slackIntegration: true,
  googleCalendar: true,
  payrollSystemApi: false,
  automaticBackups: true,
  backupRetention: 30,
  dataExportFormat: 'CSV, JSON',
  updatedAt: new Date().toISOString(),
  updatedBy: 'admin'
}

const mockSecuritySettings: SecuritySettings = {
  sessionTimeout: 60,
  twoFactorAuth: false,
  loginAttemptLimit: 5,
  dataEncryption: true,
  auditLogRetention: 90,
  passwordExpiry: 90,
  enforcePasswordHistory: true
}

const mockNotificationSettings: NotificationSettings = {
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: true,
  weeklyReports: true,
  notificationEmail: 'admin@company.com',
  alertChannels: ['email', 'slack']
}

const mockBackupSettings: BackupSettings = {
  automaticBackups: true,
  backupFrequency: 'daily',
  backupRetention: 30,
  backupLocation: 'cloud',
  compressionEnabled: true,
  encryptionEnabled: true
}

export const settingsHandlers = [
  // System Settings
  http.get('/api/settings/system', () => {
    return HttpResponse.json(mockSystemSettings)
  }),

  http.put('/api/settings/system', async ({ request }) => {
    const updates = await request.json() as Partial<SystemSettings>
    const updatedSettings = {
      ...mockSystemSettings,
      ...updates,
      updatedAt: new Date().toISOString()
    }
    Object.assign(mockSystemSettings, updatedSettings)
    return HttpResponse.json(updatedSettings)
  }),

  // Security Settings
  http.get('/api/settings/security', () => {
    return HttpResponse.json(mockSecuritySettings)
  }),

  http.put('/api/settings/security', async ({ request }) => {
    const updates = await request.json() as Partial<SecuritySettings>
    const updatedSettings = { ...mockSecuritySettings, ...updates }
    Object.assign(mockSecuritySettings, updatedSettings)
    return HttpResponse.json(updatedSettings)
  }),

  // Notification Settings
  http.get('/api/settings/notifications', () => {
    return HttpResponse.json(mockNotificationSettings)
  }),

  http.put('/api/settings/notifications', async ({ request }) => {
    const updates = await request.json() as Partial<NotificationSettings>
    const updatedSettings = { ...mockNotificationSettings, ...updates }
    Object.assign(mockNotificationSettings, updatedSettings)
    return HttpResponse.json(updatedSettings)
  }),

  // Backup Settings
  http.get('/api/settings/backup', () => {
    return HttpResponse.json(mockBackupSettings)
  }),

  http.put('/api/settings/backup', async ({ request }) => {
    const updates = await request.json() as Partial<BackupSettings>
    const updatedSettings = { ...mockBackupSettings, ...updates }
    Object.assign(mockBackupSettings, updatedSettings)
    return HttpResponse.json(updatedSettings)
  }),

  // System Actions
  http.post('/api/settings/reset', () => {
    // Reset all settings to defaults
    Object.assign(mockSystemSettings, {
      companyName: 'HRM System Enterprise',
      timezone: 'UTC-05:00 (Eastern Time)',
      currency: 'USD ($)',
      darkMode: false,
      autoSave: true,
      defaultUserRole: 'Employee',
      passwordMinLength: 8,
      requireSpecialChars: true,
      requireNumbers: true,
      userRegistration: false,
      sessionTimeout: 60,
      twoFactorAuth: false,
      loginAttemptLimit: true,
      dataEncryption: true,
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      weeklyReports: true,
      notificationEmail: 'admin@company.com',
      activeDirectorySync: false,
      slackIntegration: false,
      googleCalendar: false,
      payrollSystemApi: false,
      automaticBackups: true,
      backupRetention: 30,
      dataExportFormat: 'CSV, JSON',
      updatedAt: new Date().toISOString()
    })

    return HttpResponse.json({ message: 'Settings reset successfully' })
  }),

  http.get('/api/settings/export-audit', () => {
    const csvContent = `Date,User,Action,Details
${new Date().toISOString()},admin,LOGIN,Successful login
${new Date().toISOString()},admin,SETTINGS_UPDATE,Updated system settings
${new Date().toISOString()},john.doe,LEAVE_REQUEST,Requested vacation leave`
    
    return HttpResponse.text(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=audit-log.csv'
      }
    })
  }),

  http.post('/api/settings/test-connections', () => {
    return HttpResponse.json({
      'Active Directory': true,
      'Slack': true,
      'Google Calendar': true,
      'Payroll System': false,
      'Email Service': true
    })
  }),

  http.post('/api/settings/backup', () => {
    const backupId = `backup_${Date.now()}`
    const filename = `hrm_backup_${new Date().toISOString().split('T')[0]}.zip`
    
    return HttpResponse.json({
      id: backupId,
      filename: filename
    })
  }),

  http.get('/api/settings/export', ({ request }) => {
    const url = new URL(request.url)
    const format = url.searchParams.get('format') || 'csv'
    
    let content: string
    let contentType: string
    
    if (format === 'json') {
      content = JSON.stringify({
        employees: [],
        attendance: [],
        leave: [],
        payroll: []
      }, null, 2)
      contentType = 'application/json'
    } else {
      content = `Employee ID,Name,Department,Position
1,John Doe,Engineering,Developer
2,Jane Smith,HR,Manager`
      contentType = 'text/csv'
    }
    
    return HttpResponse.text(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename=hrm-data.${format}`
      }
    })
  })
]