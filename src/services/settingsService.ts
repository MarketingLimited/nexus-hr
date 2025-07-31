import { api } from './api'

export interface SystemSettings {
  id: string
  companyName: string
  timezone: string
  currency: string
  darkMode: boolean
  autoSave: boolean
  defaultUserRole: string
  passwordMinLength: number
  requireSpecialChars: boolean
  requireNumbers: boolean
  userRegistration: boolean
  sessionTimeout: number
  twoFactorAuth: boolean
  loginAttemptLimit: boolean
  dataEncryption: boolean
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  weeklyReports: boolean
  notificationEmail: string
  activeDirectorySync: boolean
  slackIntegration: boolean
  googleCalendar: boolean
  payrollSystemApi: boolean
  automaticBackups: boolean
  backupRetention: number
  dataExportFormat: string
  updatedAt: string
  updatedBy: string
}

export interface SecuritySettings {
  sessionTimeout: number
  twoFactorAuth: boolean
  loginAttemptLimit: number
  dataEncryption: boolean
  auditLogRetention: number
  passwordExpiry: number
  enforcePasswordHistory: boolean
}

export interface NotificationSettings {
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  weeklyReports: boolean
  notificationEmail: string
  alertChannels: string[]
}

export interface BackupSettings {
  automaticBackups: boolean
  backupFrequency: string
  backupRetention: number
  backupLocation: string
  compressionEnabled: boolean
  encryptionEnabled: boolean
}

export const settingsService = {
  // System Settings
  getSystemSettings: async (): Promise<SystemSettings> => {
    const response = await api.get('/api/settings/system')
    return response as SystemSettings
  },

  updateSystemSettings: async (settings: Partial<SystemSettings>): Promise<SystemSettings> => {
    const response = await api.put('/api/settings/system', settings)
    return response as SystemSettings
  },

  // Security Settings
  getSecuritySettings: async (): Promise<SecuritySettings> => {
    const response = await api.get('/api/settings/security')
    return response as SecuritySettings
  },

  updateSecuritySettings: async (settings: Partial<SecuritySettings>): Promise<SecuritySettings> => {
    const response = await api.put('/api/settings/security', settings)
    return response as SecuritySettings
  },

  // Notification Settings
  getNotificationSettings: async (): Promise<NotificationSettings> => {
    const response = await api.get('/api/settings/notifications')
    return response as NotificationSettings
  },

  updateNotificationSettings: async (settings: Partial<NotificationSettings>): Promise<NotificationSettings> => {
    const response = await api.put('/api/settings/notifications', settings)
    return response as NotificationSettings
  },

  // Backup Settings
  getBackupSettings: async (): Promise<BackupSettings> => {
    const response = await api.get('/api/settings/backup')
    return response as BackupSettings
  },

  updateBackupSettings: async (settings: Partial<BackupSettings>): Promise<BackupSettings> => {
    const response = await api.put('/api/settings/backup', settings)
    return response as BackupSettings
  },

  // System Actions
  resetToDefaults: async (): Promise<void> => {
    await api.post('/api/settings/reset')
  },

  exportAuditLog: async (): Promise<Blob> => {
    const response = await api.get('/api/settings/export-audit', { 
      responseType: 'blob' 
    })
    return response.data as Blob
  },

  testApiConnections: async (): Promise<{ [key: string]: boolean }> => {
    const response = await api.post('/api/settings/test-connections')
    return response.data as { [key: string]: boolean }
  },

  createBackup: async (): Promise<{ id: string; filename: string }> => {
    const response = await api.post('/api/settings/backup')
    return response.data as { id: string; filename: string }
  },

  exportData: async (format: string = 'csv'): Promise<Blob> => {
    const response = await api.get(`/api/settings/export?format=${format}`, {
      responseType: 'blob'
    })
    return response.data as Blob
  }
}