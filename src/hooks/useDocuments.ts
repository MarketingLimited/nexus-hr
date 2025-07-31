import { useQuery } from '@tanstack/react-query';

type DocumentFilters = any;

const mockDocumentService = {
  getDocumentStats: async () => ({
    totalDocuments: 1247,
    monthlyGrowth: 34,
    storageUsed: '2.4 GB',
    storageLimit: '10 GB',
    sharedDocuments: 156,
    sharedPercentage: 12.5,
    recentActivity: 23
  }),
  getDocuments: async (filters: any) => ({ data: [] })
};

export const useDocumentStats = () => {
  return useQuery({
    queryKey: ['documents', 'stats'],
    queryFn: mockDocumentService.getDocumentStats
  });
};

export const useDocumentCategories = () => {
  return useQuery({
    queryKey: ['documents', 'categories'],
    queryFn: async () => ({})
  });
};

export const useDocuments = (filters?: DocumentFilters) => {
  return useQuery({
    queryKey: ['documents', filters],
    queryFn: () => mockDocumentService.getDocuments(filters),
  });
};