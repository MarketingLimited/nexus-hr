import { useQuery } from '@tanstack/react-query'
import { analyticsService, DashboardOverview, EmployeeAnalytics, LeaveAnalytics, PayrollAnalytics } from '../services/analyticsService'
import { AnalyticsFilters } from '../utils/analytics'

// Query keys
export const analyticsKeys = {
  all: ['analytics'] as const,
  dashboard: () => [...analyticsKeys.all, 'dashboard'] as const,
  employees: (filters?: AnalyticsFilters) => [...analyticsKeys.all, 'employees', filters] as const,
  leave: (filters?: AnalyticsFilters) => [...analyticsKeys.all, 'leave', filters] as const,
  payroll: (filters?: AnalyticsFilters) => [...analyticsKeys.all, 'payroll', filters] as const,
}

// Dashboard overview analytics
export function useDashboardOverview(filters?: AnalyticsFilters) {
  return useQuery({
    queryKey: analyticsKeys.dashboard(),
    queryFn: () => analyticsService.getDashboardOverview(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  })
}

// Employee analytics
export function useEmployeeAnalytics(filters?: AnalyticsFilters) {
  return useQuery({
    queryKey: analyticsKeys.employees(filters),
    queryFn: () => analyticsService.getEmployeeAnalytics(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Leave analytics
export function useLeaveAnalytics(filters?: AnalyticsFilters) {
  return useQuery({
    queryKey: analyticsKeys.leave(filters),
    queryFn: () => analyticsService.getLeaveAnalytics(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Payroll analytics
export function usePayrollAnalytics(filters?: AnalyticsFilters) {
  return useQuery({
    queryKey: analyticsKeys.payroll(filters),
    queryFn: () => analyticsService.getPayrollAnalytics(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Combined analytics for reports
export function useComprehensiveAnalytics(filters?: AnalyticsFilters) {
  const dashboard = useDashboardOverview(filters)
  const employees = useEmployeeAnalytics(filters)
  const leave = useLeaveAnalytics(filters)
  const payroll = usePayrollAnalytics(filters)

  return {
    dashboard,
    employees,
    leave,
    payroll,
    isLoading: dashboard.isLoading || employees.isLoading || leave.isLoading || payroll.isLoading,
    isError: dashboard.isError || employees.isError || leave.isError || payroll.isError,
    error: dashboard.error || employees.error || leave.error || payroll.error,
  }
}

// Real-time metrics (frequently updated)
export function useRealTimeMetrics() {
  return useQuery({
    queryKey: [...analyticsKeys.dashboard(), 'realtime'],
    queryFn: () => analyticsService.getDashboardOverview(),
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
    staleTime: 0, // Always consider stale for real-time updates
  })
}

// Performance indicators
export function useKPIs(filters?: AnalyticsFilters) {
  const dashboard = useDashboardOverview(filters)
  
  return useQuery({
    queryKey: [...analyticsKeys.all, 'kpis', filters],
    queryFn: async () => {
      const data = await analyticsService.getDashboardOverview(filters)
      
      // Calculate KPIs
      return {
        employeeUtilization: data.employees.activeRate,
        leaveUtilization: data.leave.utilizationRate,
        payrollEfficiency: 95, // Could be calculated based on processing time
        departmentBalance: 85, // Could be calculated based on size distribution
        overallHealth: (data.employees.activeRate + data.leave.utilizationRate + 95 + 85) / 4
      }
    },
    enabled: !!dashboard.data,
    staleTime: 5 * 60 * 1000,
  })
}

// Trend analysis
export function useTrendAnalysis(period: 'week' | 'month' | 'quarter' | 'year' = 'month') {
  return useQuery({
    queryKey: [...analyticsKeys.all, 'trends', period],
    queryFn: async () => {
      // This would typically fetch historical data points
      // For now, we'll simulate trend data
      const currentData = await analyticsService.getDashboardOverview()
      
      // Generate mock historical data points
      const dataPoints = Array.from({ length: 12 }, (_, i) => ({
        period: `Month ${i + 1}`,
        employees: currentData.employees.total + Math.floor(Math.random() * 10 - 5),
        leaveRequests: currentData.leave.pendingRequests + Math.floor(Math.random() * 20 - 10),
        payrollCost: currentData.payroll.totalMonthlyCost * (0.95 + Math.random() * 0.1)
      }))
      
      return {
        dataPoints,
        trends: {
          employees: 'increasing' as const,
          leave: 'stable' as const,
          payroll: 'increasing' as const
        }
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}