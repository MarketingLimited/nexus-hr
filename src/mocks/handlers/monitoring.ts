import { http, HttpResponse } from 'msw'
import type { 
  SystemHealth, 
  HealthCheck, 
  PerformanceMetrics, 
  SystemAlert, 
  AlertRule,
  MonitoringDashboard,
  LogEntry,
  ErrorPattern
} from '../../services/monitoringService'

// Mock data
let systemHealth: SystemHealth = {
  status: 'healthy',
  score: 85,
  checks: [
    {
      id: 'db_connection',
      name: 'Database Connection',
      category: 'availability',
      status: 'pass',
      message: 'Database is responsive',
      value: 15,
      threshold: 100,
      unit: 'ms',
      lastRun: '2024-08-01T16:00:00Z',
      duration: 15
    },
    {
      id: 'memory_usage',
      name: 'Memory Usage',
      category: 'performance',
      status: 'warning',
      message: 'Memory usage is high',
      value: 85,
      threshold: 80,
      unit: '%',
      lastRun: '2024-08-01T16:00:00Z',
      duration: 5
    },
    {
      id: 'api_response_time',
      name: 'API Response Time',
      category: 'performance',
      status: 'pass',
      message: 'API responses are fast',
      value: 250,
      threshold: 500,
      unit: 'ms',
      lastRun: '2024-08-01T16:00:00Z',
      duration: 8
    }
  ],
  lastUpdated: '2024-08-01T16:00:00Z'
}

let alerts: SystemAlert[] = [
  {
    id: 'alert_001',
    type: 'warning',
    title: 'High Memory Usage',
    message: 'Memory usage has exceeded 85% for the last 10 minutes',
    category: 'performance',
    source: 'monitoring-service',
    status: 'active',
    createdAt: '2024-08-01T15:50:00Z',
    actions: [
      {
        id: 'restart_service',
        label: 'Restart Service',
        type: 'api',
        config: { endpoint: '/api/system/restart' }
      }
    ]
  },
  {
    id: 'alert_002',
    type: 'error',
    title: 'Database Connection Failed',
    message: 'Unable to connect to the primary database',
    category: 'availability',
    source: 'database-monitor',
    status: 'resolved',
    createdAt: '2024-08-01T14:30:00Z',
    resolvedAt: '2024-08-01T14:45:00Z',
    resolvedBy: 'system_admin'
  }
]

let alertRules: AlertRule[] = [
  {
    id: 'rule_001',
    name: 'High CPU Usage',
    description: 'Alert when CPU usage exceeds 80%',
    metric: 'cpu.usage',
    condition: 'greater_than',
    threshold: 80,
    severity: 'warning',
    frequency: 5,
    isActive: true,
    notifications: {
      email: ['admin@company.com'],
      inApp: true
    },
    createdBy: 'system_admin',
    createdAt: '2024-07-01T00:00:00Z'
  }
]

let dashboards: MonitoringDashboard[] = [
  {
    id: 'dash_001',
    name: 'System Overview',
    description: 'High-level system health and performance metrics',
    widgets: [
      {
        id: 'widget_001',
        type: 'metric',
        title: 'CPU Usage',
        config: {
          metric: 'cpu.usage',
          timeRange: '1h',
          refreshInterval: 30
        },
        position: { x: 0, y: 0, width: 6, height: 4 }
      },
      {
        id: 'widget_002',
        type: 'chart',
        title: 'Memory Usage Trend',
        config: {
          metric: 'memory.usage',
          timeRange: '24h',
          chartType: 'line',
          refreshInterval: 60
        },
        position: { x: 6, y: 0, width: 6, height: 4 }
      }
    ],
    layout: { columns: 12, rows: 8 },
    isPublic: false,
    createdBy: 'system_admin',
    createdAt: '2024-07-01T00:00:00Z',
    lastModified: '2024-08-01T10:00:00Z'
  }
]

let logs: LogEntry[] = [
  {
    id: 'log_001',
    timestamp: '2024-08-01T16:00:00Z',
    level: 'info',
    message: 'User login successful',
    category: 'authentication',
    source: 'auth-service',
    userId: 'user_001',
    sessionId: 'session_123',
    metadata: { ip: '192.168.1.100', userAgent: 'Mozilla/5.0...' }
  },
  {
    id: 'log_002',
    timestamp: '2024-08-01T15:58:00Z',
    level: 'error',
    message: 'Database connection timeout',
    category: 'database',
    source: 'db-service',
    metadata: { timeout: 30000, retryCount: 3 },
    stackTrace: 'Error: Connection timeout\n  at Database.connect...'
  }
]

let errorPatterns: ErrorPattern[] = [
  {
    pattern: 'Database connection timeout',
    count: 15,
    firstOccurrence: '2024-07-25T10:00:00Z',
    lastOccurrence: '2024-08-01T15:58:00Z',
    affectedUsers: 45,
    severity: 'high',
    status: 'investigating'
  },
  {
    pattern: 'Invalid email format in registration',
    count: 8,
    firstOccurrence: '2024-08-01T09:00:00Z',
    lastOccurrence: '2024-08-01T15:30:00Z',
    affectedUsers: 8,
    severity: 'low',
    status: 'open'
  }
]

export const monitoringHandlers = [
  // System Health
  http.get('/api/monitoring/health', () => {
    return HttpResponse.json({ data: systemHealth, success: true })
  }),

  http.post('/api/monitoring/health/run', async ({ request }) => {
    const { checkId } = await request.json() as { checkId?: string }

    if (checkId) {
      const check = systemHealth.checks.find(c => c.id === checkId)
      if (!check) {
        return HttpResponse.json({ error: 'Health check not found' }, { status: 404 })
      }
      
      // Simulate running the check
      check.lastRun = new Date().toISOString()
      check.duration = Math.floor(Math.random() * 100) + 10
      check.status = Math.random() > 0.1 ? 'pass' : 'fail'
      
      return HttpResponse.json({ data: check, success: true })
    } else {
      // Run all checks
      systemHealth.checks.forEach(check => {
        check.lastRun = new Date().toISOString()
        check.duration = Math.floor(Math.random() * 100) + 10
        check.status = Math.random() > 0.1 ? 'pass' : 'fail'
      })
      
      systemHealth.lastUpdated = new Date().toISOString()
      systemHealth.score = Math.floor(Math.random() * 40) + 60 // 60-100
      
      return HttpResponse.json({ data: systemHealth.checks, success: true })
    }
  }),

  http.get('/api/monitoring/health/history', ({ request }) => {
    const url = new URL(request.url)
    const period = url.searchParams.get('period') || '24h'

    // Generate mock history data
    const history = Array.from({ length: 24 }, (_, i) => ({
      timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
      score: Math.floor(Math.random() * 40) + 60,
      status: Math.random() > 0.2 ? 'healthy' : 'warning'
    }))

    return HttpResponse.json({ data: history, success: true })
  }),

  // Performance Metrics
  http.get('/api/monitoring/metrics', ({ request }) => {
    const url = new URL(request.url)
    const timeRange = url.searchParams.get('timeRange') || '1h'

    const metrics: PerformanceMetrics = {
      cpu: {
        usage: Math.floor(Math.random() * 40) + 30,
        cores: 8,
        loadAverage: [1.2, 1.5, 1.8]
      },
      memory: {
        used: 6.5 * 1024 * 1024 * 1024, // 6.5GB
        total: 16 * 1024 * 1024 * 1024, // 16GB
        percentage: 40.6,
        heap: {
          used: 512 * 1024 * 1024, // 512MB
          total: 1024 * 1024 * 1024 // 1GB
        }
      },
      storage: {
        database: {
          size: 2.5 * 1024 * 1024 * 1024, // 2.5GB
          connections: 25,
          queryTime: 45
        },
        localStorage: {
          used: 50 * 1024 * 1024, // 50MB
          quota: 100 * 1024 * 1024, // 100MB
          percentage: 50
        }
      },
      network: {
        latency: 25,
        throughput: 1024 * 1024 * 10, // 10MB/s
        activeConnections: 150,
        failedRequests: 3
      },
      application: {
        responseTime: 250,
        errorRate: 0.02,
        activeUsers: 485,
        sessionsActive: 523
      }
    }

    return HttpResponse.json({ data: metrics, success: true })
  }),

  http.get('/api/monitoring/metrics/:metric/history', ({ params, request }) => {
    const { metric } = params
    const url = new URL(request.url)
    const timeRange = url.searchParams.get('timeRange') || '24h'

    // Generate mock time series data
    const history = Array.from({ length: 100 }, (_, i) => ({
      timestamp: new Date(Date.now() - (99 - i) * 5 * 60 * 1000).toISOString(),
      value: Math.floor(Math.random() * 100) + Math.sin(i / 10) * 20 + 50
    }))

    return HttpResponse.json({ data: history, success: true })
  }),

  // Alerts
  http.get('/api/monitoring/alerts', ({ request }) => {
    const url = new URL(request.url)
    const status = url.searchParams.getAll('status')
    const type = url.searchParams.getAll('type')
    const category = url.searchParams.get('category')

    let filtered = alerts

    if (status.length > 0) {
      filtered = filtered.filter(alert => status.includes(alert.status))
    }

    if (type.length > 0) {
      filtered = filtered.filter(alert => type.includes(alert.type))
    }

    if (category) {
      filtered = filtered.filter(alert => alert.category === category)
    }

    return HttpResponse.json({ data: filtered, success: true })
  }),

  http.get('/api/monitoring/alerts/:id', ({ params }) => {
    const { id } = params
    const alert = alerts.find(a => a.id === id)

    if (!alert) {
      return HttpResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: alert, success: true })
  }),

  http.put('/api/monitoring/alerts/:id/acknowledge', async ({ params, request }) => {
    const { id } = params
    const { comment } = await request.json() as { comment?: string }

    const alertIndex = alerts.findIndex(a => a.id === id)
    if (alertIndex === -1) {
      return HttpResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    alerts[alertIndex].status = 'acknowledged'
    alerts[alertIndex].acknowledgedAt = new Date().toISOString()
    alerts[alertIndex].acknowledgedBy = 'current_user'

    return HttpResponse.json({ data: alerts[alertIndex], success: true })
  }),

  http.put('/api/monitoring/alerts/:id/resolve', async ({ params, request }) => {
    const { id } = params
    const { resolution } = await request.json() as { resolution: string }

    const alertIndex = alerts.findIndex(a => a.id === id)
    if (alertIndex === -1) {
      return HttpResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    alerts[alertIndex].status = 'resolved'
    alerts[alertIndex].resolvedAt = new Date().toISOString()
    alerts[alertIndex].resolvedBy = 'current_user'

    return HttpResponse.json({ data: alerts[alertIndex], success: true })
  }),

  // Alert Rules
  http.get('/api/monitoring/alert-rules', () => {
    return HttpResponse.json({ data: alertRules, success: true })
  }),

  http.post('/api/monitoring/alert-rules', async ({ request }) => {
    const ruleData = await request.json()
    
    const newRule: AlertRule = {
      id: `rule_${Date.now()}`,
      ...ruleData,
      createdAt: new Date().toISOString()
    }

    alertRules.push(newRule)
    return HttpResponse.json({ data: newRule, success: true })
  }),

  http.post('/api/monitoring/alert-rules/:id/test', ({ params }) => {
    const { id } = params
    const rule = alertRules.find(r => r.id === id)

    if (!rule) {
      return HttpResponse.json({ error: 'Alert rule not found' }, { status: 404 })
    }

    const testValue = Math.floor(Math.random() * 100)
    const triggered = rule.condition === 'greater_than' 
      ? testValue > rule.threshold 
      : testValue < rule.threshold

    return HttpResponse.json({
      data: {
        triggered,
        message: triggered ? 'Alert would be triggered' : 'Alert would not be triggered',
        value: testValue
      },
      success: true
    })
  }),

  // Dashboards
  http.get('/api/monitoring/dashboards', () => {
    return HttpResponse.json({ data: dashboards, success: true })
  }),

  http.get('/api/monitoring/dashboards/:id', ({ params }) => {
    const { id } = params
    const dashboard = dashboards.find(d => d.id === id)

    if (!dashboard) {
      return HttpResponse.json({ error: 'Dashboard not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: dashboard, success: true })
  }),

  // Logging
  http.get('/api/monitoring/logs', ({ request }) => {
    const url = new URL(request.url)
    const level = url.searchParams.getAll('level')
    const category = url.searchParams.get('category')
    const source = url.searchParams.get('source')
    const search = url.searchParams.get('search')
    const limit = parseInt(url.searchParams.get('limit') || '100')

    let filtered = logs

    if (level.length > 0) {
      filtered = filtered.filter(log => level.includes(log.level))
    }

    if (category) {
      filtered = filtered.filter(log => log.category === category)
    }

    if (source) {
      filtered = filtered.filter(log => log.source === source)
    }

    if (search) {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(search.toLowerCase())
      )
    }

    filtered = filtered.slice(0, limit)

    return HttpResponse.json({ data: filtered, success: true })
  }),

  // Error Patterns
  http.get('/api/monitoring/errors/patterns', ({ request }) => {
    const url = new URL(request.url)
    const timeRange = url.searchParams.get('timeRange') || '24h'

    return HttpResponse.json({ data: errorPatterns, success: true })
  }),

  // System Info
  http.get('/api/monitoring/system-info', () => {
    return HttpResponse.json({
      data: {
        version: '2.1.0',
        buildNumber: '1245',
        environment: 'production',
        deployment: {
          date: '2024-07-15T10:00:00Z',
          commit: 'a1b2c3d4',
          branch: 'main'
        },
        dependencies: [
          { name: 'react', version: '18.3.1', status: 'up-to-date' },
          { name: 'typescript', version: '5.2.2', status: 'up-to-date' },
          { name: 'vite', version: '5.3.4', status: 'outdated' }
        ],
        configuration: {
          database: {
            type: 'postgresql',
            version: '14.9',
            connectionPool: 20
          },
          cache: {
            type: 'redis',
            size: 256,
            hitRate: 0.92
          },
          features: [
            { name: 'real_time_sync', enabled: true },
            { name: 'offline_mode', enabled: true },
            { name: 'analytics', enabled: true }
          ]
        }
      },
      success: true
    })
  }),

  // Real-time metrics
  http.get('/api/monitoring/realtime', ({ request }) => {
    const url = new URL(request.url)
    const metrics = url.searchParams.get('metrics')?.split(',') || []

    const data: Record<string, number> = {}
    metrics.forEach(metric => {
      data[metric] = Math.floor(Math.random() * 100) + Math.sin(Date.now() / 10000) * 20 + 50
    })

    return HttpResponse.json({ data, success: true })
  }),

  // Diagnostics
  http.post('/api/monitoring/diagnostics', () => {
    const diagnosticId = `diag_${Date.now()}`
    
    return HttpResponse.json({
      data: {
        id: diagnosticId,
        status: 'completed',
        results: [
          {
            test: 'Database Connectivity',
            status: 'pass',
            message: 'All database connections are healthy',
            duration: 150
          },
          {
            test: 'API Endpoints',
            status: 'pass',
            message: 'All endpoints responding normally',
            duration: 250
          },
          {
            test: 'Memory Leaks',
            status: 'warning',
            message: 'Minor memory leak detected in worker process',
            duration: 500
          }
        ],
        summary: {
          total: 3,
          passed: 2,
          failed: 0,
          warnings: 1
        }
      },
      success: true
    })
  })
]