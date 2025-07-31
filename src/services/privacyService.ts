export interface DataClassification {
  id: string
  name: string
  level: 'public' | 'internal' | 'confidential' | 'restricted'
  description: string
  handlingRequirements: string[]
  retentionPeriod: number // in days
  accessRestrictions: string[]
  isActive: boolean
}

export interface ConsentRecord {
  id: string
  userId: string
  consentType: string
  purpose: string
  granted: boolean
  grantedAt?: string
  revokedAt?: string
  expiresAt?: string
  legalBasis: 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_task' | 'legitimate_interests'
  dataCategories: string[]
  processingActivities: string[]
  thirdParties?: string[]
}

export interface DataSubjectRequest {
  id: string
  userId: string
  requestType: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction' | 'objection'
  status: 'pending' | 'in_progress' | 'completed' | 'rejected'
  requestedAt: string
  completedAt?: string
  description: string
  response?: string
  attachments?: string[]
  handledBy?: string
  dueDate: string
}

export interface PrivacyImpactAssessment {
  id: string
  title: string
  description: string
  dataTypes: string[]
  processingPurposes: string[]
  riskLevel: 'low' | 'medium' | 'high'
  riskFactors: string[]
  mitigationMeasures: string[]
  status: 'draft' | 'under_review' | 'approved' | 'requires_revision'
  createdBy: string
  createdAt: string
  reviewedBy?: string
  reviewedAt?: string
  nextReviewDate: string
}

export interface DataExportRequest {
  id: string
  userId: string
  requestedBy: string
  dataCategories: string[]
  format: 'json' | 'csv' | 'xml'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  requestedAt: string
  completedAt?: string
  downloadUrl?: string
  expiresAt?: string
}

class PrivacyService {
  async getDataClassifications() {
    const response = await fetch('/api/privacy/classifications')
    if (!response.ok) throw new Error('Failed to fetch data classifications')
    return response.json()
  }

  async createDataClassification(classification: Omit<DataClassification, 'id'>) {
    const response = await fetch('/api/privacy/classifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(classification)
    })
    if (!response.ok) throw new Error('Failed to create data classification')
    return response.json()
  }

  async updateDataClassification(id: string, classification: Partial<DataClassification>) {
    const response = await fetch(`/api/privacy/classifications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(classification)
    })
    if (!response.ok) throw new Error('Failed to update data classification')
    return response.json()
  }

  async getConsentRecords(userId?: string) {
    const params = userId ? `?userId=${userId}` : ''
    const response = await fetch(`/api/privacy/consent${params}`)
    if (!response.ok) throw new Error('Failed to fetch consent records')
    return response.json()
  }

  async updateConsent(id: string, granted: boolean, purpose?: string) {
    const response = await fetch(`/api/privacy/consent/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ granted, purpose })
    })
    if (!response.ok) throw new Error('Failed to update consent')
    return response.json()
  }

  async getDataSubjectRequests(params?: {
    userId?: string
    requestType?: string
    status?: string
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
    
    const response = await fetch(`/api/privacy/data-subject-requests?${searchParams}`)
    if (!response.ok) throw new Error('Failed to fetch data subject requests')
    return response.json()
  }

  async createDataSubjectRequest(request: Omit<DataSubjectRequest, 'id' | 'requestedAt' | 'status' | 'dueDate'>) {
    const response = await fetch('/api/privacy/data-subject-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    })
    if (!response.ok) throw new Error('Failed to create data subject request')
    return response.json()
  }

  async updateDataSubjectRequest(id: string, update: Partial<DataSubjectRequest>) {
    const response = await fetch(`/api/privacy/data-subject-requests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update)
    })
    if (!response.ok) throw new Error('Failed to update data subject request')
    return response.json()
  }

  async getPrivacyImpactAssessments() {
    const response = await fetch('/api/privacy/impact-assessments')
    if (!response.ok) throw new Error('Failed to fetch privacy impact assessments')
    return response.json()
  }

  async createPrivacyImpactAssessment(pia: Omit<PrivacyImpactAssessment, 'id' | 'createdAt' | 'status'>) {
    const response = await fetch('/api/privacy/impact-assessments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pia)
    })
    if (!response.ok) throw new Error('Failed to create privacy impact assessment')
    return response.json()
  }

  async requestDataExport(userId: string, dataCategories: string[], format: 'json' | 'csv' | 'xml') {
    const response = await fetch('/api/privacy/data-export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, dataCategories, format })
    })
    if (!response.ok) throw new Error('Failed to request data export')
    return response.json()
  }

  async getDataExportRequests(userId?: string) {
    const params = userId ? `?userId=${userId}` : ''
    const response = await fetch(`/api/privacy/data-export${params}`)
    if (!response.ok) throw new Error('Failed to fetch data export requests')
    return response.json()
  }

  async getPrivacyDashboard() {
    const response = await fetch('/api/privacy/dashboard')
    if (!response.ok) throw new Error('Failed to fetch privacy dashboard')
    return response.json()
  }
}

export const privacyService = new PrivacyService()