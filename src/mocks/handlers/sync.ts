import { http, HttpResponse } from 'msw'
import type { SyncOperation, SyncConflict, SyncStats } from '../../services/syncService'

// Mock data
let syncOperations: SyncOperation[] = [
  {
    id: 'sync_001',
    type: 'update',
    entityType: 'employee',
    entityId: 'emp_001',
    localData: {
      id: 'emp_001',
      name: 'John Doe Updated',
      email: 'john.doe@company.com',
      updatedAt: '2024-08-01T10:00:00Z'
    },
    status: 'completed',
    priority: 'medium',
    timestamp: '2024-08-01T10:00:00Z',
    retryCount: 0,
    maxRetries: 3,
    operation: 'update employee profile',
    createdAt: '2024-08-01T10:00:00Z'
  },
  {
    id: 'sync_002',
    type: 'create',
    entityType: 'leave',
    entityId: 'leave_001',
    localData: {
      id: 'leave_001',
      employeeId: 'emp_002',
      startDate: '2024-08-15',
      endDate: '2024-08-20',
      type: 'vacation'
    },
    status: 'pending',
    priority: 'high',
    timestamp: '2024-08-01T14:30:00Z',
    retryCount: 0,
    maxRetries: 3,
    operation: 'create leave request',
    createdAt: '2024-08-01T14:30:00Z'
  },
  {
    id: 'sync_003',
    type: 'update',
    entityType: 'employee',
    entityId: 'emp_003',
    localData: {
      id: 'emp_003',
      name: 'Jane Smith',
      department: 'Engineering',
      updatedAt: '2024-08-01T15:00:00Z'
    },
    remoteData: {
      id: 'emp_003',
      name: 'Jane Smith',
      department: 'Marketing',
      updatedAt: '2024-08-01T15:30:00Z'
    },
    status: 'conflict',
    priority: 'medium',
    timestamp: '2024-08-01T15:00:00Z',
    retryCount: 1,
    maxRetries: 3,
    operation: 'update employee department',
    createdAt: '2024-08-01T15:00:00Z',
    conflictData: {
      local: {
        id: 'emp_003',
        name: 'Jane Smith',
        department: 'Engineering',
        updatedAt: '2024-08-01T15:00:00Z'
      },
      remote: {
        id: 'emp_003',
        name: 'Jane Smith',
        department: 'Marketing',
        updatedAt: '2024-08-01T15:30:00Z'
      },
      lastSync: '2024-08-01T12:00:00Z'
    }
  }
]

let syncConflicts: SyncConflict[] = [
  {
    id: 'conflict_001',
    operationId: 'sync_003',
    entityType: 'employee',
    entityId: 'emp_003',
    localData: {
      id: 'emp_003',
      name: 'Jane Smith',
      department: 'Engineering',
      updatedAt: '2024-08-01T15:00:00Z'
    },
    remoteData: {
      id: 'emp_003',
      name: 'Jane Smith',
      department: 'Marketing',
      updatedAt: '2024-08-01T15:30:00Z'
    },
    lastSyncTimestamp: '2024-08-01T12:00:00Z',
    conflictType: 'data',
    autoResolvable: false,
    createdAt: '2024-08-01T15:45:00Z',
    detectedAt: '2024-08-01T15:45:00Z'
  }
]

export const syncHandlers = [
  // Get sync operations
  http.get('/api/sync/operations', ({ request }) => {
    const url = new URL(request.url)
    const status = url.searchParams.getAll('status')
    const entityType = url.searchParams.get('entityType')
    const priority = url.searchParams.getAll('priority')

    let filtered = syncOperations

    if (status.length > 0) {
      filtered = filtered.filter(op => status.includes(op.status))
    }

    if (entityType) {
      filtered = filtered.filter(op => op.entityType === entityType)
    }

    if (priority.length > 0) {
      filtered = filtered.filter(op => priority.includes(op.priority))
    }

    return HttpResponse.json({
      data: filtered,
      success: true
    })
  }),

  // Get sync operation by ID
  http.get('/api/sync/operations/:id', ({ params }) => {
    const { id } = params
    const operation = syncOperations.find(op => op.id === id)

    if (!operation) {
      return HttpResponse.json({ error: 'Operation not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: operation, success: true })
  }),

  // Queue sync operation
  http.post('/api/sync/operations', async ({ request }) => {
    const operationData = await request.json() as Omit<SyncOperation, 'id' | 'status' | 'timestamp' | 'retryCount'>
    
    const newOperation: SyncOperation = {
      ...operationData,
      id: `sync_${Date.now()}`,
      status: 'pending',
      timestamp: new Date().toISOString(),
      retryCount: 0
    }

    syncOperations.push(newOperation)
    return HttpResponse.json({ data: newOperation, success: true })
  }),

  // Start sync process
  http.post('/api/sync/start', async () => {
    // Simulate sync processing
    const pendingOps = syncOperations.filter(op => op.status === 'pending')
    
    // Update some operations to completed
    pendingOps.slice(0, Math.ceil(pendingOps.length * 0.8)).forEach(op => {
      op.status = 'completed'
    })

    // Create a conflict for demonstration
    const conflictOp = pendingOps[pendingOps.length - 1]
    if (conflictOp && Math.random() > 0.7) {
      conflictOp.status = 'conflict'
      conflictOp.conflictData = {
        local: conflictOp.localData,
        remote: { ...conflictOp.localData, modifiedField: 'remote value' },
        lastSync: new Date(Date.now() - 3600000).toISOString()
      }

      // Add to conflicts
      const newConflict: SyncConflict = {
        id: `conflict_${Date.now()}`,
        operationId: conflictOp.id,
        entityType: conflictOp.entityType,
        entityId: conflictOp.entityId,
        localData: conflictOp.localData,
        remoteData: conflictOp.conflictData.remote,
        lastSyncTimestamp: conflictOp.conflictData.lastSync,
        conflictType: 'data',
        autoResolvable: Math.random() > 0.5,
        createdAt: new Date().toISOString(),
        detectedAt: new Date().toISOString()
      }
      syncConflicts.push(newConflict)
    }

    const stats: SyncStats = {
      totalOperations: syncOperations.length,
      pending: syncOperations.filter(op => op.status === 'pending').length,
      completed: syncOperations.filter(op => op.status === 'completed').length,
      failed: syncOperations.filter(op => op.status === 'failed').length,
      conflicts: syncConflicts.length,
      lastSyncTime: new Date().toISOString(),
      syncInProgress: false,
      inProgress: syncOperations.filter(op => op.status === 'syncing').length,
      averageSyncTime: 2500,
      successRate: 0.85
    }

    return HttpResponse.json({ data: stats, success: true })
  }),

  // Get sync stats
  http.get('/api/sync/stats', () => {
    const stats: SyncStats = {
      totalOperations: syncOperations.length,
      pending: syncOperations.filter(op => op.status === 'pending').length,
      completed: syncOperations.filter(op => op.status === 'completed').length,
      failed: syncOperations.filter(op => op.status === 'failed').length,
      conflicts: syncConflicts.length,
      lastSyncTime: '2024-08-01T16:00:00Z',
      nextSyncTime: '2024-08-01T16:05:00Z',
      syncInProgress: false,
      inProgress: syncOperations.filter(op => op.status === 'syncing').length,
      averageSyncTime: 2500,
      successRate: 0.85
    }

    return HttpResponse.json({ data: stats, success: true })
  }),

  // Get conflicts
  http.get('/api/sync/conflicts', () => {
    return HttpResponse.json({
      data: syncConflicts,
      success: true
    })
  }),

  // Get conflict by ID
  http.get('/api/sync/conflicts/:id', ({ params }) => {
    const { id } = params
    const conflict = syncConflicts.find(c => c.id === id)

    if (!conflict) {
      return HttpResponse.json({ error: 'Conflict not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: conflict, success: true })
  }),

  // Resolve conflict
  http.put('/api/sync/conflicts/:id/resolve', async ({ params, request }) => {
    const { id } = params
    const { strategy, resolvedData } = await request.json() as {
      strategy: 'local_wins' | 'remote_wins' | 'merge'
      resolvedData?: any
    }

    const conflictIndex = syncConflicts.findIndex(c => c.id === id)
    if (conflictIndex === -1) {
      return HttpResponse.json({ error: 'Conflict not found' }, { status: 404 })
    }

    const conflict = syncConflicts[conflictIndex]
    const operationIndex = syncOperations.findIndex(op => op.id === conflict.operationId)
    
    if (operationIndex !== -1) {
      const operation = syncOperations[operationIndex]
      
      // Apply resolution strategy
      let finalData = resolvedData
      if (!finalData) {
        switch (strategy) {
          case 'local_wins':
            finalData = conflict.localData
            break
          case 'remote_wins':
            finalData = conflict.remoteData
            break
          case 'merge':
            finalData = { ...conflict.remoteData, ...conflict.localData }
            break
        }
      }

      operation.localData = finalData
      operation.status = 'completed'
      delete operation.conflictData

      syncOperations[operationIndex] = operation
    }

    // Remove conflict
    syncConflicts.splice(conflictIndex, 1)

    return HttpResponse.json({ 
      data: { message: 'Conflict resolved successfully' }, 
      success: true 
    })
  }),

  // Sync specific entity type
  http.post('/api/sync/:entityType', async ({ params, request }) => {
    const { entityType } = params
    const data = await request.json() as any

    // Simulate potential conflict
    if (Math.random() > 0.8) {
      return HttpResponse.json({
        data: {
          conflict: true,
          conflictData: {
            remote: { ...(data as any), conflictField: 'remote value' },
            lastSync: new Date(Date.now() - 3600000).toISOString()
          }
        },
        success: true
      })
    }

    return HttpResponse.json({
      data: {
        id: (data as any).id || `${entityType}_${Date.now()}`,
        ...(data as any),
        syncedAt: new Date().toISOString()
      },
      success: true
    })
  }),

  // Update entity
  http.put('/api/sync/:entityType/:id', async ({ params, request }) => {
    const { entityType, id } = params
    const data = await request.json() as any

    // Simulate potential conflict
    if (Math.random() > 0.8) {
      return HttpResponse.json({
        data: {
          conflict: true,
          conflictData: {
            remote: { ...(data as any), id, conflictField: 'remote value' },
            lastSync: new Date(Date.now() - 3600000).toISOString()
          }
        },
        success: true
      })
    }

    return HttpResponse.json({
      data: {
        id,
        ...(data as any),
        updatedAt: new Date().toISOString(),
        syncedAt: new Date().toISOString()
      },
      success: true
    })
  }),

  // Delete entity
  http.delete('/api/sync/:entityType/:id', ({ params }) => {
    const { entityType, id } = params

    return HttpResponse.json({
      data: {
        id,
        entityType,
        deletedAt: new Date().toISOString(),
        syncedAt: new Date().toISOString()
      },
      success: true
    })
  }),

  // Get sync config
  http.get('/api/sync/config', () => {
    return HttpResponse.json({
      data: {
        autoSync: true,
        syncInterval: 5,
        maxRetries: 3,
        batchSize: 50,
        conflictResolution: 'hybrid' as const,
        priority: 'consistency' as const
      },
      success: true
    })
  }),

  // Update sync config
  http.put('/api/sync/config', async ({ request }) => {
    const config = await request.json() as any

    return HttpResponse.json({
      data: config,
      success: true
    })
  }),

  // Clear completed operations
  http.delete('/api/sync/operations/completed', () => {
    const completedCount = syncOperations.filter(op => op.status === 'completed').length
    syncOperations = syncOperations.filter(op => op.status !== 'completed')

    return HttpResponse.json({
      data: { removed: completedCount },
      success: true
    })
  })
]