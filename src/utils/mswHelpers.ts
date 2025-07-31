// MSW Helper Utilities
// Common utilities for MSW handlers including response formatting,
// pagination, filtering, and error handling

import { HttpResponse } from 'msw'

// Standardized API response types
export interface ApiResponse<T = any> {
  data: T
  meta?: {
    timestamp: string
    requestId: string
  }
}

export interface PaginatedApiResponse<T = any> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
    timestamp: string
    requestId: string
  }
}

export interface ErrorResponse {
  error: {
    code: string
    message: string
    details?: any
  }
  meta: {
    timestamp: string
    requestId: string
  }
}

// Generate unique request ID
const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Create standardized success response
export const createSuccessResponse = <T>(data: T) => {
  const response: ApiResponse<T> = {
    data,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: generateRequestId()
    }
  }
  
  return HttpResponse.json(response)
}

// Create standardized paginated response
export const createPaginatedResponse = <T>(
  data: T[],
  page: number,
  limit: number,
  total: number
) => {
  const totalPages = Math.ceil(total / limit)
  
  const response: PaginatedApiResponse<T> = {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      timestamp: new Date().toISOString(),
      requestId: generateRequestId()
    }
  }
  
  return HttpResponse.json(response)
}

// Create standardized error response
export const createErrorResponse = (
  code: string,
  message: string,
  status: number = 400,
  details?: any
) => {
  const response: ErrorResponse = {
    error: {
      code,
      message,
      details
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: generateRequestId()
    }
  }
  
  return HttpResponse.json(response, { status })
}

// Common error responses
export const commonErrors = {
  notFound: (resource: string, id: string) => 
    createErrorResponse('RESOURCE_NOT_FOUND', `${resource} with ID '${id}' not found`, 404),
  
  badRequest: (message: string, details?: any) =>
    createErrorResponse('BAD_REQUEST', message, 400, details),
  
  unauthorized: () =>
    createErrorResponse('UNAUTHORIZED', 'Authentication required', 401),
  
  forbidden: () =>
    createErrorResponse('FORBIDDEN', 'Insufficient permissions', 403),
  
  conflict: (message: string, details?: any) =>
    createErrorResponse('CONFLICT', message, 409, details),
  
  validationError: (errors: string[]) =>
    createErrorResponse('VALIDATION_ERROR', 'Validation failed', 422, { errors }),
  
  serverError: (message: string = 'Internal server error') =>
    createErrorResponse('INTERNAL_ERROR', message, 500)
}

// Parse query parameters
export const parseQueryParams = (url: URL): Record<string, any> => {
  const params: Record<string, any> = {}
  
  for (const [key, value] of url.searchParams.entries()) {
    // Parse numbers
    if (/^\d+$/.test(value)) {
      params[key] = parseInt(value, 10)
    }
    // Parse booleans
    else if (value === 'true' || value === 'false') {
      params[key] = value === 'true'
    }
    // Parse JSON arrays/objects
    else if (value.startsWith('[') || value.startsWith('{')) {
      try {
        params[key] = JSON.parse(value)
      } catch {
        params[key] = value
      }
    }
    // Keep as string
    else {
      params[key] = value
    }
  }
  
  return params
}

// Extract pagination parameters
export const getPaginationParams = (url: URL): { page: number; limit: number } => {
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '10', 10)))
  
  return { page, limit }
}

// Apply pagination to data array
export const applyPagination = <T>(data: T[], page: number, limit: number): T[] => {
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  return data.slice(startIndex, endIndex)
}

// Generic filtering function
export const applyFilters = <T extends Record<string, any>>(
  data: T[],
  filters: Record<string, any>
): T[] => {
  return data.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === undefined || value === null || value === '') return true
      
      const itemValue = item[key]
      
      // Handle different filter types
      if (typeof value === 'string') {
        // Case-insensitive partial match for strings
        return String(itemValue).toLowerCase().includes(value.toLowerCase())
      } else if (Array.isArray(value)) {
        // Array contains
        return value.includes(itemValue)
      } else if (typeof value === 'object' && value.operator) {
        // Range/comparison operators
        const { operator, value: filterValue } = value
        switch (operator) {
          case 'gte': return itemValue >= filterValue
          case 'lte': return itemValue <= filterValue
          case 'gt': return itemValue > filterValue
          case 'lt': return itemValue < filterValue
          case 'eq': return itemValue === filterValue
          case 'ne': return itemValue !== filterValue
          case 'in': return Array.isArray(filterValue) && filterValue.includes(itemValue)
          case 'nin': return Array.isArray(filterValue) && !filterValue.includes(itemValue)
          default: return true
        }
      } else {
        // Exact match
        return itemValue === value
      }
    })
  })
}

// Apply sorting
export const applySorting = <T extends Record<string, any>>(
  data: T[],
  sortBy?: string,
  sortOrder: 'asc' | 'desc' = 'asc'
): T[] => {
  if (!sortBy) return data
  
  return [...data].sort((a, b) => {
    const aValue = a[sortBy]
    const bValue = b[sortBy]
    
    if (aValue === bValue) return 0
    
    const comparison = aValue > bValue ? 1 : -1
    return sortOrder === 'asc' ? comparison : -comparison
  })
}

// Simulate network delay
export const networkDelay = (min: number = 100, max: number = 500): Promise<void> => {
  const delay = Math.random() * (max - min) + min
  return new Promise(resolve => setTimeout(resolve, delay))
}

// Simulate network errors (for testing)
export const shouldSimulateError = (errorRate: number = 0.02): boolean => {
  return Math.random() < errorRate
}

// Full-text search across multiple fields
export const fullTextSearch = <T extends Record<string, any>>(
  data: T[],
  searchTerm: string,
  searchFields: string[]
): T[] => {
  if (!searchTerm.trim()) return data
  
  const searchTermLower = searchTerm.toLowerCase()
  
  return data.filter(item => {
    return searchFields.some(field => {
      const value = item[field]
      if (value === null || value === undefined) return false
      
      return String(value).toLowerCase().includes(searchTermLower)
    })
  })
}

// Validate required fields
export const validateRequiredFields = (
  data: Record<string, any>,
  requiredFields: string[]
): { valid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      errors.push(`${field} is required`)
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// Validate field formats
export const validateFieldFormats = (
  data: Record<string, any>,
  validations: Record<string, RegExp | ((value: any) => boolean)>
): { valid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  for (const [field, validation] of Object.entries(validations)) {
    const value = data[field]
    
    if (value !== undefined && value !== null && value !== '') {
      let isValid = false
      
      if (validation instanceof RegExp) {
        isValid = validation.test(String(value))
      } else if (typeof validation === 'function') {
        isValid = validation(value)
      }
      
      if (!isValid) {
        errors.push(`${field} format is invalid`)
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// Create batch response for bulk operations
export const createBatchResponse = (
  results: Array<{ success: boolean; data?: any; error?: string }>,
  operation: string
) => {
  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)
  
  const response = {
    data: {
      operation,
      summary: {
        total: results.length,
        successful: successful.length,
        failed: failed.length
      },
      results: results,
      successfulItems: successful.map(r => r.data).filter(Boolean),
      errors: failed.map(r => r.error).filter(Boolean)
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: generateRequestId()
    }
  }
  
  const status = failed.length === 0 ? 200 : failed.length === results.length ? 400 : 207
  return HttpResponse.json(response, { status })
}
