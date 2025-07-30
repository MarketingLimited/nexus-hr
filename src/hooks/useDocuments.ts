import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  documentService, 
  type DocumentFilters, 
  type FolderFilters, 
  type PermissionFilters,
  type DocumentAnalytics 
} from '../services/documentService'
import type { Document, Folder, DocumentPermission } from '../mocks/data/documents'

// Query Keys
export const documentKeys = {
  all: ['documents'] as const,
  documents: () => [...documentKeys.all, 'documents'] as const,
  document: (id: string) => [...documentKeys.documents(), id] as const,
  folders: () => [...documentKeys.all, 'folders'] as const,
  folder: (id: string) => [...documentKeys.folders(), id] as const,
  folderContents: (id: string) => [...documentKeys.folder(id), 'contents'] as const,
  permissions: () => [...documentKeys.all, 'permissions'] as const,
  permission: (id: string) => [...documentKeys.permissions(), id] as const,
  search: (query: string, filters?: DocumentFilters) => 
    [...documentKeys.all, 'search', query, filters] as const,
  recent: (userId: string, limit: number) => 
    [...documentKeys.all, 'recent', userId, limit] as const,
  sharedWithMe: (userId: string) => 
    [...documentKeys.all, 'shared-with-me', userId] as const,
  myDocuments: (userId: string) => 
    [...documentKeys.all, 'my-documents', userId] as const,
  analytics: (filters?: any) => [...documentKeys.all, 'analytics', filters] as const,
  versions: (documentId: string) => [...documentKeys.document(documentId), 'versions'] as const,
}

// Document Management Hooks
export const useDocuments = (filters?: DocumentFilters) => {
  return useQuery({
    queryKey: documentKeys.documents(),
    queryFn: () => documentService.getDocuments(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useDocument = (id: string) => {
  return useQuery({
    queryKey: documentKeys.document(id),
    queryFn: () => documentService.getDocument(id),
    enabled: !!id,
  })
}

export const useCreateDocument = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: documentService.createDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.documents() })
      queryClient.invalidateQueries({ queryKey: documentKeys.analytics() })
    },
  })
}

export const useUpdateDocument = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Document> }) =>
      documentService.updateDocument(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.document(variables.id) })
      queryClient.invalidateQueries({ queryKey: documentKeys.documents() })
      queryClient.invalidateQueries({ queryKey: documentKeys.analytics() })
    },
  })
}

export const useDeleteDocument = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: documentService.deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.documents() })
      queryClient.invalidateQueries({ queryKey: documentKeys.analytics() })
    },
  })
}

export const useUploadDocument = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: documentService.uploadDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.documents() })
      queryClient.invalidateQueries({ queryKey: documentKeys.analytics() })
    },
  })
}

export const useDownloadDocument = () => {
  return useMutation({
    mutationFn: documentService.downloadDocument,
  })
}

// Folder Management Hooks
export const useFolders = (filters?: FolderFilters) => {
  return useQuery({
    queryKey: documentKeys.folders(),
    queryFn: () => documentService.getFolders(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useFolder = (id: string) => {
  return useQuery({
    queryKey: documentKeys.folder(id),
    queryFn: () => documentService.getFolder(id),
    enabled: !!id,
  })
}

export const useFolderContents = (id: string) => {
  return useQuery({
    queryKey: documentKeys.folderContents(id),
    queryFn: () => documentService.getFolderContents(id),
    enabled: !!id,
  })
}

export const useCreateFolder = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: documentService.createFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.folders() })
      queryClient.invalidateQueries({ queryKey: documentKeys.analytics() })
    },
  })
}

export const useUpdateFolder = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Folder> }) =>
      documentService.updateFolder(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.folder(variables.id) })
      queryClient.invalidateQueries({ queryKey: documentKeys.folders() })
    },
  })
}

export const useDeleteFolder = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: documentService.deleteFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.folders() })
      queryClient.invalidateQueries({ queryKey: documentKeys.analytics() })
    },
  })
}

// Permission Management Hooks
export const useDocumentPermissions = (filters?: PermissionFilters) => {
  return useQuery({
    queryKey: documentKeys.permissions(),
    queryFn: () => documentService.getDocumentPermissions(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useDocumentPermission = (id: string) => {
  return useQuery({
    queryKey: documentKeys.permission(id),
    queryFn: () => documentService.getDocumentPermission(id),
    enabled: !!id,
  })
}

export const useGrantDocumentPermission = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: documentService.grantDocumentPermission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.permissions() })
    },
  })
}

export const useUpdateDocumentPermission = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DocumentPermission> }) =>
      documentService.updateDocumentPermission(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.permission(variables.id) })
      queryClient.invalidateQueries({ queryKey: documentKeys.permissions() })
    },
  })
}

export const useRevokeDocumentPermission = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: documentService.revokeDocumentPermission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.permissions() })
    },
  })
}

// Search and Discovery Hooks
export const useSearchDocuments = (query: string, filters?: DocumentFilters) => {
  return useQuery({
    queryKey: documentKeys.search(query, filters),
    queryFn: () => documentService.searchDocuments(query, filters),
    enabled: query.length > 2, // Only search if query is longer than 2 characters
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const useRecentDocuments = (userId: string, limit: number = 10) => {
  return useQuery({
    queryKey: documentKeys.recent(userId, limit),
    queryFn: () => documentService.getRecentDocuments(userId, limit),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useSharedWithMe = (userId: string) => {
  return useQuery({
    queryKey: documentKeys.sharedWithMe(userId),
    queryFn: () => documentService.getSharedWithMe(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useMyDocuments = (userId: string) => {
  return useQuery({
    queryKey: documentKeys.myDocuments(userId),
    queryFn: () => documentService.getMyDocuments(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Document Analytics Hooks
export const useDocumentAnalytics = (filters?: {
  folderId?: string
  category?: string
  dateRange?: { start: string; end: string }
}) => {
  return useQuery({
    queryKey: documentKeys.analytics(filters),
    queryFn: () => documentService.getDocumentAnalytics(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Specialized Operations Hooks
export const useShareDocument = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ documentId, shareData }: {
      documentId: string
      shareData: {
        userIds: string[]
        permission: 'read' | 'write' | 'admin'
        expiresAt?: string
        message?: string
      }
    }) => documentService.shareDocument(documentId, shareData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.permissions() })
    },
  })
}

export const useCreateDocumentVersion = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ documentId, versionData }: {
      documentId: string
      versionData: {
        file: File
        versionNotes?: string
      }
    }) => documentService.createDocumentVersion(documentId, versionData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.document(variables.documentId) })
      queryClient.invalidateQueries({ queryKey: documentKeys.versions(variables.documentId) })
    },
  })
}

export const useDocumentVersions = (documentId: string) => {
  return useQuery({
    queryKey: documentKeys.versions(documentId),
    queryFn: () => documentService.getDocumentVersions(documentId),
    enabled: !!documentId,
  })
}

export const useRestoreDocumentVersion = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ documentId, versionId }: { documentId: string; versionId: string }) =>
      documentService.restoreDocumentVersion(documentId, versionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.document(variables.documentId) })
      queryClient.invalidateQueries({ queryKey: documentKeys.versions(variables.documentId) })
    },
  })
}

export const useMoveDocument = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ documentId, folderId }: { documentId: string; folderId: string }) =>
      documentService.moveDocument(documentId, folderId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.document(variables.documentId) })
      queryClient.invalidateQueries({ queryKey: documentKeys.documents() })
      queryClient.invalidateQueries({ queryKey: documentKeys.folderContents(variables.folderId) })
    },
  })
}

export const useCopyDocument = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ documentId, folderId, newName }: {
      documentId: string
      folderId: string
      newName?: string
    }) => documentService.copyDocument(documentId, folderId, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.documents() })
      queryClient.invalidateQueries({ queryKey: documentKeys.analytics() })
    },
  })
}

export const useAddDocumentTags = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ documentId, tags }: { documentId: string; tags: string[] }) =>
      documentService.addDocumentTags(documentId, tags),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.document(variables.documentId) })
      queryClient.invalidateQueries({ queryKey: documentKeys.documents() })
    },
  })
}

export const useRemoveDocumentTags = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ documentId, tags }: { documentId: string; tags: string[] }) =>
      documentService.removeDocumentTags(documentId, tags),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.document(variables.documentId) })
      queryClient.invalidateQueries({ queryKey: documentKeys.documents() })
    },
  })
}