// Analytics calculation utilities
export interface DateRange {
  startDate: string
  endDate: string
}

export interface AnalyticsFilters {
  dateRange?: DateRange
  department?: string
  employeeId?: string
  year?: number
  month?: number
}

// Date utilities for analytics
export const analyticsUtils = {
  // Get current year
  getCurrentYear: () => new Date().getFullYear(),
  
  // Get current month (1-based)
  getCurrentMonth: () => new Date().getMonth() + 1,
  
  // Get date range for current month
  getCurrentMonthRange: (): DateRange => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    
    return {
      startDate: new Date(year, month, 1).toISOString(),
      endDate: new Date(year, month + 1, 0).toISOString()
    }
  },
  
  // Get date range for current year
  getCurrentYearRange: (): DateRange => {
    const year = new Date().getFullYear()
    return {
      startDate: new Date(year, 0, 1).toISOString(),
      endDate: new Date(year, 11, 31).toISOString()
    }
  },
  
  // Get date range for last N days
  getLastNDaysRange: (days: number): DateRange => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    }
  },
  
  // Calculate percentage change
  calculatePercentageChange: (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  },
  
  // Calculate completion rate
  calculateCompletionRate: (completed: number, total: number): number => {
    if (total === 0) return 0
    return (completed / total) * 100
  },
  
  // Group data by period
  groupByPeriod: <T extends { createdAt: string }>(
    data: T[], 
    period: 'day' | 'week' | 'month' | 'year'
  ): Record<string, T[]> => {
    return data.reduce((groups, item) => {
      const date = new Date(item.createdAt)
      let key: string
      
      switch (period) {
        case 'day':
          key = date.toISOString().split('T')[0]
          break
        case 'week':
          const weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay())
          key = weekStart.toISOString().split('T')[0]
          break
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          break
        case 'year':
          key = date.getFullYear().toString()
          break
        default:
          key = date.toISOString().split('T')[0]
      }
      
      if (!groups[key]) groups[key] = []
      groups[key].push(item)
      return groups
    }, {} as Record<string, T[]>)
  },
  
  // Calculate trend (increasing, decreasing, stable)
  calculateTrend: (values: number[]): 'increasing' | 'decreasing' | 'stable' => {
    if (values.length < 2) return 'stable'
    
    const first = values[0]
    const last = values[values.length - 1]
    const threshold = 0.05 // 5% threshold for stability
    
    const change = Math.abs(last - first) / Math.max(first, 1)
    
    if (change < threshold) return 'stable'
    return last > first ? 'increasing' : 'decreasing'
  }
}

// Common analytics calculations
export const analyticsCalculations = {
  // Employee analytics
  calculateEmployeeMetrics: (employees: any[]) => {
    const total = employees.length
    const active = employees.filter(emp => emp.status === 'active').length
    const inactive = employees.filter(emp => emp.status === 'inactive').length
    const terminated = employees.filter(emp => emp.status === 'terminated').length
    
    const byDepartment = employees.reduce((acc, emp) => {
      acc[emp.department] = (acc[emp.department] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const byLocation = employees.reduce((acc, emp) => {
      acc[emp.location] = (acc[emp.location] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return {
      total,
      active,
      inactive,
      terminated,
      activeRate: analyticsUtils.calculateCompletionRate(active, total),
      byDepartment,
      byLocation
    }
  },
  
  // Leave analytics
  calculateLeaveMetrics: (requests: any[], balances: any[]) => {
    const totalRequests = requests.length
    const pending = requests.filter(req => req.status === 'pending').length
    const approved = requests.filter(req => req.status === 'approved').length
    const rejected = requests.filter(req => req.status === 'rejected').length
    
    const approvalRate = analyticsUtils.calculateCompletionRate(approved, totalRequests)
    const rejectionRate = analyticsUtils.calculateCompletionRate(rejected, totalRequests)
    
    const totalDaysRequested = requests.reduce((sum, req) => sum + req.days, 0)
    const averageDaysPerRequest = totalRequests > 0 ? totalDaysRequested / totalRequests : 0
    
    const utilizationRate = balances.length > 0 
      ? balances.reduce((sum, balance) => sum + (balance.used / balance.allocated), 0) / balances.length * 100
      : 0
    
    return {
      totalRequests,
      pending,
      approved,
      rejected,
      approvalRate,
      rejectionRate,
      totalDaysRequested,
      averageDaysPerRequest,
      utilizationRate
    }
  },
  
  // Payroll analytics
  calculatePayrollMetrics: (payslips: any[]) => {
    const totalPayslips = payslips.length
    const totalGross = payslips.reduce((sum, slip) => sum + slip.grossSalary, 0)
    const totalNet = payslips.reduce((sum, slip) => sum + slip.netSalary, 0)
    const totalDeductions = payslips.reduce((sum, slip) => sum + slip.totalDeductions, 0)
    
    const averageGross = totalPayslips > 0 ? totalGross / totalPayslips : 0
    const averageNet = totalPayslips > 0 ? totalNet / totalPayslips : 0
    const deductionRate = totalGross > 0 ? (totalDeductions / totalGross) * 100 : 0
    
    const uniqueEmployees = new Set(payslips.map(slip => slip.employeeId)).size
    
    return {
      totalPayslips,
      totalGross,
      totalNet,
      totalDeductions,
      averageGross,
      averageNet,
      deductionRate,
      uniqueEmployees
    }
  }
}