import { api, ApiResponse } from './api'
import type { Document, Folder, DocumentPermission } from '../mocks/data/documents'

export interface DocumentFilters {
  folderId?: string
  type?: string
  category?: string
  createdBy?: string
  tags?: string[]
  searchTerm?: string
  page?: number
  limit?: number
}

export interface FolderFilters {
  parentId?: string
  type?: string
  createdBy?: string
}

export interface PermissionFilters {
  documentId?: string
  userId?: string
  permission?: string
}

export interface DocumentAnalytics {
  totalDocuments: number
  totalFolders: number
  totalSize: number
  recentActivity: number
  byType: Record<string, number>
  byCategory: Record<string, number>
  accessibilityRate: number
}

export const documentService = {
  // Document Management
  getDocuments: (filters: DocumentFilters = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v))
        } else {
          params.append(key, value.toString())
        }
      }
    })
    
    return api.get<ApiResponse<Document[]>>(`/documents?${params}`)
  },

  getDocument: (id: string) => 
    api.get<ApiResponse<Document>>(`/documents/${id}`),

  createDocument: (documentData: Partial<Document>) => 
    api.post<ApiResponse<Document>>('/documents', documentData),

  updateDocument: (id: string, documentData: Partial<Document>) => 
    api.put<ApiResponse<Document>>(`/documents/${id}`, documentData),

  deleteDocument: (id: string) => 
    api.delete<ApiResponse<{ message: string }>>(`/documents/${id}`),

  downloadDocument: (id: string) => 
    api.get<ApiResponse<{ url: string }>>(`/documents/${id}/download`),

  uploadDocument: async (formData: FormData) => {
    const response = await fetch('/api/documents/upload', {
      method: 'POST',
      body: formData
    })
    return await response.json()
  },

  // Folder Management
  getFolders: (filters: FolderFilters = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value)
      }
    })
    
    return api.get<ApiResponse<Folder[]>>(`/documents/folders?${params}`)
  },

  getFolder: (id: string) => 
    api.get<ApiResponse<Folder>>(`/documents/folders/${id}`),

  createFolder: (folderData: Partial<Folder>) => 
    api.post<ApiResponse<Folder>>('/documents/folders', folderData),

  updateFolder: (id: string, folderData: Partial<Folder>) => 
    api.put<ApiResponse<Folder>>(`/documents/folders/${id}`, folderData),

  deleteFolder: (id: string) => 
    api.delete<ApiResponse<{ message: string }>>(`/documents/folders/${id}`),

  getFolderContents: (id: string) => 
    api.get<ApiResponse<{ documents: Document[]; folders: Folder[] }>>(`/documents/folders/${id}/contents`),

  // Permission Management
  getDocumentPermissions: (filters: PermissionFilters = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value)
      }
    })
    
    return api.get<ApiResponse<DocumentPermission[]>>(`/documents/permissions?${params}`)
  },

  getDocumentPermission: (id: string) => 
    api.get<ApiResponse<DocumentPermission>>(`/documents/permissions/${id}`),

  grantDocumentPermission: (permissionData: Partial<DocumentPermission>) => 
    api.post<ApiResponse<DocumentPermission>>('/documents/permissions', permissionData),

  updateDocumentPermission: (id: string, permissionData: Partial<DocumentPermission>) => 
    api.put<ApiResponse<DocumentPermission>>(`/documents/permissions/${id}`, permissionData),

  revokeDocumentPermission: (id: string) => 
    api.delete<ApiResponse<{ message: string }>>(`/documents/permissions/${id}`),

  // Search and Discovery
  searchDocuments: (query: string, filters: DocumentFilters = {}) => {
    const params = new URLSearchParams()
    params.append('q', query)
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v))
        } else {
          params.append(key, value.toString())
        }
      }
    })
    
    return api.get<ApiResponse<Document[]>>(`/documents/search?${params}`)
  },

  getRecentDocuments: (userId: string, limit: number = 10) => 
    api.get<ApiResponse<Document[]>>(`/documents/recent?userId=${userId}&limit=${limit}`),

  getSharedWithMe: (userId: string) => 
    api.get<ApiResponse<Document[]>>(`/documents/shared-with-me?userId=${userId}`),

  getMyDocuments: (userId: string) => 
    api.get<ApiResponse<Document[]>>(`/documents/my-documents?userId=${userId}`),

  // Document Analytics
  getDocumentAnalytics: (filters: {
    folderId?: string
    category?: string
    dateRange?: { start: string; end: string }
  } = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        if (typeof value === 'object') {
          params.append(key, JSON.stringify(value))
        } else {
          params.append(key, value)
        }
      }
    })
    
    return api.get<ApiResponse<DocumentAnalytics>>(`/documents/analytics?${params}`)
  },

  // Specialized Operations
  shareDocument: (documentId: string, shareData: {
    userIds: string[]
    permission: 'read' | 'write' | 'admin'
    expiresAt?: string
    message?: string
  }) => 
    api.post<ApiResponse<DocumentPermission[]>>(`/documents/${documentId}/share`, shareData),

  createDocumentVersion: async (documentId: string, versionData: {
    file: File
    versionNotes?: string
  }) => {
    const formData = new FormData()
    formData.append('file', versionData.file)
    if (versionData.versionNotes) {
      formData.append('versionNotes', versionData.versionNotes)
    }
    
    const response = await fetch(`/api/documents/${documentId}/versions`, {
      method: 'POST',
      body: formData
    })
    return await response.json()
  },

  getDocumentVersions: (documentId: string) => 
    api.get<ApiResponse<any[]>>(`/documents/${documentId}/versions`),

  restoreDocumentVersion: (documentId: string, versionId: string) => 
    api.put<ApiResponse<Document>>(`/documents/${documentId}/versions/${versionId}/restore`),

  moveDocument: (documentId: string, folderId: string) => 
    api.put<ApiResponse<Document>>(`/documents/${documentId}/move`, { folderId }),

  copyDocument: (documentId: string, folderId: string, newName?: string) => 
    api.post<ApiResponse<Document>>(`/documents/${documentId}/copy`, { 
      folderId, 
      newName 
    }),

  addDocumentTags: (documentId: string, tags: string[]) => 
    api.put<ApiResponse<Document>>(`/documents/${documentId}/tags`, { tags }),

  removeDocumentTags: (documentId: string, tags: string[]) => 
    api.delete<ApiResponse<Document>>(`/documents/${documentId}/tags`)
}