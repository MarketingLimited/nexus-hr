import { useState, useEffect, useCallback } from 'react';
import { advancedDataService, AuditLogEntry } from '../services/advancedDataService';

interface AuditLogState {
  entries: AuditLogEntry[];
  loading: boolean;
  error: string | null;
}

interface AuditLogFilters {
  userId?: string;
  entityType?: string;
  entityId?: string;
  dateRange?: { start: Date; end: Date };
}

export function useAuditLog(autoLoad = true) {
  const [state, setState] = useState<AuditLogState>({
    entries: [],
    loading: false,
    error: null
  });

  const [filters, setFilters] = useState<AuditLogFilters>({});

  const loadAuditLog = useCallback(async (searchFilters?: AuditLogFilters) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const entries = await advancedDataService.getAuditLog(searchFilters);
      setState({ entries, loading: false, error: null });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load audit log'
      }));
    }
  }, []);

  const logAction = useCallback(async (
    action: string,
    entityType: string,
    entityId: string,
    changes: Record<string, { old: any; new: any }>,
    metadata?: Record<string, any>
  ) => {
    try {
      await advancedDataService.logAuditEntry({
        userId: 'current_user', // In real app, get from auth context
        action,
        entityType,
        entityId,
        changes,
        metadata
      });
      
      // Reload audit log to show new entry
      await loadAuditLog(filters);
    } catch (error) {
      console.error('Failed to log audit entry:', error);
    }
  }, [filters, loadAuditLog]);

  const applyFilters = useCallback((newFilters: AuditLogFilters) => {
    setFilters(newFilters);
    loadAuditLog(newFilters);
  }, [loadAuditLog]);

  const clearFilters = useCallback(() => {
    setFilters({});
    loadAuditLog();
  }, [loadAuditLog]);

  const exportAuditLog = useCallback(async (format: 'csv' | 'json') => {
    try {
      const data = JSON.stringify(state.entries, null, 2);
      const blob = new Blob([data], { 
        type: format === 'json' ? 'application/json' : 'text/csv' 
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit_log_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }, [state.entries]);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad) {
      loadAuditLog();
    }
  }, [autoLoad, loadAuditLog]);

  return {
    ...state,
    filters,
    loadAuditLog,
    logAction,
    applyFilters,
    clearFilters,
    exportAuditLog
  };
}