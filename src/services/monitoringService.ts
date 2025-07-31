import { api, ApiResponse } from './api'

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical' | 'unknown'
  score: number // 0-100
  checks: HealthCheck[]
  lastUpdated: string
}

export interface HealthCheck {
  id: string
  name: string
  category: 'performance' | 'availability' | 'security' | 'data' | 'integration'
  status: 'pass' | 'fail' | 'warning'
  message: string
  value?: number
  threshold?: number
  unit?: string
  details?: Record<string, any>
  lastRun: string
  duration: number // milliseconds
}

export interface PerformanceMetrics {
  cpu: {
    usage: number
    cores: number
    loadAverage: number[]
  }
  memory: {
    used: number
    total: number
    percentage: number
    heap: {
      used: number
      total: number
    }
  }
  storage: {
    database: {
      size: number
      connections: number
      queryTime: number
    }
    localStorage: {
      used: number
      quota: number
      percentage: number
    }
  }
  network: {
    latency: number
    throughput: number
    activeConnections: number
    failedRequests: number
  }
  application: {
    responseTime: number
    errorRate: number
    activeUsers: number
    sessionsActive: number
  }
}

export interface SystemAlert {
  id: string
  type: 'info' | 'warning' | 'error' | 'critical'
  title: string
  message: string
  category: string
  source: string
  entityId?: string
  metadata?: Record<string, any>
  status: 'active' | 'acknowledged' | 'resolved'
  createdAt: string
  acknowledgedAt?: string
  acknowledgedBy?: string
  resolvedAt?: string
  resolvedBy?: string
  actions?: AlertAction[]
}

export interface AlertAction {
  id: string
  label: string
  type: 'api' | 'redirect' | 'modal'
  config: Record<string, any>
}

export interface AlertRule {
  id: string
  name: string
  description: string
  metric: string
  condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals' | 'contains'
  threshold: number | string
  severity: 'info' | 'warning' | 'error' | 'critical'
  frequency: number // minutes
  isActive: boolean
  notifications: {
    email?: string[]
    webhook?: string
    inApp: boolean
  }
  createdBy: string
  createdAt: string
}

export interface MonitoringDashboard {
  id: string
  name: string
  description: string
  widgets: DashboardWidget[]
  layout: {
    columns: number
    rows: number
  }
  isPublic: boolean
  createdBy: string
  createdAt: string
  lastModified: string
}

export interface DashboardWidget {
  id: string
  type: 'metric' | 'chart' | 'table' | 'alert' | 'health'
  title: string
  config: {
    metric?: string
    timeRange?: string
    chartType?: 'line' | 'bar' | 'pie' | 'gauge'
    refreshInterval?: number
    filters?: Record<string, any>
  }
  position: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface LogEntry {
  id: string
  timestamp: string
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal'
  message: string
  category: string
  source: string
  userId?: string
  sessionId?: string
  metadata?: Record<string, any>
  stackTrace?: string
}

export interface ErrorPattern {
  pattern: string
  count: number
  firstOccurrence: string
  lastOccurrence: string
  affectedUsers: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  resolution?: string
  status: 'open' | 'investigating' | 'resolved'
}

export const monitoringService = {
  // System Health
  getSystemHealth: () => 
    api.get<ApiResponse<SystemHealth>>('/monitoring/health'),

  runHealthCheck: (checkId?: string) => 
    api.post<ApiResponse<HealthCheck | HealthCheck[]>>('/monitoring/health/run', { checkId }),

  getHealthHistory: (period: string = '24h') => 
    api.get<ApiResponse<{
      timestamp: string
      score: number
      status: string
    }[]>>(`/monitoring/health/history?period=${period}`),

  // Performance Metrics
  getPerformanceMetrics: (timeRange: string = '1h') => 
    api.get<ApiResponse<PerformanceMetrics>>(`/monitoring/metrics?timeRange=${timeRange}`),

  getMetricHistory: (metric: string, timeRange: string = '24h') => 
    api.get<ApiResponse<{
      timestamp: string
      value: number
    }[]>>(`/monitoring/metrics/${metric}/history?timeRange=${timeRange}`),

  // Alerts
  getAlerts: (filters?: {
    status?: string[]
    type?: string[]
    category?: string
    since?: string
  }) => {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v))
        } else if (value) {
          params.append(key, value)
        }
      })
    }
    
    return api.get<ApiResponse<SystemAlert[]>>(`/monitoring/alerts?${params}`)
  },

  getAlert: (id: string) => 
    api.get<ApiResponse<SystemAlert>>(`/monitoring/alerts/${id}`),

  acknowledgeAlert: (id: string, comment?: string) => 
    api.put<ApiResponse<SystemAlert>>(`/monitoring/alerts/${id}/acknowledge`, { comment }),

  resolveAlert: (id: string, resolution: string) => 
    api.put<ApiResponse<SystemAlert>>(`/monitoring/alerts/${id}/resolve`, { resolution }),

  createAlert: (alertData: Omit<SystemAlert, 'id' | 'createdAt' | 'status'>) => 
    api.post<ApiResponse<SystemAlert>>('/monitoring/alerts', alertData),

  // Alert Rules
  getAlertRules: () => 
    api.get<ApiResponse<AlertRule[]>>('/monitoring/alert-rules'),

  getAlertRule: (id: string) => 
    api.get<ApiResponse<AlertRule>>(`/monitoring/alert-rules/${id}`),

  createAlertRule: (ruleData: Omit<AlertRule, 'id' | 'createdAt'>) => 
    api.post<ApiResponse<AlertRule>>('/monitoring/alert-rules', ruleData),

  updateAlertRule: (id: string, updates: Partial<AlertRule>) => 
    api.put<ApiResponse<AlertRule>>(`/monitoring/alert-rules/${id}`, updates),

  deleteAlertRule: (id: string) => 
    api.delete<ApiResponse<{ message: string }>>(`/monitoring/alert-rules/${id}`),

  testAlertRule: (id: string) => 
    api.post<ApiResponse<{
      triggered: boolean
      message: string
      value: number
    }>>(`/monitoring/alert-rules/${id}/test`),

  // Dashboards
  getDashboards: () => 
    api.get<ApiResponse<MonitoringDashboard[]>>('/monitoring/dashboards'),

  getDashboard: (id: string) => 
    api.get<ApiResponse<MonitoringDashboard>>(`/monitoring/dashboards/${id}`),

  createDashboard: (dashboardData: Omit<MonitoringDashboard, 'id' | 'createdAt' | 'lastModified'>) => 
    api.post<ApiResponse<MonitoringDashboard>>('/monitoring/dashboards', dashboardData),

  updateDashboard: (id: string, updates: Partial<MonitoringDashboard>) => 
    api.put<ApiResponse<MonitoringDashboard>>(`/monitoring/dashboards/${id}`, updates),

  deleteDashboard: (id: string) => 
    api.delete<ApiResponse<{ message: string }>>(`/monitoring/dashboards/${id}`),

  // Logging
  getLogs: (filters?: {
    level?: string[]
    category?: string
    source?: string
    since?: string
    limit?: number
    search?: string
  }) => {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v))
        } else if (value) {
          params.append(key, value.toString())
        }
      })
    }
    
    return api.get<ApiResponse<LogEntry[]>>(`/monitoring/logs?${params}`)
  },

  getLog: (id: string) => 
    api.get<ApiResponse<LogEntry>>(`/monitoring/logs/${id}`),

  createLog: (logData: Omit<LogEntry, 'id' | 'timestamp'>) => 
    api.post<ApiResponse<LogEntry>>('/monitoring/logs', logData),

  // Error Analysis
  getErrorPatterns: (timeRange: string = '24h') => 
    api.get<ApiResponse<ErrorPattern[]>>(`/monitoring/errors/patterns?timeRange=${timeRange}`),

  getErrorPattern: (pattern: string) => 
    api.get<ApiResponse<ErrorPattern>>(`/monitoring/errors/patterns/${encodeURIComponent(pattern)}`),

  updateErrorPattern: (pattern: string, updates: Partial<ErrorPattern>) => 
    api.put<ApiResponse<ErrorPattern>>(`/monitoring/errors/patterns/${encodeURIComponent(pattern)}`, updates),

  // System Information
  getSystemInfo: () => 
    api.get<ApiResponse<{
      version: string
      buildNumber: string
      environment: string
      deployment: {
        date: string
        commit: string
        branch: string
      }
      dependencies: {
        name: string
        version: string
        status: 'up-to-date' | 'outdated' | 'vulnerable'
      }[]
      configuration: {
        database: {
          type: string
          version: string
          connectionPool: number
        }
        cache: {
          type: string
          size: number
          hitRate: number
        }
        features: {
          name: string
          enabled: boolean
        }[]
      }
    }>>('/monitoring/system-info'),

  // Maintenance
  getMaintenanceWindows: () => 
    api.get<ApiResponse<{
      id: string
      title: string
      description: string
      startTime: string
      endTime: string
      status: 'scheduled' | 'active' | 'completed' | 'cancelled'
      affectedServices: string[]
      createdBy: string
    }[]>>('/monitoring/maintenance'),

  scheduleMaintenanceWindow: (data: {
    title: string
    description: string
    startTime: string
    endTime: string
    affectedServices: string[]
  }) => 
    api.post<ApiResponse<{
      id: string
      message: string
    }>>('/monitoring/maintenance', data),

  // Real-time Monitoring
  subscribeToMetrics: (metrics: string[], callback: (data: any) => void) => {
    // Simulate WebSocket connection for real-time metrics
    const interval = setInterval(async () => {
      try {
        const response = await api.get<ApiResponse<Record<string, number>>>('/monitoring/realtime', {
          params: { metrics: metrics.join(',') }
        })
        callback(response.data)
      } catch (error) {
        console.error('Failed to fetch real-time metrics:', error)
      }
    }, 5000)

    return () => clearInterval(interval)
  },

  // Diagnostics
  runDiagnostics: () => 
    api.post<ApiResponse<{
      id: string
      status: string
      results: {
        test: string
        status: 'pass' | 'fail' | 'warning'
        message: string
        duration: number
      }[]
      summary: {
        total: number
        passed: number
        failed: number
        warnings: number
      }
    }>>('/monitoring/diagnostics'),

  getDiagnosticResults: (id: string) => 
    api.get<ApiResponse<any>>(`/monitoring/diagnostics/${id}`)
}