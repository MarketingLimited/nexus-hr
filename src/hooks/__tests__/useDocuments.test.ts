import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useDocuments } from '@/hooks/useDocuments'

// Mock document service
vi.mock('@/services/documentService', () => ({
  getDocuments: vi.fn(),
  uploadDocument: vi.fn(),
  deleteDocument: vi.fn(),
  downloadDocument: vi.fn(),
  searchDocuments: vi.fn(),
  getDocumentVersions: vi.fn()
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

describe('useDocuments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getDocuments', () => {
    it('fetches documents successfully', async () => {
      const mockDocuments = [
        { id: '1', name: 'Employee Handbook.pdf', type: 'policy', size: '2.5 MB', category: 'HR' },
        { id: '2', name: 'Code of Conduct.pdf', type: 'policy', size: '1.8 MB', category: 'Legal' }
      ]

      vi.mocked(require('@/services/documentService').getDocuments).mockResolvedValue(mockDocuments)

      const { result } = renderHook(() => useDocuments(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.documents).toEqual(mockDocuments)
      })

      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)
    })

    it('handles document fetch errors', async () => {
      const mockError = new Error('Failed to fetch documents')
      vi.mocked(require('@/services/documentService').getDocuments).mockRejectedValue(mockError)

      const { result } = renderHook(() => useDocuments(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.error).toBeTruthy()
      })

      expect(result.current.documents).toEqual([])
      expect(result.current.loading).toBe(false)
    })

    it('supports document filtering by category', async () => {
      const mockDocuments = [
        { id: '1', name: 'Policy.pdf', category: 'HR' }
      ]

      vi.mocked(require('@/services/documentService').getDocuments).mockResolvedValue(mockDocuments)

      const { result } = renderHook(() => useDocuments({ category: 'HR' }), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.documents).toEqual(mockDocuments)
      })

      expect(require('@/services/documentService').getDocuments).toHaveBeenCalledWith({ category: 'HR' })
    })
  })

  describe('uploadDocument', () => {
    it('uploads document successfully', async () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      const uploadedDocument = {
        id: '3',
        name: 'test.pdf',
        type: 'document',
        size: '1 KB',
        uploadDate: '2024-02-20'
      }

      vi.mocked(require('@/services/documentService').uploadDocument).mockResolvedValue(uploadedDocument)

      const { result } = renderHook(() => useDocuments(), {
        wrapper: createWrapper()
      })

      await result.current.uploadDocument(file, { category: 'General' })

      expect(require('@/services/documentService').uploadDocument).toHaveBeenCalledWith(file, { category: 'General' })
    })

    it('handles upload errors', async () => {
      const file = new File(['content'], 'invalid.exe', { type: 'application/exe' })
      const mockError = new Error('File type not allowed')

      vi.mocked(require('@/services/documentService').uploadDocument).mockRejectedValue(mockError)

      const { result } = renderHook(() => useDocuments(), {
        wrapper: createWrapper()
      })

      await expect(result.current.uploadDocument(file)).rejects.toThrow('File type not allowed')
    })

    it('validates file size limits', async () => {
      const largeFile = new File(['x'.repeat(10 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' })
      const mockError = new Error('File too large')

      vi.mocked(require('@/services/documentService').uploadDocument).mockRejectedValue(mockError)

      const { result } = renderHook(() => useDocuments(), {
        wrapper: createWrapper()
      })

      await expect(result.current.uploadDocument(largeFile)).rejects.toThrow('File too large')
    })

    it('tracks upload progress', async () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      
      vi.mocked(require('@/services/documentService').uploadDocument).mockImplementation(
        (file, options, onProgress) => {
          // Simulate progress updates
          if (onProgress) {
            setTimeout(() => onProgress(25), 10)
            setTimeout(() => onProgress(50), 20)
            setTimeout(() => onProgress(75), 30)
            setTimeout(() => onProgress(100), 40)
          }
          return Promise.resolve({ id: '3', name: 'test.pdf' })
        }
      )

      const { result } = renderHook(() => useDocuments(), {
        wrapper: createWrapper()
      })

      let progressUpdates: number[] = []
      await result.current.uploadDocument(file, {}, (progress) => {
        progressUpdates.push(progress)
      })

      await waitFor(() => {
        expect(progressUpdates).toContain(100)
      })

      expect(progressUpdates).toEqual([25, 50, 75, 100])
    })
  })

  describe('deleteDocument', () => {
    it('deletes document successfully', async () => {
      const documentId = '1'

      vi.mocked(require('@/services/documentService').deleteDocument).mockResolvedValue(true)

      const { result } = renderHook(() => useDocuments(), {
        wrapper: createWrapper()
      })

      await result.current.deleteDocument(documentId)

      expect(require('@/services/documentService').deleteDocument).toHaveBeenCalledWith(documentId)
    })

    it('handles deletion errors', async () => {
      const documentId = 'protected'
      const mockError = new Error('Cannot delete protected document')

      vi.mocked(require('@/services/documentService').deleteDocument).mockRejectedValue(mockError)

      const { result } = renderHook(() => useDocuments(), {
        wrapper: createWrapper()
      })

      await expect(result.current.deleteDocument(documentId)).rejects.toThrow('Cannot delete protected document')
    })
  })

  describe('downloadDocument', () => {
    it('downloads document successfully', async () => {
      const documentId = '1'
      const downloadUrl = 'https://example.com/download/1'

      vi.mocked(require('@/services/documentService').downloadDocument).mockResolvedValue(downloadUrl)

      const { result } = renderHook(() => useDocuments(), {
        wrapper: createWrapper()
      })

      const url = await result.current.downloadDocument(documentId)

      expect(url).toBe(downloadUrl)
      expect(require('@/services/documentService').downloadDocument).toHaveBeenCalledWith(documentId)
    })

    it('handles download errors', async () => {
      const documentId = 'expired'
      const mockError = new Error('Download link expired')

      vi.mocked(require('@/services/documentService').downloadDocument).mockRejectedValue(mockError)

      const { result } = renderHook(() => useDocuments(), {
        wrapper: createWrapper()
      })

      await expect(result.current.downloadDocument(documentId)).rejects.toThrow('Download link expired')
    })
  })

  describe('searchDocuments', () => {
    it('searches documents successfully', async () => {
      const searchQuery = 'handbook'
      const mockResults = [
        { id: '1', name: 'Employee Handbook.pdf', relevance: 0.95 }
      ]

      vi.mocked(require('@/services/documentService').searchDocuments).mockResolvedValue(mockResults)

      const { result } = renderHook(() => useDocuments(), {
        wrapper: createWrapper()
      })

      const results = await result.current.searchDocuments(searchQuery)

      expect(results).toEqual(mockResults)
      expect(require('@/services/documentService').searchDocuments).toHaveBeenCalledWith(searchQuery, undefined)
    })

    it('supports advanced search with filters', async () => {
      const searchQuery = 'policy'
      const filters = { category: 'HR', type: 'pdf', dateRange: { from: '2024-01-01', to: '2024-12-31' } }
      const mockResults = [
        { id: '1', name: 'HR Policy.pdf', relevance: 0.9 }
      ]

      vi.mocked(require('@/services/documentService').searchDocuments).mockResolvedValue(mockResults)

      const { result } = renderHook(() => useDocuments(), {
        wrapper: createWrapper()
      })

      const results = await result.current.searchDocuments(searchQuery, filters)

      expect(results).toEqual(mockResults)
      expect(require('@/services/documentService').searchDocuments).toHaveBeenCalledWith(searchQuery, filters)
    })

    it('handles empty search results', async () => {
      const searchQuery = 'nonexistent'

      vi.mocked(require('@/services/documentService').searchDocuments).mockResolvedValue([])

      const { result } = renderHook(() => useDocuments(), {
        wrapper: createWrapper()
      })

      const results = await result.current.searchDocuments(searchQuery)

      expect(results).toEqual([])
    })
  })

  describe('document versions', () => {
    it('fetches document versions successfully', async () => {
      const documentId = '1'
      const mockVersions = [
        { id: 'v1', version: '1.0', uploadDate: '2024-01-01', size: '1 MB' },
        { id: 'v2', version: '1.1', uploadDate: '2024-02-01', size: '1.1 MB' }
      ]

      vi.mocked(require('@/services/documentService').getDocumentVersions).mockResolvedValue(mockVersions)

      const { result } = renderHook(() => useDocuments(), {
        wrapper: createWrapper()
      })

      const versions = await result.current.getDocumentVersions(documentId)

      expect(versions).toEqual(mockVersions)
      expect(require('@/services/documentService').getDocumentVersions).toHaveBeenCalledWith(documentId)
    })
  })

  describe('document permissions', () => {
    it('checks document permissions', async () => {
      const mockDocuments = [
        { id: '1', name: 'Public.pdf', permissions: { read: true, write: true, delete: true } },
        { id: '2', name: 'ReadOnly.pdf', permissions: { read: true, write: false, delete: false } }
      ]

      vi.mocked(require('@/services/documentService').getDocuments).mockResolvedValue(mockDocuments)

      const { result } = renderHook(() => useDocuments(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.documents).toEqual(mockDocuments)
      })

      const canEdit = result.current.canEditDocument('1')
      const cannotEdit = result.current.canEditDocument('2')

      expect(canEdit).toBe(true)
      expect(cannotEdit).toBe(false)
    })
  })

  describe('bulk operations', () => {
    it('handles bulk document deletion', async () => {
      const documentIds = ['1', '2', '3']

      vi.mocked(require('@/services/documentService').deleteDocument)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)

      const { result } = renderHook(() => useDocuments(), {
        wrapper: createWrapper()
      })

      const results = await result.current.bulkDeleteDocuments(documentIds)

      expect(results.success).toHaveLength(3)
      expect(results.failed).toHaveLength(0)
    })

    it('handles partial bulk operation failures', async () => {
      const documentIds = ['1', '2', '3']

      vi.mocked(require('@/services/documentService').deleteDocument)
        .mockResolvedValueOnce(true)
        .mockRejectedValueOnce(new Error('Protected'))
        .mockResolvedValueOnce(true)

      const { result } = renderHook(() => useDocuments(), {
        wrapper: createWrapper()
      })

      const results = await result.current.bulkDeleteDocuments(documentIds)

      expect(results.success).toHaveLength(2)
      expect(results.failed).toHaveLength(1)
      expect(results.failed[0].id).toBe('2')
    })
  })
})