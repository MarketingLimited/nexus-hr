import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { settingsService, type SystemSettings, type SecuritySettings, type NotificationSettings, type BackupSettings } from '../services/settingsService'
import { useToast } from './use-toast'

// System Settings Hooks
export function useSystemSettings() {
  return useQuery({
    queryKey: ['system-settings'],
    queryFn: () => settingsService.getSystemSettings(),
  })
}

export function useUpdateSystemSettings() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (settings: Partial<SystemSettings>) => 
      settingsService.updateSystemSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] })
      toast({ title: 'System settings updated successfully' })
    },
    onError: () => {
      toast({ 
        title: 'Failed to update settings', 
        variant: 'destructive' 
      })
    }
  })
}

// Security Settings Hooks
export function useSecuritySettings() {
  return useQuery({
    queryKey: ['security-settings'],
    queryFn: () => settingsService.getSecuritySettings(),
  })
}

export function useUpdateSecuritySettings() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (settings: Partial<SecuritySettings>) => 
      settingsService.updateSecuritySettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-settings'] })
      queryClient.invalidateQueries({ queryKey: ['security-metrics'] })
      toast({ title: 'Security settings updated successfully' })
    },
    onError: () => {
      toast({ 
        title: 'Failed to update security settings', 
        variant: 'destructive' 
      })
    }
  })
}

// Notification Settings Hooks
export function useNotificationSettings() {
  return useQuery({
    queryKey: ['notification-settings'],
    queryFn: () => settingsService.getNotificationSettings(),
  })
}

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (settings: Partial<NotificationSettings>) => 
      settingsService.updateNotificationSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] })
      toast({ title: 'Notification settings updated successfully' })
    },
    onError: () => {
      toast({ 
        title: 'Failed to update notification settings', 
        variant: 'destructive' 
      })
    }
  })
}

// Backup Settings Hooks
export function useBackupSettings() {
  return useQuery({
    queryKey: ['backup-settings'],
    queryFn: () => settingsService.getBackupSettings(),
  })
}

export function useUpdateBackupSettings() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (settings: Partial<BackupSettings>) => 
      settingsService.updateBackupSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backup-settings'] })
      toast({ title: 'Backup settings updated successfully' })
    },
    onError: () => {
      toast({ 
        title: 'Failed to update backup settings', 
        variant: 'destructive' 
      })
    }
  })
}

// System Action Hooks
export function useResetSettings() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: () => settingsService.resetToDefaults(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] })
      queryClient.invalidateQueries({ queryKey: ['security-settings'] })
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] })
      queryClient.invalidateQueries({ queryKey: ['backup-settings'] })
      toast({ title: 'Settings reset to defaults successfully' })
    },
    onError: () => {
      toast({ 
        title: 'Failed to reset settings', 
        variant: 'destructive' 
      })
    }
  })
}

export function useExportAuditLog() {
  const { toast } = useToast()

  return useMutation({
    mutationFn: () => settingsService.exportAuditLog(),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast({ title: 'Audit log exported successfully' })
    },
    onError: () => {
      toast({ 
        title: 'Failed to export audit log', 
        variant: 'destructive' 
      })
    }
  })
}

export function useTestApiConnections() {
  const { toast } = useToast()

  return useMutation({
    mutationFn: () => settingsService.testApiConnections(),
    onSuccess: (results) => {
      const failed = Object.entries(results).filter(([_, success]) => !success)
      if (failed.length === 0) {
        toast({ title: 'All API connections are working' })
      } else {
        toast({ 
          title: `${failed.length} API connection(s) failed`,
          description: failed.map(([name]) => name).join(', '),
          variant: 'destructive' 
        })
      }
    },
    onError: () => {
      toast({ 
        title: 'Failed to test API connections', 
        variant: 'destructive' 
      })
    }
  })
}

export function useCreateBackup() {
  const { toast } = useToast()

  return useMutation({
    mutationFn: () => settingsService.createBackup(),
    onSuccess: (result) => {
      toast({ 
        title: 'Backup created successfully',
        description: `Backup file: ${result.filename}`
      })
    },
    onError: () => {
      toast({ 
        title: 'Failed to create backup', 
        variant: 'destructive' 
      })
    }
  })
}

export function useExportData() {
  const { toast } = useToast()

  return useMutation({
    mutationFn: (format: string = 'csv') => settingsService.exportData(format),
    onSuccess: (blob, format) => {
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `hrm-data-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast({ title: 'Data exported successfully' })
    },
    onError: () => {
      toast({ 
        title: 'Failed to export data', 
        variant: 'destructive' 
      })
    }
  })
}