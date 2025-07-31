import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { securityService, type SecurityEvent, type ActiveSession, type DeviceFingerprint } from '../services/securityService'
import { useToast } from './use-toast'

export function useSecurityEvents(params?: {
  userId?: string
  type?: string
  severity?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}) {
  return useQuery({
    queryKey: ['security-events', params],
    queryFn: () => securityService.getSecurityEvents(params),
    refetchInterval: 30000, // Refresh every 30 seconds
  })
}

export function useActiveSessions(userId?: string) {
  return useQuery({
    queryKey: ['active-sessions', userId],
    queryFn: () => securityService.getActiveSessions(userId),
    refetchInterval: 60000, // Refresh every minute
  })
}

export function useSecurityMetrics() {
  return useQuery({
    queryKey: ['security-metrics'],
    queryFn: () => securityService.getSecurityMetrics(),
    refetchInterval: 60000, // Refresh every minute
  })
}

export function useDeviceFingerprints(userId: string) {
  return useQuery({
    queryKey: ['device-fingerprints', userId],
    queryFn: () => securityService.getDeviceFingerprints(userId),
    enabled: !!userId,
  })
}

export function useTerminateSession() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (sessionId: string) => securityService.terminateSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-sessions'] })
      queryClient.invalidateQueries({ queryKey: ['security-metrics'] })
      toast({ title: 'Session terminated successfully' })
    },
    onError: () => {
      toast({ title: 'Failed to terminate session', variant: 'destructive' })
    },
  })
}

export function useTrustDevice() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (deviceId: string) => securityService.trustDevice(deviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['device-fingerprints'] })
      toast({ title: 'Device trusted successfully' })
    },
    onError: () => {
      toast({ title: 'Failed to trust device', variant: 'destructive' })
    },
  })
}

export function useRevokeDevice() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (deviceId: string) => securityService.revokeDevice(deviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['device-fingerprints'] })
      queryClient.invalidateQueries({ queryKey: ['active-sessions'] })
      toast({ title: 'Device revoked successfully' })
    },
    onError: () => {
      toast({ title: 'Failed to revoke device', variant: 'destructive' })
    },
  })
}

export function useLogSecurityEvent() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (event: Omit<SecurityEvent, 'id' | 'timestamp'>) =>
      securityService.logSecurityEvent(event),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-events'] })
      queryClient.invalidateQueries({ queryKey: ['security-metrics'] })
    },
    onError: () => {
      toast({ title: 'Failed to log security event', variant: 'destructive' })
    },
  })
}

// Specialized hooks for common security use cases
export function useUserSecurityOverview(userId: string) {
  const securityEvents = useSecurityEvents({ userId, limit: 10 })
  const activeSessions = useActiveSessions(userId)
  const deviceFingerprints = useDeviceFingerprints(userId)

  return {
    recentEvents: securityEvents.data?.data || [],
    activeSessions: activeSessions.data?.data || [],
    trustedDevices: deviceFingerprints.data?.data?.filter((d: DeviceFingerprint) => d.trusted) || [],
    untrustedDevices: deviceFingerprints.data?.data?.filter((d: DeviceFingerprint) => !d.trusted) || [],
    isLoading: securityEvents.isLoading || activeSessions.isLoading || deviceFingerprints.isLoading,
    error: securityEvents.error || activeSessions.error || deviceFingerprints.error,
  }
}

export function useSecurityAlerts() {
  const events = useSecurityEvents({ 
    severity: 'high',
    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Last 24 hours
  })

  const criticalEvents = events.data?.data?.filter((event: SecurityEvent) => 
    event.severity === 'critical' || event.severity === 'high'
  ) || []

  return {
    alerts: criticalEvents,
    count: criticalEvents.length,
    isLoading: events.isLoading,
    error: events.error,
  }
}

export function useSessionManagement() {
  const sessions = useActiveSessions()
  const terminateSession = useTerminateSession()
  const securityMetrics = useSecurityMetrics()

  const terminateAllSessions = async (excludeCurrentSession?: string) => {
    const allSessions = sessions.data?.data || []
    const sessionsToTerminate = excludeCurrentSession 
      ? allSessions.filter((s: ActiveSession) => s.id !== excludeCurrentSession)
      : allSessions

    try {
      await Promise.all(
        sessionsToTerminate.map((session: ActiveSession) => 
          terminateSession.mutateAsync(session.id)
        )
      )
    } catch (error) {
      console.error('Failed to terminate some sessions:', error)
    }
  }

  return {
    sessions: sessions.data?.data || [],
    metrics: securityMetrics.data,
    terminateSession: terminateSession.mutate,
    terminateAllSessions,
    isLoading: sessions.isLoading || securityMetrics.isLoading,
    error: sessions.error || securityMetrics.error,
  }
}

export function useDeviceManagement(userId: string) {
  const devices = useDeviceFingerprints(userId)
  const trustDevice = useTrustDevice()
  const revokeDevice = useRevokeDevice()

  const trustAllDevices = async () => {
    const untrustedDevices = devices.data?.data?.filter((d: DeviceFingerprint) => !d.trusted) || []
    
    try {
      await Promise.all(
        untrustedDevices.map((device: DeviceFingerprint) => 
          trustDevice.mutateAsync(device.id)
        )
      )
    } catch (error) {
      console.error('Failed to trust some devices:', error)
    }
  }

  const revokeAllDevices = async () => {
    const allDevices = devices.data?.data || []
    
    try {
      await Promise.all(
        allDevices.map((device: DeviceFingerprint) => 
          revokeDevice.mutateAsync(device.id)
        )
      )
    } catch (error) {
      console.error('Failed to revoke some devices:', error)
    }
  }

  return {
    devices: devices.data?.data || [],
    trustedDevices: devices.data?.data?.filter((d: DeviceFingerprint) => d.trusted) || [],
    untrustedDevices: devices.data?.data?.filter((d: DeviceFingerprint) => !d.trusted) || [],
    trustDevice: trustDevice.mutate,
    revokeDevice: revokeDevice.mutate,
    trustAllDevices,
    revokeAllDevices,
    isLoading: devices.isLoading,
    error: devices.error,
  }
}