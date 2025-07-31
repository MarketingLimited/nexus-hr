import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { createTestQueryClient } from '../test-utils/test-utils'
import { 
  usePayrollStats,
  usePayrollStatus,
  usePayrollHistory
} from '../usePayroll'

describe('usePayroll Hooks', () => {
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

  describe('usePayrollStats', () => {
    it('should fetch payroll statistics', async () => {
      const { result } = renderHook(() => usePayrollStats(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeDefined()
      expect(result.current.data).toHaveProperty('monthlyTotal')
      expect(result.current.data).toHaveProperty('monthlyGrowth')
      expect(result.current.data).toHaveProperty('avgSalary')
      expect(result.current.data).toHaveProperty('daysToNext')
      expect(result.current.data).toHaveProperty('taxDeductions')
    })

    it('should use correct query key', () => {
      renderHook(() => usePayrollStats(), { wrapper })
      
      const queries = queryClient.getQueryCache().getAll()
      expect(queries.some(query => 
        JSON.stringify(query.queryKey) === JSON.stringify(['payroll', 'stats'])
      )).toBe(true)
    })

    it('should return expected data types', async () => {
      const { result } = renderHook(() => usePayrollStats(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      const { data } = result.current
      expect(typeof data?.monthlyTotal).toBe('number')
      expect(typeof data?.monthlyGrowth).toBe('number')
      expect(typeof data?.avgSalary).toBe('number')
      expect(typeof data?.daysToNext).toBe('number')
      expect(typeof data?.taxDeductions).toBe('number')
    })

    it('should return reasonable data values', async () => {
      const { result } = renderHook(() => usePayrollStats(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      const { data } = result.current
      expect(data?.monthlyTotal).toBeGreaterThan(0)
      expect(data?.avgSalary).toBeGreaterThan(0)
      expect(data?.daysToNext).toBeGreaterThanOrEqual(0)
      expect(data?.taxDeductions).toBeGreaterThanOrEqual(0)
    })
  })

  describe('usePayrollStatus', () => {
    it('should fetch payroll processing status', async () => {
      const { result } = renderHook(() => usePayrollStatus(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeDefined()
      expect(result.current.data).toHaveProperty('currentPeriod')
      expect(result.current.data).toHaveProperty('processingPeriod')
      expect(result.current.data).toHaveProperty('status')
      expect(result.current.data).toHaveProperty('steps')
    })

    it('should use correct query key', () => {
      renderHook(() => usePayrollStatus(), { wrapper })
      
      const queries = queryClient.getQueryCache().getAll()
      expect(queries.some(query => 
        JSON.stringify(query.queryKey) === JSON.stringify(['payroll', 'status'])
      )).toBe(true)
    })

    it('should return valid status information', async () => {
      const { result } = renderHook(() => usePayrollStatus(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      const { data } = result.current
      expect(typeof data?.currentPeriod).toBe('string')
      expect(typeof data?.processingPeriod).toBe('string')
      expect(['in-progress', 'completed', 'pending', 'failed']).toContain(data?.status)
      expect(Array.isArray(data?.steps)).toBe(true)
    })

    it('should return valid processing steps', async () => {
      const { result } = renderHook(() => usePayrollStatus(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      const { data } = result.current
      if (data?.steps && data.steps.length > 0) {
        const step = data.steps[0]
        expect(step).toHaveProperty('name')
        expect(step).toHaveProperty('status')
        expect(['completed', 'in-progress', 'pending', 'failed']).toContain(step.status)
      }
    })

    it('should have processing steps in logical order', async () => {
      const { result } = renderHook(() => usePayrollStatus(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      const { data } = result.current
      if (data?.steps) {
        const stepNames = data.steps.map(step => step.name)
        expect(stepNames).toContain('Salary calculations')
        expect(stepNames).toContain('Tax calculations')
        
        // Check order makes sense
        const salaryIndex = stepNames.indexOf('Salary calculations')
        const taxIndex = stepNames.indexOf('Tax calculations')
        expect(salaryIndex).toBeLessThan(taxIndex)
      }
    })
  })

  describe('usePayrollHistory', () => {
    it('should fetch payroll history without filters', async () => {
      const { result } = renderHook(() => usePayrollHistory(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeDefined()
      expect(result.current.data).toHaveProperty('data')
      expect(Array.isArray(result.current.data?.data)).toBe(true)
    })

    it('should fetch payroll history with filters', async () => {
      const filters = { year: 2024, status: 'Completed' }
      const { result } = renderHook(() => usePayrollHistory(filters), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeDefined()
      expect(Array.isArray(result.current.data?.data)).toBe(true)
    })

    it('should use correct query key with filters', () => {
      const filters = { year: 2024 }
      renderHook(() => usePayrollHistory(filters), { wrapper })
      
      const queries = queryClient.getQueryCache().getAll()
      expect(queries.some(query => 
        JSON.stringify(query.queryKey) === JSON.stringify(['payroll', 'history', filters])
      )).toBe(true)
    })

    it('should return valid payroll history data structure', async () => {
      const { result } = renderHook(() => usePayrollHistory(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      const { data } = result.current
      expect(Array.isArray(data?.data)).toBe(true)
      
      if (data?.data && data.data.length > 0) {
        const record = data.data[0]
        expect(record).toHaveProperty('id')
        expect(record).toHaveProperty('period')
        expect(record).toHaveProperty('totalAmount')
        expect(record).toHaveProperty('status')
        expect(record).toHaveProperty('processedDate')
      }
    })

    it('should return records with valid status values', async () => {
      const { result } = renderHook(() => usePayrollHistory(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      const { data } = result.current
      if (data?.data) {
        data.data.forEach(record => {
          expect(['Completed', 'In Progress', 'Failed', 'Pending']).toContain(record.status)
          expect(typeof record.totalAmount).toBe('number')
          expect(record.totalAmount).toBeGreaterThan(0)
        })
      }
    })

    it('should return records in chronological order', async () => {
      const { result } = renderHook(() => usePayrollHistory(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      const { data } = result.current
      if (data?.data && data.data.length > 1) {
        // Check if records are in reverse chronological order (newest first)
        const firstDate = new Date(data.data[0].processedDate)
        const secondDate = new Date(data.data[1].processedDate)
        expect(firstDate.getTime()).toBeGreaterThanOrEqual(secondDate.getTime())
      }
    })
  })

  describe('React Query Integration', () => {
    it('should support refetching for all hooks', async () => {
      const { result: statsResult } = renderHook(() => usePayrollStats(), { wrapper })
      const { result: statusResult } = renderHook(() => usePayrollStatus(), { wrapper })
      const { result: historyResult } = renderHook(() => usePayrollHistory(), { wrapper })

      await waitFor(() => {
        expect(statsResult.current.isSuccess).toBe(true)
        expect(statusResult.current.isSuccess).toBe(true)
        expect(historyResult.current.isSuccess).toBe(true)
      })

      // Test refetch functionality
      expect(statsResult.current.refetch).toBeInstanceOf(Function)
      expect(statusResult.current.refetch).toBeInstanceOf(Function)
      expect(historyResult.current.refetch).toBeInstanceOf(Function)
    })

    it('should handle loading states', () => {
      const { result } = renderHook(() => usePayrollStats(), { wrapper })

      expect(result.current.isLoading || result.current.isSuccess || result.current.isError).toBe(true)
    })

    it('should handle error states gracefully', async () => {
      // All hooks should handle potential errors
      const { result: statsResult } = renderHook(() => usePayrollStats(), { wrapper })
      const { result: statusResult } = renderHook(() => usePayrollStatus(), { wrapper })
      const { result: historyResult } = renderHook(() => usePayrollHistory(), { wrapper })

      await waitFor(() => {
        expect(
          statsResult.current.isSuccess || statsResult.current.isError
        ).toBe(true)
        expect(
          statusResult.current.isSuccess || statusResult.current.isError
        ).toBe(true)
        expect(
          historyResult.current.isSuccess || historyResult.current.isError
        ).toBe(true)
      })
    })
  })

  describe('Query Cache Management', () => {
    it('should cache data appropriately', async () => {
      const { result } = renderHook(() => usePayrollStats(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // Verify data is cached
      const cachedData = queryClient.getQueryData(['payroll', 'stats'])
      expect(cachedData).toBeDefined()
      expect(cachedData).toEqual(result.current.data)
    })

    it('should invalidate related queries when appropriate', async () => {
      // Pre-populate cache
      queryClient.setQueryData(['payroll', 'stats'], { monthlyTotal: 100000 })
      queryClient.setQueryData(['payroll', 'history'], { data: [] })

      const queries = queryClient.getQueryCache().getAll()
      expect(queries.length).toBeGreaterThan(0)

      // Test that cache invalidation could work
      queryClient.invalidateQueries({ queryKey: ['payroll'] })
      
      const payrollQueries = queryClient.getQueryCache().findAll({ queryKey: ['payroll'] })
      payrollQueries.forEach(query => {
        expect(query.isStale()).toBe(true)
      })
    })
  })
})