import { useQuery } from '@tanstack/react-query';

type AssetFilters = any;

const mockAssetService = {
  getAssetStats: async () => ({
    totalAssets: 342,
    monthlyGrowth: 15,
    assignedAssets: 298,
    utilizationRate: 87,
    availableAssets: 44,
    maintenanceAssets: 8,
    maintenanceDueThisWeek: 2
  }),
  getAssets: async (filters: any) => ({ data: [] })
};

export const useAssetStats = () => {
  return useQuery({
    queryKey: ['assets', 'stats'],
    queryFn: mockAssetService.getAssetStats
  });
};

export const useAssetCategories = () => {
  return useQuery({
    queryKey: ['assets', 'categories'],
    queryFn: async () => ({})
  });
};

export const useAssets = (filters?: AssetFilters) => {
  return useQuery({
    queryKey: ['assets', filters],
    queryFn: () => mockAssetService.getAssets(filters),
  });
};