import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { departmentService } from '../services/dataService'
import { Department } from '../mocks/data/departments'
import { toast } from 'sonner'

// Query keys
export const departmentKeys = {
  all: ['departments'] as const,
  list: (params?: any) => [...departmentKeys.all, 'list', params] as const,
  detail: (id: string) => [...departmentKeys.all, 'detail', id] as const,
  hierarchy: () => [...departmentKeys.all, 'hierarchy'] as const,
}

// Get all departments with filters
export function useDepartments(params?: { search?: string; location?: string }) {
  return useQuery({
    queryKey: departmentKeys.list(params),
    queryFn: () => departmentService.getAll(params),
    select: (data) => data.data,
  })
}

// Get single department by ID
export function useDepartment(id: string, enabled = true) {
  return useQuery({
    queryKey: departmentKeys.detail(id),
    queryFn: () => departmentService.getById(id),
    enabled: enabled && !!id,
    select: (data) => data.data,
  })
}

// Get department hierarchy
export function useDepartmentHierarchy() {
  return useQuery({
    queryKey: departmentKeys.hierarchy(),
    queryFn: () => departmentService.getHierarchy(),
    select: (data) => data.data,
  })
}

// Create department mutation
export function useCreateDepartment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<Department>) => departmentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.all })
      toast.success('Department created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create department')
    },
  })
}

// Update department mutation
export function useUpdateDepartment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Department> }) =>
      departmentService.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.all })
      queryClient.invalidateQueries({ queryKey: departmentKeys.detail(variables.id) })
      toast.success('Department updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update department')
    },
  })
}

// Delete department mutation
export function useDeleteDepartment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => departmentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.all })
      toast.success('Department deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete department')
    },
  })
}