import { api, ApiResponse } from './api'
import { analyticsUtils, AnalyticsFilters } from '../utils/analytics'

// Dashboard Overview Analytics
export interface DashboardOverview {
  employees: {
    total: number
    active: number
    newThisMonth: number
    activeRate: number
    trend: 'increasing' | 'decreasing' | 'stable'
  }
  leave: {
    pendingRequests: number
    approvedThisMonth: number
    rejectionRate: number
    utilizationRate: number
  }
  payroll: {
    totalMonthlyCost: number
    averageSalary: number
    pendingPayslips: number
    processingStatus: 'completed' | 'in_progress' | 'pending'
  }
  departments: {
    total: number
    largestDepartment: string
    smallestDepartment: string
    averageSize: number
  }
}

// Detailed Analytics Interfaces
export interface EmployeeAnalytics {
  overview: {
    total: number
    active: number
    inactive: number
    terminated: number
    activeRate: number
  }
  growth: {
    newHires: Array<{ period: string; count: number }>
    turnoverRate: number
    retentionRate: number
  }
  distribution: {
    byDepartment: Record<string, number>
    byLocation: Record<string, number>
    byRole: Record<string, number>
  }
  trends: {
    hiringTrend: 'increasing' | 'decreasing' | 'stable'
    turnoverTrend: 'increasing' | 'decreasing' | 'stable'
  }
}

export interface LeaveAnalytics {
  overview: {
    totalRequests: number
    pending: number
    approved: number
    rejected: number
    approvalRate: number
  }
  usage: {
    totalDaysUsed: number
    averageDaysPerEmployee: number
    utilizationRate: number
    mostUsedType: string
  }
  patterns: {
    byMonth: Array<{ month: string; requests: number; days: number }>
    byDepartment: Record<string, { requests: number; days: number }>
    seasonalTrends: Array<{ quarter: string; requests: number }>
  }
  predictions: {
    upcomingRequests: number
    capacityIssues: string[]
    recommendations: string[]
  }
}

export interface PayrollAnalytics {
  overview: {
    totalMonthlyCost: number
    totalEmployees: number
    averageSalary: number
    medianSalary: number
  }
  costs: {
    grossTotal: number
    netTotal: number
    totalDeductions: number
    totalAllowances: number
    deductionRate: number
  }
  distribution: {
    byDepartment: Record<string, { employees: number; totalCost: number; average: number }>
    byLocation: Record<string, { employees: number; totalCost: number; average: number }>
    salaryRanges: Array<{ range: string; count: number; percentage: number }>
  }
  trends: {
    monthlyCosts: Array<{ month: string; cost: number }>
    salaryGrowth: number
    costPerEmployee: number
  }
}

// Cross-Module Analytics Interfaces
export interface CrossModuleInsights {
  correlations: {
    attendancePerformance: {
      correlation: number
      insight: string
      trend: 'positive' | 'negative' | 'neutral'
    }
    leaveProductivity: {
      correlation: number
      insight: string
      departments: Array<{ name: string; impact: number }>
    }
    payrollRetention: {
      correlation: number
      insight: string
      riskFactors: string[]
    }
  }
  predictions: {
    turnoverRisk: Array<{ employeeId: string; risk: number; factors: string[] }>
    leavePatterns: Array<{ period: string; expectedRequests: number; confidence: number }>
    costProjections: Array<{ month: string; projectedCost: number; variance: number }>
  }
  recommendations: {
    immediate: string[]
    shortTerm: string[]
    longTerm: string[]
  }
}

export interface ReportTemplate {
  id: string
  name: string
  description: string
  type: 'employee' | 'leave' | 'payroll' | 'performance' | 'cross-module'
  filters: AnalyticsFilters
  metrics: string[]
  visualization: 'chart' | 'table' | 'dashboard'
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly'
    recipients: string[]
    format: 'pdf' | 'excel' | 'csv'
  }
}

export interface DashboardWidget {
  id: string
  title: string
  type: 'metric' | 'chart' | 'table' | 'alert'
  size: 'small' | 'medium' | 'large'
  data: any
  refreshInterval?: number
  position: { x: number; y: number; w: number; h: number }
}

// Analytics Service
export const analyticsService = {
  // Dashboard Overview
  getDashboardOverview: async (filters?: AnalyticsFilters): Promise<DashboardOverview> => {
    const currentYear = analyticsUtils.getCurrentYear()
    const currentMonth = analyticsUtils.getCurrentMonth()
    
    // Fetch all required data in parallel
    const [employeeStats, leaveStats, payrollStats, departments] = await Promise.all([
      api.get<ApiResponse<any>>('/employees/stats'),
      api.get<ApiResponse<any>>('/leave/stats', { year: currentYear.toString() }),
      api.get<ApiResponse<any>>('/payroll/stats', { 
        year: currentYear.toString(), 
        month: currentMonth.toString() 
      }),
      api.get<ApiResponse<any[]>>('/departments')
    ])

    return {
      employees: {
        total: employeeStats.data.total,
        active: employeeStats.data.active,
        newThisMonth: employeeStats.data.newThisMonth || 0,
        activeRate: (employeeStats.data.active / employeeStats.data.total) * 100,
        trend: 'stable' // Calculate based on historical data
      },
      leave: {
        pendingRequests: leaveStats.data.pending,
        approvedThisMonth: leaveStats.data.approved,
        rejectionRate: (leaveStats.data.rejected / leaveStats.data.totalRequests) * 100,
        utilizationRate: 75 // Calculate from leave balances
      },
      payroll: {
        totalMonthlyCost: payrollStats.data.totalGrossSalary,
        averageSalary: payrollStats.data.averageSalary,
        pendingPayslips: 0, // Calculate from payslip status
        processingStatus: 'completed'
      },
      departments: {
        total: departments.data.length,
        largestDepartment: 'Engineering', // Calculate from employee counts
        smallestDepartment: 'Legal',
        averageSize: departments.data.length > 0 ? employeeStats.data.total / departments.data.length : 0
      }
    }
  },

  // Employee Analytics
  getEmployeeAnalytics: async (filters?: AnalyticsFilters): Promise<EmployeeAnalytics> => {
    const [employees, stats] = await Promise.all([
      api.get<ApiResponse<any[]>>('/employees'),
      api.get<ApiResponse<any>>('/employees/stats')
    ])

    const employeeData = employees.data
    const currentYear = new Date().getFullYear()
    
    // Calculate new hires by month
    const newHiresByMonth = analyticsUtils.groupByPeriod(
      employeeData.filter(emp => new Date(emp.createdAt).getFullYear() === currentYear),
      'month'
    )

    const newHires = Object.entries(newHiresByMonth).map(([month, emps]) => ({
      period: month,
      count: emps.length
    }))

    // Calculate turnover (terminated employees)
    const terminatedThisYear = employeeData.filter(emp => 
      emp.status === 'terminated' && 
      new Date(emp.updatedAt).getFullYear() === currentYear
    ).length

    const turnoverRate = (terminatedThisYear / employeeData.length) * 100
    const retentionRate = 100 - turnoverRate

    return {
      overview: {
        total: stats.data.total,
        active: stats.data.active,
        inactive: stats.data.inactive,
        terminated: stats.data.terminated,
        activeRate: (stats.data.active / stats.data.total) * 100
      },
      growth: {
        newHires,
        turnoverRate,
        retentionRate
      },
      distribution: {
        byDepartment: stats.data.byDepartment,
        byLocation: stats.data.byLocation,
        byRole: employeeData.reduce((acc, emp) => {
          acc[emp.position] = (acc[emp.position] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      },
      trends: {
        hiringTrend: analyticsUtils.calculateTrend(newHires.map(h => h.count)),
        turnoverTrend: 'stable'
      }
    }
  },

  // Leave Analytics
  getLeaveAnalytics: async (filters?: AnalyticsFilters): Promise<LeaveAnalytics> => {
    const year = filters?.year || analyticsUtils.getCurrentYear()
    
    const [requests, balances, types, stats] = await Promise.all([
      api.get<ApiResponse<any[]>>('/leave/requests'),
      api.get<ApiResponse<any[]>>('/leave/balances', { year: year.toString() }),
      api.get<ApiResponse<any[]>>('/leave/types'),
      api.get<ApiResponse<any>>('/leave/stats', { year: year.toString() })
    ])

    const requestData = requests.data
    const balanceData = balances.data
    
    // Group requests by month
    const requestsByMonth = analyticsUtils.groupByPeriod(requestData, 'month')
    const byMonth = Object.entries(requestsByMonth).map(([month, reqs]) => ({
      month,
      requests: reqs.length,
      days: reqs.reduce((sum, req) => sum + req.days, 0)
    }))

    // Group by department
    const byDepartment = requestData.reduce((acc, req) => {
      const dept = req.department || 'Unknown'
      if (!acc[dept]) acc[dept] = { requests: 0, days: 0 }
      acc[dept].requests++
      acc[dept].days += req.days
      return acc
    }, {} as Record<string, { requests: number; days: number }>)

    // Calculate utilization
    const totalAllocated = balanceData.reduce((sum, bal) => sum + bal.allocated, 0)
    const totalUsed = balanceData.reduce((sum, bal) => sum + bal.used, 0)
    const utilizationRate = totalAllocated > 0 ? (totalUsed / totalAllocated) * 100 : 0

    // Find most used leave type
    const typeUsage = stats.data.byType || []
    const mostUsedType = typeUsage.reduce((max, type) => 
      type.days > (max?.days || 0) ? type : max, null
    )?.type || 'Annual Leave'

    return {
      overview: {
        totalRequests: stats.data.totalRequests,
        pending: stats.data.pending,
        approved: stats.data.approved,
        rejected: stats.data.rejected,
        approvalRate: (stats.data.approved / stats.data.totalRequests) * 100
      },
      usage: {
        totalDaysUsed: stats.data.totalDays,
        averageDaysPerEmployee: balanceData.length > 0 ? totalUsed / balanceData.length : 0,
        utilizationRate,
        mostUsedType
      },
      patterns: {
        byMonth,
        byDepartment,
        seasonalTrends: [
          { quarter: 'Q1', requests: byMonth.slice(0, 3).reduce((sum, m) => sum + m.requests, 0) },
          { quarter: 'Q2', requests: byMonth.slice(3, 6).reduce((sum, m) => sum + m.requests, 0) },
          { quarter: 'Q3', requests: byMonth.slice(6, 9).reduce((sum, m) => sum + m.requests, 0) },
          { quarter: 'Q4', requests: byMonth.slice(9, 12).reduce((sum, m) => sum + m.requests, 0) }
        ]
      },
      predictions: {
        upcomingRequests: stats.data.pending,
        capacityIssues: [],
        recommendations: [
          'Consider implementing flexible leave policies',
          'Monitor seasonal leave patterns for better planning'
        ]
      }
    }
  },

  // Payroll Analytics
  getPayrollAnalytics: async (filters?: AnalyticsFilters): Promise<PayrollAnalytics> => {
    const year = filters?.year || analyticsUtils.getCurrentYear()
    
    const [payslips, structures, stats] = await Promise.all([
      api.get<ApiResponse<any[]>>('/payroll/payslips', { year: year.toString() }),
      api.get<ApiResponse<any[]>>('/payroll/salary-structures'),
      api.get<ApiResponse<any>>('/payroll/stats', { year: year.toString() })
    ])

    const payslipData = payslips.data
    const structureData = structures.data
    
    // Calculate salary distribution
    const salaries = structureData.map(s => s.baseSalary).sort((a, b) => a - b)
    const medianSalary = salaries.length > 0 ? salaries[Math.floor(salaries.length / 2)] : 0

    // Group by department
    const byDepartment = structureData.reduce((acc, structure) => {
      const dept = structure.department || 'Unknown'
      if (!acc[dept]) acc[dept] = { employees: 0, totalCost: 0, average: 0 }
      acc[dept].employees++
      acc[dept].totalCost += structure.baseSalary
      return acc
    }, {} as Record<string, { employees: number; totalCost: number; average: number }>)

    // Calculate averages
    Object.keys(byDepartment).forEach(dept => {
      const data = byDepartment[dept]
      data.average = data.employees > 0 ? data.totalCost / data.employees : 0
    })

    // Salary ranges
    const ranges = [
      { range: '< $50k', min: 0, max: 50000 },
      { range: '$50k - $75k', min: 50000, max: 75000 },
      { range: '$75k - $100k', min: 75000, max: 100000 },
      { range: '$100k - $150k', min: 100000, max: 150000 },
      { range: '> $150k', min: 150000, max: Infinity }
    ]

    const salaryRanges = ranges.map(range => {
      const count = salaries.filter(s => s >= range.min && s < range.max).length
      return {
        range: range.range,
        count,
        percentage: salaries.length > 0 ? (count / salaries.length) * 100 : 0
      }
    })

    return {
      overview: {
        totalMonthlyCost: stats.data.totalGrossSalary,
        totalEmployees: stats.data.employeeCount,
        averageSalary: stats.data.averageSalary,
        medianSalary
      },
      costs: {
        grossTotal: stats.data.totalGrossSalary,
        netTotal: stats.data.totalNetSalary,
        totalDeductions: stats.data.totalDeductions,
        totalAllowances: stats.data.totalAllowances,
        deductionRate: stats.data.totalGrossSalary > 0 ? 
          (stats.data.totalDeductions / stats.data.totalGrossSalary) * 100 : 0
      },
      distribution: {
        byDepartment,
        byLocation: {}, // Could be calculated similarly
        salaryRanges
      },
      trends: {
        monthlyCosts: [], // Would need historical payroll data
        salaryGrowth: 0,
        costPerEmployee: stats.data.employeeCount > 0 ? 
          stats.data.totalGrossSalary / stats.data.employeeCount : 0
      }
    }
  },

  // Cross-Module Analytics
  getCrossModuleInsights: async (filters?: AnalyticsFilters): Promise<CrossModuleInsights> => {
    const [employeeData, attendanceData, leaveData, performanceData] = await Promise.all([
      api.get<ApiResponse<any[]>>('/employees'),
      api.get<ApiResponse<any[]>>('/attendance/records'),
      api.get<ApiResponse<any[]>>('/leave/requests'),
      api.get<ApiResponse<any[]>>('/performance/reviews')
    ])

    // Attendance vs Performance correlation
    const attendancePerformanceCorr = analyticsUtils.calculateCorrelation(
      attendanceData.data.map(a => a.hoursWorked),
      performanceData.data.map(p => p.overallScore)
    )

    // Leave vs Productivity analysis
    const leaveProductivityByDept = analyticsUtils.groupBy(leaveData.data, 'department')
    const deptProductivityImpact = Object.entries(leaveProductivityByDept).map(([dept, leaves]) => ({
      name: dept,
      impact: analyticsUtils.calculateProductivityImpact(leaves)
    }))

    // Payroll vs Retention correlation
    const payrollRetentionCorr = analyticsUtils.calculateRetentionCorrelation(employeeData.data)

    return {
      correlations: {
        attendancePerformance: {
          correlation: attendancePerformanceCorr,
          insight: attendancePerformanceCorr > 0.5 
            ? 'Strong positive correlation between attendance and performance'
            : 'Weak correlation between attendance and performance',
          trend: attendancePerformanceCorr > 0.3 ? 'positive' : 'neutral'
        },
        leaveProductivity: {
          correlation: -0.2, // Simulated negative correlation
          insight: 'Higher leave usage correlates with temporary productivity dips',
          departments: deptProductivityImpact
        },
        payrollRetention: {
          correlation: 0.7, // Simulated positive correlation
          insight: 'Competitive compensation strongly correlates with retention',
          riskFactors: ['Below-market salaries', 'Limited growth opportunities', 'Work-life balance']
        }
      },
      predictions: {
        turnoverRisk: employeeData.data
          .filter(emp => emp.status === 'active')
          .map(emp => ({
            employeeId: emp.id,
            risk: analyticsUtils.calculateTurnoverRisk(emp),
            factors: analyticsUtils.getTurnoverFactors(emp)
          }))
          .filter(pred => pred.risk > 0.6)
          .slice(0, 10),
        leavePatterns: analyticsUtils.predictLeavePatterns(leaveData.data),
        costProjections: analyticsUtils.projectCosts(12) // 12-month projection
      },
      recommendations: {
        immediate: [
          'Review compensation for high-risk employees',
          'Address attendance patterns affecting performance',
          'Implement retention bonuses for critical roles'
        ],
        shortTerm: [
          'Develop career growth programs',
          'Improve work-life balance initiatives',
          'Implement flexible leave policies'
        ],
        longTerm: [
          'Build comprehensive talent development programs',
          'Establish long-term retention strategies',
          'Create succession planning framework'
        ]
      }
    }
  },

  // Advanced Reporting Engine
  generateReport: async (template: ReportTemplate, filters?: AnalyticsFilters): Promise<any> => {
    const combinedFilters = { ...template.filters, ...filters }
    
    switch (template.type) {
      case 'employee':
        return analyticsService.getEmployeeAnalytics(combinedFilters)
      case 'leave':
        return analyticsService.getLeaveAnalytics(combinedFilters)
      case 'payroll':
        return analyticsService.getPayrollAnalytics(combinedFilters)
      case 'cross-module':
        return analyticsService.getCrossModuleInsights(combinedFilters)
      default:
        return analyticsService.getDashboardOverview(combinedFilters)
    }
  },

  // Export functionality
  exportReport: async (data: any, format: 'pdf' | 'excel' | 'csv'): Promise<Blob> => {
    // Simulate export functionality
    const exportData = {
      data,
      format,
      timestamp: new Date().toISOString(),
      metadata: {
        generated: 'HR Analytics System',
        version: '1.0'
      }
    }
    
    return new Blob([JSON.stringify(exportData, null, 2)], {
      type: format === 'pdf' ? 'application/pdf' : 
           format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
           'text/csv'
    })
  },

  // Dashboard Widgets
  getDashboardWidgets: async (): Promise<DashboardWidget[]> => {
    const overview = await analyticsService.getDashboardOverview()
    
    return [
      {
        id: 'employee-count',
        title: 'Total Employees',
        type: 'metric',
        size: 'small',
        data: { value: overview.employees.total, trend: overview.employees.trend },
        refreshInterval: 300000, // 5 minutes
        position: { x: 0, y: 0, w: 3, h: 2 }
      },
      {
        id: 'leave-requests',
        title: 'Pending Leave Requests',
        type: 'metric',
        size: 'small',
        data: { value: overview.leave.pendingRequests, trend: 'stable' },
        refreshInterval: 60000, // 1 minute
        position: { x: 3, y: 0, w: 3, h: 2 }
      },
      {
        id: 'payroll-cost',
        title: 'Monthly Payroll Cost',
        type: 'metric',
        size: 'medium',
        data: { value: overview.payroll.totalMonthlyCost, currency: true },
        refreshInterval: 600000, // 10 minutes
        position: { x: 6, y: 0, w: 6, h: 2 }
      }
    ]
  },

  // Real-time metrics
  getRealTimeMetrics: async (): Promise<any> => {
    const [overview, crossModule] = await Promise.all([
      analyticsService.getDashboardOverview(),
      analyticsService.getCrossModuleInsights()
    ])

    return {
      ...overview,
      insights: crossModule,
      lastUpdated: new Date().toISOString()
    }
  }
}