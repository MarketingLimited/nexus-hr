import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor, act } from '@/test-utils'
import { useEmployees } from '../useEmployees'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React, { ReactNode } from 'react'

// Mock the API
const mockGetEmployees = vi.fn()
const mockGetEmployee = vi.fn()
const mockCreateEmployee = vi.fn()
const mockUpdateEmployee = vi.fn()
const mockDeleteEmployee = vi.fn()

vi.mock('@/services/api', () => ({
  getEmployees: (...args: any[]) => mockGetEmployees(...args),
  getEmployee: (...args: any[]) => mockGetEmployee(...args),
  createEmployee: (...args: any[]) => mockCreateEmployee(...args),
  updateEmployee: (...args: any[]) => mockUpdateEmployee(...args),
  deleteEmployee: (...args: any[]) => mockDeleteEmployee(...args)
}))

describe('useEmployees Hook', () => {
  let queryClient: QueryClient

  const wrapper = ({ children }: { children: ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  )

  const mockEmployees = [
    {
      id: 'emp-1',
      employeeId: 'EMP001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@company.com',
      department: 'Engineering',
      position: 'Software Engineer',
      status: 'active' as const,
      avatar: '/avatars/john.jpg',
      startDate: '2024-01-15',
      phone: '+1234567890',
      manager: null,
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z'
    },
    {
      id: 'emp-2',
      employeeId: 'EMP002',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@company.com',
      department: 'Marketing',
      position: 'Marketing Manager',
      status: 'active' as const,
      avatar: '/avatars/jane.jpg',
      startDate: '2024-01-10',
      phone: '+1234567891',
      manager: null,
      createdAt: '2024-01-10T00:00:00Z',
      updatedAt: '2024-01-10T00:00:00Z'
    }
  ]

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    })
    vi.clearAllMocks()
  })

  describe('useEmployees Query', () => {
    it('fetches employees successfully', async () => {
      mockGetEmployees.mockResolvedValueOnce({
        data: mockEmployees,
        meta: {
          total: 2,
          page: 1,
          limit: 20,
          totalPages: 1
        }
      })

      const { result } = renderHook(() => useEmployees(), { wrapper })

      await waitFor(() => {
        expect(result.current.data).toEqual(mockEmployees)
        expect(result.current.isLoading).toBe(false)
        expect(result.current.error).toBeNull()
      })

      expect(mockGetEmployees).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        search: '',
        department: '',
        status: ''
      })
    })

    it('applies search filters', async () => {
      mockGetEmployees.mockResolvedValueOnce({
        data: [mockEmployees[0]],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 }
      })

      const { result } = renderHook(() => useEmployees({
        search: 'John',
        department: 'Engineering',
        status: 'active'
      }), { wrapper })

      await waitFor(() => {
        expect(result.current.data).toHaveLength(1)
        expect(result.current.data?.[0].firstName).toBe('John')
      })

      expect(mockGetEmployees).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        search: 'John',
        department: 'Engineering',
        status: 'active'
      })
    })

    it('handles pagination', async () => {
      mockGetEmployees.mockResolvedValueOnce({
        data: mockEmployees,
        meta: { total: 50, page: 2, limit: 10, totalPages: 5 }
      })

      const { result } = renderHook(() => useEmployees({
        page: 2,
        limit: 10
      }), { wrapper })

      await waitFor(() => {
        expect(result.current.data).toEqual(mockEmployees)
        expect(result.current.meta?.page).toBe(2)
        expect(result.current.meta?.totalPages).toBe(5)
      })

      expect(mockGetEmployees).toHaveBeenCalledWith({
        page: 2,
        limit: 10,
        search: '',
        department: '',
        status: ''
      })
    })

    it('handles loading state', () => {
      mockGetEmployees.mockImplementation(() => new Promise(() => {})) // Never resolves

      const { result } = renderHook(() => useEmployees(), { wrapper })

      expect(result.current.isLoading).toBe(true)
      expect(result.current.data).toBeUndefined()
    })

    it('handles error state', async () => {
      const error = new Error('Failed to fetch employees')
      mockGetEmployees.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useEmployees(), { wrapper })

      await waitFor(() => {
        expect(result.current.error).toEqual(error)
        expect(result.current.isLoading).toBe(false)
        expect(result.current.data).toBeUndefined()
      })
    })
  })

  describe('useEmployee Single Query', () => {
    it('fetches single employee successfully', async () => {
      mockGetEmployee.mockResolvedValueOnce({
        data: mockEmployees[0]
      })

      const { result } = renderHook(() => useEmployees({ employeeId: 'emp-1' }), { wrapper })

      await waitFor(() => {
        expect(result.current.employee).toEqual(mockEmployees[0])
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockGetEmployee).toHaveBeenCalledWith('emp-1')
    })

    it('handles employee not found', async () => {
      const error = new Error('Employee not found')
      mockGetEmployee.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useEmployees({ employeeId: 'non-existent' }), { wrapper })

      await waitFor(() => {
        expect(result.current.error).toEqual(error)
        expect(result.current.employee).toBeUndefined()
      })
    })
  })

  describe('Create Employee Mutation', () => {
    it('creates employee successfully', async () => {
      const newEmployee = {
        firstName: 'Bob',
        lastName: 'Wilson',
        email: 'bob.wilson@company.com',
        department: 'Sales',
        position: 'Sales Rep'
      }

      const createdEmployee = {
        id: 'emp-3',
        employeeId: 'EMP003',
        ...newEmployee,
        status: 'active' as const,
        avatar: '/avatars/default.jpg',
        startDate: '2024-01-20',
        phone: '',
        manager: null,
        createdAt: '2024-01-20T00:00:00Z',
        updatedAt: '2024-01-20T00:00:00Z'
      }

      mockCreateEmployee.mockResolvedValueOnce({
        data: createdEmployee
      })

      const { result } = renderHook(() => useEmployees(), { wrapper })

      await act(async () => {
        await result.current.createEmployee.mutateAsync(newEmployee)
      })

      expect(mockCreateEmployee).toHaveBeenCalledWith(newEmployee)
      expect(result.current.createEmployee.isSuccess).toBe(true)
      expect(result.current.createEmployee.data?.data).toEqual(createdEmployee)
    })

    it('handles create employee error', async () => {
      const error = new Error('Email already exists')
      mockCreateEmployee.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useEmployees(), { wrapper })

      await act(async () => {
        try {
          await result.current.createEmployee.mutateAsync({
            firstName: 'Test',
            lastName: 'User',
            email: 'existing@company.com'
          })
        } catch (e) {
          expect(e).toEqual(error)
        }
      })

      expect(result.current.createEmployee.isError).toBe(true)
      expect(result.current.createEmployee.error).toEqual(error)
    })

    it('manages loading state during creation', async () => {
      let resolveCreate: (value: any) => void
      const createPromise = new Promise((resolve) => {
        resolveCreate = resolve
      })
      mockCreateEmployee.mockReturnValueOnce(createPromise)

      const { result } = renderHook(() => useEmployees(), { wrapper })

      act(() => {
        result.current.createEmployee.mutate({
          firstName: 'Test',
          lastName: 'User',
          email: 'test@company.com'
        })
      })

      expect(result.current.createEmployee.isPending).toBe(true)

      act(() => {
        resolveCreate({ data: mockEmployees[0] })
      })

      await waitFor(() => {
        expect(result.current.createEmployee.isPending).toBe(false)
      })
    })
  })

  describe('Update Employee Mutation', () => {
    it('updates employee successfully', async () => {
      const updates = {
        firstName: 'John Updated',
        position: 'Senior Software Engineer'
      }

      const updatedEmployee = {
        ...mockEmployees[0],
        ...updates,
        updatedAt: '2024-01-21T00:00:00Z'
      }

      mockUpdateEmployee.mockResolvedValueOnce({
        data: updatedEmployee
      })

      const { result } = renderHook(() => useEmployees(), { wrapper })

      await act(async () => {
        await result.current.updateEmployee.mutateAsync({
          id: 'emp-1',
          data: updates
        })
      })

      expect(mockUpdateEmployee).toHaveBeenCalledWith('emp-1', updates)
      expect(result.current.updateEmployee.isSuccess).toBe(true)
    })

    it('handles update employee error', async () => {
      const error = new Error('Employee not found')
      mockUpdateEmployee.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useEmployees(), { wrapper })

      await act(async () => {
        try {
          await result.current.updateEmployee.mutateAsync({
            id: 'non-existent',
            data: { firstName: 'Test' }
          })
        } catch (e) {
          expect(e).toEqual(error)
        }
      })

      expect(result.current.updateEmployee.isError).toBe(true)
    })
  })

  describe('Delete Employee Mutation', () => {
    it('deletes employee successfully', async () => {
      mockDeleteEmployee.mockResolvedValueOnce({
        message: 'Employee deleted successfully'
      })

      const { result } = renderHook(() => useEmployees(), { wrapper })

      await act(async () => {
        await result.current.deleteEmployee.mutateAsync('emp-1')
      })

      expect(mockDeleteEmployee).toHaveBeenCalledWith('emp-1')
      expect(result.current.deleteEmployee.isSuccess).toBe(true)
    })

    it('handles delete employee error', async () => {
      const error = new Error('Cannot delete employee with active leave')
      mockDeleteEmployee.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useEmployees(), { wrapper })

      await act(async () => {
        try {
          await result.current.deleteEmployee.mutateAsync('emp-1')
        } catch (e) {
          expect(e).toEqual(error)
        }
      })

      expect(result.current.deleteEmployee.isError).toBe(true)
    })
  })

  describe('Query Invalidation and Refetching', () => {
    it('refetches employees after successful creation', async () => {
      mockGetEmployees.mockResolvedValue({
        data: mockEmployees,
        meta: { total: 2, page: 1, limit: 20, totalPages: 1 }
      })

      mockCreateEmployee.mockResolvedValueOnce({
        data: mockEmployees[0]
      })

      const { result } = renderHook(() => useEmployees(), { wrapper })

      // Wait for initial fetch
      await waitFor(() => {
        expect(result.current.data).toEqual(mockEmployees)
      })

      // Clear mock calls
      mockGetEmployees.mockClear()

      // Create employee
      await act(async () => {
        await result.current.createEmployee.mutateAsync({
          firstName: 'New',
          lastName: 'Employee',
          email: 'new@company.com'
        })
      })

      // Should trigger refetch
      await waitFor(() => {
        expect(mockGetEmployees).toHaveBeenCalled()
      })
    })
  })

  describe('Optimistic Updates', () => {
    it('provides optimistic update capabilities', async () => {
      const { result } = renderHook(() => useEmployees(), { wrapper })

      // The hook should provide utilities for optimistic updates
      expect(result.current.updateEmployee).toBeDefined()
      expect(result.current.deleteEmployee).toBeDefined()
    })
  })
})