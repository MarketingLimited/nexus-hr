import { http, HttpResponse } from 'msw'
import type { 
  MigrationJob, 
  DataPreview, 
  MigrationTemplate, 
  LegacySystemConnector,
  ValidationResult,
  FieldMapping
} from '../../services/migrationService'

// Mock data
let migrationJobs: MigrationJob[] = [
  {
    id: 'mig_001',
    name: 'Employee Data Import - Q3 2024',
    type: 'import',
    source: 'csv',
    target: 'employees',
    status: 'completed',
    progress: {
      total: 500,
      processed: 500,
      errors: 5,
      warnings: 12
    },
    mapping: [
      {
        sourceField: 'Employee_Name',
        targetField: 'name',
        transformation: 'trim',
        required: true
      },
      {
        sourceField: 'Email_Address',
        targetField: 'email',
        transformation: 'lowercase',
        validationRules: ['email'],
        required: true
      }
    ],
    config: {
      batchSize: 100,
      skipErrors: true,
      validateOnly: false,
      createBackup: true,
      overwriteExisting: false,
      conflictResolution: 'skip'
    },
    validation: [
      {
        field: 'email',
        rule: 'email_format',
        errors: 3,
        warnings: 0,
        samples: [
          {
            value: 'invalid-email',
            error: 'Invalid email format',
            rowNumber: 45
          }
        ]
      }
    ],
    createdBy: 'hr_admin',
    createdAt: '2024-07-15T09:00:00Z',
    startedAt: '2024-07-15T09:05:00Z',
    completedAt: '2024-07-15T09:45:00Z',
    logs: [
      {
        id: 'log_001',
        timestamp: '2024-07-15T09:05:00Z',
        level: 'info',
        message: 'Migration started',
        details: { batchSize: 100 }
      },
      {
        id: 'log_002',
        timestamp: '2024-07-15T09:45:00Z',
        level: 'info',
        message: 'Migration completed successfully'
      }
    ]
  }
]

let migrationTemplates: MigrationTemplate[] = [
  {
    id: 'tpl_001',
    name: 'Standard Employee Import',
    description: 'Template for importing employee data from CSV files',
    sourceType: 'csv',
    targetType: 'employees',
    mapping: [
      { sourceField: 'Employee_ID', targetField: 'id', required: true },
      { sourceField: 'Full_Name', targetField: 'name', required: true },
      { sourceField: 'Email', targetField: 'email', validationRules: ['email'], required: true },
      { sourceField: 'Department', targetField: 'department', required: false }
    ],
    config: {
      batchSize: 100,
      skipErrors: false,
      validateOnly: false,
      createBackup: true,
      overwriteExisting: false,
      conflictResolution: 'skip'
    },
    validationRules: ['email', 'phone', 'required'],
    isPublic: true,
    createdBy: 'system',
    createdAt: '2024-01-01T00:00:00Z',
    usageCount: 25
  }
]

let legacyConnectors: LegacySystemConnector[] = [
  {
    id: 'conn_001',
    name: 'SAP SuccessFactors',
    type: 'successfactors',
    config: {
      endpoint: 'https://api.successfactors.com',
      authMethod: 'oauth',
      credentials: {
        clientId: 'sf_client_123',
        clientSecret: '***'
      },
      mapping: [
        { sourceField: 'personId', targetField: 'id', required: true },
        { sourceField: 'firstName', targetField: 'firstName', required: true },
        { sourceField: 'lastName', targetField: 'lastName', required: true }
      ]
    },
    status: 'active',
    lastSync: '2024-08-01T08:00:00Z'
  }
]

export const migrationHandlers = [
  // Preview data
  http.post('/api/migration/preview', async ({ request }) => {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const sampleSize = parseInt(formData.get('sampleSize') as string) || 10

    // Mock preview data
    const preview: DataPreview = {
      headers: ['Employee_ID', 'Full_Name', 'Email', 'Department', 'Hire_Date'],
      rows: [
        ['EMP001', 'John Doe', 'john.doe@company.com', 'Engineering', '2024-01-15'],
        ['EMP002', 'Jane Smith', 'jane.smith@company.com', 'Marketing', '2024-02-01'],
        ['EMP003', 'Bob Johnson', 'bob.johnson@company.com', 'Sales', '2024-03-10']
      ],
      totalRows: 1500,
      sampleSize,
      detectedSchema: [
        {
          field: 'Employee_ID',
          type: 'string',
          nullable: false,
          unique: true,
          samples: ['EMP001', 'EMP002', 'EMP003']
        },
        {
          field: 'Full_Name',
          type: 'string',
          nullable: false,
          unique: false,
          samples: ['John Doe', 'Jane Smith', 'Bob Johnson']
        },
        {
          field: 'Email',
          type: 'email',
          nullable: false,
          unique: true,
          samples: ['john.doe@company.com', 'jane.smith@company.com']
        },
        {
          field: 'Department',
          type: 'string',
          nullable: true,
          unique: false,
          samples: ['Engineering', 'Marketing', 'Sales']
        },
        {
          field: 'Hire_Date',
          type: 'date',
          nullable: true,
          unique: false,
          samples: ['2024-01-15', '2024-02-01', '2024-03-10']
        }
      ]
    }

    return HttpResponse.json({ data: preview, success: true })
  }),

  // Detect schema
  http.post('/api/migration/detect-schema', async ({ request }) => {
    const { data } = await request.json() as { data: any[] }

    const schema = [
      {
        field: 'id',
        type: 'string' as const,
        nullable: false,
        unique: true,
        samples: ['001', '002', '003']
      },
      {
        field: 'name',
        type: 'string' as const,
        nullable: false,
        unique: false,
        samples: ['John Doe', 'Jane Smith']
      }
    ]

    return HttpResponse.json({ data: schema, success: true })
  }),

  // Get migration jobs
  http.get('/api/migration/jobs', ({ request }) => {
    const url = new URL(request.url)
    const status = url.searchParams.getAll('status')
    const type = url.searchParams.getAll('type')

    let filtered = migrationJobs

    if (status.length > 0) {
      filtered = filtered.filter(job => status.includes(job.status))
    }

    if (type.length > 0) {
      filtered = filtered.filter(job => type.includes(job.type))
    }

    return HttpResponse.json({ data: filtered, success: true })
  }),

  // Get migration job
  http.get('/api/migration/jobs/:id', ({ params }) => {
    const { id } = params
    const job = migrationJobs.find(j => j.id === id)

    if (!job) {
      return HttpResponse.json({ error: 'Migration job not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: job, success: true })
  }),

  // Create migration job
  http.post('/api/migration/jobs', async ({ request }) => {
    const jobData = await request.json() as any
    
    const newJob: MigrationJob = {
      id: `mig_${Date.now()}`,
      name: jobData.name,
      type: jobData.type,
      source: jobData.source,
      target: jobData.target,
      status: 'pending',
      progress: {
        total: 0,
        processed: 0,
        errors: 0,
        warnings: 0
      },
      mapping: jobData.mapping || [],
      config: jobData.config,
      validation: [],
      createdBy: 'current_user',
      createdAt: new Date().toISOString(),
      logs: []
    }

    migrationJobs.push(newJob)
    return HttpResponse.json({ data: newJob, success: true })
  }),

  // Start migration job
  http.post('/api/migration/jobs/:id/start', ({ params }) => {
    const { id } = params
    const jobIndex = migrationJobs.findIndex(j => j.id === id)

    if (jobIndex === -1) {
      return HttpResponse.json({ error: 'Migration job not found' }, { status: 404 })
    }

    migrationJobs[jobIndex].status = 'running'
    migrationJobs[jobIndex].startedAt = new Date().toISOString()

    return HttpResponse.json({ data: migrationJobs[jobIndex], success: true })
  }),

  // Validate data
  http.post('/api/migration/jobs/:id/validate', ({ params }) => {
    const { id } = params
    const job = migrationJobs.find(j => j.id === id)

    if (!job) {
      return HttpResponse.json({ error: 'Migration job not found' }, { status: 404 })
    }

    const validationResults: ValidationResult[] = [
      {
        field: 'email',
        rule: 'email_format',
        errors: 2,
        warnings: 1,
        samples: [
          {
            value: 'invalid-email',
            error: 'Invalid email format',
            rowNumber: 45
          },
          {
            value: 'test@',
            error: 'Incomplete email address',
            rowNumber: 128
          }
        ]
      },
      {
        field: 'phone',
        rule: 'phone_format',
        errors: 0,
        warnings: 3,
        samples: [
          {
            value: '123-456-7890',
            error: 'Non-standard phone format',
            rowNumber: 67
          }
        ]
      }
    ]

    return HttpResponse.json({ data: validationResults, success: true })
  }),

  // Generate mapping
  http.post('/api/migration/generate-mapping', async ({ request }) => {
    const { source, targetSchema } = await request.json() as { source: any; targetSchema: string }

    const mapping: FieldMapping[] = [
      {
        sourceField: 'Employee_ID',
        targetField: 'id',
        required: true
      },
      {
        sourceField: 'Full_Name',
        targetField: 'name',
        transformation: 'trim',
        required: true
      },
      {
        sourceField: 'Email',
        targetField: 'email',
        transformation: 'lowercase',
        validationRules: ['email'],
        required: true
      }
    ]

    return HttpResponse.json({ data: mapping, success: true })
  }),

  // Get migration templates
  http.get('/api/migration/templates', ({ request }) => {
    const url = new URL(request.url)
    const sourceType = url.searchParams.get('sourceType')
    const targetType = url.searchParams.get('targetType')

    let filtered = migrationTemplates

    if (sourceType) {
      filtered = filtered.filter(t => t.sourceType === sourceType)
    }

    if (targetType) {
      filtered = filtered.filter(t => t.targetType === targetType)
    }

    return HttpResponse.json({ data: filtered, success: true })
  }),

  // Create migration template
  http.post('/api/migration/templates', async ({ request }) => {
    const templateData = await request.json() as Partial<MigrationTemplate>
    
    const newTemplate: MigrationTemplate = {
      id: `tpl_${Date.now()}`,
      ...(templateData as any),
      createdAt: new Date().toISOString(),
      usageCount: 0
    }

    migrationTemplates.push(newTemplate)
    return HttpResponse.json({ data: newTemplate, success: true })
  }),

  // Get legacy connectors
  http.get('/api/migration/connectors', () => {
    return HttpResponse.json({ data: legacyConnectors, success: true })
  }),

  // Create legacy connector
  http.post('/api/migration/connectors', async ({ request }) => {
    const connectorData = await request.json() as Partial<LegacySystemConnector>
    
    const newConnector: LegacySystemConnector = {
      id: `conn_${Date.now()}`,
      ...(connectorData as any)
    }

    legacyConnectors.push(newConnector)
    return HttpResponse.json({ data: newConnector, success: true })
  }),

  // Test legacy connector
  http.post('/api/migration/connectors/:id/test', ({ params }) => {
    const { id } = params
    const connector = legacyConnectors.find(c => c.id === id)

    if (!connector) {
      return HttpResponse.json({ error: 'Connector not found' }, { status: 404 })
    }

    // Simulate test result
    const success = Math.random() > 0.2

    return HttpResponse.json({
      data: {
        success,
        message: success ? 'Connection successful' : 'Authentication failed',
        details: success ? { recordCount: 1500 } : { error: 'Invalid credentials' }
      },
      success: true
    })
  }),

  // Export data
  http.post('/api/migration/export', async ({ request }) => {
    const options = await request.json()
    
    const jobId = `exp_${Date.now()}`
    
    return HttpResponse.json({
      data: {
        jobId,
        downloadUrl: `/api/migration/download/${jobId}`
      },
      success: true
    })
  }),

  // Create backup
  http.post('/api/migration/backup', async ({ request }) => {
    const options = await request.json()
    
    return HttpResponse.json({
      data: {
        backupId: `backup_${Date.now()}`,
        size: 1024 * 1024 * 50, // 50MB
        createdAt: new Date().toISOString()
      },
      success: true
    })
  }),

  // Get migration analytics
  http.get('/api/migration/analytics', ({ request }) => {
    const url = new URL(request.url)
    const period = url.searchParams.get('period') || '30d'

    return HttpResponse.json({
      data: {
        totalJobs: 125,
        successRate: 0.92,
        averageProcessingTime: 1800, // 30 minutes in seconds
        dataVolume: {
          imported: 50000,
          exported: 25000,
          transformed: 15000
        },
        errorPatterns: [
          {
            error: 'Invalid email format',
            count: 45,
            lastOccurrence: '2024-08-01T10:30:00Z'
          },
          {
            error: 'Missing required field',
            count: 32,
            lastOccurrence: '2024-07-30T14:15:00Z'
          }
        ]
      },
      success: true
    })
  }),

  // Validate file
  http.post('/api/migration/validate-file', async ({ request }) => {
    const formData = await request.formData()
    const file = formData.get('file') as File

    return HttpResponse.json({
      data: {
        valid: true,
        errors: [],
        warnings: ['File encoding detected as UTF-8 with BOM'],
        metadata: {
          size: file.size,
          type: file.type,
          encoding: 'UTF-8',
          rowCount: 1500
        }
      },
      success: true
    })
  }),

  // Get supported formats
  http.get('/api/migration/supported-formats', () => {
    return HttpResponse.json({
      data: {
        import: ['csv', 'excel', 'json', 'xml'],
        export: ['csv', 'excel', 'json', 'xml', 'pdf'],
        transformation: ['map', 'format', 'calculate', 'merge', 'split']
      },
      success: true
    })
  })
]