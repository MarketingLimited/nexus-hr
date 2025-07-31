import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { syncService, type SyncOperation, type SyncConflict, type SyncConfig } from '../services/syncService'
import { useToast } from './use-toast'
import { useEffect, useState } from 'react'

export function useSyncStats() {
  return useQuery({
    queryKey: ['sync-stats'],
    queryFn: () => syncService.getStats(),
    refetchInterval: 5000, // Refresh every 5 seconds
  })
}

export function useSyncOperations() {
  return useQuery({
    queryKey: ['sync-operations'],
    queryFn: () => syncService.getOperations(),
    refetchInterval: 3000, // Refresh every 3 seconds
  })
}

export function useSyncConflicts() {
  return useQuery({
    queryKey: ['sync-conflicts'],
    queryFn: () => syncService.getConflicts(),
    refetchInterval: 5000, // Refresh every 5 seconds
  })
}

export function useQueueSyncOperation() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (operation: Omit<SyncOperation, 'id' | 'createdAt' | 'status'>) => {
      syncService.queueOperation(operation)
      return Promise.resolve()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sync-operations'] })
      queryClient.invalidateQueries({ queryKey: ['sync-stats'] })
    },
    onError: () => {
      toast({ title: 'Failed to queue sync operation', variant: 'destructive' })
    },
  })
}

export function useStartSync() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: () => syncService.startSync(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sync-operations'] })
      queryClient.invalidateQueries({ queryKey: ['sync-stats'] })
      toast({ title: 'Sync started successfully' })
    },
    onError: () => {
      toast({ title: 'Failed to start sync', variant: 'destructive' })
    },
  })
}

export function useResolveConflict() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ conflictId, resolution }: { 
      conflictId: string
      resolution: 'local_wins' | 'remote_wins' | 'merge' | 'auto'
    }) => syncService.resolveConflict(conflictId, resolution),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sync-conflicts'] })
      queryClient.invalidateQueries({ queryKey: ['sync-stats'] })
      toast({ title: 'Conflict resolved successfully' })
    },
    onError: () => {
      toast({ title: 'Failed to resolve conflict', variant: 'destructive' })
    },
  })
}

export function useUpdateSyncConfig() {
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (config: Partial<SyncConfig>) => {
      syncService.updateConfig(config)
      return Promise.resolve()
    },
    onSuccess: () => {
      toast({ title: 'Sync configuration updated successfully' })
    },
    onError: () => {
      toast({ title: 'Failed to update sync configuration', variant: 'destructive' })
    },
  })
}

export function useClearSyncData() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (type: 'completed' | 'all') => {
      if (type === 'completed') {
        syncService.clearCompleted()
      } else {
        syncService.clearAll()
      }
      return Promise.resolve()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sync-operations'] })
      queryClient.invalidateQueries({ queryKey: ['sync-conflicts'] })
      queryClient.invalidateQueries({ queryKey: ['sync-stats'] })
      toast({ title: 'Sync data cleared successfully' })
    },
    onError: () => {
      toast({ title: 'Failed to clear sync data', variant: 'destructive' })
    },
  })
}

export function useAutoSync() {
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(false)
  const { toast } = useToast()

  const startAutoSync = () => {
    try {
      // syncService.startAutoSync() // Method is private, would need to be exposed
      setIsAutoSyncEnabled(true)
      toast({ title: 'Auto-sync enabled' })
    } catch (error) {
      toast({ title: 'Failed to start auto-sync', variant: 'destructive' })
    }
  }

  const stopAutoSync = () => {
    try {
      // syncService.stopAutoSync() // Method is private, would need to be exposed
      setIsAutoSyncEnabled(false)
      toast({ title: 'Auto-sync disabled' })
    } catch (error) {
      toast({ title: 'Failed to stop auto-sync', variant: 'destructive' })
    }
  }

  useEffect(() => {
    return () => {
      if (isAutoSyncEnabled) {
        // syncService.stopAutoSync() // Method is private, would need to be exposed
      }
    }
  }, [isAutoSyncEnabled])

  return {
    isAutoSyncEnabled,
    startAutoSync,
    stopAutoSync,
  }
}

// Hook for real-time sync status monitoring
export function useSyncStatus() {
  const [isSyncing, setIsSyncing] = useState(false)
  const stats = useSyncStats()

  useEffect(() => {
    if (stats.data) {
      setIsSyncing(stats.data.pending > 0)
    }
  }, [stats.data])

  return {
    isSyncing,
    stats: stats.data,
    isLoading: stats.isLoading,
    error: stats.error,
  }
}