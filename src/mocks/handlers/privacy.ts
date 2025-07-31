import { http, HttpResponse } from 'msw'
import { DataClassification, ConsentRecord, DataSubjectRequest, PrivacyImpactAssessment, DataExportRequest } from '../../services/privacyService'

// Mock data
let dataClassifications: DataClassification[] = [
  {
    id: 'class_1',
    name: 'Employee Personal Data',
    level: 'confidential',
    description: 'Personal information of employees including names, addresses, and contact details',
    handlingRequirements: ['Encryption at rest', 'Access logging', 'Regular backup'],
    retentionPeriod: 2555, // 7 years
    accessRestrictions: ['HR Department', 'Direct Manager', 'Employee Self'],
    isActive: true
  },
  {
    id: 'class_2',
    name: 'Financial Records',
    level: 'restricted',
    description: 'Salary, tax information, and financial records',
    handlingRequirements: ['Strong encryption', 'Multi-factor authentication', 'Audit trail'],
    retentionPeriod: 2555, // 7 years
    accessRestrictions: ['Finance Department', 'Authorized Personnel Only'],
    isActive: true
  },
  {
    id: 'class_3',
    name: 'Company Directory',
    level: 'internal',
    description: 'Basic employee directory information for internal use',
    handlingRequirements: ['Standard access controls', 'Regular updates'],
    retentionPeriod: 365, // 1 year after termination
    accessRestrictions: ['All Employees'],
    isActive: true
  }
]

let consentRecords: ConsentRecord[] = [
  {
    id: 'consent_1',
    userId: '1',
    consentType: 'marketing_communications',
    purpose: 'Receiving company newsletters and updates',
    granted: true,
    grantedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    legalBasis: 'consent',
    dataCategories: ['email', 'communication_preferences'],
    processingActivities: ['email_marketing', 'newsletter_distribution']
  },
  {
    id: 'consent_2',
    userId: '1',
    consentType: 'performance_monitoring',
    purpose: 'Monitoring work performance and productivity',
    granted: true,
    grantedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    legalBasis: 'legitimate_interests',
    dataCategories: ['work_activities', 'performance_metrics'],
    processingActivities: ['performance_tracking', 'productivity_analysis']
  },
  {
    id: 'consent_3',
    userId: '2',
    consentType: 'photo_usage',
    purpose: 'Using employee photos in company materials',
    granted: false,
    revokedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    legalBasis: 'consent',
    dataCategories: ['profile_photo', 'image_rights'],
    processingActivities: ['marketing_materials', 'website_content']
  }
]

let dataSubjectRequests: DataSubjectRequest[] = [
  {
    id: 'dsr_1',
    userId: '1',
    requestType: 'access',
    status: 'completed',
    requestedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Request for all personal data held by the company',
    response: 'Data export provided via secure download link',
    handledBy: 'privacy_officer@company.com',
    dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'dsr_2',
    userId: '3',
    requestType: 'erasure',
    status: 'in_progress',
    requestedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Request to delete all personal data following termination',
    handledBy: 'privacy_officer@company.com',
    dueDate: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000).toISOString()
  }
]

let privacyImpactAssessments: PrivacyImpactAssessment[] = [
  {
    id: 'pia_1',
    title: 'Employee Monitoring System PIA',
    description: 'Privacy impact assessment for new employee monitoring and productivity tracking system',
    dataTypes: ['work_activities', 'computer_usage', 'application_usage', 'productivity_metrics'],
    processingPurposes: ['performance_management', 'productivity_optimization', 'compliance_monitoring'],
    riskLevel: 'medium',
    riskFactors: ['Continuous monitoring', 'Detailed activity tracking', 'Potential for function creep'],
    mitigationMeasures: ['Data minimization', 'Purpose limitation', 'Regular review cycles', 'Employee transparency'],
    status: 'approved',
    createdBy: 'privacy_officer@company.com',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    reviewedBy: 'dpo@company.com',
    reviewedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    nextReviewDate: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000).toISOString()
  }
]

let dataExportRequests: DataExportRequest[] = [
  {
    id: 'export_1',
    userId: '1',
    requestedBy: 'admin@company.com',
    dataCategories: ['profile', 'employment_history', 'performance_data'],
    format: 'json',
    status: 'completed',
    requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    downloadUrl: '/downloads/user_1_data_export.json',
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
  }
]

export const privacyHandlers = [
  // Get data classifications
  http.get('/api/privacy/classifications', () => {
    return HttpResponse.json({ data: dataClassifications })
  }),

  // Create data classification
  http.post('/api/privacy/classifications', async ({ request }) => {
    const classification = await request.json() as Omit<DataClassification, 'id'>
    const newClassification: DataClassification = {
      ...classification,
      id: `class_${Date.now()}`
    }
    dataClassifications.push(newClassification)
    return HttpResponse.json({ data: newClassification })
  }),

  // Update data classification
  http.put('/api/privacy/classifications/:id', async ({ params, request }) => {
    const { id } = params
    const update = await request.json()
    const classIndex = dataClassifications.findIndex(c => c.id === id)
    
    if (classIndex === -1) {
      return HttpResponse.json({ error: 'Classification not found' }, { status: 404 })
    }

    dataClassifications[classIndex] = { ...dataClassifications[classIndex], ...(update as Partial<DataClassification>) }
    return HttpResponse.json({ data: dataClassifications[classIndex] })
  }),

  // Get consent records
  http.get('/api/privacy/consent', ({ request }) => {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')

    let filteredConsent = [...consentRecords]
    if (userId) {
      filteredConsent = filteredConsent.filter(consent => consent.userId === userId)
    }

    return HttpResponse.json({ data: filteredConsent })
  }),

  // Update consent
  http.put('/api/privacy/consent/:id', async ({ params, request }) => {
    const { id } = params
    const { granted, purpose } = await request.json() as { granted: boolean; purpose?: string }
    const consentIndex = consentRecords.findIndex(c => c.id === id)
    
    if (consentIndex === -1) {
      return HttpResponse.json({ error: 'Consent record not found' }, { status: 404 })
    }

    const now = new Date().toISOString()
    consentRecords[consentIndex] = {
      ...consentRecords[consentIndex],
      granted,
      ...(granted ? { grantedAt: now, revokedAt: undefined } : { revokedAt: now }),
      ...(purpose && { purpose })
    }

    return HttpResponse.json({ data: consentRecords[consentIndex] })
  }),

  // Get data subject requests
  http.get('/api/privacy/data-subject-requests', ({ request }) => {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    const requestType = url.searchParams.get('requestType')
    const status = url.searchParams.get('status')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    let filteredRequests = [...dataSubjectRequests]

    if (userId) {
      filteredRequests = filteredRequests.filter(req => req.userId === userId)
    }
    if (requestType) {
      filteredRequests = filteredRequests.filter(req => req.requestType === requestType)
    }
    if (status) {
      filteredRequests = filteredRequests.filter(req => req.status === status)
    }

    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedRequests = filteredRequests.slice(startIndex, endIndex)

    return HttpResponse.json({
      data: paginatedRequests,
      meta: {
        total: filteredRequests.length,
        page,
        limit,
        totalPages: Math.ceil(filteredRequests.length / limit)
      }
    })
  }),

  // Create data subject request
  http.post('/api/privacy/data-subject-requests', async ({ request }) => {
    const requestData = await request.json() as Omit<DataSubjectRequest, 'id' | 'requestedAt' | 'status' | 'dueDate'>
    const now = new Date()
    const dueDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days from now

    const newRequest: DataSubjectRequest = {
      ...requestData,
      id: `dsr_${Date.now()}`,
      requestedAt: now.toISOString(),
      status: 'pending',
      dueDate: dueDate.toISOString()
    }
    
    dataSubjectRequests.push(newRequest)
    return HttpResponse.json({ data: newRequest })
  }),

  // Update data subject request
  http.put('/api/privacy/data-subject-requests/:id', async ({ params, request }) => {
    const { id } = params
    const update = await request.json()
    const requestIndex = dataSubjectRequests.findIndex(r => r.id === id)
    
    if (requestIndex === -1) {
      return HttpResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    const updateData = update as Partial<DataSubjectRequest>
    if (updateData.status === 'completed' && !dataSubjectRequests[requestIndex].completedAt) {
      updateData.completedAt = new Date().toISOString()
    }

    dataSubjectRequests[requestIndex] = { ...dataSubjectRequests[requestIndex], ...updateData }
    return HttpResponse.json({ data: dataSubjectRequests[requestIndex] })
  }),

  // Get privacy impact assessments
  http.get('/api/privacy/impact-assessments', () => {
    return HttpResponse.json({ data: privacyImpactAssessments })
  }),

  // Create privacy impact assessment
  http.post('/api/privacy/impact-assessments', async ({ request }) => {
    const pia = await request.json() as Omit<PrivacyImpactAssessment, 'id' | 'createdAt' | 'status'>
    const newPIA: PrivacyImpactAssessment = {
      ...pia,
      id: `pia_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'draft'
    }
    privacyImpactAssessments.push(newPIA)
    return HttpResponse.json({ data: newPIA })
  }),

  // Request data export
  http.post('/api/privacy/data-export', async ({ request }) => {
    const { userId, dataCategories, format } = await request.json() as { userId: string; dataCategories: string[]; format: 'json' | 'csv' | 'xml' }
    const newExport: DataExportRequest = {
      id: `export_${Date.now()}`,
      userId,
      requestedBy: 'current_user@company.com',
      dataCategories,
      format,
      status: 'pending',
      requestedAt: new Date().toISOString()
    }
    dataExportRequests.push(newExport)
    
    // Simulate processing
    setTimeout(() => {
      const exportIndex = dataExportRequests.findIndex(e => e.id === newExport.id)
      if (exportIndex !== -1) {
        dataExportRequests[exportIndex].status = 'completed'
        dataExportRequests[exportIndex].completedAt = new Date().toISOString()
        dataExportRequests[exportIndex].downloadUrl = `/downloads/user_${userId}_export.${format}`
        dataExportRequests[exportIndex].expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    }, 2000)

    return HttpResponse.json({ data: newExport })
  }),

  // Get data export requests
  http.get('/api/privacy/data-export', ({ request }) => {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')

    let filteredExports = [...dataExportRequests]
    if (userId) {
      filteredExports = filteredExports.filter(exp => exp.userId === userId)
    }

    return HttpResponse.json({ data: filteredExports })
  }),

  // Get privacy dashboard
  http.get('/api/privacy/dashboard', () => {
    const totalRequests = dataSubjectRequests.length
    const pendingRequests = dataSubjectRequests.filter(r => r.status === 'pending').length
    const overdueRequests = dataSubjectRequests.filter(r => 
      r.status !== 'completed' && new Date(r.dueDate) < new Date()
    ).length
    
    const consentStats = {
      total: consentRecords.length,
      granted: consentRecords.filter(c => c.granted).length,
      revoked: consentRecords.filter(c => !c.granted).length
    }

    const dashboard = {
      dataSubjectRequests: {
        total: totalRequests,
        pending: pendingRequests,
        overdue: overdueRequests,
        completionRate: totalRequests > 0 ? ((totalRequests - pendingRequests) / totalRequests * 100).toFixed(1) : '0'
      },
      consent: consentStats,
      dataClassifications: {
        total: dataClassifications.length,
        active: dataClassifications.filter(c => c.isActive).length
      },
      privacyImpactAssessments: {
        total: privacyImpactAssessments.length,
        approved: privacyImpactAssessments.filter(p => p.status === 'approved').length,
        pending: privacyImpactAssessments.filter(p => p.status === 'under_review').length
      },
      complianceScore: 85, // Mock compliance score
      recentActivity: [
        { type: 'Data Subject Request', action: 'New access request submitted', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
        { type: 'Consent', action: 'Marketing consent revoked', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
        { type: 'Data Export', action: 'Employee data export completed', timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() }
      ]
    }

    return HttpResponse.json({ data: dashboard })
  })
]