import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  assetService, 
  type AssetFilters, 
  type AssignmentFilters, 
  type MaintenanceFilters,
  type AssetAnalytics 
} from '../services/assetService'
import type { Asset, AssetCategory, AssetAssignment, AssetMaintenance } from '../mocks/data/assets'

// Query Keys
export const assetKeys = {
  all: ['assets'] as const,
  assets: () => [...assetKeys.all, 'assets'] as const,
  asset: (id: string) => [...assetKeys.assets(), id] as const,
  categories: () => [...assetKeys.all, 'categories'] as const,
  category: (id: string) => [...assetKeys.categories(), id] as const,
  assignments: () => [...assetKeys.all, 'assignments'] as const,
  assignment: (id: string) => [...assetKeys.assignments(), id] as const,
  maintenance: () => [...assetKeys.all, 'maintenance'] as const,
  maintenanceRecord: (id: string) => [...assetKeys.maintenance(), id] as const,
  analytics: (filters?: any) => [...assetKeys.all, 'analytics', filters] as const,
  availability: (assetId: string, dates: { start: string; end: string }) => 
    [...assetKeys.asset(assetId), 'availability', dates] as const,
  history: (assetId: string) => [...assetKeys.asset(assetId), 'history'] as const,
}

// Asset Management Hooks
export const useAssets = (filters?: AssetFilters) => {
  return useQuery({
    queryKey: assetKeys.assets(),
    queryFn: () => assetService.getAssets(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useAsset = (id: string) => {
  return useQuery({
    queryKey: assetKeys.asset(id),
    queryFn: () => assetService.getAsset(id),
    enabled: !!id,
  })
}

export const useCreateAsset = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: assetService.createAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetKeys.assets() })
      queryClient.invalidateQueries({ queryKey: assetKeys.analytics() })
    },
  })
}

export const useUpdateAsset = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Asset> }) =>
      assetService.updateAsset(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: assetKeys.asset(variables.id) })
      queryClient.invalidateQueries({ queryKey: assetKeys.assets() })
      queryClient.invalidateQueries({ queryKey: assetKeys.analytics() })
    },
  })
}

export const useDeleteAsset = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: assetService.deleteAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetKeys.assets() })
      queryClient.invalidateQueries({ queryKey: assetKeys.analytics() })
    },
  })
}

export const useUpdateAssetStatus = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: string; notes?: string }) =>
      assetService.updateAssetStatus(id, status, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: assetKeys.asset(variables.id) })
      queryClient.invalidateQueries({ queryKey: assetKeys.assets() })
      queryClient.invalidateQueries({ queryKey: assetKeys.analytics() })
    },
  })
}

export const useBulkUpdateAssets = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ assetIds, updates }: { assetIds: string[]; updates: Partial<Asset> }) =>
      assetService.bulkUpdateAssets(assetIds, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetKeys.assets() })
      queryClient.invalidateQueries({ queryKey: assetKeys.analytics() })
    },
  })
}

// Asset Categories Hooks
export const useAssetCategories = () => {
  return useQuery({
    queryKey: assetKeys.categories(),
    queryFn: assetService.getAssetCategories,
    staleTime: 30 * 60 * 1000, // 30 minutes
  })
}

export const useAssetCategory = (id: string) => {
  return useQuery({
    queryKey: assetKeys.category(id),
    queryFn: () => assetService.getAssetCategory(id),
    enabled: !!id,
  })
}

export const useCreateAssetCategory = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: assetService.createAssetCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetKeys.categories() })
    },
  })
}

export const useUpdateAssetCategory = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AssetCategory> }) =>
      assetService.updateAssetCategory(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: assetKeys.category(variables.id) })
      queryClient.invalidateQueries({ queryKey: assetKeys.categories() })
    },
  })
}

export const useDeleteAssetCategory = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: assetService.deleteAssetCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetKeys.categories() })
    },
  })
}

// Asset Assignments Hooks
export const useAssetAssignments = (filters?: AssignmentFilters) => {
  return useQuery({
    queryKey: assetKeys.assignments(),
    queryFn: () => assetService.getAssetAssignments(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useAssetAssignment = (id: string) => {
  return useQuery({
    queryKey: assetKeys.assignment(id),
    queryFn: () => assetService.getAssetAssignment(id),
    enabled: !!id,
  })
}

export const useAssignAsset = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: assetService.assignAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetKeys.assignments() })
      queryClient.invalidateQueries({ queryKey: assetKeys.assets() })
      queryClient.invalidateQueries({ queryKey: assetKeys.analytics() })
    },
  })
}

export const useUpdateAssetAssignment = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AssetAssignment> }) =>
      assetService.updateAssetAssignment(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: assetKeys.assignment(variables.id) })
      queryClient.invalidateQueries({ queryKey: assetKeys.assignments() })
      queryClient.invalidateQueries({ queryKey: assetKeys.assets() })
    },
  })
}

export const useReturnAsset = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, returnNotes }: { id: string; returnNotes?: string }) =>
      assetService.returnAsset(id, returnNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetKeys.assignments() })
      queryClient.invalidateQueries({ queryKey: assetKeys.assets() })
      queryClient.invalidateQueries({ queryKey: assetKeys.analytics() })
    },
  })
}

// Asset Maintenance Hooks
export const useAssetMaintenance = (filters?: MaintenanceFilters) => {
  return useQuery({
    queryKey: assetKeys.maintenance(),
    queryFn: () => assetService.getAssetMaintenance(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useAssetMaintenanceRecord = (id: string) => {
  return useQuery({
    queryKey: assetKeys.maintenanceRecord(id),
    queryFn: () => assetService.getAssetMaintenanceRecord(id),
    enabled: !!id,
  })
}

export const useScheduleAssetMaintenance = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: assetService.scheduleAssetMaintenance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetKeys.maintenance() })
      queryClient.invalidateQueries({ queryKey: assetKeys.analytics() })
    },
  })
}

export const useUpdateAssetMaintenance = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AssetMaintenance> }) =>
      assetService.updateAssetMaintenance(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: assetKeys.maintenanceRecord(variables.id) })
      queryClient.invalidateQueries({ queryKey: assetKeys.maintenance() })
    },
  })
}

export const useCompleteAssetMaintenance = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, completionData }: {
      id: string
      completionData: {
        actualCost?: number
        completionNotes?: string
        performedBy?: string
      }
    }) => assetService.completeAssetMaintenance(id, completionData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: assetKeys.maintenanceRecord(variables.id) })
      queryClient.invalidateQueries({ queryKey: assetKeys.maintenance() })
      queryClient.invalidateQueries({ queryKey: assetKeys.analytics() })
    },
  })
}

// Asset Analytics Hooks
export const useAssetAnalytics = (filters?: {
  categoryId?: string
  location?: string
  dateRange?: { start: string; end: string }
}) => {
  return useQuery({
    queryKey: assetKeys.analytics(filters),
    queryFn: () => assetService.getAssetAnalytics(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useAssetAvailability = (assetId: string, startDate: string, endDate: string) => {
  return useQuery({
    queryKey: assetKeys.availability(assetId, { start: startDate, end: endDate }),
    queryFn: () => assetService.checkAssetAvailability(assetId, startDate, endDate),
    enabled: !!assetId && !!startDate && !!endDate,
  })
}

export const useAssetHistory = (assetId: string) => {
  return useQuery({
    queryKey: assetKeys.history(assetId),
    queryFn: () => assetService.getAssetHistory(assetId),
    enabled: !!assetId,
  })
}

export const useGenerateAssetReport = () => {
  return useMutation({
    mutationFn: assetService.generateAssetReport,
  })
}