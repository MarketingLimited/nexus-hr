import { useQuery } from '@tanstack/react-query'
import { useDashboardOverview, useRealTimeMetrics } from './useAnalytics'
import { useEmployeeStats } from './useEmployees'
import { analyticsService } from '../services/analyticsService'

// Dashboard-specific data hooks
export function useDashboardStats() {
  const overview = useDashboardOverview()
  const employeeStats = useEmployeeStats()
  
  return {
    ...overview,
    data: overview.data ? {
      ...overview.data,
      employees: {
        ...overview.data.employees,
        ...employeeStats.data
      }
    } : undefined
  }
}

// Quick stats for dashboard cards
export function useQuickStats() {
  return useQuery({
    queryKey: ['dashboard', 'quickStats'],
    queryFn: async () => {
      // Fetch the most important metrics quickly
      const overview = await analyticsService.getDashboardOverview()
      
      return {
        totalEmployees: overview.employees.total,
        activeEmployees: overview.employees.active,
        pendingLeaveRequests: overview.leave.pendingRequests,
        monthlyPayrollCost: overview.payroll.totalMonthlyCost,
        employeeGrowth: overview.employees.trend,
        leaveApprovalRate: 100 - overview.leave.rejectionRate,
        averageSalary: overview.payroll.averageSalary,
        departmentCount: overview.departments.total
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 3 * 60 * 1000, // Refresh every 3 minutes
  })
}

// Recent activity data
export function useRecentActivity() {
  return useQuery({
    queryKey: ['dashboard', 'recentActivity'],
    queryFn: async () => {
      // This would typically fetch recent activities from multiple sources
      // For now, we'll simulate recent activity data
      return [
        {
          id: '1',
          type: 'leave_request',
          title: 'Leave request submitted',
          description: 'John Doe submitted a leave request for Dec 25-27',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
          user: 'John Doe',
          status: 'pending',
          priority: 'medium'
        },
        {
          id: '2',
          type: 'employee_joined',
          title: 'New employee onboarded',
          description: 'Sarah Wilson joined the Engineering team',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          user: 'Sarah Wilson',
          status: 'completed',
          priority: 'low'
        },
        {
          id: '3',
          type: 'payroll_processed',
          title: 'Payroll processed',
          description: 'November payroll has been processed for 45 employees',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
          user: 'System',
          status: 'completed',
          priority: 'high'
        },
        {
          id: '4',
          type: 'leave_approved',
          title: 'Leave request approved',
          description: 'Manager approved vacation request for Mike Chen',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
          user: 'Mike Chen',
          status: 'approved',
          priority: 'low'
        },
        {
          id: '5',
          type: 'performance_review',
          title: 'Performance review completed',
          description: 'Q4 performance review completed for Engineering team',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
          user: 'HR Team',
          status: 'completed',
          priority: 'medium'
        }
      ]
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Refresh every 2 minutes
  })
}

// Alerts and notifications for dashboard
export function useDashboardAlerts() {
  return useQuery({
    queryKey: ['dashboard', 'alerts'],
    queryFn: async () => {
      // This would typically check for various system conditions
      const overview = await analyticsService.getDashboardOverview()
      const alerts = []

      // Check for high leave request volume
      if (overview.leave.pendingRequests > 10) {
        alerts.push({
          id: 'high-leave-requests',
          type: 'warning',
          title: 'High Leave Request Volume',
          message: `${overview.leave.pendingRequests} leave requests are pending approval`,
          actionUrl: '/leave-management',
          priority: 'medium'
        })
      }

      // Check for low employee activity rate
      if (overview.employees.activeRate < 85) {
        alerts.push({
          id: 'low-activity-rate',
          type: 'error',
          title: 'Low Employee Activity Rate',
          message: `Only ${overview.employees.activeRate.toFixed(1)}% of employees are currently active`,
          actionUrl: '/employees',
          priority: 'high'
        })
      }

      // Check for payroll processing status
      if (overview.payroll.processingStatus === 'pending') {
        alerts.push({
          id: 'payroll-pending',
          type: 'info',
          title: 'Payroll Processing Required',
          message: 'Monthly payroll processing is ready to begin',
          actionUrl: '/payroll',
          priority: 'high'
        })
      }

      // Success message for good metrics
      if (overview.leave.rejectionRate < 5 && overview.employees.activeRate > 95) {
        alerts.push({
          id: 'system-healthy',
          type: 'success',
          title: 'System Operating Optimally',
          message: 'All key metrics are within healthy ranges',
          priority: 'low'
        })
      }

      return alerts
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  })
}

// Performance metrics for dashboard
export function useDashboardPerformance() {
  return useQuery({
    queryKey: ['dashboard', 'performance'],
    queryFn: async () => {
      const overview = await analyticsService.getDashboardOverview()
      
      return {
        scores: {
          employeeEngagement: overview.employees.activeRate,
          leaveManagement: 100 - overview.leave.rejectionRate,
          payrollEfficiency: overview.payroll.processingStatus === 'completed' ? 100 : 75,
          departmentBalance: 85 // Could be calculated based on size distribution
        },
        benchmarks: {
          employeeEngagement: 90,
          leaveManagement: 95,
          payrollEfficiency: 98,
          departmentBalance: 80
        },
        trends: {
          employeeEngagement: overview.employees.trend,
          leaveManagement: 'stable' as const,
          payrollEfficiency: 'increasing' as const,
          departmentBalance: 'stable' as const
        }
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}