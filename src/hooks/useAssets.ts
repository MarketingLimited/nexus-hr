import { useQuery } from '@tanstack/react-query';
import { assetService } from '@/services/assetService';

type AssetFilters = any;

export const useAssetStats = () => {
  return useQuery({
    queryKey: ['assets', 'stats'],
    queryFn: assetService.getAssetAnalytics
  });
};

export const useAssetCategories = () => {
  return useQuery({
    queryKey: ['assets', 'categories'],
    queryFn: assetService.getAssetCategories
  });
};

export const useAssets = (filters?: AssetFilters) => {
  return useQuery({
    queryKey: ['assets', filters],
    queryFn: () => assetService.getAssets(filters),
  });
};