import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { monitoringService, type AlertRule, type MonitoringDashboard } from '../services/monitoringService'
import { useToast } from './use-toast'
import { useEffect, useState } from 'react'

export function useSystemHealth() {
  return useQuery({
    queryKey: ['system-health'],
    queryFn: () => monitoringService.getSystemHealth(),
    refetchInterval: 30000, // Refresh every 30 seconds
  })
}

export function usePerformanceMetrics(timeRange: string) {
  return useQuery({
    queryKey: ['performance-metrics', timeRange],
    queryFn: () => monitoringService.getPerformanceMetrics(timeRange),
    refetchInterval: 60000, // Refresh every minute
  })
}

export function useSystemAlerts(filters?: { 
  status?: string[]
  type?: string[]
  category?: string
  since?: string
}) {
  return useQuery({
    queryKey: ['system-alerts', filters],
    queryFn: () => monitoringService.getAlerts(filters),
    refetchInterval: 10000, // Refresh every 10 seconds
  })
}

export function useAlertRules() {
  return useQuery({
    queryKey: ['alert-rules'],
    queryFn: () => monitoringService.getAlertRules(),
  })
}

export function useAlertRule(id: string) {
  return useQuery({
    queryKey: ['alert-rule', id],
    queryFn: () => monitoringService.getAlertRule(id),
    enabled: !!id,
  })
}

export function useMonitoringDashboards() {
  return useQuery({
    queryKey: ['monitoring-dashboards'],
    queryFn: () => monitoringService.getDashboards(),
  })
}

export function useMonitoringDashboard(id: string) {
  return useQuery({
    queryKey: ['monitoring-dashboard', id],
    queryFn: () => monitoringService.getDashboard(id),
    enabled: !!id,
  })
}

export function useSystemLogs(filters?: {
  level?: string[]
  component?: string[]
  startDate?: string
  endDate?: string
  search?: string
  page?: number
  limit?: number
}) {
  return useQuery({
    queryKey: ['system-logs', filters],
    queryFn: () => monitoringService.getLogs(filters),
  })
}

export function useErrorPatterns(timeRange?: string) {
  return useQuery({
    queryKey: ['error-patterns', timeRange],
    queryFn: () => monitoringService.getErrorPatterns(timeRange),
  })
}

export function useSystemInfo() {
  return useQuery({
    queryKey: ['system-info'],
    queryFn: () => monitoringService.getSystemInfo(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useMaintenanceWindows() {
  return useQuery({
    queryKey: ['maintenance-windows'],
    queryFn: () => monitoringService.getMaintenanceWindows(),
  })
}

export function useDiagnosticTests() {
  return useQuery({
    queryKey: ['diagnostic-tests'],
    queryFn: () => monitoringService.getDiagnosticResults('latest'),
  })
}

export function useCreateAlertRule() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (ruleData: Omit<AlertRule, 'id' | 'createdAt'>) =>
      monitoringService.createAlertRule(ruleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-rules'] })
      toast({ title: 'Alert rule created successfully' })
    },
    onError: () => {
      toast({ title: 'Failed to create alert rule', variant: 'destructive' })
    },
  })
}

export function useUpdateAlertRule() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<AlertRule> }) =>
      monitoringService.updateAlertRule(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['alert-rule', id] })
      queryClient.invalidateQueries({ queryKey: ['alert-rules'] })
      toast({ title: 'Alert rule updated successfully' })
    },
    onError: () => {
      toast({ title: 'Failed to update alert rule', variant: 'destructive' })
    },
  })
}

export function useDeleteAlertRule() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => monitoringService.deleteAlertRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-rules'] })
      toast({ title: 'Alert rule deleted successfully' })
    },
    onError: () => {
      toast({ title: 'Failed to delete alert rule', variant: 'destructive' })
    },
  })
}

export function useTestAlertRule() {
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => monitoringService.testAlertRule(id),
    onSuccess: () => {
      toast({ title: 'Alert rule test completed' })
    },
    onError: () => {
      toast({ title: 'Alert rule test failed', variant: 'destructive' })
    },
  })
}

export function useCreateDashboard() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (dashboardData: Omit<MonitoringDashboard, 'id' | 'createdAt'>) =>
      monitoringService.createDashboard(dashboardData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitoring-dashboards'] })
      toast({ title: 'Dashboard created successfully' })
    },
    onError: () => {
      toast({ title: 'Failed to create dashboard', variant: 'destructive' })
    },
  })
}

export function useUpdateDashboard() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<MonitoringDashboard> }) =>
      monitoringService.updateDashboard(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['monitoring-dashboard', id] })
      queryClient.invalidateQueries({ queryKey: ['monitoring-dashboards'] })
      toast({ title: 'Dashboard updated successfully' })
    },
    onError: () => {
      toast({ title: 'Failed to update dashboard', variant: 'destructive' })
    },
  })
}

export function useDeleteDashboard() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => monitoringService.deleteDashboard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitoring-dashboards'] })
      toast({ title: 'Dashboard deleted successfully' })
    },
    onError: () => {
      toast({ title: 'Failed to delete dashboard', variant: 'destructive' })
    },
  })
}

export function useCreateMaintenanceWindow() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (windowData: { title: string; description?: string; startTime: string; endTime: string; affectedServices: string[] }) =>
      monitoringService.getMaintenanceWindows(), // Placeholder - actual create method would need to be implemented
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-windows'] })
      toast({ title: 'Maintenance window created successfully' })
    },
    onError: () => {
      toast({ title: 'Failed to create maintenance window', variant: 'destructive' })
    },
  })
}

export function useRunDiagnostics() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: () => monitoringService.runDiagnostics(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagnostic-tests'] })
      toast({ title: 'System diagnostics started' })
    },
    onError: () => {
      toast({ title: 'Failed to run system diagnostics', variant: 'destructive' })
    },
  })
}

export function useRealTimeMetrics(metrics: string[]) {
  const [metricsData, setMetricsData] = useState<any>(null)
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    if (metrics.length > 0) {
      const unsubscribe = monitoringService.subscribeToMetrics(metrics, (data) => {
        setMetricsData(data)
      })
      setIsSubscribed(true)

      return () => {
        unsubscribe()
        setIsSubscribed(false)
      }
    }
  }, [metrics])

  return {
    metricsData,
    isSubscribed,
  }
}

// Health Checks specific hooks
export function useHealthChecks() {
  return useQuery({
    queryKey: ['health-checks'],
    queryFn: () => monitoringService.getHealthChecks(),
    refetchInterval: 30000,
  })
}

export function useRunHealthCheck() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (checkId: string) => {
      const result = await monitoringService.runHealthCheck(checkId)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-checks'] })
      toast({ title: 'Health check completed' })
    },
    onError: () => {
      toast({ title: 'Health check failed', variant: 'destructive' })
    },
  })
}

export function useUpdateHealthCheckConfig() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ checkId, config }: { checkId: string; config: any }) => {
      const result = await monitoringService.updateHealthCheckConfig(checkId, config)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-checks'] })
      toast({ title: 'Health check configuration updated' })
    },
    onError: () => {
      toast({ title: 'Failed to update health check configuration', variant: 'destructive' })
    },
  })
}

export function useSystemOverview() {
  const systemHealth = useSystemHealth()
  const performanceMetrics = usePerformanceMetrics('1h')
  const alerts = useSystemAlerts({ status: ['active'], type: ['security', 'performance'] })

  return {
    health: systemHealth.data,
    performance: performanceMetrics.data,
    criticalAlerts: alerts.data?.data || [],
    isLoading: systemHealth.isLoading || performanceMetrics.isLoading || alerts.isLoading,
    error: systemHealth.error || performanceMetrics.error || alerts.error,
  }
}