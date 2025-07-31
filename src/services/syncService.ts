import { api, ApiResponse } from './api'
import { eventBus } from './eventBus'

export interface SyncOperation {
  id: string
  type: 'create' | 'update' | 'delete'
  entityType: string
  entityId: string
  localData: any
  remoteData?: any
  status: 'pending' | 'syncing' | 'completed' | 'failed' | 'conflict'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  timestamp: string
  retryCount: number
  maxRetries: number
  error?: string
  operation: string
  progress?: number
  createdAt: string
  completedAt?: string
  conflictData?: {
    local: any
    remote: any
    lastSync: string
  }
}

export interface SyncConflict {
  id: string
  operationId: string
  entityType: string
  entityId: string
  localData: any
  remoteData: any
  lastSyncTimestamp: string
  conflictType: 'data' | 'version' | 'deletion'
  autoResolvable: boolean
  resolutionStrategy?: 'local_wins' | 'remote_wins' | 'merge' | 'manual'
  createdAt: string
  detectedAt: string
}

export interface SyncStats {
  totalOperations: number
  pending: number
  completed: number
  failed: number
  conflicts: number
  lastSyncTime?: string
  nextSyncTime?: string
  syncInProgress: boolean
  inProgress: number
  lastSync?: string
  averageSyncTime: number
  successRate: number
}

export interface SyncConfig {
  autoSync: boolean
  syncInterval: number // minutes
  maxRetries: number
  batchSize: number
  conflictResolution: 'auto' | 'manual' | 'hybrid'
  priority: 'performance' | 'consistency' | 'availability'
}

class SyncService {
  private operations: Map<string, SyncOperation> = new Map()
  private conflicts: Map<string, SyncConflict> = new Map()
  private syncInProgress = false
  private config: SyncConfig = {
    autoSync: true,
    syncInterval: 5,
    maxRetries: 3,
    batchSize: 50,
    conflictResolution: 'hybrid',
    priority: 'consistency'
  }
  private syncTimer?: NodeJS.Timeout

  constructor() {
    this.startAutoSync()
  }

  // Configuration
  updateConfig(newConfig: Partial<SyncConfig>): void {
    this.config = { ...this.config, ...newConfig }
    
    if (this.config.autoSync && !this.syncTimer) {
      this.startAutoSync()
    } else if (!this.config.autoSync && this.syncTimer) {
      this.stopAutoSync()
    }
  }

  getConfig(): SyncConfig {
    return { ...this.config }
  }

  // Queue Operations
  queueOperation(operation: Omit<SyncOperation, 'id' | 'status' | 'timestamp' | 'retryCount'>): string {
    const id = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const syncOperation: SyncOperation = {
      ...operation,
      id,
      status: 'pending',
      timestamp: new Date().toISOString(),
      retryCount: 0,
      maxRetries: operation.maxRetries || this.config.maxRetries
    }

    this.operations.set(id, syncOperation)

    // Publish event
    eventBus.publishSyncEvent('sync.operation_queued' as any, id, syncOperation, 'sync-service')

    return id
  }

  // Sync Execution
  async startSync(): Promise<SyncStats> {
    if (this.syncInProgress) {
      throw new Error('Sync already in progress')
    }

    this.syncInProgress = true
    const startTime = Date.now()

    try {
      const pendingOps = Array.from(this.operations.values())
        .filter(op => op.status === 'pending' || op.status === 'failed')
        .sort((a, b) => this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority))

      // Process in batches
      const batches = this.chunkArray(pendingOps, this.config.batchSize)
      
      for (const batch of batches) {
        await this.processBatch(batch)
      }

      const stats = this.getStats()
      stats.lastSyncTime = new Date().toISOString()
      stats.averageSyncTime = Date.now() - startTime

      // Publish completion event
      eventBus.publishSyncEvent('sync.completed', 'sync', stats, 'sync-service')

      return stats
    } finally {
      this.syncInProgress = false
    }
  }

  private async processBatch(operations: SyncOperation[]): Promise<void> {
    const promises = operations.map(op => this.processOperation(op))
    await Promise.allSettled(promises)
  }

  private async processOperation(operation: SyncOperation): Promise<void> {
    try {
      operation.status = 'syncing'
      this.operations.set(operation.id, operation)

      let result: any

      switch (operation.type) {
        case 'create':
          result = await this.syncCreate(operation)
          break
        case 'update':
          result = await this.syncUpdate(operation)
          break
        case 'delete':
          result = await this.syncDelete(operation)
          break
      }

      if (result.conflict) {
        await this.handleConflict(operation, result.conflictData)
      } else {
        operation.status = 'completed'
        this.operations.set(operation.id, operation)
      }
    } catch (error) {
      operation.retryCount++
      operation.error = error instanceof Error ? error.message : 'Unknown error'

      if (operation.retryCount >= operation.maxRetries) {
        operation.status = 'failed'
      } else {
        operation.status = 'pending'
      }

      this.operations.set(operation.id, operation)
    }
  }

  private async syncCreate(operation: SyncOperation): Promise<any> {
    const response = await api.post(`/sync/${operation.entityType}`, operation.localData)
    return (response as any).data
  }

  private async syncUpdate(operation: SyncOperation): Promise<any> {
    const response = await api.put(`/sync/${operation.entityType}/${operation.entityId}`, operation.localData)
    return (response as any).data
  }

  private async syncDelete(operation: SyncOperation): Promise<any> {
    const response = await api.delete(`/sync/${operation.entityType}/${operation.entityId}`)
    return (response as any).data
  }

  // Conflict Resolution
  private async handleConflict(operation: SyncOperation, conflictData: any): Promise<void> {
    const conflict: SyncConflict = {
      id: `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      operationId: operation.id,
      entityType: operation.entityType,
      entityId: operation.entityId,
      localData: operation.localData,
      remoteData: conflictData.remote,
      lastSyncTimestamp: conflictData.lastSync,
      conflictType: this.determineConflictType(operation.localData, conflictData.remote),
      autoResolvable: this.isAutoResolvable(operation.localData, conflictData.remote),
      createdAt: new Date().toISOString()
    }

    this.conflicts.set(conflict.id, conflict)
    operation.status = 'conflict'
    operation.conflictData = {
      local: operation.localData,
      remote: conflictData.remote,
      lastSync: conflictData.lastSync
    }

    this.operations.set(operation.id, operation)

    // Attempt auto-resolution if configured and possible
    if (this.config.conflictResolution !== 'manual' && conflict.autoResolvable) {
      await this.resolveConflict(conflict.id, 'auto')
    }

    // Publish conflict event
    eventBus.publishSyncEvent('sync.conflict_detected', conflict.id, conflict, 'sync-service')
  }

  async resolveConflict(conflictId: string, strategy: 'local_wins' | 'remote_wins' | 'merge' | 'auto'): Promise<void> {
    const conflict = this.conflicts.get(conflictId)
    if (!conflict) {
      throw new Error('Conflict not found')
    }

    const operation = this.operations.get(conflict.operationId)
    if (!operation) {
      throw new Error('Operation not found')
    }

    let resolvedData: any

    switch (strategy) {
      case 'local_wins':
        resolvedData = conflict.localData
        break
      case 'remote_wins':
        resolvedData = conflict.remoteData
        break
      case 'merge':
        resolvedData = this.mergeData(conflict.localData, conflict.remoteData)
        break
      case 'auto':
        resolvedData = this.autoResolve(conflict)
        break
    }

    // Apply resolution
    operation.localData = resolvedData
    operation.status = 'pending'
    delete operation.conflictData

    this.operations.set(operation.id, operation)
    this.conflicts.delete(conflictId)

    // Re-queue for sync
    await this.processOperation(operation)
  }

  // Utility Methods
  private getPriorityWeight(priority: SyncOperation['priority']): number {
    switch (priority) {
      case 'urgent': return 4
      case 'high': return 3
      case 'medium': return 2
      case 'low': return 1
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }

  private determineConflictType(local: any, remote: any): SyncConflict['conflictType'] {
    if (!remote) return 'deletion'
    if (local.version !== remote.version) return 'version'
    return 'data'
  }

  private isAutoResolvable(local: any, remote: any): boolean {
    // Simple heuristic - auto-resolvable if only non-critical fields differ
    const criticalFields = ['id', 'status', 'amount', 'startDate', 'endDate']
    
    for (const field of criticalFields) {
      if (local[field] !== remote[field]) {
        return false
      }
    }
    
    return true
  }

  private mergeData(local: any, remote: any): any {
    // Simple merge strategy - take local for user-editable fields, remote for system fields
    const systemFields = ['id', 'createdAt', 'updatedAt', 'version']
    const merged = { ...local }
    
    for (const field of systemFields) {
      if (remote[field] !== undefined) {
        merged[field] = remote[field]
      }
    }
    
    return merged
  }

  private autoResolve(conflict: SyncConflict): any {
    // Auto-resolve based on timestamps and conflict type
    if (conflict.conflictType === 'deletion') {
      return null // Accept deletion
    }
    
    const localTime = new Date(conflict.localData.updatedAt || conflict.localData.createdAt)
    const remoteTime = new Date(conflict.remoteData.updatedAt || conflict.remoteData.createdAt)
    
    // Latest wins
    return localTime > remoteTime ? conflict.localData : conflict.remoteData
  }

  // Stats and Monitoring
  getStats(): SyncStats {
    const operations = Array.from(this.operations.values())
    
    return {
      totalOperations: operations.length,
      pending: operations.filter(op => op.status === 'pending').length,
      completed: operations.filter(op => op.status === 'completed').length,
      failed: operations.filter(op => op.status === 'failed').length,
      conflicts: this.conflicts.size,
      syncInProgress: this.syncInProgress,
      averageSyncTime: 0, // Will be updated during sync
      successRate: operations.length > 0 
        ? operations.filter(op => op.status === 'completed').length / operations.length 
        : 1
    }
  }

  getOperations(filters?: {
    status?: SyncOperation['status'][]
    entityType?: string
    priority?: SyncOperation['priority'][]
  }): SyncOperation[] {
    let operations = Array.from(this.operations.values())
    
    if (filters) {
      if (filters.status) {
        operations = operations.filter(op => filters.status!.includes(op.status))
      }
      if (filters.entityType) {
        operations = operations.filter(op => op.entityType === filters.entityType)
      }
      if (filters.priority) {
        operations = operations.filter(op => filters.priority!.includes(op.priority))
      }
    }
    
    return operations.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  getConflicts(): SyncConflict[] {
    return Array.from(this.conflicts.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  // Auto-sync Management
  private startAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer)
    }
    
    this.syncTimer = setInterval(() => {
      if (!this.syncInProgress && this.config.autoSync) {
        this.startSync().catch(console.error)
      }
    }, this.config.syncInterval * 60 * 1000)
  }

  private stopAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer)
      this.syncTimer = undefined
    }
  }

  // Cleanup
  clearCompleted(): void {
    const toDelete: string[] = []
    
    for (const [id, operation] of this.operations) {
      if (operation.status === 'completed') {
        toDelete.push(id)
      }
    }
    
    toDelete.forEach(id => this.operations.delete(id))
  }

  clearAll(): void {
    this.operations.clear()
    this.conflicts.clear()
  }
}

export const syncService = new SyncService()