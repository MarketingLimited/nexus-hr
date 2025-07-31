export interface AuditLog {
  id: string
  userId: string
  userEmail: string
  action: string
  resource: string
  resourceId?: string
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
  timestamp: string
  ip: string
  userAgent: string
  sessionId: string
  outcome: 'success' | 'failure' | 'partial'
  details?: Record<string, any>
  category: 'authentication' | 'authorization' | 'data_access' | 'data_modification' | 'system_admin' | 'compliance'
}

export interface AuditReport {
  id: string
  name: string
  description: string
  filters: AuditFilters
  generatedAt: string
  generatedBy: string
  totalRecords: number
  downloadUrl?: string
}

export interface AuditFilters {
  userId?: string
  action?: string
  resource?: string
  category?: string
  outcome?: string
  startDate?: string
  endDate?: string
  ip?: string
}

export interface DataRetentionPolicy {
  id: string
  name: string
  description: string
  retentionPeriod: number // in days
  dataTypes: string[]
  autoDelete: boolean
  complianceRequirement?: string
  isActive: boolean
}

class AuditService {
  async getAuditLogs(params?: {
    userId?: string
    action?: string
    resource?: string
    category?: string
    outcome?: string
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.set(key, value.toString())
        }
      })
    }
    
    const response = await fetch(`/api/audit/logs?${searchParams}`)
    if (!response.ok) throw new Error('Failed to fetch audit logs')
    return response.json()
  }

  async createAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>) {
    const response = await fetch('/api/audit/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log)
    })
    if (!response.ok) throw new Error('Failed to create audit log')
    return response.json()
  }

  async generateReport(filters: AuditFilters, name: string, description?: string) {
    const response = await fetch('/api/audit/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filters, name, description })
    })
    if (!response.ok) throw new Error('Failed to generate audit report')
    return response.json()
  }

  async getReports() {
    const response = await fetch('/api/audit/reports')
    if (!response.ok) throw new Error('Failed to fetch audit reports')
    return response.json()
  }

  async downloadReport(reportId: string) {
    const response = await fetch(`/api/audit/reports/${reportId}/download`)
    if (!response.ok) throw new Error('Failed to download report')
    return response.blob()
  }

  async getRetentionPolicies() {
    const response = await fetch('/api/audit/retention-policies')
    if (!response.ok) throw new Error('Failed to fetch retention policies')
    return response.json()
  }

  async createRetentionPolicy(policy: Omit<DataRetentionPolicy, 'id'>) {
    const response = await fetch('/api/audit/retention-policies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(policy)
    })
    if (!response.ok) throw new Error('Failed to create retention policy')
    return response.json()
  }

  async updateRetentionPolicy(id: string, policy: Partial<DataRetentionPolicy>) {
    const response = await fetch(`/api/audit/retention-policies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(policy)
    })
    if (!response.ok) throw new Error('Failed to update retention policy')
    return response.json()
  }

  async deleteRetentionPolicy(id: string) {
    const response = await fetch(`/api/audit/retention-policies/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete retention policy')
    return response.json()
  }

  async getAuditStats() {
    const response = await fetch('/api/audit/stats')
    if (!response.ok) throw new Error('Failed to fetch audit statistics')
    return response.json()
  }
}

export const auditService = new AuditService()