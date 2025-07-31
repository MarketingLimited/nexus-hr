// Analytics calculation utilities
export interface DateRange {
  start: Date
  end: Date
}

export interface AnalyticsFilters {
  dateRange?: DateRange
  department?: string
  employeeId?: string
  year?: number
  month?: number
}

export const analyticsUtils = {
  getCurrentYear: () => new Date().getFullYear(),
  getCurrentMonth: () => new Date().getMonth() + 1,

  getCurrentMonthRange: (): DateRange => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return { start, end }
  },

  getCurrentYearRange: (): DateRange => {
    const now = new Date()
    const start = new Date(now.getFullYear(), 0, 1)
    const end = new Date(now.getFullYear(), 11, 31)
    return { start, end }
  },

  getLastNDaysRange: (days: number): DateRange => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days)
    return { start, end }
  },

  calculatePercentageChange: (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  },

  calculateCompletionRate: (completed: number, total: number): number => {
    if (total === 0) return 0
    return (completed / total) * 100
  },

  formatCurrency: (amount: number, currency = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  },

  formatPercentage: (value: number, decimals = 1): string => {
    return `${value.toFixed(decimals)}%`
  },

  groupByPeriod: (data: any[], period: 'day' | 'week' | 'month' | 'quarter' | 'year') => {
    const grouped: Record<string, any[]> = {}
    
    data.forEach(item => {
      const date = new Date(item.createdAt || item.date)
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
        case 'quarter':
          const quarter = Math.floor(date.getMonth() / 3) + 1
          key = `${date.getFullYear()}-Q${quarter}`
          break
        case 'year':
          key = date.getFullYear().toString()
          break
        default:
          key = date.toISOString().split('T')[0]
      }
      
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(item)
    })
    
    return grouped
  },

  calculateTrend: (values: number[]): 'increasing' | 'decreasing' | 'stable' => {
    if (values.length < 2) return 'stable'
    
    const trend = values.reduce((acc, val, idx) => {
      if (idx === 0) return acc
      return acc + (val - values[idx - 1])
    }, 0)
    
    const threshold = values.reduce((a, b) => a + b, 0) / values.length * 0.1
    
    if (trend > threshold) return 'increasing'
    if (trend < -threshold) return 'decreasing'
    return 'stable'
  },

  calculateAverage: (values: number[]): number => {
    if (values.length === 0) return 0
    return values.reduce((sum, val) => sum + val, 0) / values.length
  },

  calculateMedian: (values: number[]): number => {
    if (values.length === 0) return 0
    const sorted = [...values].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
  },

  calculateStandardDeviation: (values: number[]): number => {
    if (values.length === 0) return 0
    const avg = analyticsUtils.calculateAverage(values)
    const squareDiffs = values.map(value => Math.pow(value - avg, 2))
    const avgSquareDiff = analyticsUtils.calculateAverage(squareDiffs)
    return Math.sqrt(avgSquareDiff)
  },

  getDateRange: (period: 'week' | 'month' | 'quarter' | 'year'): DateRange => {
    const now = new Date()
    const start = new Date()
    
    switch (period) {
      case 'week':
        start.setDate(now.getDate() - 7)
        break
      case 'month':
        start.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        start.setMonth(now.getMonth() - 3)
        break
      case 'year':
        start.setFullYear(now.getFullYear() - 1)
        break
    }
    
    return { start, end: now }
  },

  // Cross-module analytics functions
  calculateCorrelation: (x: number[], y: number[]): number => {
    if (x.length !== y.length || x.length === 0) return 0
    
    const n = x.length
    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = y.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0)
    const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0)
    
    const numerator = n * sumXY - sumX * sumY
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY))
    
    return denominator === 0 ? 0 : numerator / denominator
  },

  groupBy: (data: any[], key: string): Record<string, any[]> => {
    return data.reduce((grouped, item) => {
      const groupKey = item[key] || 'Unknown'
      if (!grouped[groupKey]) grouped[groupKey] = []
      grouped[groupKey].push(item)
      return grouped
    }, {} as Record<string, any[]>)
  },

  calculateProductivityImpact: (leaveData: any[]): number => {
    // Simulate productivity impact calculation
    const totalLeaveDays = leaveData.reduce((sum, leave) => sum + (leave.days || 0), 0)
    const avgImpact = Math.min(totalLeaveDays * 0.1, 50) // Max 50% impact
    return Math.round(avgImpact * 100) / 100
  },

  calculateRetentionCorrelation: (employeeData: any[]): number => {
    // Simulate correlation between salary and retention
    const activeSalaries = employeeData
      .filter(emp => emp.status === 'active')
      .map(emp => emp.salary || 50000)
    
    const terminatedSalaries = employeeData
      .filter(emp => emp.status === 'terminated')
      .map(emp => emp.salary || 50000)
    
    const activeAvg = analyticsUtils.calculateAverage(activeSalaries)
    const terminatedAvg = analyticsUtils.calculateAverage(terminatedSalaries)
    
    return activeAvg > terminatedAvg ? 0.75 : 0.25
  },

  calculateTurnoverRisk: (employee: any): number => {
    let risk = 0
    
    // Tenure-based risk
    const tenure = new Date().getTime() - new Date(employee.startDate || employee.createdAt).getTime()
    const tenureYears = tenure / (1000 * 60 * 60 * 24 * 365)
    if (tenureYears < 1) risk += 0.3
    else if (tenureYears < 2) risk += 0.2
    else if (tenureYears > 10) risk += 0.1
    
    // Performance-based risk
    if (employee.performanceScore && employee.performanceScore < 3) risk += 0.4
    
    // Salary-based risk
    const marketSalary = 70000
    if (employee.salary && employee.salary < marketSalary * 0.9) risk += 0.3
    
    return Math.min(risk, 1)
  },

  getTurnoverFactors: (employee: any): string[] => {
    const factors: string[] = []
    
    const tenure = new Date().getTime() - new Date(employee.startDate || employee.createdAt).getTime()
    const tenureYears = tenure / (1000 * 60 * 60 * 24 * 365)
    
    if (tenureYears < 1) factors.push('New employee (< 1 year)')
    if (employee.performanceScore && employee.performanceScore < 3) factors.push('Low performance score')
    if (employee.salary && employee.salary < 60000) factors.push('Below-market compensation')
    if (!employee.lastPromotion || new Date().getTime() - new Date(employee.lastPromotion).getTime() > 2 * 365 * 24 * 60 * 60 * 1000) {
      factors.push('No recent promotion')
    }
    
    return factors
  },

  predictLeavePatterns: (leaveData: any[]): Array<{ period: string; expectedRequests: number; confidence: number }> => {
    const monthlyData = analyticsUtils.groupByPeriod(leaveData, 'month')
    const predictions: Array<{ period: string; expectedRequests: number; confidence: number }> = []
    
    const now = new Date()
    for (let i = 1; i <= 6; i++) {
      const futureDate = new Date(now.getFullYear(), now.getMonth() + i, 1)
      const monthKey = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}`
      
      const historicalAvg = Object.values(monthlyData).reduce((sum, requests) => sum + requests.length, 0) / Object.keys(monthlyData).length
      const seasonalMultiplier = [1.2, 0.8, 1.0, 1.1, 0.9, 1.3][i - 1]
      
      predictions.push({
        period: monthKey,
        expectedRequests: Math.round(historicalAvg * seasonalMultiplier),
        confidence: Math.max(0.6, 1 - (i * 0.1))
      })
    }
    
    return predictions
  },

  projectCosts: (months: number): Array<{ month: string; projectedCost: number; variance: number }> => {
    const projections: Array<{ month: string; projectedCost: number; variance: number }> = []
    const baseCost = 500000
    const growthRate = 0.03
    
    const now = new Date()
    for (let i = 1; i <= months; i++) {
      const futureDate = new Date(now.getFullYear(), now.getMonth() + i, 1)
      const monthKey = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}`
      
      const projectedCost = baseCost * Math.pow(1 + growthRate, i)
      const variance = Math.random() * 0.1 - 0.05
      
      projections.push({
        month: monthKey,
        projectedCost: Math.round(projectedCost),
        variance: Math.round(variance * 100) / 100
      })
    }
    
    return projections
  }
}