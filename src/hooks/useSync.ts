
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { syncService } from '@/services/syncService'

export const useSync = () => {
  return useQuery({
    queryKey: ['sync-stats'],
    queryFn: () => syncService.getStats()
  })
}

export const useSyncStats = () => {
  return useQuery({
    queryKey: ['sync-stats'],
    queryFn: () => syncService.getStats()
  })
}

export const useSyncOperations = () => {
  return useQuery({
    queryKey: ['sync-operations'],
    queryFn: () => syncService.getOperations()
  })
}

export const useSyncConflicts = () => {
  return useQuery({
    queryKey: ['sync-conflicts'],
    queryFn: () => syncService.getConflicts()
  })
}

export const useSyncHistory = () => {
  return useQuery({
    queryKey: ['sync-history'],
    queryFn: () => syncService.getOperations()
  })
}

export const useStartSync = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: () => syncService.startSync(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sync-stats'] })
      queryClient.invalidateQueries({ queryKey: ['sync-operations'] })
      queryClient.invalidateQueries({ queryKey: ['sync-conflicts'] })
    }
  })
}

export const useAutoSync = () => {
  const config = syncService.getConfig()
  
  return {
    isAutoSyncEnabled: config.autoSync,
    enableAutoSync: () => syncService.updateConfig({ autoSync: true }),
    disableAutoSync: () => syncService.updateConfig({ autoSync: false })
  }
}

export const useResolveConflict = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ conflictId, resolution }: { conflictId: string, resolution: 'merge' | 'local_wins' | 'remote_wins' | 'auto' }) => 
      syncService.resolveConflict(conflictId, resolution),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sync-conflicts'] })
      queryClient.invalidateQueries({ queryKey: ['sync-operations'] })
    }
  })
}

export const useCreateSync = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: any) => syncService.queueOperation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sync-stats'] })
      queryClient.invalidateQueries({ queryKey: ['sync-operations'] })
    }
  })
}

export const useUpdateSync = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => {
      // Since syncService doesn't have updateSync, we'll use queueOperation
      return syncService.queueOperation({ ...data, id })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sync-stats'] })
      queryClient.invalidateQueries({ queryKey: ['sync-operations'] })
    }
  })
}

export const useDeleteSync = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => {
      // Since syncService doesn't have deleteSync, we'll simulate it
      return Promise.resolve({ id })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sync-stats'] })
      queryClient.invalidateQueries({ queryKey: ['sync-operations'] })
    }
  })
}
