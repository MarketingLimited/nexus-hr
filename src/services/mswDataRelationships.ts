// MSW Data Relationships Service
// Manages foreign key relationships and data integrity constraints
// Ensures referential integrity across all entities

import { mswDataPersistence } from './mswDataPersistence'
import { Employee } from '../mocks/data/employees'
import { Department } from '../mocks/data/departments'

// Relationship validation rules
export interface RelationshipRule {
  entity: string
  field: string
  references: string
  onDelete: 'cascade' | 'restrict' | 'set_null'
  onUpdate: 'cascade' | 'restrict'
}

// Define all relationships in the system
export const RELATIONSHIPS: RelationshipRule[] = [
  {
    entity: 'employees',
    field: 'department',
    references: 'departments',
    onDelete: 'restrict',
    onUpdate: 'cascade'
  },
  {
    entity: 'employees',
    field: 'manager',
    references: 'employees',
    onDelete: 'set_null',
    onUpdate: 'cascade'
  },
  {
    entity: 'leaveRequests',
    field: 'employeeId',
    references: 'employees',
    onDelete: 'cascade',
    onUpdate: 'cascade'
  },
  {
    entity: 'leaveRequests',
    field: 'leaveTypeId',
    references: 'leaveTypes',
    onDelete: 'restrict',
    onUpdate: 'cascade'
  },
  {
    entity: 'leaveBalances',
    field: 'employeeId',
    references: 'employees',
    onDelete: 'cascade',
    onUpdate: 'cascade'
  },
  {
    entity: 'leaveBalances',
    field: 'leaveTypeId',
    references: 'leaveTypes',
    onDelete: 'restrict',
    onUpdate: 'cascade'
  },
  {
    entity: 'salaryStructures',
    field: 'employeeId',
    references: 'employees',
    onDelete: 'cascade',
    onUpdate: 'cascade'
  },
  {
    entity: 'payslips',
    field: 'employeeId',
    references: 'employees',
    onDelete: 'cascade',
    onUpdate: 'cascade'
  }
]

class MSWDataRelationships {
  private static instance: MSWDataRelationships

  static getInstance(): MSWDataRelationships {
    if (!MSWDataRelationships.instance) {
      MSWDataRelationships.instance = new MSWDataRelationships()
    }
    return MSWDataRelationships.instance
  }

  // Validate a delete operation against relationship constraints
  validateDelete(entityType: string, id: string): {
    canDelete: boolean
    blockedBy: string[]
    cascadeDeletes: Array<{ entity: string; ids: string[] }>
  } {
    const blockedBy: string[] = []
    const cascadeDeletes: Array<{ entity: string; ids: string[] }> = []

    // Find all relationships where this entity is referenced
    const dependentRelationships = RELATIONSHIPS.filter(rel => rel.references === entityType)

    for (const rel of dependentRelationships) {
      const dependentItems = mswDataPersistence.findItems(rel.entity as any, (item: any) => 
        item[rel.field] === id
      )

      if (dependentItems.length > 0) {
        if (rel.onDelete === 'restrict') {
          blockedBy.push(`${rel.entity} (${dependentItems.length} records)`)
        } else if (rel.onDelete === 'cascade') {
          cascadeDeletes.push({
            entity: rel.entity,
            ids: dependentItems.map((item: any) => item.id)
          })
        }
        // set_null is handled automatically in the delete operation
      }
    }

    return {
      canDelete: blockedBy.length === 0,
      blockedBy,
      cascadeDeletes
    }
  }

  // Execute a delete with relationship handling
  executeDelete(entityType: string, id: string): {
    success: boolean
    error?: string
    deletedCount: number
    affectedEntities: string[]
  } {
    const validation = this.validateDelete(entityType, id)
    
    if (!validation.canDelete) {
      return {
        success: false,
        error: `Cannot delete: Referenced by ${validation.blockedBy.join(', ')}`,
        deletedCount: 0,
        affectedEntities: []
      }
    }

    let deletedCount = 0
    const affectedEntities: string[] = []

    // Execute cascade deletes first
    for (const cascade of validation.cascadeDeletes) {
      const deleted = mswDataPersistence.bulkDelete(cascade.entity as any, cascade.ids)
      deletedCount += deleted
      if (deleted > 0) {
        affectedEntities.push(cascade.entity)
      }
    }

    // Handle set_null relationships
    const setNullRelationships = RELATIONSHIPS.filter(
      rel => rel.references === entityType && rel.onDelete === 'set_null'
    )
    
    for (const rel of setNullRelationships) {
      const itemsToUpdate = mswDataPersistence.findItems(rel.entity as any, (item: any) => 
        item[rel.field] === id
      )
      
      if (itemsToUpdate.length > 0) {
        const updates = itemsToUpdate.map((item: any) => ({
          id: item.id,
          data: { [rel.field]: null }
        }))
        
        mswDataPersistence.bulkUpdate(rel.entity as any, updates)
        affectedEntities.push(rel.entity)
      }
    }

    // Delete the main entity
    const mainDeleted = mswDataPersistence.deleteItem(entityType as any, id)
    if (mainDeleted) {
      deletedCount += 1
      affectedEntities.push(entityType)
    }

    return {
      success: true,
      deletedCount,
      affectedEntities: [...new Set(affectedEntities)]
    }
  }

  // Validate foreign key references before create/update
  validateReferences(entityType: string, data: any): {
    valid: boolean
    errors: string[]
  } {
    const errors: string[] = []
    
    // Find relationships for this entity
    const entityRelationships = RELATIONSHIPS.filter(rel => rel.entity === entityType)
    
    for (const rel of entityRelationships) {
      const value = data[rel.field]
      
      if (value && value !== null) {
        const referencedItem = mswDataPersistence.getItemById(rel.references as any, value)
        
        if (!referencedItem) {
          errors.push(`${rel.field}: Referenced ${rel.references} with id '${value}' does not exist`)
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  // Get computed fields (e.g., employee count per department)
  getComputedFields(entityType: string, id: string): Record<string, any> {
    const computed: Record<string, any> = {}

    switch (entityType) {
      case 'departments':
        const employeeCount = mswDataPersistence.findItems('employees', (emp: Employee) => 
          emp.department === id
        ).length
        computed.employeeCount = employeeCount
        break

      case 'employees':
        // Count direct reports
        const directReports = mswDataPersistence.findItems('employees', (emp: Employee) => 
          emp.manager === id
        ).length
        computed.directReports = directReports

        // Get leave balance summary
        const leaveBalances = mswDataPersistence.findItems('leaveBalances', (lb: any) => 
          lb.employeeId === id
        )
        computed.totalLeaveBalance = leaveBalances.reduce((sum, lb: any) => sum + lb.balance, 0)
        break

      case 'leaveTypes':
        // Count requests for this leave type
        const requestCount = mswDataPersistence.findItems('leaveRequests', (lr: any) => 
          lr.leaveTypeId === id
        ).length
        computed.requestCount = requestCount
        break
    }

    return computed
  }

  // Get all related entities for a given entity
  getRelatedEntities(entityType: string, id: string): Record<string, any[]> {
    const related: Record<string, any[]> = {}

    // Find relationships where this entity is referenced
    const dependentRelationships = RELATIONSHIPS.filter(rel => rel.references === entityType)
    
    for (const rel of dependentRelationships) {
      const relatedItems = mswDataPersistence.findItems(rel.entity as any, (item: any) => 
        item[rel.field] === id
      )
      
      if (relatedItems.length > 0) {
        related[rel.entity] = relatedItems
      }
    }

    return related
  }

  // Validate data integrity across all entities
  validateDataIntegrity(): {
    valid: boolean
    issues: Array<{
      entity: string
      field: string
      issue: string
      affectedRecords: number
    }>
  } {
    const issues: Array<{
      entity: string
      field: string
      issue: string
      affectedRecords: number
    }> = []

    for (const rel of RELATIONSHIPS) {
      const entities = mswDataPersistence.getData(rel.entity as any) as any[]
      
      for (const entity of entities) {
        const value = entity[rel.field]
        
        if (value && value !== null) {
          const referencedItem = mswDataPersistence.getItemById(rel.references as any, value)
          
          if (!referencedItem) {
            const existingIssue = issues.find(i => 
              i.entity === rel.entity && 
              i.field === rel.field && 
              i.issue.includes('does not exist')
            )
            
            if (existingIssue) {
              existingIssue.affectedRecords++
            } else {
              issues.push({
                entity: rel.entity,
                field: rel.field,
                issue: `References non-existent ${rel.references}`,
                affectedRecords: 1
              })
            }
          }
        }
      }
    }

    return {
      valid: issues.length === 0,
      issues
    }
  }

  // Fix data integrity issues (remove orphaned references)
  fixDataIntegrity(): {
    fixed: number
    issues: Array<{
      entity: string
      action: string
      count: number
    }>
  } {
    const fixed: Array<{
      entity: string
      action: string
      count: number
    }> = []

    for (const rel of RELATIONSHIPS) {
      const entities = mswDataPersistence.getData(rel.entity as any) as any[]
      const orphanedEntities: any[] = []
      
      for (const entity of entities) {
        const value = entity[rel.field]
        
        if (value && value !== null) {
          const referencedItem = mswDataPersistence.getItemById(rel.references as any, value)
          
          if (!referencedItem) {
            orphanedEntities.push({
              ...entity,
              [rel.field]: null
            })
          }
        }
      }
      
      if (orphanedEntities.length > 0) {
        const updates = orphanedEntities.map(entity => ({
          id: entity.id,
          data: { [rel.field]: null }
        }))
        
        mswDataPersistence.bulkUpdate(rel.entity as any, updates)
        
        fixed.push({
          entity: rel.entity,
          action: `Set ${rel.field} to null for orphaned references`,
          count: orphanedEntities.length
        })
      }
    }

    return {
      fixed: fixed.reduce((sum, f) => sum + f.count, 0),
      issues: fixed
    }
  }
}

// Export singleton instance
export const mswDataRelationships = MSWDataRelationships.getInstance()