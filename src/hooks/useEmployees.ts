import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { employeeService } from '../services/dataService'
import { Employee } from '../mocks/data/employees'
import { toast } from 'sonner'

// Query keys
export const employeeKeys = {
  all: ['employees'] as const,
  list: (params?: any) => [...employeeKeys.all, 'list', params] as const,
  detail: (id: string) => [...employeeKeys.all, 'detail', id] as const,
  stats: () => [...employeeKeys.all, 'stats'] as const,
}

// Get all employees with pagination and filters
export function useEmployees(params?: {
  search?: string
  department?: string
  status?: string
  page?: number
  limit?: number
}) {
  return useQuery({
    queryKey: employeeKeys.list(params),
    queryFn: () => employeeService.getAll(params),
    select: (data) => data,
  })
}

// Get single employee by ID
export function useEmployee(id: string, enabled = true) {
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: () => employeeService.getById(id),
    enabled: enabled && !!id,
    select: (data) => data.data,
  })
}

// Get employee statistics
export function useEmployeeStats() {
  return useQuery({
    queryKey: employeeKeys.stats(),
    queryFn: () => employeeService.getStats(),
    select: (data) => data.data,
  })
}

// Create employee mutation
export function useCreateEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<Employee>) => employeeService.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all })
      toast.success('Employee created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create employee')
    },
  })
}

// Update employee mutation
export function useUpdateEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Employee> }) =>
      employeeService.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all })
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(variables.id) })
      toast.success('Employee updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update employee')
    },
  })
}

// Delete employee mutation
export function useDeleteEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => employeeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all })
      toast.success('Employee deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete employee')
    },
  })
}