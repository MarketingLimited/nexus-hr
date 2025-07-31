import { QueryClient } from '@tanstack/react-query'

// Optimized query client configuration for better performance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default stale time - data is considered fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      
      // Cache time - data stays in cache for 10 minutes after becoming unused
      gcTime: 10 * 60 * 1000,
      
      // Retry configuration
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false
        }
        // Retry up to 3 times for other errors
        return failureCount < 3
      },
      
      // Retry delay - exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch on window focus only if data is stale
      refetchOnWindowFocus: 'always',
      
      // Refetch on reconnect
      refetchOnReconnect: 'always',
      
      // Don't refetch on mount if data exists
      refetchOnMount: true,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
      
      // Retry delay for mutations
      retryDelay: 1000,
    },
  },
})

// Query key factories for consistent cache management
export const queryKeys = {
  // Employee queries
  employees: {
    all: ['employees'] as const,
    lists: () => [...queryKeys.employees.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.employees.lists(), filters] as const,
    details: () => [...queryKeys.employees.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.employees.details(), id] as const,
  },
  
  // Leave queries  
  leave: {
    all: ['leave'] as const,
    lists: () => [...queryKeys.leave.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.leave.lists(), filters] as const,
    details: () => [...queryKeys.leave.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.leave.details(), id] as const,
    balances: () => [...queryKeys.leave.all, 'balances'] as const,
    balance: (employeeId: string) => [...queryKeys.leave.balances(), employeeId] as const,
  },
  
  // Attendance queries
  attendance: {
    all: ['attendance'] as const,
    lists: () => [...queryKeys.attendance.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.attendance.lists(), filters] as const,
    details: () => [...queryKeys.attendance.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.attendance.details(), id] as const,
    stats: () => [...queryKeys.attendance.all, 'stats'] as const,
  },
  
  // Payroll queries
  payroll: {
    all: ['payroll'] as const,
    lists: () => [...queryKeys.payroll.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.payroll.lists(), filters] as const,
    details: () => [...queryKeys.payroll.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.payroll.details(), id] as const,
    processing: () => [...queryKeys.payroll.all, 'processing'] as const,
  },
  
  // Performance queries
  performance: {
    all: ['performance'] as const,
    reviews: () => [...queryKeys.performance.all, 'reviews'] as const,
    review: (id: string) => [...queryKeys.performance.reviews(), id] as const,
    goals: () => [...queryKeys.performance.all, 'goals'] as const,
    goal: (id: string) => [...queryKeys.performance.goals(), id] as const,
    analytics: () => [...queryKeys.performance.all, 'analytics'] as const,
  },
  
  // Security queries
  security: {
    all: ['security'] as const,
    events: () => [...queryKeys.security.all, 'events'] as const,
    sessions: () => [...queryKeys.security.all, 'sessions'] as const,
    metrics: () => [...queryKeys.security.all, 'metrics'] as const,
    devices: () => [...queryKeys.security.all, 'devices'] as const,
  },
  
  // Monitoring queries
  monitoring: {
    all: ['monitoring'] as const,
    health: () => [...queryKeys.monitoring.all, 'health'] as const,
    metrics: () => [...queryKeys.monitoring.all, 'metrics'] as const,
    alerts: () => [...queryKeys.monitoring.all, 'alerts'] as const,
    logs: () => [...queryKeys.monitoring.all, 'logs'] as const,
  },
  
  // Settings queries
  settings: {
    all: ['settings'] as const,
    system: () => [...queryKeys.settings.all, 'system'] as const,
    security: () => [...queryKeys.settings.all, 'security'] as const,
    notifications: () => [...queryKeys.settings.all, 'notifications'] as const,
    backup: () => [...queryKeys.settings.all, 'backup'] as const,
  },
  
  // Workflow queries
  workflows: {
    all: ['workflows'] as const,
    lists: () => [...queryKeys.workflows.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.workflows.lists(), filters] as const,
    details: () => [...queryKeys.workflows.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.workflows.details(), id] as const,
    templates: () => [...queryKeys.workflows.all, 'templates'] as const,
    analytics: () => [...queryKeys.workflows.all, 'analytics'] as const,
  },
}

// Cache invalidation helpers
export const cacheHelpers = {
  // Invalidate all related queries when an entity is updated
  invalidateEntity: (queryClient: QueryClient, entity: keyof typeof queryKeys) => {
    queryClient.invalidateQueries({ queryKey: queryKeys[entity].all })
  },
  
  // Invalidate specific query
  invalidateQuery: (queryClient: QueryClient, queryKey: any[]) => {
    queryClient.invalidateQueries({ queryKey })
  },
  
  // Remove specific query from cache
  removeQuery: (queryClient: QueryClient, queryKey: any[]) => {
    queryClient.removeQueries({ queryKey })
  },
  
  // Update cache optimistically
  updateCache: <T>(queryClient: QueryClient, queryKey: any[], updater: (oldData: T) => T) => {
    queryClient.setQueryData(queryKey, updater)
  },
  
  // Prefetch related data
  prefetchRelated: async (queryClient: QueryClient, entity: string, id: string) => {
    switch (entity) {
      case 'employee':
        // Prefetch employee's leave balance, attendance, and performance data
        await Promise.all([
          queryClient.prefetchQuery({
            queryKey: queryKeys.leave.balance(id),
            staleTime: 2 * 60 * 1000, // 2 minutes
          }),
          queryClient.prefetchQuery({
            queryKey: queryKeys.attendance.list({ employeeId: id }),
            staleTime: 2 * 60 * 1000,
          }),
          queryClient.prefetchQuery({
            queryKey: queryKeys.performance.reviews(),
            staleTime: 5 * 60 * 1000,
          }),
        ])
        break
        
      case 'leave':
        // Prefetch employee data when viewing leave requests
        await queryClient.prefetchQuery({
          queryKey: queryKeys.employees.lists(),
          staleTime: 5 * 60 * 1000,
        })
        break
        
      default:
        break
    }
  },
}