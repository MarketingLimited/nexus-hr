import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Documents from '@/pages/Documents'

// Mock hooks
vi.mock('@/hooks/useDocuments', () => ({
  useDocuments: () => ({
    documents: [
      {
        id: '1',
        name: 'Employee Handbook.pdf',
        type: 'policy',
        size: '2.5 MB',
        uploadDate: '2024-01-15',
        category: 'HR Policies'
      },
      {
        id: '2', 
        name: 'W4_Form.pdf',
        type: 'form',
        size: '1.2 MB',
        uploadDate: '2024-02-01',
        category: 'Tax Documents'
      }
    ],
    uploadDocument: vi.fn().mockResolvedValue({ success: true }),
    deleteDocument: vi.fn().mockResolvedValue({ success: true }),
    downloadDocument: vi.fn(),
    searchDocuments: vi.fn(),
    loading: false,
    error: null
  })
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1', name: 'John Doe', role: 'admin' },
    isAuthenticated: true
  })
}))

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('Documents Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders documents page', () => {
    renderWithRouter(<Documents />)
    
    expect(screen.getByText(/document management/i)).toBeInTheDocument()
  })

  it('displays document list', () => {
    renderWithRouter(<Documents />)
    
    expect(screen.getByText('Employee Handbook.pdf')).toBeInTheDocument()
    expect(screen.getByText('W4_Form.pdf')).toBeInTheDocument()
  })

  it('shows document categories', () => {
    renderWithRouter(<Documents />)
    
    expect(screen.getByText('HR Policies')).toBeInTheDocument()
    expect(screen.getByText('Tax Documents')).toBeInTheDocument()
  })

  it('displays document metadata', () => {
    renderWithRouter(<Documents />)
    
    expect(screen.getByText('2.5 MB')).toBeInTheDocument()
    expect(screen.getByText('1.2 MB')).toBeInTheDocument()
  })

  it('has upload functionality', () => {
    renderWithRouter(<Documents />)
    
    expect(screen.getByText(/upload document/i)).toBeInTheDocument()
  })

  it('provides search functionality', () => {
    renderWithRouter(<Documents />)
    
    const searchInput = screen.getByPlaceholderText(/search documents/i)
    expect(searchInput).toBeInTheDocument()
  })

  it('handles document upload', async () => {
    const mockUpload = vi.fn().mockResolvedValue({ success: true })
    vi.mocked(require('@/hooks/useDocuments').useDocuments).mockReturnValue({
      documents: [],
      uploadDocument: mockUpload,
      deleteDocument: vi.fn(),
      downloadDocument: vi.fn(),
      searchDocuments: vi.fn(),
      loading: false,
      error: null
    })

    renderWithRouter(<Documents />)
    
    const uploadButton = screen.getByText(/upload document/i)
    fireEvent.click(uploadButton)
    
    expect(screen.getByText(/select file/i)).toBeInTheDocument()
  })

  it('handles document deletion', async () => {
    const mockDelete = vi.fn().mockResolvedValue({ success: true })
    vi.mocked(require('@/hooks/useDocuments').useDocuments).mockReturnValue({
      documents: [
        {
          id: '1',
          name: 'test.pdf',
          type: 'document',
          size: '1 MB',
          uploadDate: '2024-01-01',
          category: 'General'
        }
      ],
      uploadDocument: vi.fn(),
      deleteDocument: mockDelete,
      downloadDocument: vi.fn(),
      searchDocuments: vi.fn(),
      loading: false,
      error: null
    })

    renderWithRouter(<Documents />)
    
    const deleteButton = screen.getByText(/delete/i)
    fireEvent.click(deleteButton)
    
    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith('1')
    })
  })

  it('shows loading state', () => {
    vi.mocked(require('@/hooks/useDocuments').useDocuments).mockReturnValue({
      documents: [],
      uploadDocument: vi.fn(),
      deleteDocument: vi.fn(),
      downloadDocument: vi.fn(),
      searchDocuments: vi.fn(),
      loading: true,
      error: null
    })

    renderWithRouter(<Documents />)
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('displays error state', () => {
    vi.mocked(require('@/hooks/useDocuments').useDocuments).mockReturnValue({
      documents: [],
      uploadDocument: vi.fn(),
      deleteDocument: vi.fn(),
      downloadDocument: vi.fn(),
      searchDocuments: vi.fn(),
      loading: false,
      error: 'Failed to load documents'
    })

    renderWithRouter(<Documents />)
    
    expect(screen.getByText(/error/i)).toBeInTheDocument()
  })

  it('filters documents by category', () => {
    renderWithRouter(<Documents />)
    
    const categoryFilter = screen.getByText(/all categories/i)
    fireEvent.click(categoryFilter)
    
    expect(screen.getByText(/hr policies/i)).toBeInTheDocument()
  })

  it('handles document download', () => {
    const mockDownload = vi.fn()
    vi.mocked(require('@/hooks/useDocuments').useDocuments).mockReturnValue({
      documents: [
        {
          id: '1',
          name: 'test.pdf',
          type: 'document',
          size: '1 MB',
          uploadDate: '2024-01-01',
          category: 'General'
        }
      ],
      uploadDocument: vi.fn(),
      deleteDocument: vi.fn(),
      downloadDocument: mockDownload,
      searchDocuments: vi.fn(),
      loading: false,
      error: null
    })

    renderWithRouter(<Documents />)
    
    const downloadButton = screen.getByText(/download/i)
    fireEvent.click(downloadButton)
    
    expect(mockDownload).toHaveBeenCalledWith('1')
  })

  it('requires authentication', () => {
    vi.mocked(require('@/contexts/AuthContext').useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false
    })

    renderWithRouter(<Documents />)
    
    expect(screen.getByText(/sign in/i)).toBeInTheDocument()
  })

  it('shows document permissions based on role', () => {
    vi.mocked(require('@/contexts/AuthContext').useAuth).mockReturnValue({
      user: { id: '1', name: 'John Doe', role: 'employee' },
      isAuthenticated: true
    })

    renderWithRouter(<Documents />)
    
    // Employee should not see upload button
    expect(screen.queryByText(/upload document/i)).not.toBeInTheDocument()
  })

  it('handles search functionality', async () => {
    const mockSearch = vi.fn()
    vi.mocked(require('@/hooks/useDocuments').useDocuments).mockReturnValue({
      documents: [],
      uploadDocument: vi.fn(),
      deleteDocument: vi.fn(),
      downloadDocument: vi.fn(),
      searchDocuments: mockSearch,
      loading: false,
      error: null
    })

    renderWithRouter(<Documents />)
    
    const searchInput = screen.getByPlaceholderText(/search documents/i)
    fireEvent.change(searchInput, { target: { value: 'handbook' } })
    
    await waitFor(() => {
      expect(mockSearch).toHaveBeenCalledWith('handbook')
    })
  })

  it('displays document preview for supported formats', () => {
    renderWithRouter(<Documents />)
    
    const previewButton = screen.getByText(/preview/i)
    expect(previewButton).toBeInTheDocument()
  })

  it('shows document version history', () => {
    renderWithRouter(<Documents />)
    
    const versionButton = screen.getByText(/versions/i)
    fireEvent.click(versionButton)
    
    expect(screen.getByText(/version history/i)).toBeInTheDocument()
  })
})