// MSW Data Persistence Service
// Provides centralized localStorage-based persistence for MSW handlers
// Ensures data survives page refreshes and maintains relationships

import { Employee } from '../mocks/data/employees'
import { Department } from '../mocks/data/departments'
import { LeaveRequest, LeaveType, LeaveBalance } from '../mocks/data/leave'
import { Payslip, SalaryStructure, PayrollRun } from '../mocks/data/payroll'
import { User } from '../mocks/data/auth'

// Storage keys
const STORAGE_KEYS = {
  employees: 'msw_employees',
  departments: 'msw_departments',
  leaveTypes: 'msw_leave_types',
  leaveRequests: 'msw_leave_requests',
  leaveBalances: 'msw_leave_balances',
  salaryStructures: 'msw_salary_structures',
  payslips: 'msw_payslips',
  payrollRuns: 'msw_payroll_runs',
  users: 'msw_users',
  lastSync: 'msw_last_sync',
} as const

// Entity type mapping
export type EntityType = keyof typeof STORAGE_KEYS
export type EntityData = Employee | Department | LeaveRequest | LeaveType | LeaveBalance | 
                        Payslip | SalaryStructure | PayrollRun | User

// Data storage interface
interface StorageData {
  employees: Employee[]
  departments: Department[]
  leaveTypes: LeaveType[]
  leaveRequests: LeaveRequest[]
  leaveBalances: LeaveBalance[]
  salaryStructures: SalaryStructure[]
  payslips: Payslip[]
  payrollRuns: PayrollRun[]
  users: User[]
}

class MSWDataPersistence {
  private static instance: MSWDataPersistence
  private cache: Partial<StorageData> = {}
  private isInitialized = false

  static getInstance(): MSWDataPersistence {
    if (!MSWDataPersistence.instance) {
      MSWDataPersistence.instance = new MSWDataPersistence()
    }
    return MSWDataPersistence.instance
  }

  // Initialize data from localStorage or seed with default data
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      const lastSync = localStorage.getItem(STORAGE_KEYS.lastSync)
      const isFirstLoad = !lastSync

      if (isFirstLoad) {
        console.log('🌱 MSW: First load - seeding data')
        await this.seedData()
      } else {
        console.log('🔄 MSW: Loading persisted data')
        this.loadFromStorage()
      }

      this.isInitialized = true
      console.log('✅ MSW: Data persistence initialized')
    } catch (error) {
      console.error('❌ MSW: Failed to initialize data persistence:', error)
      await this.seedData() // Fallback to seed data
    }
  }

  // Load data from localStorage
  private loadFromStorage(): void {
    Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
      if (key === 'lastSync') return
      
      try {
        const stored = localStorage.getItem(storageKey)
        if (stored) {
          this.cache[key as EntityType] = JSON.parse(stored)
        }
      } catch (error) {
        console.warn(`Failed to load ${key} from storage:`, error)
      }
    })
  }

  // Seed initial data
  private async seedData(): Promise<void> {
    const { generateEmployees } = await import('../mocks/data/employees')
    const { generateDepartments } = await import('../mocks/data/departments')
    const { generateLeaveTypes, generateLeaveRequests, generateLeaveBalances } = await import('../mocks/data/leave')
    const { generateSalaryStructures, generatePayslips, generatePayrollRuns } = await import('../mocks/data/payroll')
    const { generateUsers } = await import('../mocks/data/auth')

    // Generate departments first (needed for employee relationships)
    const departments = generateDepartments()
    this.cache.departments = departments
    
    // Generate employees with department relationships
    const employees = generateEmployees(100)
    this.cache.employees = employees
    
    // Generate leave data
    const leaveTypes = generateLeaveTypes()
    this.cache.leaveTypes = leaveTypes
    
    const employeeIds = employees.map(e => e.id)
    const leaveTypeIds = leaveTypes.map(lt => lt.id)
    
    this.cache.leaveRequests = generateLeaveRequests(employeeIds, leaveTypeIds, 150)
    this.cache.leaveBalances = generateLeaveBalances(employeeIds, leaveTypeIds)
    
    // Generate payroll data
    this.cache.salaryStructures = generateSalaryStructures(employeeIds)
    this.cache.payslips = generatePayslips(employeeIds, 200)
    this.cache.payrollRuns = generatePayrollRuns(12)
    
    // Generate users
    this.cache.users = generateUsers(50)

    // Save all to localStorage
    this.saveAllToStorage()
    localStorage.setItem(STORAGE_KEYS.lastSync, new Date().toISOString())
  }

  // Save all cached data to localStorage
  private saveAllToStorage(): void {
    Object.entries(this.cache).forEach(([key, data]) => {
      if (data && STORAGE_KEYS[key as EntityType]) {
        localStorage.setItem(STORAGE_KEYS[key as EntityType], JSON.stringify(data))
      }
    })
    localStorage.setItem(STORAGE_KEYS.lastSync, new Date().toISOString())
  }

  // Get data for a specific entity type
  getData(entityType: EntityType): any[] {
    return (this.cache[entityType] || []) as any[]
  }

  // Set data for a specific entity type
  setData(entityType: EntityType, data: any[]): void {
    this.cache[entityType] = data as any
    localStorage.setItem(STORAGE_KEYS[entityType], JSON.stringify(data))
    localStorage.setItem(STORAGE_KEYS.lastSync, new Date().toISOString())
  }

  // Add a single item
  addItem<T extends EntityType>(entityType: T, item: any): any {
    const currentData = this.getData(entityType)
    const newItem = {
      ...item,
      id: item.id || crypto.randomUUID(),
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    currentData.push(newItem)
    this.setData(entityType, currentData)
    return newItem
  }

  // Update a single item
  updateItem<T extends EntityType>(entityType: T, id: string, updates: any): any | null {
    const currentData = this.getData(entityType)
    const itemIndex = currentData.findIndex((item: any) => item.id === id)
    
    if (itemIndex === -1) return null
    
    currentData[itemIndex] = {
      ...currentData[itemIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    this.setData(entityType, currentData)
    return currentData[itemIndex]
  }

  // Delete a single item
  deleteItem<T extends EntityType>(entityType: T, id: string): boolean {
    const currentData = this.getData(entityType)
    const itemIndex = currentData.findIndex((item: any) => item.id === id)
    
    if (itemIndex === -1) return false
    
    currentData.splice(itemIndex, 1)
    this.setData(entityType, currentData)
    return true
  }

  // Find items by criteria
  findItems<T extends EntityType>(entityType: T, predicate: (item: any) => boolean): any[] {
    const currentData = this.getData(entityType)
    return currentData.filter(predicate)
  }

  // Get item by ID
  getItemById<T extends EntityType>(entityType: T, id: string): any | null {
    const currentData = this.getData(entityType)
    return currentData.find((item: any) => item.id === id) || null
  }

  // Bulk operations
  bulkDelete<T extends EntityType>(entityType: T, ids: string[]): number {
    const currentData = this.getData(entityType)
    const initialLength = currentData.length
    
    const filteredData = currentData.filter((item: any) => !ids.includes(item.id))
    this.setData(entityType, filteredData)
    
    return initialLength - filteredData.length
  }

  bulkUpdate<T extends EntityType>(entityType: T, updates: Array<{ id: string; data: any }>): any[] {
    const currentData = this.getData(entityType)
    const updatedItems: any[] = []
    
    updates.forEach(({ id, data }) => {
      const itemIndex = currentData.findIndex((item: any) => item.id === id)
      if (itemIndex !== -1) {
        currentData[itemIndex] = {
          ...currentData[itemIndex],
          ...data,
          updatedAt: new Date().toISOString()
        }
        updatedItems.push(currentData[itemIndex])
      }
    })
    
    this.setData(entityType, currentData)
    return updatedItems
  }

  // Clear all data (for testing/reset)
  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
    this.cache = {}
    this.isInitialized = false
  }

  // Export data for backup
  exportData(): string {
    return JSON.stringify({
      data: this.cache,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }, null, 2)
  }

  // Import data from backup
  importData(jsonData: string): boolean {
    try {
      const { data } = JSON.parse(jsonData)
      this.cache = data
      this.saveAllToStorage()
      return true
    } catch (error) {
      console.error('Failed to import data:', error)
      return false
    }
  }
}

// Export singleton instance
export const mswDataPersistence = MSWDataPersistence.getInstance()