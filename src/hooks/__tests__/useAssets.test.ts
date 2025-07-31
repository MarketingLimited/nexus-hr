import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAssets } from '@/hooks/useAssets'

// Mock asset service
vi.mock('@/services/assetService', () => ({
  getAssets: vi.fn(),
  createAsset: vi.fn(),
  updateAsset: vi.fn(),
  deleteAsset: vi.fn(),
  getAssetHistory: vi.fn()
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

describe('useAssets', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAssets', () => {
    it('fetches assets successfully', async () => {
      const mockAssets = [
        { id: '1', name: 'Laptop', category: 'IT Equipment', status: 'assigned' },
        { id: '2', name: 'Monitor', category: 'IT Equipment', status: 'available' }
      ]

      vi.mocked(require('@/services/assetService').getAssets).mockResolvedValue(mockAssets)

      const { result } = renderHook(() => useAssets(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.assets).toEqual(mockAssets)
      })

      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)
    })

    it('handles asset fetch errors', async () => {
      const mockError = new Error('Failed to fetch assets')
      vi.mocked(require('@/services/assetService').getAssets).mockRejectedValue(mockError)

      const { result } = renderHook(() => useAssets(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.error).toBeTruthy()
      })

      expect(result.current.assets).toEqual([])
      expect(result.current.loading).toBe(false)
    })

    it('supports asset filtering by category', async () => {
      const mockAssets = [
        { id: '1', name: 'Laptop', category: 'IT Equipment', status: 'assigned' }
      ]

      vi.mocked(require('@/services/assetService').getAssets).mockResolvedValue(mockAssets)

      const { result } = renderHook(() => useAssets({ category: 'IT Equipment' }), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.assets).toEqual(mockAssets)
      })

      expect(require('@/services/assetService').getAssets).toHaveBeenCalledWith({ category: 'IT Equipment' })
    })
  })

  describe('createAsset', () => {
    it('creates new asset successfully', async () => {
      const newAsset = { name: 'New Laptop', category: 'IT Equipment', value: 1200 }
      const createdAsset = { id: '3', ...newAsset, status: 'available' }

      vi.mocked(require('@/services/assetService').createAsset).mockResolvedValue(createdAsset)

      const { result } = renderHook(() => useAssets(), {
        wrapper: createWrapper()
      })

      await result.current.createAsset(newAsset)

      expect(require('@/services/assetService').createAsset).toHaveBeenCalledWith(newAsset)
    })

    it('handles asset creation errors', async () => {
      const newAsset = { name: 'Invalid Asset' }
      const mockError = new Error('Validation failed')

      vi.mocked(require('@/services/assetService').createAsset).mockRejectedValue(mockError)

      const { result } = renderHook(() => useAssets(), {
        wrapper: createWrapper()
      })

      await expect(result.current.createAsset(newAsset)).rejects.toThrow('Validation failed')
    })
  })

  describe('updateAsset', () => {
    it('updates asset successfully', async () => {
      const assetId = '1'
      const updates = { status: 'maintenance' }
      const updatedAsset = { id: '1', name: 'Laptop', status: 'maintenance' }

      vi.mocked(require('@/services/assetService').updateAsset).mockResolvedValue(updatedAsset)

      const { result } = renderHook(() => useAssets(), {
        wrapper: createWrapper()
      })

      await result.current.updateAsset(assetId, updates)

      expect(require('@/services/assetService').updateAsset).toHaveBeenCalledWith(assetId, updates)
    })

    it('handles asset update errors', async () => {
      const assetId = 'nonexistent'
      const updates = { status: 'maintenance' }
      const mockError = new Error('Asset not found')

      vi.mocked(require('@/services/assetService').updateAsset).mockRejectedValue(mockError)

      const { result } = renderHook(() => useAssets(), {
        wrapper: createWrapper()
      })

      await expect(result.current.updateAsset(assetId, updates)).rejects.toThrow('Asset not found')
    })
  })

  describe('deleteAsset', () => {
    it('deletes asset successfully', async () => {
      const assetId = '1'

      vi.mocked(require('@/services/assetService').deleteAsset).mockResolvedValue(true)

      const { result } = renderHook(() => useAssets(), {
        wrapper: createWrapper()
      })

      await result.current.deleteAsset(assetId)

      expect(require('@/services/assetService').deleteAsset).toHaveBeenCalledWith(assetId)
    })

    it('handles asset deletion errors', async () => {
      const assetId = 'protected'
      const mockError = new Error('Cannot delete protected asset')

      vi.mocked(require('@/services/assetService').deleteAsset).mockRejectedValue(mockError)

      const { result } = renderHook(() => useAssets(), {
        wrapper: createWrapper()
      })

      await expect(result.current.deleteAsset(assetId)).rejects.toThrow('Cannot delete protected asset')
    })
  })

  describe('getAssetHistory', () => {
    it('fetches asset history successfully', async () => {
      const assetId = '1'
      const mockHistory = [
        { id: '1', action: 'assigned', date: '2024-01-15', user: 'john.doe' },
        { id: '2', action: 'returned', date: '2024-02-01', user: 'john.doe' }
      ]

      vi.mocked(require('@/services/assetService').getAssetHistory).mockResolvedValue(mockHistory)

      const { result } = renderHook(() => useAssets(), {
        wrapper: createWrapper()
      })

      const history = await result.current.getAssetHistory(assetId)

      expect(history).toEqual(mockHistory)
      expect(require('@/services/assetService').getAssetHistory).toHaveBeenCalledWith(assetId)
    })
  })

  describe('asset assignment', () => {
    it('assigns asset to employee', async () => {
      const assetId = '1'
      const employeeId = 'emp1'
      const assignedAsset = { id: '1', assignedTo: 'emp1', status: 'assigned' }

      vi.mocked(require('@/services/assetService').updateAsset).mockResolvedValue(assignedAsset)

      const { result } = renderHook(() => useAssets(), {
        wrapper: createWrapper()
      })

      await result.current.assignAsset(assetId, employeeId)

      expect(require('@/services/assetService').updateAsset).toHaveBeenCalledWith(
        assetId,
        { assignedTo: employeeId, status: 'assigned', assignedDate: expect.any(String) }
      )
    })

    it('returns asset from employee', async () => {
      const assetId = '1'
      const returnedAsset = { id: '1', assignedTo: null, status: 'available' }

      vi.mocked(require('@/services/assetService').updateAsset).mockResolvedValue(returnedAsset)

      const { result } = renderHook(() => useAssets(), {
        wrapper: createWrapper()
      })

      await result.current.returnAsset(assetId)

      expect(require('@/services/assetService').updateAsset).toHaveBeenCalledWith(
        assetId,
        { assignedTo: null, status: 'available', returnedDate: expect.any(String) }
      )
    })
  })

  describe('asset search and filtering', () => {
    it('searches assets by name', async () => {
      const searchTerm = 'laptop'
      const mockAssets = [
        { id: '1', name: 'Laptop Dell', category: 'IT Equipment' }
      ]

      vi.mocked(require('@/services/assetService').getAssets).mockResolvedValue(mockAssets)

      const { result } = renderHook(() => useAssets({ search: searchTerm }), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.assets).toEqual(mockAssets)
      })

      expect(require('@/services/assetService').getAssets).toHaveBeenCalledWith({ search: searchTerm })
    })

    it('filters assets by status', async () => {
      const status = 'assigned'
      const mockAssets = [
        { id: '1', name: 'Laptop', status: 'assigned' }
      ]

      vi.mocked(require('@/services/assetService').getAssets).mockResolvedValue(mockAssets)

      const { result } = renderHook(() => useAssets({ status }), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.assets).toEqual(mockAssets)
      })

      expect(require('@/services/assetService').getAssets).toHaveBeenCalledWith({ status })
    })
  })

  describe('optimistic updates', () => {
    it('optimistically updates asset status', async () => {
      const mockAssets = [
        { id: '1', name: 'Laptop', status: 'available' }
      ]

      vi.mocked(require('@/services/assetService').getAssets).mockResolvedValue(mockAssets)
      vi.mocked(require('@/services/assetService').updateAsset).mockImplementation(
        (id, updates) => new Promise(resolve => 
          setTimeout(() => resolve({ id, ...updates }), 100)
        )
      )

      const { result } = renderHook(() => useAssets(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.assets).toEqual(mockAssets)
      })

      // Trigger optimistic update
      result.current.updateAsset('1', { status: 'maintenance' })

      // Should show optimistic update immediately
      await waitFor(() => {
        const updatedAsset = result.current.assets.find(a => a.id === '1')
        expect(updatedAsset?.status).toBe('maintenance')
      })
    })
  })
})