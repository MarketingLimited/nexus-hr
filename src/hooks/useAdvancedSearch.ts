import { useState, useCallback, useMemo } from 'react';
import { advancedDataService, AdvancedSearchFilters } from '../services/advancedDataService';
import { Employee } from '../types';

interface UseAdvancedSearchState {
  results: Employee[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
}

export function useAdvancedSearch() {
  const [state, setState] = useState<UseAdvancedSearchState>({
    results: [],
    loading: false,
    error: null,
    total: 0,
    page: 1,
    totalPages: 1
  });

  const [filters, setFilters] = useState<AdvancedSearchFilters>({});

  const search = useCallback(async (searchFilters: AdvancedSearchFilters) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await advancedDataService.advancedSearch(searchFilters);
      setState({
        results: result.employees,
        loading: false,
        error: null,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages
      });
      setFilters(searchFilters);
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Search failed'
      }));
    }
  }, []);

  const updateFilters = useCallback((newFilters: Partial<AdvancedSearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    search(updatedFilters);
  }, [filters, search]);

  const clearFilters = useCallback(() => {
    const emptyFilters: AdvancedSearchFilters = {};
    search(emptyFilters);
  }, [search]);

  const exportResults = useCallback(async (format: 'csv' | 'json' | 'xlsx') => {
    try {
      const blob = await advancedDataService.exportData('employees', format, filters);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `employees_export.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }, [filters]);

  const sortOptions = useMemo(() => [
    { value: 'name', label: 'Name' },
    { value: 'department', label: 'Department' },
    { value: 'position', label: 'Position' },
    { value: 'salary', label: 'Salary' },
    { value: 'startDate', label: 'Start Date' }
  ], []);

  return {
    ...state,
    filters,
    search,
    updateFilters,
    clearFilters,
    exportResults,
    sortOptions
  };
}