import { useState, useCallback } from 'react';
import { advancedDataService, AdvancedSearchFilters } from '../services/advancedDataService';

interface ExportState {
  loading: boolean;
  error: string | null;
  progress: number;
}

export function useDataExport() {
  const [state, setState] = useState<ExportState>({
    loading: false,
    error: null,
    progress: 0
  });

  const exportData = useCallback(async (
    dataType: string,
    format: 'csv' | 'json' | 'xlsx',
    filters?: AdvancedSearchFilters,
    filename?: string
  ) => {
    setState({ loading: true, error: null, progress: 0 });

    try {
      setState(prev => ({ ...prev, progress: 25 }));
      
      const blob = await advancedDataService.exportData(dataType, format, filters);
      
      setState(prev => ({ ...prev, progress: 75 }));
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `${dataType}_export.${format}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setState({ loading: false, error: null, progress: 100 });
      
      // Reset progress after a short delay
      setTimeout(() => {
        setState(prev => ({ ...prev, progress: 0 }));
      }, 1000);
      
    } catch (error) {
      setState({
        loading: false,
        error: error instanceof Error ? error.message : 'Export failed',
        progress: 0
      });
      throw error;
    }
  }, []);

  const exportEmployees = useCallback((
    format: 'csv' | 'json' | 'xlsx',
    filters?: AdvancedSearchFilters
  ) => exportData('employees', format, filters, `employees_${new Date().toISOString().split('T')[0]}.${format}`), [exportData]);

  const exportDepartments = useCallback((format: 'csv' | 'json' | 'xlsx') => 
    exportData('departments', format, undefined, `departments_${new Date().toISOString().split('T')[0]}.${format}`), [exportData]);

  const exportLeaveRequests = useCallback((format: 'csv' | 'json' | 'xlsx') => 
    exportData('leave', format, undefined, `leave_requests_${new Date().toISOString().split('T')[0]}.${format}`), [exportData]);

  const exportPayroll = useCallback((format: 'csv' | 'json' | 'xlsx') => 
    exportData('payroll', format, undefined, `payroll_${new Date().toISOString().split('T')[0]}.${format}`), [exportData]);

  return {
    ...state,
    exportData,
    exportEmployees,
    exportDepartments,
    exportLeaveRequests,
    exportPayroll
  };
}