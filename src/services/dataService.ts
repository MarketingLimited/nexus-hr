import {
  EmployeeData,
  DepartmentData,
  LeaveData,
  PayrollData,
  PerformanceData,
  AttendanceData,
  NotificationData,
  OnboardingData,
  AssetData,
  RoleData,
  ConfigData
} from '../types';

class DataService {
  private cache = new Map<string, any>();
  private loadingPromises = new Map<string, Promise<any>>();

  async loadEmployees(): Promise<EmployeeData> {
    return this.loadData<EmployeeData>('employees', '/api/employees');
  }

  async loadDepartments(): Promise<DepartmentData> {
    return this.loadData<DepartmentData>('departments', '/api/departments');
  }

  async loadLeave(): Promise<LeaveData> {
    return this.loadData<LeaveData>('leave', '/api/leave/requests');
  }

  async loadPayroll(): Promise<PayrollData> {
    return this.loadData<PayrollData>('payroll', '/api/payroll/payslips');
  }

  async loadPerformance(): Promise<PerformanceData> {
    return this.loadData<PerformanceData>('performance', '/api/performance/reviews');
  }

  async loadAttendance(): Promise<AttendanceData> {
    return this.loadData<AttendanceData>('attendance', '/api/attendance/records');
  }

  async loadNotifications(): Promise<NotificationData> {
    return this.loadData<NotificationData>('notifications', '/api/notifications');
  }

  async loadOnboarding(): Promise<OnboardingData> {
    return this.loadData<OnboardingData>('onboarding', '/api/onboarding');
  }

  async loadAssets(): Promise<AssetData> {
    return this.loadData<AssetData>('assets', '/api/assets');
  }

  async loadRoles(): Promise<RoleData> {
    return this.loadData<RoleData>('roles', '/api/roles');
  }

  async loadConfig(): Promise<ConfigData> {
    return this.loadData<ConfigData>('config', '/api/config');
  }

  private async loadData<T>(key: string, path: string): Promise<T> {
    // Return cached data if available
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    // Return existing loading promise if in progress
    if (this.loadingPromises.has(key)) {
      return this.loadingPromises.get(key);
    }

    // Create new loading promise
    const loadingPromise = this.fetchData<T>(path);
    this.loadingPromises.set(key, loadingPromise);

    try {
      const data = await loadingPromise;
      this.cache.set(key, data);
      this.loadingPromises.delete(key);
      return data;
    } catch (error) {
      this.loadingPromises.delete(key);
      throw error;
    }
  }

  private async fetchData<T>(path: string): Promise<T> {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`Failed to load data from ${path}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error loading data from ${path}:`, error);
      throw new Error(`Failed to load data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Cache management methods
  clearCache(): void {
    this.cache.clear();
  }

  clearCacheKey(key: string): void {
    this.cache.delete(key);
  }

  invalidateAndReload<T>(key: string, path: string): Promise<T> {
    this.clearCacheKey(key);
    return this.loadData<T>(key, path);
  }

  // Utility methods for data operations
  async updateEmployeeData(updatedData: EmployeeData): Promise<void> {
    this.cache.set('employees', updatedData);
    // In a real application, this would also persist to backend
  }

  async updateLeaveData(updatedData: LeaveData): Promise<void> {
    this.cache.set('leave', updatedData);
    // In a real application, this would also persist to backend
  }

  async updatePerformanceData(updatedData: PerformanceData): Promise<void> {
    this.cache.set('performance', updatedData);
    // In a real application, this would also persist to backend
  }

  async updateAttendanceData(updatedData: AttendanceData): Promise<void> {
    this.cache.set('attendance', updatedData);
    // In a real application, this would also persist to backend
  }

  async updatePayrollData(updatedData: PayrollData): Promise<void> {
    this.cache.set('payroll', updatedData);
    // In a real application, this would also persist to backend
  }

  // Search functionality using API endpoints
  async searchEmployees(query: string): Promise<any[]> {
    try {
      const response = await fetch(`/api/employees/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error searching employees:', error);
      throw error;
    }
  }

  async getEmployeesByDepartment(departmentId: string): Promise<any[]> {
    try {
      const response = await fetch(`/api/employees?department=${encodeURIComponent(departmentId)}`);
      if (!response.ok) {
        throw new Error(`Failed to get employees by department: ${response.statusText}`);
      }
      const data = await response.json();
      return data.employees || [];
    } catch (error) {
      console.error('Error getting employees by department:', error);
      throw error;
    }
  }

  async getEmployeeById(employeeId: string): Promise<any | null> {
    try {
      const response = await fetch(`/api/employees/${employeeId}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Failed to get employee: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error getting employee by ID:', error);
      throw error;
    }
  }

  async getLeaveRequestsByEmployee(employeeId: string): Promise<any[]> {
    try {
      const response = await fetch(`/api/leave/requests?employeeId=${encodeURIComponent(employeeId)}`);
      if (!response.ok) {
        throw new Error(`Failed to get leave requests: ${response.statusText}`);
      }
      const data = await response.json();
      return data.leaveRequests || [];
    } catch (error) {
      console.error('Error getting leave requests:', error);
      throw error;
    }
  }

  async getLeaveBalancesByEmployee(employeeId: string): Promise<any[]> {
    try {
      const response = await fetch(`/api/leave/balances?employeeId=${encodeURIComponent(employeeId)}`);
      if (!response.ok) {
        throw new Error(`Failed to get leave balances: ${response.statusText}`);
      }
      const data = await response.json();
      return data.leaveBalances || [];
    } catch (error) {
      console.error('Error getting leave balances:', error);
      throw error;
    }
  }

  // Create/Update methods for CRUD operations
  async createEmployee(employeeData: any): Promise<any> {
    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeData)
      });
      if (!response.ok) {
        throw new Error(`Failed to create employee: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  }

  async updateEmployee(employeeId: string, updates: any): Promise<any> {
    try {
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) {
        throw new Error(`Failed to update employee: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  }

  async deleteEmployee(employeeId: string): Promise<void> {
    try {
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error(`Failed to delete employee: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      throw error;
    }
  }
}

export const dataService = new DataService();