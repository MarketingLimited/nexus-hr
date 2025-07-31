import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useDepartments } from '@/hooks/useDepartments'

// Mock department service
vi.mock('@/services/dataService', () => ({
  getDepartments: vi.fn(),
  createDepartment: vi.fn(),
  updateDepartment: vi.fn(),
  deleteDepartment: vi.fn(),
  getDepartmentEmployees: vi.fn()
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useDepartments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getDepartments', () => {
    it('fetches departments successfully', async () => {
      const mockDepartments = [
        { id: '1', name: 'Engineering', headCount: 25, budget: 250000 },
        { id: '2', name: 'Marketing', headCount: 12, budget: 120000 },
        { id: '3', name: 'Sales', headCount: 18, budget: 180000 }
      ]

      vi.mocked(require('@/services/dataService').getDepartments).mockResolvedValue(mockDepartments)

      const { result } = renderHook(() => useDepartments(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.departments).toEqual(mockDepartments)
      })

      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)
    })

    it('handles department fetch errors', async () => {
      const mockError = new Error('Failed to fetch departments')
      vi.mocked(require('@/services/dataService').getDepartments).mockRejectedValue(mockError)

      const { result } = renderHook(() => useDepartments(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.error).toBeTruthy()
      })

      expect(result.current.departments).toEqual([])
      expect(result.current.loading).toBe(false)
    })
  })

  describe('createDepartment', () => {
    it('creates new department successfully', async () => {
      const newDepartment = {
        name: 'Product',
        description: 'Product development team',
        budget: 300000
      }
      const createdDepartment = { id: '4', ...newDepartment, headCount: 0 }

      vi.mocked(require('@/services/dataService').createDepartment).mockResolvedValue(createdDepartment)

      const { result } = renderHook(() => useDepartments(), {
        wrapper: createWrapper()
      })

      await result.current.createDepartment(newDepartment)

      expect(require('@/services/dataService').createDepartment).toHaveBeenCalledWith(newDepartment)
    })

    it('handles department creation errors', async () => {
      const newDepartment = { name: '' } // Invalid department
      const mockError = new Error('Department name is required')

      vi.mocked(require('@/services/dataService').createDepartment).mockRejectedValue(mockError)

      const { result } = renderHook(() => useDepartments(), {
        wrapper: createWrapper()
      })

      await expect(result.current.createDepartment(newDepartment)).rejects.toThrow('Department name is required')
    })
  })

  describe('updateDepartment', () => {
    it('updates department successfully', async () => {
      const departmentId = '1'
      const updates = { budget: 275000, headCount: 28 }
      const updatedDepartment = { id: '1', name: 'Engineering', ...updates }

      vi.mocked(require('@/services/dataService').updateDepartment).mockResolvedValue(updatedDepartment)

      const { result } = renderHook(() => useDepartments(), {
        wrapper: createWrapper()
      })

      await result.current.updateDepartment(departmentId, updates)

      expect(require('@/services/dataService').updateDepartment).toHaveBeenCalledWith(departmentId, updates)
    })

    it('handles department update errors', async () => {
      const departmentId = 'nonexistent'
      const updates = { budget: 100000 }
      const mockError = new Error('Department not found')

      vi.mocked(require('@/services/dataService').updateDepartment).mockRejectedValue(mockError)

      const { result } = renderHook(() => useDepartments(), {
        wrapper: createWrapper()
      })

      await expect(result.current.updateDepartment(departmentId, updates)).rejects.toThrow('Department not found')
    })
  })

  describe('deleteDepartment', () => {
    it('deletes department successfully', async () => {
      const departmentId = '2'

      vi.mocked(require('@/services/dataService').deleteDepartment).mockResolvedValue(true)

      const { result } = renderHook(() => useDepartments(), {
        wrapper: createWrapper()
      })

      await result.current.deleteDepartment(departmentId)

      expect(require('@/services/dataService').deleteDepartment).toHaveBeenCalledWith(departmentId)
    })

    it('handles department deletion errors', async () => {
      const departmentId = '1'
      const mockError = new Error('Cannot delete department with active employees')

      vi.mocked(require('@/services/dataService').deleteDepartment).mockRejectedValue(mockError)

      const { result } = renderHook(() => useDepartments(), {
        wrapper: createWrapper()
      })

      await expect(result.current.deleteDepartment(departmentId)).rejects.toThrow('Cannot delete department with active employees')
    })
  })

  describe('getDepartmentEmployees', () => {
    it('fetches department employees successfully', async () => {
      const departmentId = '1'
      const mockEmployees = [
        { id: 'emp1', name: 'John Doe', position: 'Software Engineer' },
        { id: 'emp2', name: 'Jane Smith', position: 'Senior Developer' }
      ]

      vi.mocked(require('@/services/dataService').getDepartmentEmployees).mockResolvedValue(mockEmployees)

      const { result } = renderHook(() => useDepartments(), {
        wrapper: createWrapper()
      })

      const employees = await result.current.getDepartmentEmployees(departmentId)

      expect(employees).toEqual(mockEmployees)
      expect(require('@/services/dataService').getDepartmentEmployees).toHaveBeenCalledWith(departmentId)
    })
  })

  describe('department statistics', () => {
    it('calculates department statistics', async () => {
      const mockDepartments = [
        { id: '1', name: 'Engineering', headCount: 25, budget: 250000 },
        { id: '2', name: 'Marketing', headCount: 12, budget: 120000 }
      ]

      vi.mocked(require('@/services/dataService').getDepartments).mockResolvedValue(mockDepartments)

      const { result } = renderHook(() => useDepartments(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.departments).toEqual(mockDepartments)
      })

      const stats = result.current.getDepartmentStats()

      expect(stats).toEqual({
        totalDepartments: 2,
        totalEmployees: 37,
        totalBudget: 370000,
        averageDepartmentSize: 18.5
      })
    })

    it('handles empty departments list', async () => {
      vi.mocked(require('@/services/dataService').getDepartments).mockResolvedValue([])

      const { result } = renderHook(() => useDepartments(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.departments).toEqual([])
      })

      const stats = result.current.getDepartmentStats()

      expect(stats).toEqual({
        totalDepartments: 0,
        totalEmployees: 0,
        totalBudget: 0,
        averageDepartmentSize: 0
      })
    })
  })

  describe('department filtering and search', () => {
    it('filters departments by size', async () => {
      const mockDepartments = [
        { id: '1', name: 'Engineering', headCount: 25 },
        { id: '2', name: 'Marketing', headCount: 12 },
        { id: '3', name: 'Sales', headCount: 5 }
      ]

      vi.mocked(require('@/services/dataService').getDepartments).mockResolvedValue(mockDepartments)

      const { result } = renderHook(() => useDepartments(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.departments).toEqual(mockDepartments)
      })

      const largeDepartments = result.current.getDepartmentsBySize('large') // > 20 employees

      expect(largeDepartments).toHaveLength(1)
      expect(largeDepartments[0].name).toBe('Engineering')
    })

    it('searches departments by name', async () => {
      const mockDepartments = [
        { id: '1', name: 'Engineering', headCount: 25 },
        { id: '2', name: 'Marketing', headCount: 12 }
      ]

      vi.mocked(require('@/services/dataService').getDepartments).mockResolvedValue(mockDepartments)

      const { result } = renderHook(() => useDepartments(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.departments).toEqual(mockDepartments)
      })

      const searchResults = result.current.searchDepartments('eng')

      expect(searchResults).toHaveLength(1)
      expect(searchResults[0].name).toBe('Engineering')
    })
  })

  describe('department hierarchy', () => {
    it('handles department hierarchy relationships', async () => {
      const mockDepartments = [
        { id: '1', name: 'Engineering', parentId: null, headCount: 25 },
        { id: '2', name: 'Frontend Team', parentId: '1', headCount: 12 },
        { id: '3', name: 'Backend Team', parentId: '1', headCount: 13 }
      ]

      vi.mocked(require('@/services/dataService').getDepartments).mockResolvedValue(mockDepartments)

      const { result } = renderHook(() => useDepartments(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.departments).toEqual(mockDepartments)
      })

      const hierarchy = result.current.getDepartmentHierarchy()

      expect(hierarchy).toHaveProperty('1')
      expect(hierarchy['1'].children).toHaveLength(2)
      expect(hierarchy['1'].children).toContain('2')
      expect(hierarchy['1'].children).toContain('3')
    })

    it('gets department children', async () => {
      const mockDepartments = [
        { id: '1', name: 'Engineering', parentId: null },
        { id: '2', name: 'Frontend Team', parentId: '1' },
        { id: '3', name: 'Backend Team', parentId: '1' }
      ]

      vi.mocked(require('@/services/dataService').getDepartments).mockResolvedValue(mockDepartments)

      const { result } = renderHook(() => useDepartments(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.departments).toEqual(mockDepartments)
      })

      const children = result.current.getDepartmentChildren('1')

      expect(children).toHaveLength(2)
      expect(children.map(d => d.name)).toEqual(['Frontend Team', 'Backend Team'])
    })
  })

  describe('optimistic updates', () => {
    it('optimistically updates department list on creation', async () => {
      const mockDepartments = [
        { id: '1', name: 'Engineering', headCount: 25 }
      ]

      vi.mocked(require('@/services/dataService').getDepartments).mockResolvedValue(mockDepartments)
      vi.mocked(require('@/services/dataService').createDepartment).mockImplementation(
        (dept) => new Promise(resolve => 
          setTimeout(() => resolve({ id: '2', ...dept, headCount: 0 }), 100)
        )
      )

      const { result } = renderHook(() => useDepartments(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.departments).toEqual(mockDepartments)
      })

      // Trigger optimistic update
      const newDepartment = { name: 'Marketing', budget: 120000 }
      result.current.createDepartment(newDepartment)

      // Should optimistically show new department
      await waitFor(() => {
        expect(result.current.departments).toHaveLength(2)
        const newDept = result.current.departments.find(d => d.name === 'Marketing')
        expect(newDept).toBeDefined()
      })
    })
  })
})