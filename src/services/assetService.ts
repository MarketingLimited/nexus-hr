import { api, ApiResponse } from './api'
import type { Asset, AssetCategory, AssetAssignment, AssetMaintenance } from '../mocks/data/assets'

export interface AssetFilters {
  categoryId?: string
  status?: string
  condition?: string
  assignedTo?: string
  location?: string
  page?: number
  limit?: number
}

export interface AssignmentFilters {
  employeeId?: string
  assetId?: string
  status?: string
  startDate?: string
  endDate?: string
}

export interface MaintenanceFilters {
  assetId?: string
  type?: string
  status?: string
  scheduledDate?: string
}

export interface AssetAnalytics {
  total: number
  available: number
  assigned: number
  maintenance: number
  retired: number
  byCategory: Record<string, number>
  utilizationRate: number
  maintenanceCost: number
}

export const assetService = {
  // Asset Management
  getAssets: (filters: AssetFilters = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString())
      }
    })
    
    return api.get<ApiResponse<Asset[]>>(`/assets?${params}`)
  },

  getAsset: (id: string) => 
    api.get<ApiResponse<Asset>>(`/assets/${id}`),

  createAsset: (assetData: Partial<Asset>) => 
    api.post<ApiResponse<Asset>>('/assets', assetData),

  updateAsset: (id: string, assetData: Partial<Asset>) => 
    api.put<ApiResponse<Asset>>(`/assets/${id}`, assetData),

  deleteAsset: (id: string) => 
    api.delete<ApiResponse<{ message: string }>>(`/assets/${id}`),

  // Asset Categories
  getAssetCategories: () => 
    api.get<ApiResponse<AssetCategory[]>>('/assets/categories'),

  getAssetCategory: (id: string) => 
    api.get<ApiResponse<AssetCategory>>(`/assets/categories/${id}`),

  createAssetCategory: (categoryData: Partial<AssetCategory>) => 
    api.post<ApiResponse<AssetCategory>>('/assets/categories', categoryData),

  updateAssetCategory: (id: string, categoryData: Partial<AssetCategory>) => 
    api.put<ApiResponse<AssetCategory>>(`/assets/categories/${id}`, categoryData),

  deleteAssetCategory: (id: string) => 
    api.delete<ApiResponse<{ message: string }>>(`/assets/categories/${id}`),

  // Asset Assignments
  getAssetAssignments: (filters: AssignmentFilters = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value)
      }
    })
    
    return api.get<ApiResponse<AssetAssignment[]>>(`/assets/assignments?${params}`)
  },

  getAssetAssignment: (id: string) => 
    api.get<ApiResponse<AssetAssignment>>(`/assets/assignments/${id}`),

  assignAsset: (assignmentData: Partial<AssetAssignment>) => 
    api.post<ApiResponse<AssetAssignment>>('/assets/assignments', assignmentData),

  updateAssetAssignment: (id: string, assignmentData: Partial<AssetAssignment>) => 
    api.put<ApiResponse<AssetAssignment>>(`/assets/assignments/${id}`, assignmentData),

  returnAsset: (id: string, returnNotes?: string) => 
    api.put<ApiResponse<AssetAssignment>>(`/assets/assignments/${id}/return`, {
      returnedAt: new Date().toISOString(),
      returnCondition: 'good',
      returnNotes: returnNotes || ''
    }),

  // Asset Maintenance
  getAssetMaintenance: (filters: MaintenanceFilters = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value)
      }
    })
    
    return api.get<ApiResponse<AssetMaintenance[]>>(`/assets/maintenance?${params}`)
  },

  getAssetMaintenanceRecord: (id: string) => 
    api.get<ApiResponse<AssetMaintenance>>(`/assets/maintenance/${id}`),

  scheduleAssetMaintenance: (maintenanceData: Partial<AssetMaintenance>) => 
    api.post<ApiResponse<AssetMaintenance>>('/assets/maintenance', maintenanceData),

  updateAssetMaintenance: (id: string, maintenanceData: Partial<AssetMaintenance>) => 
    api.put<ApiResponse<AssetMaintenance>>(`/assets/maintenance/${id}`, maintenanceData),

  completeAssetMaintenance: (id: string, completionData: {
    actualCost?: number
    completionNotes?: string
    performedBy?: string
  }) => 
    api.put<ApiResponse<AssetMaintenance>>(`/assets/maintenance/${id}/complete`, {
      ...completionData,
      status: 'completed',
      actualCompletionDate: new Date().toISOString()
    }),

  // Asset Analytics
  getAssetAnalytics: (filters: {
    categoryId?: string
    location?: string
    dateRange?: { start: string; end: string }
  } = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        if (typeof value === 'object') {
          params.append(key, JSON.stringify(value))
        } else {
          params.append(key, value)
        }
      }
    })
    
    return api.get<ApiResponse<AssetAnalytics>>(`/assets/analytics?${params}`)
  },

  // Specialized Operations
  checkAssetAvailability: (assetId: string, startDate: string, endDate: string) => 
    api.get<ApiResponse<{ available: boolean }>>(`/assets/${assetId}/availability?startDate=${startDate}&endDate=${endDate}`),

  getAssetHistory: (assetId: string) => 
    api.get<ApiResponse<any[]>>(`/assets/${assetId}/history`),

  updateAssetStatus: (id: string, status: string, notes?: string) => 
    api.put<ApiResponse<Asset>>(`/assets/${id}`, {
      status,
      statusNotes: notes,
      statusUpdatedAt: new Date().toISOString()
    }),

  bulkUpdateAssets: (assetIds: string[], updates: Partial<Asset>) => 
    api.put<ApiResponse<Asset[]>>('/assets/bulk-update', {
      assetIds,
      updates
    }),

  generateAssetReport: (filters: AssetFilters = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString())
      }
    })
    
    return api.get<ApiResponse<any>>(`/assets/reports?${params}`)
  }
}