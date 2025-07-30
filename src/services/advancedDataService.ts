import { dataService } from './dataService';
import {
  EmployeeData,
  DepartmentData,
  LeaveData,
  PayrollData,
  PerformanceData,
  AttendanceData,
  Employee,
  LeaveRequest,
  PerformanceReview
} from '../types';

// Audit Trail Interface
export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: Date;
  changes: Record<string, { old: any; new: any }>;
  metadata?: Record<string, any>;
}

// Advanced Search Filters
export interface AdvancedSearchFilters {
  query?: string;
  departments?: string[];
  positions?: string[];
  dateRange?: { start: Date; end: Date };
  status?: string[];
  salary?: { min: number; max: number };
  performance?: { min: number; max: number };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Bulk Operation Types
export interface BulkOperation {
  type: 'update' | 'delete' | 'create';
  entityType: string;
  entities: any[];
  changes?: Record<string, any>;
}

export interface BulkOperationResult {
  success: boolean;
  processed: number;
  failed: number;
  errors: string[];
  auditLogIds: string[];
}

class AdvancedDataService {
  private auditLog: AuditLogEntry[] = [];

  // Advanced Search Across All Data
  async advancedSearch(filters: AdvancedSearchFilters): Promise<{
    employees: Employee[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const employeeData = await dataService.loadEmployees();
    const departmentData = await dataService.loadDepartments();
    const performanceData = await dataService.loadPerformance();
    
    let results = [...employeeData.employees];

    // Apply filters
    if (filters.query) {
      const query = filters.query.toLowerCase();
      results = results.filter(emp => 
        emp.personalInfo.firstName.toLowerCase().includes(query) ||
        emp.personalInfo.lastName.toLowerCase().includes(query) ||
        emp.personalInfo.email.toLowerCase().includes(query) ||
        emp.employmentInfo.position.toLowerCase().includes(query) ||
        emp.employmentInfo.department.toLowerCase().includes(query)
      );
    }

    if (filters.departments && filters.departments.length > 0) {
      results = results.filter(emp => 
        filters.departments!.includes(emp.employmentInfo.department)
      );
    }

    if (filters.positions && filters.positions.length > 0) {
      results = results.filter(emp => 
        filters.positions!.includes(emp.employmentInfo.position)
      );
    }

    if (filters.status && filters.status.length > 0) {
      results = results.filter(emp => 
        filters.status!.includes(emp.employmentInfo.status)
      );
    }

    if (filters.salary) {
      results = results.filter(emp => {
        const salary = emp.employmentInfo.salary;
        return salary >= filters.salary!.min && salary <= filters.salary!.max;
      });
    }

    if (filters.dateRange) {
      results = results.filter(emp => {
        const startDate = new Date(emp.employmentInfo.startDate);
        return startDate >= filters.dateRange!.start && startDate <= filters.dateRange!.end;
      });
    }

    // Apply sorting
    if (filters.sortBy) {
      results.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (filters.sortBy) {
          case 'name':
            aValue = `${a.personalInfo.firstName} ${a.personalInfo.lastName}`;
            bValue = `${b.personalInfo.firstName} ${b.personalInfo.lastName}`;
            break;
          case 'department':
            aValue = a.employmentInfo.department;
            bValue = b.employmentInfo.department;
            break;
          case 'position':
            aValue = a.employmentInfo.position;
            bValue = b.employmentInfo.position;
            break;
          case 'salary':
            aValue = a.employmentInfo.salary;
            bValue = b.employmentInfo.salary;
            break;
          case 'startDate':
            aValue = new Date(a.employmentInfo.startDate);
            bValue = new Date(b.employmentInfo.startDate);
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return {
      employees: results,
      total: results.length,
      page: 1,
      totalPages: 1
    };
  }

  // Data Export Functionality
  async exportData(
    dataType: string,
    format: 'csv' | 'json' | 'xlsx',
    filters?: AdvancedSearchFilters
  ): Promise<Blob> {
    let data: any;
    
    switch (dataType) {
      case 'employees':
        if (filters) {
          const searchResult = await this.advancedSearch(filters);
          data = searchResult.employees;
        } else {
          const employeeData = await dataService.loadEmployees();
          data = employeeData.employees;
        }
        break;
      case 'departments':
        const departmentData = await dataService.loadDepartments();
        data = departmentData.departments;
        break;
      case 'leave':
        const leaveData = await dataService.loadLeave();
        data = leaveData.leaveRequests;
        break;
      case 'payroll':
        const payrollData = await dataService.loadPayroll();
        data = payrollData.payslips;
        break;
      default:
        throw new Error(`Unsupported data type: ${dataType}`);
    }

    switch (format) {
      case 'json':
        return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      case 'csv':
        return this.convertToCSV(data);
      case 'xlsx':
        // For now, return as CSV. In a real app, you'd use a library like xlsx
        return this.convertToCSV(data);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private convertToCSV(data: any[]): Blob {
    if (!data.length) return new Blob([''], { type: 'text/csv' });

    const headers = Object.keys(this.flattenObject(data[0]));
    const csvRows = [headers.join(',')];

    for (const row of data) {
      const flatRow = this.flattenObject(row);
      const values = headers.map(header => {
        const value = flatRow[header];
        return typeof value === 'string' ? `"${value}"` : value;
      });
      csvRows.push(values.join(','));
    }

    return new Blob([csvRows.join('\n')], { type: 'text/csv' });
  }

  private flattenObject(obj: any, prefix = ''): Record<string, any> {
    const flattened: Record<string, any> = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          Object.assign(flattened, this.flattenObject(obj[key], newKey));
        } else {
          flattened[newKey] = obj[key];
        }
      }
    }
    
    return flattened;
  }

  // Bulk Operations
  async performBulkOperation(operation: BulkOperation): Promise<BulkOperationResult> {
    const result: BulkOperationResult = {
      success: false,
      processed: 0,
      failed: 0,
      errors: [],
      auditLogIds: []
    };

    try {
      for (const entity of operation.entities) {
        try {
          const auditId = await this.logAuditEntry({
            action: operation.type,
            entityType: operation.entityType,
            entityId: entity.id || 'bulk_operation',
            userId: 'system', // In real app, get from auth context
            changes: operation.changes || {},
            metadata: { bulkOperation: true }
          });
          
          result.auditLogIds.push(auditId);
          result.processed++;
        } catch (error) {
          result.failed++;
          result.errors.push(`Failed to process entity ${entity.id}: ${error}`);
        }
      }

      result.success = result.failed === 0;
      return result;
    } catch (error) {
      result.errors.push(`Bulk operation failed: ${error}`);
      return result;
    }
  }

  // Data Validation
  validateEmployeeData(employee: Employee): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields validation
    if (!employee.personalInfo.firstName?.trim()) {
      errors.push('First name is required');
    }
    if (!employee.personalInfo.lastName?.trim()) {
      errors.push('Last name is required');
    }
    if (!employee.personalInfo.email?.trim()) {
      errors.push('Email is required');
    }
    if (!employee.employmentInfo.department?.trim()) {
      errors.push('Department is required');
    }
    if (!employee.employmentInfo.position?.trim()) {
      errors.push('Position is required');
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (employee.personalInfo.email && !emailRegex.test(employee.personalInfo.email)) {
      errors.push('Invalid email format');
    }

    // Salary validation
    if (employee.employmentInfo.salary < 0) {
      errors.push('Salary must be positive');
    }

    // Date validation
    const startDate = new Date(employee.employmentInfo.startDate);
    if (startDate > new Date()) {
      errors.push('Start date cannot be in the future');
    }

    return { valid: errors.length === 0, errors };
  }

  validateLeaveRequest(request: LeaveRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.employeeId?.trim()) {
      errors.push('Employee ID is required');
    }
    if (!request.leaveType?.trim()) {
      errors.push('Leave type is required');
    }
    if (!request.startDate) {
      errors.push('Start date is required');
    }
    if (!request.endDate) {
      errors.push('End date is required');
    }

    if (request.startDate && request.endDate) {
      const start = new Date(request.startDate);
      const end = new Date(request.endDate);
      
      if (end < start) {
        errors.push('End date must be after start date');
      }
      if (start < new Date()) {
        errors.push('Start date cannot be in the past');
      }
    }

    return { valid: errors.length === 0, errors };
  }

  // Audit Trail Management
  async logAuditEntry(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<string> {
    const auditEntry: AuditLogEntry = {
      ...entry,
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    this.auditLog.push(auditEntry);
    
    // In a real application, this would be persisted to a database
    console.log('Audit Log Entry:', auditEntry);
    
    return auditEntry.id;
  }

  async getAuditLog(filters?: {
    userId?: string;
    entityType?: string;
    entityId?: string;
    dateRange?: { start: Date; end: Date };
  }): Promise<AuditLogEntry[]> {
    let filtered = [...this.auditLog];

    if (filters) {
      if (filters.userId) {
        filtered = filtered.filter(entry => entry.userId === filters.userId);
      }
      if (filters.entityType) {
        filtered = filtered.filter(entry => entry.entityType === filters.entityType);
      }
      if (filters.entityId) {
        filtered = filtered.filter(entry => entry.entityId === filters.entityId);
      }
      if (filters.dateRange) {
        filtered = filtered.filter(entry => 
          entry.timestamp >= filters.dateRange!.start && 
          entry.timestamp <= filters.dateRange!.end
        );
      }
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Real-time Data Synchronization
  private syncCallbacks: Map<string, Function[]> = new Map();

  onDataChange(dataType: string, callback: Function): () => void {
    if (!this.syncCallbacks.has(dataType)) {
      this.syncCallbacks.set(dataType, []);
    }
    this.syncCallbacks.get(dataType)!.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.syncCallbacks.get(dataType);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) callbacks.splice(index, 1);
      }
    };
  }

  private notifyDataChange(dataType: string, data: any): void {
    const callbacks = this.syncCallbacks.get(dataType);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Data Integrity Checks
  async performDataIntegrityCheck(): Promise<{
    valid: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      const [employeeData, departmentData, leaveData] = await Promise.all([
        dataService.loadEmployees(),
        dataService.loadDepartments(),
        dataService.loadLeave()
      ]);

      // Check for orphaned references
      const departmentIds = new Set(departmentData.departments.map(d => d.id));
      const employeeIds = new Set(employeeData.employees.map(e => e.id));

      // Check employee-department references
      employeeData.employees.forEach(emp => {
        if (!departmentIds.has(emp.employmentInfo.department)) {
          issues.push(`Employee ${emp.id} references non-existent department: ${emp.employmentInfo.department}`);
        }
      });

      // Check leave request-employee references
      leaveData.leaveRequests.forEach(request => {
        if (!employeeIds.has(request.employeeId)) {
          issues.push(`Leave request ${request.id} references non-existent employee: ${request.employeeId}`);
        }
      });

      // Performance recommendations
      if (employeeData.employees.length > 1000) {
        recommendations.push('Consider implementing data pagination for large employee datasets');
      }
      
      if (leaveData.leaveRequests.length > 500) {
        recommendations.push('Consider archiving old leave requests to improve performance');
      }

      return {
        valid: issues.length === 0,
        issues,
        recommendations
      };
    } catch (error) {
      return {
        valid: false,
        issues: [`Failed to perform integrity check: ${error}`],
        recommendations: ['Fix data loading issues before running integrity checks']
      };
    }
  }
}

export const advancedDataService = new AdvancedDataService();