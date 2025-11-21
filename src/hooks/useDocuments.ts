import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentService } from '../services/dataService';
import { toast } from 'sonner';
import type { Document } from '../mocks/data/documents';

interface DocumentFilters {
  type?: string
  category?: string
  search?: string
  employeeId?: string
  startDate?: string
  endDate?: string
}

// Query keys
export const documentKeys = {
  all: ['documents'] as const,
  list: (filters?: DocumentFilters) => [...documentKeys.all, 'list', filters] as const,
  detail: (id: string) => [...documentKeys.all, 'detail', id] as const,
  stats: () => [...documentKeys.all, 'stats'] as const,
  categories: () => [...documentKeys.all, 'categories'] as const,
};

// Get document statistics
export const useDocumentStats = () => {
  return useQuery({
    queryKey: documentKeys.stats(),
    queryFn: () => documentService.getStats(),
    select: (data) => data.data,
  });
};

// Get document categories
export const useDocumentCategories = () => {
  return useQuery({
    queryKey: documentKeys.categories(),
    queryFn: () => documentService.getCategories(),
    select: (data) => data.data,
  });
};

// Get documents with filters
export const useDocuments = (filters?: DocumentFilters) => {
  return useQuery({
    queryKey: documentKeys.list(filters),
    queryFn: () => documentService.getAll(filters),
    select: (data) => data.data,
  });
};

// Get single document
export const useDocument = (id: string) => {
  return useQuery({
    queryKey: documentKeys.detail(id),
    queryFn: () => documentService.getById(id),
    enabled: !!id,
    select: (data) => data.data,
  });
};

// Upload document
export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FormData) => documentService.upload(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
      toast.success('Document uploaded successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload document');
    },
  });
};

// Update document
export const useUpdateDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Document> }) =>
      documentService.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
      queryClient.invalidateQueries({ queryKey: documentKeys.detail(variables.id) });
      toast.success('Document updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update document');
    },
  });
};

// Delete document
export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => documentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
      toast.success('Document deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete document');
    },
  });
};

// Share document
export const useShareDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userIds, permissions }: { id: string; userIds: string[]; permissions: string[] }) =>
      documentService.share(id, { userIds, permissions }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.detail(variables.id) });
      toast.success('Document shared successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to share document');
    },
  });
};