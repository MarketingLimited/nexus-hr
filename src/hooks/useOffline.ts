import { useState, useEffect, useCallback } from 'react';
import { offlineService } from '@/services/offlineService';

interface UseOfflineOptions {
  module?: string;
  autoSync?: boolean;
  enableEncryption?: boolean;
}

interface OfflineState {
  isOnline: boolean;
  isInitialized: boolean;
  syncInProgress: boolean;
  queuedRequests: number;
  pendingConflicts: number;
  lastSyncTime: number | null;
}

interface SyncStats {
  success: number;
  failed: number;
  total: number;
}

export const useOffline = (options: UseOfflineOptions = {}) => {
  const { module = 'general', autoSync = true, enableEncryption = false } = options;

  const [state, setState] = useState<OfflineState>({
    isOnline: navigator.onLine,
    isInitialized: false,
    syncInProgress: false,
    queuedRequests: 0,
    pendingConflicts: 0,
    lastSyncTime: null
  });

  const [syncStats, setSyncStats] = useState<SyncStats>({ success: 0, failed: 0, total: 0 });

  // Initialize offline service
  useEffect(() => {
    const initialize = async () => {
      try {
        await offlineService.initialize();
        setState(prev => ({ ...prev, isInitialized: true }));
        
        if (autoSync && navigator.onLine) {
          syncData();
        }
      } catch (error) {
        console.error('Failed to initialize offline service:', error);
      }
    };

    initialize();
  }, [autoSync]);

  // Set up event listeners
  useEffect(() => {
    const handleNetworkChange = ({ online }: { online: boolean }) => {
      setState(prev => ({ ...prev, isOnline: online }));
      
      if (online && autoSync) {
        syncData();
      }
    };

    const handleSyncCompleted = (stats: { success: number; failed: number }) => {
      setSyncStats(prev => ({
        success: prev.success + stats.success,
        failed: prev.failed + stats.failed,
        total: prev.total + stats.success + stats.failed
      }));
      
      setState(prev => ({
        ...prev,
        syncInProgress: false,
        lastSyncTime: Date.now()
      }));
    };

    const handleRequestQueued = () => {
      setState(prev => ({ ...prev, queuedRequests: prev.queuedRequests + 1 }));
    };

    const handleRequestSynced = () => {
      setState(prev => ({ ...prev, queuedRequests: Math.max(0, prev.queuedRequests - 1) }));
    };

    const handleConflictDetected = () => {
      setState(prev => ({ ...prev, pendingConflicts: prev.pendingConflicts + 1 }));
    };

    const handleConflictResolved = () => {
      setState(prev => ({ ...prev, pendingConflicts: Math.max(0, prev.pendingConflicts - 1) }));
    };

    // Add event listeners
    offlineService.on('networkStatusChanged', handleNetworkChange);
    offlineService.on('syncCompleted', handleSyncCompleted);
    offlineService.on('requestQueued', handleRequestQueued);
    offlineService.on('requestSynced', handleRequestSynced);
    offlineService.on('conflictDetected', handleConflictDetected);
    offlineService.on('conflictResolved', handleConflictResolved);

    return () => {
      offlineService.off('networkStatusChanged', handleNetworkChange);
      offlineService.off('syncCompleted', handleSyncCompleted);
      offlineService.off('requestQueued', handleRequestQueued);
      offlineService.off('requestSynced', handleRequestSynced);
      offlineService.off('conflictDetected', handleConflictDetected);
      offlineService.off('conflictResolved', handleConflictResolved);
    };
  }, [autoSync]);

  // Store data with optional encryption
  const storeData = useCallback(async (key: string, data: any) => {
    try {
      await offlineService.storeData(module, key, data, enableEncryption);
      return { success: true, error: null };
    } catch (error) {
      console.error('Failed to store offline data:', error);
      return { success: false, error: error as Error };
    }
  }, [module, enableEncryption]);

  // Retrieve data from local storage
  const getData = useCallback(async (key: string) => {
    try {
      const data = await offlineService.getData(module, key);
      return { data, error: null };
    } catch (error) {
      console.error('Failed to retrieve offline data:', error);
      return { data: null, error: error as Error };
    }
  }, [module]);

  // Get all data for the current module
  const getModuleData = useCallback(async () => {
    try {
      const data = await offlineService.getModuleData(module);
      return { data, error: null };
    } catch (error) {
      console.error('Failed to retrieve module data:', error);
      return { data: {}, error: error as Error };
    }
  }, [module]);

  // Queue request for offline sync
  const queueRequest = useCallback(async (
    url: string,
    method: string,
    body?: any,
    headers: Record<string, string> = {}
  ) => {
    try {
      await offlineService.queueRequest(url, method, body, headers, module);
      return { success: true, error: null };
    } catch (error) {
      console.error('Failed to queue request:', error);
      return { success: false, error: error as Error };
    }
  }, [module]);

  // Manually trigger sync
  const syncData = useCallback(async () => {
    if (state.syncInProgress || !state.isOnline) {
      return { success: false, error: new Error('Sync already in progress or offline') };
    }

    setState(prev => ({ ...prev, syncInProgress: true }));

    try {
      const result = await offlineService.syncQueuedRequests();
      return { success: true, result, error: null };
    } catch (error) {
      console.error('Sync failed:', error);
      setState(prev => ({ ...prev, syncInProgress: false }));
      return { success: false, error: error as Error };
    }
  }, [state.syncInProgress, state.isOnline]);

  // Get pending conflicts
  const getPendingConflicts = useCallback(async () => {
    try {
      const conflicts = await offlineService.getPendingConflicts();
      return { conflicts, error: null };
    } catch (error) {
      console.error('Failed to get conflicts:', error);
      return { conflicts: [], error: error as Error };
    }
  }, []);

  // Resolve conflict
  const resolveConflict = useCallback(async (key: string, resolvedData: any) => {
    try {
      await offlineService.resolveConflict(key, resolvedData);
      return { success: true, error: null };
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
      return { success: false, error: error as Error };
    }
  }, []);

  // Get storage statistics
  const getStorageStats = useCallback(async () => {
    try {
      const stats = await offlineService.getStorageStats();
      return { stats, error: null };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return { stats: null, error: error as Error };
    }
  }, []);

  // Clear offline data
  const clearOfflineData = useCallback(async () => {
    try {
      await offlineService.clearOfflineData();
      setState(prev => ({
        ...prev,
        queuedRequests: 0,
        pendingConflicts: 0
      }));
      setSyncStats({ success: 0, failed: 0, total: 0 });
      return { success: true, error: null };
    } catch (error) {
      console.error('Failed to clear offline data:', error);
      return { success: false, error: error as Error };
    }
  }, []);

  return {
    // State
    isOnline: state.isOnline,
    isInitialized: state.isInitialized,
    syncInProgress: state.syncInProgress,
    queuedRequests: state.queuedRequests,
    pendingConflicts: state.pendingConflicts,
    lastSyncTime: state.lastSyncTime,
    syncStats,

    // Actions
    storeData,
    getData,
    getModuleData,
    queueRequest,
    syncData,
    getPendingConflicts,
    resolveConflict,
    getStorageStats,
    clearOfflineData
  };
};

export default useOffline;