import { api, ApiResponse } from './api'

export interface MigrationJob {
  id: string
  name: string
  type: 'import' | 'export' | 'transform'
  source: string // 'csv', 'excel', 'json', 'xml', 'api', 'database'
  target: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused'
  progress: {
    total: number
    processed: number
    errors: number
    warnings: number
  }
  mapping: FieldMapping[]
  config: MigrationConfig
  validation: ValidationResult[]
  createdBy: string
  createdAt: string
  startedAt?: string
  completedAt?: string
  error?: string
  logs: MigrationLog[]
}

export interface FieldMapping {
  sourceField: string
  targetField: string
  transformation?: string
  validationRules?: string[]
  defaultValue?: any
  required: boolean
}

export interface MigrationConfig {
  batchSize: number
  skipErrors: boolean
  validateOnly: boolean
  createBackup: boolean
  overwriteExisting: boolean
  conflictResolution: 'skip' | 'overwrite' | 'merge'
  customSettings?: Record<string, any>
}

export interface ValidationResult {
  field: string
  rule: string
  errors: number
  warnings: number
  samples: {
    value: any
    error: string
    rowNumber: number
  }[]
}

export interface MigrationLog {
  id: string
  timestamp: string
  level: 'info' | 'warning' | 'error'
  message: string
  details?: Record<string, any>
}

export interface DataPreview {
  headers: string[]
  rows: any[][]
  totalRows: number
  sampleSize: number
  detectedSchema: {
    field: string
    type: 'string' | 'number' | 'date' | 'boolean' | 'email' | 'phone'
    nullable: boolean
    unique: boolean
    samples: any[]
  }[]
}

export interface LegacySystemConnector {
  id: string
  name: string
  type: 'sap' | 'workday' | 'bamboohr' | 'adp' | 'successfactors' | 'custom'
  config: {
    endpoint?: string
    authMethod: 'api_key' | 'oauth' | 'basic' | 'bearer'
    credentials: Record<string, string>
    mapping: FieldMapping[]
  }
  status: 'active' | 'inactive' | 'error'
  lastSync?: string
}

export interface MigrationTemplate {
  id: string
  name: string
  description: string
  sourceType: string
  targetType: string
  mapping: FieldMapping[]
  config: MigrationConfig
  validationRules: string[]
  isPublic: boolean
  createdBy: string
  createdAt: string
  usageCount: number
}

export const migrationService = {
  // Data Preview and Analysis
  previewData: (file: File | string, options?: {
    sampleSize?: number
    delimiter?: string
    hasHeader?: boolean
  }) => {
    const formData = new FormData()
    if (file instanceof File) {
      formData.append('file', file)
    } else {
      formData.append('url', file)
    }
    
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        formData.append(key, value.toString())
      })
    }

    return api.post<ApiResponse<DataPreview>>('/migration/preview', formData)
  },

  detectSchema: (data: any[]) => 
    api.post<ApiResponse<DataPreview['detectedSchema']>>('/migration/detect-schema', { data }),

  // Migration Jobs
  getMigrationJobs: (filters?: {
    status?: string[]
    type?: string[]
    createdBy?: string
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
    
    return api.get<ApiResponse<MigrationJob[]>>(`/migration/jobs?${params}`)
  },

  getMigrationJob: (id: string) => 
    api.get<ApiResponse<MigrationJob>>(`/migration/jobs/${id}`),

  createMigrationJob: (jobData: {
    name: string
    type: 'import' | 'export' | 'transform'
    source: string
    target: string
    mapping: FieldMapping[]
    config: MigrationConfig
    templateId?: string
  }) => 
    api.post<ApiResponse<MigrationJob>>('/migration/jobs', jobData),

  updateMigrationJob: (id: string, updates: Partial<MigrationJob>) => 
    api.put<ApiResponse<MigrationJob>>(`/migration/jobs/${id}`, updates),

  startMigrationJob: (id: string) => 
    api.post<ApiResponse<MigrationJob>>(`/migration/jobs/${id}/start`),

  pauseMigrationJob: (id: string) => 
    api.post<ApiResponse<MigrationJob>>(`/migration/jobs/${id}/pause`),

  resumeMigrationJob: (id: string) => 
    api.post<ApiResponse<MigrationJob>>(`/migration/jobs/${id}/resume`),

  cancelMigrationJob: (id: string) => 
    api.post<ApiResponse<MigrationJob>>(`/migration/jobs/${id}/cancel`),

  deleteMigrationJob: (id: string) => 
    api.delete<ApiResponse<{ message: string }>>(`/migration/jobs/${id}`),

  // Validation
  validateData: (jobId: string) => 
    api.post<ApiResponse<ValidationResult[]>>(`/migration/jobs/${jobId}/validate`),

  getValidationResults: (jobId: string) => 
    api.get<ApiResponse<ValidationResult[]>>(`/migration/jobs/${jobId}/validation`),

  // Field Mapping
  generateMapping: (source: DataPreview['detectedSchema'], targetSchema: string) => 
    api.post<ApiResponse<FieldMapping[]>>('/migration/generate-mapping', {
      source,
      targetSchema
    }),

  validateMapping: (mapping: FieldMapping[], sourceSchema: any, targetSchema: any) => 
    api.post<ApiResponse<{
      valid: boolean
      errors: string[]
      warnings: string[]
      suggestions: {
        field: string
        suggestion: string
      }[]
    }>>('/migration/validate-mapping', {
      mapping,
      sourceSchema,
      targetSchema
    }),

  // Templates
  getMigrationTemplates: (filters?: {
    sourceType?: string
    targetType?: string
    isPublic?: boolean
  }) => {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString())
        }
      })
    }
    
    return api.get<ApiResponse<MigrationTemplate[]>>(`/migration/templates?${params}`)
  },

  getMigrationTemplate: (id: string) => 
    api.get<ApiResponse<MigrationTemplate>>(`/migration/templates/${id}`),

  createMigrationTemplate: (templateData: Omit<MigrationTemplate, 'id' | 'createdAt' | 'usageCount'>) => 
    api.post<ApiResponse<MigrationTemplate>>('/migration/templates', templateData),

  updateMigrationTemplate: (id: string, updates: Partial<MigrationTemplate>) => 
    api.put<ApiResponse<MigrationTemplate>>(`/migration/templates/${id}`, updates),

  deleteMigrationTemplate: (id: string) => 
    api.delete<ApiResponse<{ message: string }>>(`/migration/templates/${id}`),

  // Legacy System Connectors
  getLegacyConnectors: () => 
    api.get<ApiResponse<LegacySystemConnector[]>>('/migration/connectors'),

  getLegacyConnector: (id: string) => 
    api.get<ApiResponse<LegacySystemConnector>>(`/migration/connectors/${id}`),

  createLegacyConnector: (connectorData: Omit<LegacySystemConnector, 'id'>) => 
    api.post<ApiResponse<LegacySystemConnector>>('/migration/connectors', connectorData),

  updateLegacyConnector: (id: string, updates: Partial<LegacySystemConnector>) => 
    api.put<ApiResponse<LegacySystemConnector>>(`/migration/connectors/${id}`, updates),

  testLegacyConnector: (id: string) => 
    api.post<ApiResponse<{
      success: boolean
      message: string
      details?: any
    }>>(`/migration/connectors/${id}/test`),

  syncFromLegacySystem: (connectorId: string, options?: {
    dryRun?: boolean
    entityTypes?: string[]
    since?: string
  }) => 
    api.post<ApiResponse<MigrationJob>>(`/migration/connectors/${connectorId}/sync`, options),

  deleteLegacyConnector: (id: string) => 
    api.delete<ApiResponse<{ message: string }>>(`/migration/connectors/${id}`),

  // Data Export
  exportData: (options: {
    entityTypes: string[]
    format: 'csv' | 'excel' | 'json' | 'xml'
    filters?: Record<string, any>
    includeRelations?: boolean
  }) => 
    api.post<ApiResponse<{
      jobId: string
      downloadUrl?: string
    }>>('/migration/export', options),

  // Data Transformation
  transformData: (jobId: string, transformations: {
    field: string
    operation: 'map' | 'format' | 'calculate' | 'merge' | 'split'
    config: Record<string, any>
  }[]) => 
    api.post<ApiResponse<MigrationJob>>(`/migration/jobs/${jobId}/transform`, {
      transformations
    }),

  // Backup and Restore
  createBackup: (options?: {
    entityTypes?: string[]
    compressed?: boolean
    encrypted?: boolean
  }) => 
    api.post<ApiResponse<{
      backupId: string
      size: number
      createdAt: string
    }>>('/migration/backup', options),

  restoreFromBackup: (backupId: string, options?: {
    overwriteExisting?: boolean
    validateData?: boolean
  }) => 
    api.post<ApiResponse<MigrationJob>>(`/migration/restore/${backupId}`, options),

  // Analytics
  getMigrationAnalytics: (period?: string) => 
    api.get<ApiResponse<{
      totalJobs: number
      successRate: number
      averageProcessingTime: number
      dataVolume: {
        imported: number
        exported: number
        transformed: number
      }
      errorPatterns: {
        error: string
        count: number
        lastOccurrence: string
      }[]
    }>>(`/migration/analytics${period ? `?period=${period}` : ''}`),

  // Utility Functions
  validateFile: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    
    return api.post<ApiResponse<{
      valid: boolean
      errors: string[]
      warnings: string[]
      metadata: {
        size: number
        type: string
        encoding?: string
        rowCount?: number
      }
    }>>('/migration/validate-file', formData)
  },

  getSupportedFormats: () => 
    api.get<ApiResponse<{
      import: string[]
      export: string[]
      transformation: string[]
    }>>('/migration/supported-formats')
}