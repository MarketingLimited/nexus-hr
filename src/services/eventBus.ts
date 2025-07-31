export type EventType = 
  | 'employee.created'
  | 'employee.updated'
  | 'employee.deleted'
  | 'leave.requested'
  | 'leave.approved'
  | 'leave.rejected'
  | 'payroll.initiated'
  | 'payroll.completed'
  | 'performance.review_started'
  | 'performance.review_completed'
  | 'workflow.started'
  | 'workflow.step_completed'
  | 'workflow.completed'
  | 'system.health_check'
  | 'sync.conflict_detected'
  | 'sync.completed'

export interface EventPayload {
  id: string
  type: EventType
  entityId: string
  entityType: string
  data: Record<string, any>
  metadata?: Record<string, any>
  timestamp: string
  source: string
}

export type EventHandler<T = any> = (payload: EventPayload & { data: T }) => void | Promise<void>

class EventBus {
  private handlers: Map<EventType, Set<EventHandler>> = new Map()
  private eventHistory: EventPayload[] = []
  private maxHistorySize = 1000

  subscribe<T = any>(eventType: EventType, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set())
    }
    
    this.handlers.get(eventType)!.add(handler as EventHandler)
    
    // Return unsubscribe function
    return () => {
      const handlers = this.handlers.get(eventType)
      if (handlers) {
        handlers.delete(handler as EventHandler)
        if (handlers.size === 0) {
          this.handlers.delete(eventType)
        }
      }
    }
  }

  async publish(payload: Omit<EventPayload, 'id' | 'timestamp'>): Promise<void> {
    const event: EventPayload = {
      ...payload,
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    }

    // Add to history
    this.eventHistory.push(event)
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift()
    }

    // Emit to handlers
    const handlers = this.handlers.get(event.type)
    if (handlers) {
      const promises = Array.from(handlers).map(handler => {
        try {
          return Promise.resolve(handler(event))
        } catch (error) {
          console.error(`Error in event handler for ${event.type}:`, error)
          return Promise.resolve()
        }
      })
      
      await Promise.allSettled(promises)
    }

    // Also emit to global listeners
    const globalHandlers = this.handlers.get('*' as EventType)
    if (globalHandlers) {
      const promises = Array.from(globalHandlers).map(handler => {
        try {
          return Promise.resolve(handler(event))
        } catch (error) {
          console.error(`Error in global event handler for ${event.type}:`, error)
          return Promise.resolve()
        }
      })
      
      await Promise.allSettled(promises)
    }
  }

  subscribeToAll(handler: EventHandler): () => void {
    return this.subscribe('*' as EventType, handler)
  }

  getEventHistory(filters?: {
    type?: EventType[]
    entityId?: string
    entityType?: string
    since?: string
  }): EventPayload[] {
    let filtered = this.eventHistory

    if (filters) {
      if (filters.type) {
        filtered = filtered.filter(event => filters.type!.includes(event.type))
      }
      if (filters.entityId) {
        filtered = filtered.filter(event => event.entityId === filters.entityId)
      }
      if (filters.entityType) {
        filtered = filtered.filter(event => event.entityType === filters.entityType)
      }
      if (filters.since) {
        const sinceDate = new Date(filters.since)
        filtered = filtered.filter(event => new Date(event.timestamp) >= sinceDate)
      }
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  clearHistory(): void {
    this.eventHistory = []
  }

  getHandlerCount(eventType?: EventType): number {
    if (eventType) {
      return this.handlers.get(eventType)?.size || 0
    }
    
    return Array.from(this.handlers.values()).reduce((total, handlers) => total + handlers.size, 0)
  }

  // Utility methods for common event patterns
  publishEmployeeEvent(
    type: 'employee.created' | 'employee.updated' | 'employee.deleted',
    employeeId: string,
    data: any,
    source = 'employee-service'
  ) {
    return this.publish({
      type,
      entityId: employeeId,
      entityType: 'employee',
      data,
      source
    })
  }

  publishLeaveEvent(
    type: 'leave.requested' | 'leave.approved' | 'leave.rejected',
    leaveId: string,
    data: any,
    source = 'leave-service'
  ) {
    return this.publish({
      type,
      entityId: leaveId,
      entityType: 'leave',
      data,
      source
    })
  }

  publishWorkflowEvent(
    type: 'workflow.started' | 'workflow.step_completed' | 'workflow.completed',
    workflowId: string,
    data: any,
    source = 'workflow-service'
  ) {
    return this.publish({
      type,
      entityId: workflowId,
      entityType: 'workflow',
      data,
      source
    })
  }

  publishSyncEvent(
    type: 'sync.conflict_detected' | 'sync.completed',
    entityId: string,
    data: any,
    source = 'sync-service'
  ) {
    return this.publish({
      type,
      entityId,
      entityType: 'sync',
      data,
      source
    })
  }
}

// Global event bus instance
export const eventBus = new EventBus()

// React hook for subscribing to events
export function useEventBus() {
  return {
    subscribe: eventBus.subscribe.bind(eventBus),
    publish: eventBus.publish.bind(eventBus),
    subscribeToAll: eventBus.subscribeToAll.bind(eventBus),
    getEventHistory: eventBus.getEventHistory.bind(eventBus),
    getHandlerCount: eventBus.getHandlerCount.bind(eventBus)
  }
}