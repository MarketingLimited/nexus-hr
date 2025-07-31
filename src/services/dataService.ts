import { api, ApiResponse, PaginatedResponse } from './api'
import { Employee } from '../mocks/data/employees'
import { Department } from '../mocks/data/departments'
import { LeaveRequest, LeaveType, LeaveBalance } from '../mocks/data/leave'
import { Payslip, SalaryStructure, PayrollRun } from '../mocks/data/payroll'
import { User } from '../mocks/data/auth'

// Employee Services
export const employeeService = {
  getAll: (params?: {
    search?: string
    department?: string
    status?: string
    page?: number
    limit?: number
  }) => api.get<PaginatedResponse<Employee>>('/employees', params as Record<string, string>),
  
  getById: (id: string) => api.get<ApiResponse<Employee>>(`/employees/${id}`),
  
  create: (data: Partial<Employee>) => api.post<ApiResponse<Employee>>('/employees', data),
  
  update: (id: string, data: Partial<Employee>) => api.put<ApiResponse<Employee>>(`/employees/${id}`, data),
  
  delete: (id: string) => api.delete<ApiResponse<{ message: string }>>(`/employees/${id}`),
  
  getStats: () => api.get<ApiResponse<{
    total: number
    active: number
    inactive: number
    terminated: number
    byDepartment: Record<string, number>
    byLocation: Record<string, number>
  }>>('/employees/stats'),
}

// Department Services
export const departmentService = {
  getAll: (params?: { search?: string; location?: string }) => 
    api.get<ApiResponse<Department[]>>('/departments', params as Record<string, string>),
  
  getById: (id: string) => api.get<ApiResponse<Department>>(`/departments/${id}`),
  
  create: (data: Partial<Department>) => api.post<ApiResponse<Department>>('/departments', data),
  
  update: (id: string, data: Partial<Department>) => api.put<ApiResponse<Department>>(`/departments/${id}`, data),
  
  delete: (id: string) => api.delete<ApiResponse<{ message: string }>>(`/departments/${id}`),
  
  getHierarchy: () => api.get<ApiResponse<any[]>>('/departments/hierarchy'),
}

// Leave Services
export const leaveService = {
  getTypes: () => api.get<ApiResponse<LeaveType[]>>('/leave/types'),
  
  createType: (data: Partial<LeaveType>) => api.post<ApiResponse<LeaveType>>('/leave/types', data),
  
  getRequests: (params?: {
    employeeId?: string
    status?: string
    startDate?: string
    endDate?: string
  }) => api.get<ApiResponse<LeaveRequest[]>>('/leave/requests', params as Record<string, string>),
  
  getRequestById: (id: string) => api.get<ApiResponse<LeaveRequest>>(`/leave/requests/${id}`),
  
  createRequest: (data: Partial<LeaveRequest>) => api.post<ApiResponse<LeaveRequest>>('/leave/requests', data),
  
  updateRequest: (id: string, data: Partial<LeaveRequest>) => api.put<ApiResponse<LeaveRequest>>(`/leave/requests/${id}`, data),
  
  approveRequest: (id: string, data: { approvedBy: string; comments?: string }) => 
    api.post<ApiResponse<LeaveRequest>>(`/leave/requests/${id}/approve`, data),
  
  rejectRequest: (id: string, data: { rejectedBy: string; comments: string }) => 
    api.post<ApiResponse<LeaveRequest>>(`/leave/requests/${id}/reject`, data),
  
  getBalances: (params?: { employeeId?: string; year?: string }) => 
    api.get<ApiResponse<LeaveBalance[]>>('/leave/balances', params as Record<string, string>),
  
  updateBalance: (id: string, data: Partial<LeaveBalance>) => 
    api.put<ApiResponse<LeaveBalance>>(`/leave/balances/${id}`, data),
  
  getStats: (params?: { year?: string }) => 
    api.get<ApiResponse<{
      totalRequests: number
      pending: number
      approved: number
      rejected: number
      cancelled: number
      totalDays: number
      byType: Array<{ type: string; count: number; days: number }>
    }>>('/leave/stats', params as Record<string, string>),
}

// Payroll Services
export const payrollService = {
  getSalaryStructures: (params?: { employeeId?: string }) => 
    api.get<ApiResponse<SalaryStructure[]>>('/payroll/salary-structures', params as Record<string, string>),
  
  getSalaryStructureById: (id: string) => api.get<ApiResponse<SalaryStructure>>(`/payroll/salary-structures/${id}`),
  
  createSalaryStructure: (data: Partial<SalaryStructure>) => 
    api.post<ApiResponse<SalaryStructure>>('/payroll/salary-structures', data),
  
  updateSalaryStructure: (id: string, data: Partial<SalaryStructure>) => 
    api.put<ApiResponse<SalaryStructure>>(`/payroll/salary-structures/${id}`, data),
  
  getPayslips: (params?: {
    employeeId?: string
    payPeriod?: string
    status?: string
    year?: string
  }) => api.get<ApiResponse<Payslip[]>>('/payroll/payslips', params as Record<string, string>),
  
  getPayslipById: (id: string) => api.get<ApiResponse<Payslip>>(`/payroll/payslips/${id}`),
  
  createPayslip: (data: Partial<Payslip>) => api.post<ApiResponse<Payslip>>('/payroll/payslips', data),
  
  updatePayslip: (id: string, data: Partial<Payslip>) => api.put<ApiResponse<Payslip>>(`/payroll/payslips/${id}`, data),
  
  getTaxBrackets: () => api.get<ApiResponse<any[]>>('/payroll/tax-brackets'),
  
  calculateTax: (grossSalary: number) => 
    api.post<ApiResponse<{ grossSalary: number; tax: number; netSalary: number }>>('/payroll/calculate-tax', { grossSalary }),
  
  getRuns: (params?: { year?: string; status?: string }) => 
    api.get<ApiResponse<PayrollRun[]>>('/payroll/runs', params as Record<string, string>),
  
  getRunById: (id: string) => api.get<ApiResponse<PayrollRun>>(`/payroll/runs/${id}`),
  
  createRun: (data: Partial<PayrollRun>) => api.post<ApiResponse<PayrollRun>>('/payroll/runs', data),
  
  updateRun: (id: string, data: Partial<PayrollRun>) => api.put<ApiResponse<PayrollRun>>(`/payroll/runs/${id}`, data),
  
  getStats: (params?: { year?: string; month?: string }) => 
    api.get<ApiResponse<{
      totalGrossSalary: number
      totalNetSalary: number
      totalDeductions: number
      totalAllowances: number
      averageSalary: number
      employeeCount: number
    }>>('/payroll/stats', params as Record<string, string>),
}

// Auth Services
export const authService = {
  login: (credentials: { email:string; password: string }) =>
    api.post<ApiResponse<{
      user: User
      session: { token: string; refreshToken: string; expiresAt: string }
    }>>('/api/auth/login', credentials),
  
  logout: () => api.post<ApiResponse<{ message: string }>>('/auth/logout'),
  
  refresh: (refreshToken: string) => 
    api.post<ApiResponse<{ token: string; refreshToken: string; expiresAt: string }>>('/auth/refresh', { refreshToken }),
  
  getCurrentUser: () => api.get<ApiResponse<User>>('/auth/me'),
  
  getUsers: (params?: { role?: string; status?: string; search?: string }) => 
    api.get<ApiResponse<User[]>>('/auth/users', params as Record<string, string>),
  
  getUserById: (id: string) => api.get<ApiResponse<User>>(`/auth/users/${id}`),
  
  createUser: (data: Partial<User>) => api.post<ApiResponse<User>>('/auth/users', data),
  
  updateUser: (id: string, data: Partial<User>) => api.put<ApiResponse<User>>(`/auth/users/${id}`, data),
  
  deleteUser: (id: string) => api.delete<ApiResponse<{ message: string }>>(`/auth/users/${id}`),
  
  changePassword: (data: { currentPassword: string; newPassword: string }) => 
    api.post<ApiResponse<{ message: string }>>('/auth/change-password', data),
  
  forgotPassword: (email: string) => 
    api.post<ApiResponse<{ message: string; resetToken: string }>>('/auth/forgot-password', { email }),
  
  getRoles: () => api.get<ApiResponse<any[]>>('/auth/roles'),
  
  getPermissions: (params?: { role?: string }) => 
    api.get<ApiResponse<any[]>>('/auth/permissions', params as Record<string, string>),
}

// Health Check
export const healthService = {
  check: () => api.get<{ status: string; timestamp: string }>('/health'),
}