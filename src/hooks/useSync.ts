
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { syncService } from '@/services/syncService'

export const useSync = () => {
  return useQuery({
    queryKey: ['sync-stats'],
    queryFn: () => syncService.getSyncStats()
  })
}

export const useSyncHistory = () => {
  return useQuery({
    queryKey: ['sync-history'],
    queryFn: () => syncService.getSyncHistory()
  })
}

export const useCreateSync = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: any) => syncService.createSync(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sync-stats'] })
      queryClient.invalidateQueries({ queryKey: ['sync-history'] })
    }
  })
}

export const useUpdateSync = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => syncService.updateSync(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sync-stats'] })
      queryClient.invalidateQueries({ queryKey: ['sync-history'] })
    }
  })
}

export const useDeleteSync = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => syncService.deleteSync(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sync-stats'] })
      queryClient.invalidateQueries({ queryKey: ['sync-history'] })
    }
  })
}
