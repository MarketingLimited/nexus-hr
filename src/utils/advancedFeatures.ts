import { useState, useCallback, useMemo } from 'react';

// Advanced search and filtering hook
export interface SearchFilters {
  query?: string;
  department?: string;
  status?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  salary?: {
    min: number;
    max: number;
  };
  tags?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface UseAdvancedSearchOptions {
  pageSize?: number;
  initialFilters?: SearchFilters;
  debounceMs?: number;
}

export function useAdvancedSearch<T extends Record<string, any>>(
  data: T[],
  options: UseAdvancedSearchOptions = {}
) {
  const { pageSize = 20, initialFilters = {}, debounceMs = 300 } = options;
  
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [currentPage, setCurrentPage] = useState(1);

  // Advanced filtering logic
  const filteredData = useMemo(() => {
    let result = [...data];

    // Text search across multiple fields
    if (filters.query) {
      const query = filters.query.toLowerCase();
      result = result.filter(item => 
        Object.values(item).some(value => 
          String(value).toLowerCase().includes(query)
        )
      );
    }

    // Department filter
    if (filters.department && filters.department !== 'all') {
      result = result.filter(item => item.department === filters.department);
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      result = result.filter(item => item.status === filters.status);
    }

    // Date range filter
    if (filters.dateRange) {
      result = result.filter(item => {
        const itemDate = new Date(item.createdAt || item.date);
        return itemDate >= filters.dateRange!.start && itemDate <= filters.dateRange!.end;
      });
    }

    // Salary range filter
    if (filters.salary) {
      result = result.filter(item => 
        item.salary >= filters.salary!.min && item.salary <= filters.salary!.max
      );
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      result = result.filter(item => 
        filters.tags!.some(tag => 
          item.tags?.includes(tag) || item.skills?.includes(tag)
        )
      );
    }

    // Sorting
    if (filters.sortBy) {
      result.sort((a, b) => {
        const aValue = a[filters.sortBy!];
        const bValue = b[filters.sortBy!];
        
        let comparison = 0;
        if (aValue > bValue) comparison = 1;
        if (aValue < bValue) comparison = -1;
        
        return filters.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    return result;
  }, [data, filters]);

  // Pagination
  const paginatedResult = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filteredData.slice(startIndex, endIndex);
    
    const totalPages = Math.ceil(filteredData.length / pageSize);
    
    return {
      data: paginatedData,
      total: filteredData.length,
      page: currentPage,
      pageSize,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1
    } as SearchResult<T>;
  }, [filteredData, currentPage, pageSize]);

  // Filter update functions
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
    setCurrentPage(1);
  }, [initialFilters]);

  const setPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, paginatedResult.totalPages)));
  }, [paginatedResult.totalPages]);

  const nextPage = useCallback(() => {
    if (paginatedResult.hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [paginatedResult.hasNextPage]);

  const previousPage = useCallback(() => {
    if (paginatedResult.hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  }, [paginatedResult.hasPreviousPage]);

  return {
    result: paginatedResult,
    filters,
    updateFilters,
    clearFilters,
    setPage,
    nextPage,
    previousPage,
    isFiltered: Object.keys(filters).some(key => 
      filters[key as keyof SearchFilters] !== undefined && 
      filters[key as keyof SearchFilters] !== ''
    )
  };
}

// Bulk operations hook
export interface BulkOperationResult {
  success: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
}

export function useBulkOperations<T extends { id: string }>() {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleSelection = useCallback((id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback((items: T[]) => {
    setSelectedItems(new Set(items.map(item => item.id)));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  const executeBulkOperation = useCallback(async (
    operation: (item: T) => Promise<void>,
    items: T[]
  ): Promise<BulkOperationResult> => {
    setIsProcessing(true);
    
    const selectedItemsList = items.filter(item => selectedItems.has(item.id));
    const result: BulkOperationResult = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (const item of selectedItemsList) {
      try {
        await operation(item);
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          id: item.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    setIsProcessing(false);
    setSelectedItems(new Set()); // Clear selection after operation
    
    return result;
  }, [selectedItems]);

  return {
    selectedItems,
    selectedCount: selectedItems.size,
    toggleSelection,
    selectAll,
    clearSelection,
    executeBulkOperation,
    isProcessing
  };
}

// Import/Export utilities
export class DataImportExport {
  static async exportToCSV<T extends Record<string, any>>(
    data: T[],
    filename: string,
    columns?: Array<{ key: keyof T; label: string }>
  ): Promise<void> {
    const headers = columns ? columns.map(col => col.label) : Object.keys(data[0] || {});
    const rows = data.map(item => 
      columns 
        ? columns.map(col => this.formatCSVValue(item[col.key]))
        : Object.values(item).map(value => this.formatCSVValue(value))
    );

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  }

  static async exportToJSON<T>(data: T[], filename: string): Promise<void> {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.json`;
    link.click();
  }

  static async importFromCSV(file: File): Promise<Array<Record<string, any>>> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csv = e.target?.result as string;
          const lines = csv.split('\n').filter(line => line.trim());
          
          if (lines.length < 2) {
            throw new Error('CSV must have at least header and one data row');
          }

          const headers = lines[0].split(',').map(h => h.trim());
          const data = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            const obj: Record<string, any> = {};
            headers.forEach((header, index) => {
              obj[header] = this.parseCSVValue(values[index] || '');
            });
            return obj;
          });

          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  private static formatCSVValue(value: any): string {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  private static parseCSVValue(value: string): any {
    // Remove quotes if present
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1).replace(/""/g, '"');
    }

    // Try to parse as number
    if (/^\d+$/.test(value)) {
      return parseInt(value, 10);
    }
    if (/^\d*\.\d+$/.test(value)) {
      return parseFloat(value);
    }

    // Try to parse as boolean
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;

    // Try to parse as date
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    }

    return value;
  }
}

// Error simulation utilities for testing
export class ErrorSimulator {
  private static errorScenarios: Array<{
    condition: (url: string, method: string) => boolean;
    response: () => { status: number; error: string };
  }> = [];

  static addErrorScenario(
    condition: (url: string, method: string) => boolean,
    response: () => { status: number; error: string }
  ): void {
    this.errorScenarios.push({ condition, response });
  }

  static simulateNetworkError(): void {
    this.addErrorScenario(
      () => Math.random() < 0.05, // 5% chance
      () => ({ status: 500, error: 'Network error' })
    );
  }

  static simulateServerError(): void {
    this.addErrorScenario(
      (url) => url.includes('/employees') && Math.random() < 0.1, // 10% chance for employee endpoints
      () => ({ status: 500, error: 'Internal server error' })
    );
  }

  static simulateRateLimiting(): void {
    this.addErrorScenario(
      () => Math.random() < 0.02, // 2% chance
      () => ({ status: 429, error: 'Rate limit exceeded' })
    );
  }

  static checkForError(url: string, method: string): { status: number; error: string } | null {
    for (const scenario of this.errorScenarios) {
      if (scenario.condition(url, method)) {
        return scenario.response();
      }
    }
    return null;
  }

  static clearScenarios(): void {
    this.errorScenarios = [];
  }
}