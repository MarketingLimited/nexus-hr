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
    return this.loadData<EmployeeData>('employees', '/src/data/employees.json');
  }

  async loadDepartments(): Promise<DepartmentData> {
    return this.loadData<DepartmentData>('departments', '/src/data/departments.json');
  }

  async loadLeave(): Promise<LeaveData> {
    return this.loadData<LeaveData>('leave', '/src/data/leave.json');
  }

  async loadPayroll(): Promise<PayrollData> {
    return this.loadData<PayrollData>('payroll', '/src/data/payroll.json');
  }

  async loadPerformance(): Promise<PerformanceData> {
    return this.loadData<PerformanceData>('performance', '/src/data/performance.json');
  }

  async loadAttendance(): Promise<AttendanceData> {
    return this.loadData<AttendanceData>('attendance', '/src/data/attendance.json');
  }

  async loadNotifications(): Promise<NotificationData> {
    return this.loadData<NotificationData>('notifications', '/src/data/notifications.json');
  }

  async loadOnboarding(): Promise<OnboardingData> {
    return this.loadData<OnboardingData>('onboarding', '/src/data/onboarding.json');
  }

  async loadAssets(): Promise<AssetData> {
    return this.loadData<AssetData>('assets', '/src/data/assets.json');
  }

  async loadRoles(): Promise<RoleData> {
    return this.loadData<RoleData>('roles', '/src/data/roles.json');
  }

  async loadConfig(): Promise<ConfigData> {
    return this.loadData<ConfigData>('config', '/src/data/config.json');
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

  // Search functionality
  async searchEmployees(query: string): Promise<any[]> {
    const data = await this.loadEmployees();
    const searchTerm = query.toLowerCase();
    
    return data.employees.filter(employee => 
      employee.personalInfo.firstName.toLowerCase().includes(searchTerm) ||
      employee.personalInfo.lastName.toLowerCase().includes(searchTerm) ||
      employee.personalInfo.email.toLowerCase().includes(searchTerm) ||
      employee.employmentInfo.position.toLowerCase().includes(searchTerm) ||
      employee.employmentInfo.department.toLowerCase().includes(searchTerm)
    );
  }

  async getEmployeesByDepartment(departmentId: string): Promise<any[]> {
    const data = await this.loadEmployees();
    return data.employees.filter(employee => 
      employee.employmentInfo.department === departmentId
    );
  }

  async getEmployeeById(employeeId: string): Promise<any | null> {
    const data = await this.loadEmployees();
    return data.employees.find(employee => employee.id === employeeId) || null;
  }

  async getLeaveRequestsByEmployee(employeeId: string): Promise<any[]> {
    const data = await this.loadLeave();
    return data.leaveRequests.filter(request => request.employeeId === employeeId);
  }

  async getLeaveBalancesByEmployee(employeeId: string): Promise<any[]> {
    const data = await this.loadLeave();
    return data.leaveBalances.filter(balance => balance.employeeId === employeeId);
  }
}

export const dataService = new DataService();