// Type definitions for Nexus HR Frontend

// ============================================================================
// User & Authentication Types
// ============================================================================

export type UserRole = 'ADMIN' | 'HR' | 'MANAGER' | 'EMPLOYEE';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ============================================================================
// Employee Types
// ============================================================================

export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED';

export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  position: string;
  department: string;
  location: string;
  hireDate: string;
  salary?: number | null;
  manager?: string | null;
  skills: string[];
  status: EmployeeStatus;
  avatar?: string;
  notes?: string;
  bio?: string;
  joinDate?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

// ============================================================================
// Leave Types
// ============================================================================

export type LeaveType =
  | 'ANNUAL'
  | 'SICK'
  | 'PERSONAL'
  | 'MATERNITY'
  | 'PATERNITY'
  | 'UNPAID'
  | 'BEREAVEMENT';

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  approverId?: string | null;
  approvedAt?: string | null;
  approverComments?: string | null;
  createdAt: string;
  updatedAt: string;
  employee?: Employee;
  approver?: Employee;
}

export interface LeaveBalance {
  id: string;
  employeeId: string;
  year: number;
  leaveType: LeaveType;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Attendance Types
// ============================================================================

export type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT' | 'ON_LEAVE';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  clockIn?: string | null;
  clockOut?: string | null;
  status: AttendanceStatus;
  workHours?: number | null;
  breakMinutes: number;
  location?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  employee?: Employee;
}

// ============================================================================
// Performance Types
// ============================================================================

export type PerformanceStatus = 'PENDING' | 'COMPLETED' | 'ARCHIVED';

export interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewerId: string;
  reviewDate: string;
  reviewPeriodStart: string;
  reviewPeriodEnd: string;
  overallRating: number;
  strengths?: string | null;
  areasForImprovement?: string | null;
  goals?: string | null;
  comments?: string | null;
  status: PerformanceStatus;
  createdAt: string;
  updatedAt: string;
  employee?: Employee;
  reviewer?: Employee;
}

export type GoalStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Goal {
  id: string;
  employeeId: string;
  title: string;
  description?: string | null;
  targetDate: string;
  status: GoalStatus;
  progress: number;
  createdAt: string;
  updatedAt: string;
  employee?: Employee;
}

export type FeedbackType = 'POSITIVE' | 'CONSTRUCTIVE' | 'GENERAL';
export type FeedbackStatus = 'DRAFT' | 'SUBMITTED' | 'ACKNOWLEDGED';

export interface Feedback {
  id: string;
  fromEmployeeId: string;
  toEmployeeId: string;
  type: FeedbackType;
  content: string;
  status: FeedbackStatus;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
  fromEmployee?: Employee;
  toEmployee?: Employee;
}

// ============================================================================
// Payroll Types
// ============================================================================

export type PayrollStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'CANCELLED';

export interface PayrollRecord {
  id: string;
  employeeId: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
  taxAmount: number;
  bonus: number;
  grossSalary: number;
  netSalary: number;
  status: PayrollStatus;
  paymentDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  employee?: Employee;
}

// ============================================================================
// Document Types
// ============================================================================

export type DocumentType = 'CONTRACT' | 'POLICY' | 'FORM' | 'CERTIFICATE' | 'OTHER';
export type DocumentCategory = 'HR' | 'LEGAL' | 'PERSONAL' | 'COMPANY';

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  category: DocumentCategory;
  filePath: string;
  fileSize: number;
  mimeType: string;
  employeeId: string;
  uploadedBy: string;
  isConfidential: boolean;
  expiryDate?: string | null;
  tags: string[];
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
  employee?: Employee;
  uploader?: User;
  permissions?: DocumentPermission[];
}

export interface DocumentPermission {
  id: string;
  documentId: string;
  employeeId: string;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface PaginatedResponse<T> {
  status: 'success' | 'error';
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ============================================================================
// Filter & Query Types
// ============================================================================

export interface EmployeeFilters {
  search?: string;
  department?: string;
  status?: EmployeeStatus;
  position?: string;
  location?: string;
  page?: number;
  limit?: number;
}

export interface LeaveFilters {
  employeeId?: string;
  status?: LeaveStatus;
  leaveType?: LeaveType;
  startDate?: string;
  endDate?: string;
}

export interface AttendanceFilters {
  employeeId?: string;
  startDate?: string;
  endDate?: string;
  status?: AttendanceStatus;
}

export interface PerformanceFilters {
  employeeId?: string;
  status?: PerformanceStatus;
  year?: number;
}

// ============================================================================
// Analytics & Dashboard Types
// ============================================================================

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  pendingLeaveRequests: number;
  upcomingReviews: number;
  attendanceRate: number;
  averageSalary: number;
}

export interface AnalyticsData<T = unknown> {
  period: string;
  value: number;
  data?: T;
  metadata?: Record<string, unknown>;
}

export interface GroupedData<T> {
  [key: string]: T[];
}

export interface TrendData {
  period: string;
  value: number;
  change?: number;
  changePercent?: number;
}

// ============================================================================
// Form & UI Types
// ============================================================================

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

// ============================================================================
// Utility Types
// ============================================================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type PartialFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// ============================================================================
// Error Types
// ============================================================================

export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: Record<string, unknown>;
}

// ============================================================================
// Monitoring & Performance Types
// ============================================================================

export interface PerformanceMetrics {
  name: string;
  value: number;
  unit: string;
  timestamp: string;
}

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    name: string;
    status: 'pass' | 'fail';
    message?: string;
  }[];
}
