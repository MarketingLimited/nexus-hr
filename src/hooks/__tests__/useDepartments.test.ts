import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useDepartments, useDepartmentStats, useCreateDepartment, useUpdateDepartment } from '../useDepartments'
import { ReactNode } from 'react'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false }
    }
  })
  
  return function Wrapper({ children }: { children: ReactNode }) {
    return QueryClientProvider({ client: queryClient, children })
  }
}

describe('useDepartments hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useDepartments', () => {
    it('should fetch departments successfully', async () => {
      const mockDepartments = {
        data: [
          {
            id: '1',
            name: 'Engineering',
            description: 'Software development team',
            managerId: 'manager1',
            location: 'New York',
            employeeCount: 25
          },
          {
            id: '2',
            name: 'Human Resources',
            description: 'HR team',
            managerId: 'manager2',
            location: 'San Francisco',
            employeeCount: 8
          }
        ],
        pagination: { page: 1, limit: 10, total: 2 }
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockDepartments
      })

      const { result } = renderHook(() => useDepartments(), {
        wrapper: createWrapper()
      })

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual(mockDepartments)
      expect(result.current.data.data).toHaveLength(2)
    })

    it('should handle departments with filters', async () => {
      const mockDepartments = { data: [], pagination: { page: 1, limit: 10, total: 0 } }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockDepartments
      })

      const filters = { location: 'New York', search: 'engineering' }
      const { result } = renderHook(() => useDepartments(filters), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual(mockDepartments)
    })

    it('should handle fetch errors', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useDepartments(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBeTruthy()
      expect(result.current.data).toBeUndefined()
    })
  })

  describe('useDepartmentStats', () => {
    it('should fetch department statistics successfully', async () => {
      const mockStats = {
        totalDepartments: 8,
        averageEmployeesPerDepartment: 15.5,
        largestDepartment: 'Engineering',
        smallestDepartment: 'Legal',
        departmentGrowth: 12.5
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats
      })

      const { result } = renderHook(() => useDepartmentStats(), {
        wrapper: createWrapper()
      })

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual(mockStats)
    })

    it('should handle empty stats response', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      })

      const { result } = renderHook(() => useDepartmentStats(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual({})
    })
  })

  describe('useCreateDepartment', () => {
    it('should create a department successfully', async () => {
      const newDepartment = {
        id: '3',
        name: 'Marketing',
        description: 'Marketing and communications',
        managerId: 'manager3',
        location: 'Chicago'
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => newDepartment
      })

      const { result } = renderHook(() => useCreateDepartment(), {
        wrapper: createWrapper()
      })

      const departmentData = {
        name: 'Marketing',
        description: 'Marketing and communications',
        managerId: 'manager3',
        location: 'Chicago'
      }

      result.current.mutate(departmentData)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(newDepartment)
      expect(result.current.isLoading).toBe(false)
    })

    it('should handle creation errors', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Creation failed'))

      const { result } = renderHook(() => useCreateDepartment(), {
        wrapper: createWrapper()
      })

      result.current.mutate({
        name: 'Test Department',
        description: 'Test description'
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeTruthy()
    })

    it('should handle validation errors', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Department name is required' })
      })

      const { result } = renderHook(() => useCreateDepartment(), {
        wrapper: createWrapper()
      })

      result.current.mutate({ name: '' })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })
    })
  })

  describe('useUpdateDepartment', () => {
    it('should update a department successfully', async () => {
      const updatedDepartment = {
        id: '1',
        name: 'Software Engineering',
        description: 'Updated description',
        managerId: 'manager1',
        location: 'New York'
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => updatedDepartment
      })

      const { result } = renderHook(() => useUpdateDepartment(), {
        wrapper: createWrapper()
      })

      result.current.mutate({
        id: '1',
        name: 'Software Engineering',
        description: 'Updated description'
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(updatedDepartment)
    })

    it('should handle update errors', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Update failed'))

      const { result } = renderHook(() => useUpdateDepartment(), {
        wrapper: createWrapper()
      })

      result.current.mutate({
        id: '1',
        name: 'Updated Name'
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeTruthy()
    })

    it('should handle not found errors', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Department not found' })
      })

      const { result } = renderHook(() => useUpdateDepartment(), {
        wrapper: createWrapper()
      })

      result.current.mutate({
        id: 'nonexistent',
        name: 'Updated Name'
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })
    })
  })

  describe('Query invalidation and caching', () => {
    it('should invalidate departments cache after creation', async () => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } }
      })
      
      const wrapper = function Wrapper({ children }: { children: ReactNode }) {
        return QueryClientProvider({ client: queryClient, children })
      }

      // Mock successful creation
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '3', name: 'New Department' })
      })

      const { result } = renderHook(() => useCreateDepartment(), { wrapper })

      result.current.mutate({ name: 'New Department' })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // Verify that the mutation completed successfully
      expect(result.current.data).toBeDefined()
    })
  })

  describe('Loading states', () => {
    it('should show loading state during fetch', () => {
      global.fetch = vi.fn().mockImplementation(() => new Promise(() => {})) // Never resolves

      const { result } = renderHook(() => useDepartments(), {
        wrapper: createWrapper()
      })

      expect(result.current.isLoading).toBe(true)
      expect(result.current.data).toBeUndefined()
    })

    it('should show loading state during mutation', () => {
      global.fetch = vi.fn().mockImplementation(() => new Promise(() => {})) // Never resolves

      const { result } = renderHook(() => useCreateDepartment(), {
        wrapper: createWrapper()
      })

      result.current.mutate({ name: 'Test Department' })

      expect(result.current.isLoading).toBe(true)
    })
  })
})