import { http, HttpResponse } from 'msw'
import { AuditLog, AuditReport, DataRetentionPolicy } from '../../services/auditService'

// Mock data
let auditLogs: AuditLog[] = [
  {
    id: 'audit_1',
    userId: '1',
    userEmail: 'admin@company.com',
    action: 'USER_LOGIN',
    resource: 'authentication',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    sessionId: 'sess_1',
    outcome: 'success',
    category: 'authentication',
    details: { loginMethod: 'password', mfaUsed: false }
  },
  {
    id: 'audit_2',
    userId: '1',
    userEmail: 'admin@company.com',
    action: 'EMPLOYEE_UPDATE',
    resource: 'employee',
    resourceId: '123',
    oldValues: { department: 'IT', salary: 75000 },
    newValues: { department: 'Engineering', salary: 80000 },
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    sessionId: 'sess_1',
    outcome: 'success',
    category: 'data_modification'
  },
  {
    id: 'audit_3',
    userId: '2',
    userEmail: 'user@company.com',
    action: 'PAYROLL_ACCESS',
    resource: 'payroll',
    resourceId: '456',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    ip: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    sessionId: 'sess_2',
    outcome: 'failure',
    category: 'authorization',
    details: { reason: 'insufficient_permissions' }
  }
]

let auditReports: AuditReport[] = [
  {
    id: 'report_1',
    name: 'Monthly Access Report',
    description: 'All access attempts for the month',
    filters: {
      category: 'data_access',
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString()
    },
    generatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    generatedBy: 'admin@company.com',
    totalRecords: 150,
    downloadUrl: '/downloads/monthly-access-report.pdf'
  }
]

let retentionPolicies: DataRetentionPolicy[] = [
  {
    id: 'policy_1',
    name: 'Employee Data Retention',
    description: 'Retention policy for employee personal data',
    retentionPeriod: 2555, // 7 years
    dataTypes: ['employee_records', 'payroll_data', 'performance_reviews'],
    autoDelete: true,
    complianceRequirement: 'GDPR Art. 5(1)(e)',
    isActive: true
  },
  {
    id: 'policy_2',
    name: 'Audit Log Retention',
    description: 'Retention policy for security and audit logs',
    retentionPeriod: 1095, // 3 years
    dataTypes: ['audit_logs', 'security_events', 'access_logs'],
    autoDelete: true,
    complianceRequirement: 'SOX Section 404',
    isActive: true
  }
]

export const auditHandlers = [
  // Get audit logs
  http.get('/api/audit/logs', ({ request }) => {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    const action = url.searchParams.get('action')
    const resource = url.searchParams.get('resource')
    const category = url.searchParams.get('category')
    const outcome = url.searchParams.get('outcome')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    let filteredLogs = [...auditLogs]

    if (userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === userId)
    }
    if (action) {
      filteredLogs = filteredLogs.filter(log => log.action.includes(action.toUpperCase()))
    }
    if (resource) {
      filteredLogs = filteredLogs.filter(log => log.resource === resource)
    }
    if (category) {
      filteredLogs = filteredLogs.filter(log => log.category === category)
    }
    if (outcome) {
      filteredLogs = filteredLogs.filter(log => log.outcome === outcome)
    }

    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex)

    return HttpResponse.json({
      data: paginatedLogs,
      meta: {
        total: filteredLogs.length,
        page,
        limit,
        totalPages: Math.ceil(filteredLogs.length / limit)
      }
    })
  }),

  // Create audit log
  http.post('/api/audit/logs', async ({ request }) => {
    const log = await request.json() as Omit<AuditLog, 'id' | 'timestamp'>
    const newLog: AuditLog = {
      ...log,
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString()
    }
    auditLogs.unshift(newLog)
    return HttpResponse.json({ data: newLog })
  }),

  // Generate report
  http.post('/api/audit/reports', async ({ request }) => {
    const body = await request.json() as { filters: any; name: string; description?: string }
    const { filters, name, description } = body
    
    const newReport: AuditReport = {
      id: `report_${Date.now()}`,
      name,
      description: description || '',
      filters,
      generatedAt: new Date().toISOString(),
      generatedBy: 'current_user@company.com',
      totalRecords: Math.floor(Math.random() * 500) + 50,
      downloadUrl: `/downloads/${name.toLowerCase().replace(/\s+/g, '-')}.pdf`
    }
    
    auditReports.push(newReport)
    return HttpResponse.json({ data: newReport })
  }),

  // Get reports
  http.get('/api/audit/reports', () => {
    return HttpResponse.json({ data: auditReports })
  }),

  // Download report
  http.get('/api/audit/reports/:reportId/download', ({ params }) => {
    const { reportId } = params
    const report = auditReports.find(r => r.id === reportId)
    
    if (!report) {
      return HttpResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    // Return a mock PDF blob
    const pdfContent = `Mock PDF content for report: ${report.name}`
    return new HttpResponse(pdfContent, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${report.name}.pdf"`
      }
    })
  }),

  // Get retention policies
  http.get('/api/audit/retention-policies', () => {
    return HttpResponse.json({ data: retentionPolicies })
  }),

  // Create retention policy
  http.post('/api/audit/retention-policies', async ({ request }) => {
    const policy = await request.json() as Omit<DataRetentionPolicy, 'id'>
    const newPolicy: DataRetentionPolicy = {
      ...policy,
      id: `policy_${Date.now()}`
    }
    retentionPolicies.push(newPolicy)
    return HttpResponse.json({ data: newPolicy })
  }),

  // Update retention policy
  http.put('/api/audit/retention-policies/:id', async ({ params, request }) => {
    const { id } = params
    const update = await request.json() as Partial<DataRetentionPolicy>
    const policyIndex = retentionPolicies.findIndex(p => p.id === id)
    
    if (policyIndex === -1) {
      return HttpResponse.json({ error: 'Policy not found' }, { status: 404 })
    }

    retentionPolicies[policyIndex] = { ...retentionPolicies[policyIndex], ...update }
    return HttpResponse.json({ data: retentionPolicies[policyIndex] })
  }),

  // Delete retention policy
  http.delete('/api/audit/retention-policies/:id', ({ params }) => {
    const { id } = params
    const policyIndex = retentionPolicies.findIndex(p => p.id === id)
    
    if (policyIndex === -1) {
      return HttpResponse.json({ error: 'Policy not found' }, { status: 404 })
    }

    retentionPolicies.splice(policyIndex, 1)
    return HttpResponse.json({ message: 'Policy deleted successfully' })
  }),

  // Get audit statistics
  http.get('/api/audit/stats', () => {
    const now = new Date()
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const recentLogs = auditLogs.filter(log => new Date(log.timestamp) > last24Hours)
    const weeklyLogs = auditLogs.filter(log => new Date(log.timestamp) > lastWeek)

    const stats = {
      totalLogs: auditLogs.length,
      logs24h: recentLogs.length,
      logsThisWeek: weeklyLogs.length,
      failedActions24h: recentLogs.filter(log => log.outcome === 'failure').length,
      topActions: [
        { action: 'USER_LOGIN', count: 45 },
        { action: 'DATA_ACCESS', count: 32 },
        { action: 'EMPLOYEE_UPDATE', count: 18 }
      ],
      categoryBreakdown: {
        authentication: recentLogs.filter(log => log.category === 'authentication').length,
        authorization: recentLogs.filter(log => log.category === 'authorization').length,
        data_access: recentLogs.filter(log => log.category === 'data_access').length,
        data_modification: recentLogs.filter(log => log.category === 'data_modification').length,
        system_admin: recentLogs.filter(log => log.category === 'system_admin').length,
        compliance: recentLogs.filter(log => log.category === 'compliance').length
      }
    }

    return HttpResponse.json({ data: stats })
  })
]