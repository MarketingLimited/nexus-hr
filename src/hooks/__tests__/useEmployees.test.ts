import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { createTestQueryClient } from '../../test-utils'
import { 
  useEmployees, 
  useEmployee, 
  useEmployeeStats,
  useCreateEmployee,
  useUpdateEmployee,
  useDeleteEmployee,
  employeeKeys
} from '../useEmployees'
import { employeeService } from '../../services/dataService'
import { toast } from 'sonner'

// Mock dependencies
vi.mock('../../services/dataService', () => ({
  employeeService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    getStats: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  }
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

describe('useEmployees Hooks', () => {
  let queryClient: QueryClient
  let wrapper: any

  beforeEach(() => {
    queryClient = createTestQueryClient()
    wrapper = ({ children }: { children: React.ReactNode }) => 
      React.createElement(QueryClientProvider, { client: queryClient }, children)
    vi.clearAllMocks()
  })

  afterEach(() => {
    queryClient.clear()
  })

  describe('useEmployees', () => {
    it('should fetch employees with pagination and filters', async () => {
      const mockEmployees = {
        data: [
          { id: 'emp-1', name: 'John Doe', department: 'Engineering' } as any,
          { id: 'emp-2', name: 'Jane Smith', department: 'HR' } as any
        ],
        meta: { total: 2, page: 1, limit: 10, totalPages: 1 }
      }
      vi.mocked(employeeService.getAll).mockResolvedValue(mockEmployees)

      const params = { 
        search: 'John', 
        department: 'Engineering',
        status: 'active',
        page: 1,
        limit: 10
      }
      const { result } = renderHook(() => useEmployees(params), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockEmployees)
      expect(employeeService.getAll).toHaveBeenCalledWith(params)
    })

    it('should fetch employees without parameters', async () => {
      const mockEmployees = { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } }
      vi.mocked(employeeService.getAll).mockResolvedValue(mockEmployees)

      const { result } = renderHook(() => useEmployees(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(employeeService.getAll).toHaveBeenCalledWith(undefined)
    })

    it('should handle fetch employees error', async () => {
      const mockError = new Error('Failed to fetch employees')
      vi.mocked(employeeService.getAll).mockRejectedValue(mockError)

      const { result } = renderHook(() => useEmployees(), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })

    it('should use correct query key with parameters', () => {
      const params = { search: 'test', department: 'IT' }
      renderHook(() => useEmployees(params), { wrapper })
      
      const queries = queryClient.getQueryCache().getAll()
      expect(queries.some(query => 
        JSON.stringify(query.queryKey) === JSON.stringify(employeeKeys.list(params))
      )).toBe(true)
    })
  })

  describe('useEmployee', () => {
    it('should fetch single employee by ID when enabled', async () => {
      const mockEmployee = { 
        data: { id: 'emp-1', name: 'John Doe', email: 'john@example.com' }
      } as any
      vi.mocked(employeeService.getById).mockResolvedValue(mockEmployee)

      const { result } = renderHook(() => useEmployee('emp-1', true), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockEmployee.data)
      expect(employeeService.getById).toHaveBeenCalledWith('emp-1')
    })

    it('should not fetch when disabled', () => {
      const { result } = renderHook(() => useEmployee('emp-1', false), { wrapper })

      expect(result.current.isFetching).toBe(false)
      expect(employeeService.getById).not.toHaveBeenCalled()
    })

    it('should not fetch when ID is empty', () => {
      const { result } = renderHook(() => useEmployee('', true), { wrapper })

      expect(result.current.isFetching).toBe(false)
      expect(employeeService.getById).not.toHaveBeenCalled()
    })

    it('should handle fetch employee error', async () => {
      const mockError = new Error('Employee not found')
      vi.mocked(employeeService.getById).mockRejectedValue(mockError)

      const { result } = renderHook(() => useEmployee('non-existent', true), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('useEmployeeStats', () => {
    it('should fetch employee statistics', async () => {
      const mockStats = {
        data: {
          total: 150,
          active: 142,
          inactive: 8,
          terminated: 0,
          byDepartment: { Engineering: 50, HR: 25, Sales: 30 },
          byLocation: { 'New York': 75, 'San Francisco': 75 }
        }
      }
      vi.mocked(employeeService.getStats).mockResolvedValue(mockStats)

      const { result } = renderHook(() => useEmployeeStats(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockStats.data)
      expect(employeeService.getStats).toHaveBeenCalledOnce()
    })

    it('should use correct query key for stats', () => {
      renderHook(() => useEmployeeStats(), { wrapper })
      
      const queries = queryClient.getQueryCache().getAll()
      expect(queries.some(query => 
        JSON.stringify(query.queryKey) === JSON.stringify(employeeKeys.stats())
      )).toBe(true)
    })
  })

  describe('useCreateEmployee', () => {
    it('should create employee successfully', async () => {
      const mockEmployee = { 
        data: { 
          id: 'emp-new', 
          employeeId: 'EMP001',
          firstName: 'New', 
          lastName: 'Employee',
          email: 'new@example.com' 
        }
      } as any
      vi.mocked(employeeService.create).mockResolvedValue(mockEmployee)

      const { result } = renderHook(() => useCreateEmployee(), { wrapper })

      const newEmployeeData = {
        firstName: 'New',
        lastName: 'Employee',
        email: 'new@example.com',
        department: 'Engineering',
        position: 'Developer'
      } as any
      result.current.mutate(newEmployeeData)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(employeeService.create).toHaveBeenCalledWith(newEmployeeData)
      expect(toast.success).toHaveBeenCalledWith('Employee created successfully')
    })

    it('should handle create employee failure', async () => {
      const mockError = new Error('Failed to create employee')
      vi.mocked(employeeService.create).mockRejectedValue(mockError)

      const { result } = renderHook(() => useCreateEmployee(), { wrapper })

      result.current.mutate({ firstName: 'Test', lastName: 'Employee' } as any)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(toast.error).toHaveBeenCalledWith('Failed to create employee')
    })

    it('should invalidate employee queries on success', async () => {
      const mockEmployee = { data: { id: 'emp-new', firstName: 'New', lastName: 'Employee' } } as any
      vi.mocked(employeeService.create).mockResolvedValue(mockEmployee)

      // Pre-populate cache
      queryClient.setQueryData(employeeKeys.list(), { data: [] })

      const { result } = renderHook(() => useCreateEmployee(), { wrapper })

      result.current.mutate({ firstName: 'New', lastName: 'Employee' } as any)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // Verify cache invalidation by checking if queries were marked as stale
      const queries = queryClient.getQueryCache().findAll({ queryKey: employeeKeys.all })
      expect(queries.some(query => query.isStale())).toBe(true)
    })
  })

  describe('useUpdateEmployee', () => {
    it('should update employee successfully', async () => {
      const mockUpdatedEmployee = { 
        data: { id: 'emp-1', firstName: 'Updated', lastName: 'Name', position: 'Senior Developer' }
      } as any
      vi.mocked(employeeService.update).mockResolvedValue(mockUpdatedEmployee)

      const { result } = renderHook(() => useUpdateEmployee(), { wrapper })

      const updateData = {
        id: 'emp-1',
        data: { firstName: 'Updated', lastName: 'Name', position: 'Senior Developer' }
      } as any
      result.current.mutate(updateData)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(employeeService.update).toHaveBeenCalledWith('emp-1', updateData.data)
      expect(toast.success).toHaveBeenCalledWith('Employee updated successfully')
    })

    it('should handle update employee failure', async () => {
      const mockError = new Error('Failed to update employee')
      vi.mocked(employeeService.update).mockRejectedValue(mockError)

      const { result } = renderHook(() => useUpdateEmployee(), { wrapper })

      result.current.mutate({ id: 'emp-1', data: { firstName: 'Test' } } as any)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(toast.error).toHaveBeenCalledWith('Failed to update employee')
    })

    it('should invalidate specific employee query on success', async () => {
      const mockUpdatedEmployee = { data: { id: 'emp-1', firstName: 'Updated' } } as any
      vi.mocked(employeeService.update).mockResolvedValue(mockUpdatedEmployee)

      // Pre-populate cache for specific employee
      queryClient.setQueryData(employeeKeys.detail('emp-1'), { data: { id: 'emp-1', name: 'Original' } })

      const { result } = renderHook(() => useUpdateEmployee(), { wrapper })

      result.current.mutate({ id: 'emp-1', data: { firstName: 'Updated' } } as any)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // Verify specific employee query was invalidated
      const specificQuery = queryClient.getQueryCache().find({ queryKey: employeeKeys.detail('emp-1') })
      expect(specificQuery?.isStale()).toBe(true)
    })
  })

  describe('useDeleteEmployee', () => {
    it('should delete employee successfully', async () => {
      const mockResponse = { data: { message: 'Employee deleted successfully' } }
      vi.mocked(employeeService.delete).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useDeleteEmployee(), { wrapper })

      result.current.mutate('emp-1')

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(employeeService.delete).toHaveBeenCalledWith('emp-1')
      expect(toast.success).toHaveBeenCalledWith('Employee deleted successfully')
    })

    it('should handle delete employee failure', async () => {
      const mockError = new Error('Failed to delete employee')
      vi.mocked(employeeService.delete).mockRejectedValue(mockError)

      const { result } = renderHook(() => useDeleteEmployee(), { wrapper })

      result.current.mutate('emp-1')

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(toast.error).toHaveBeenCalledWith('Failed to delete employee')
    })
  })

  describe('Query Keys', () => {
    it('should generate correct query keys', () => {
      expect(employeeKeys.all).toEqual(['employees'])
      expect(employeeKeys.list({ search: 'test' })).toEqual(['employees', 'list', { search: 'test' }])
      expect(employeeKeys.detail('emp-1')).toEqual(['employees', 'detail', 'emp-1'])
      expect(employeeKeys.stats()).toEqual(['employees', 'stats'])
    })
  })
})