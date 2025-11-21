import { z } from 'zod';

// Auth schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  role: z.enum(['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Employee schemas
export const createEmployeeSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Invalid email format'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format').optional(),
  position: z.string().min(1, 'Position is required'),
  department: z.string().min(1, 'Department is required'),
  location: z.string().min(1, 'Location is required'),
  hireDate: z.string().datetime().or(z.date()),
  salary: z.number().positive('Salary must be positive').optional(),
  manager: z.string().optional(),
  skills: z.array(z.string()).optional(),
});

export const updateEmployeeSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  email: z.string().email().optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  position: z.string().min(1).optional(),
  department: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  hireDate: z.string().datetime().or(z.date()).optional(),
  salary: z.number().positive().optional(),
  manager: z.string().optional(),
  skills: z.array(z.string()).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED']).optional(),
});

// Attendance schemas
export const clockInSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  location: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export const clockOutSchema = z.object({
  attendanceId: z.string().min(1, 'Attendance ID is required'),
  notes: z.string().max(500).optional(),
});

export const attendanceQuerySchema = z.object({
  employeeId: z.string().optional(),
  startDate: z.string().datetime().or(z.date()).optional(),
  endDate: z.string().datetime().or(z.date()).optional(),
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE']).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

// Performance schemas
export const createReviewSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  reviewerId: z.string().min(1, 'Reviewer ID is required'),
  reviewType: z.enum(['ANNUAL', 'QUARTERLY', 'PROBATION', 'PROJECT']),
  reviewPeriodStart: z.string().datetime().or(z.date()),
  reviewPeriodEnd: z.string().datetime().or(z.date()),
  overallRating: z.number().min(1).max(5).optional(),
  strengths: z.string().max(2000).optional(),
  areasForImprovement: z.string().max(2000).optional(),
  goals: z.string().max(2000).optional(),
  comments: z.string().max(2000).optional(),
});

export const createFeedbackSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  giverId: z.string().min(1, 'Giver ID is required'),
  feedbackType: z.enum(['POSITIVE', 'CONSTRUCTIVE', 'GENERAL']),
  content: z.string().min(10, 'Feedback must be at least 10 characters').max(2000),
  isAnonymous: z.boolean().optional(),
});

export const createGoalSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  targetDate: z.string().datetime().or(z.date()),
  category: z.enum(['PERFORMANCE', 'DEVELOPMENT', 'BEHAVIORAL', 'PROJECT']),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  progress: z.number().min(0).max(100).optional(),
});

// Leave schemas
export const createLeaveRequestSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  leaveType: z.enum(['ANNUAL', 'SICK', 'PERSONAL', 'MATERNITY', 'PATERNITY', 'UNPAID', 'BEREAVEMENT']),
  startDate: z.string().datetime().or(z.date()),
  endDate: z.string().datetime().or(z.date()),
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(1000),
  isHalfDay: z.boolean().optional(),
});

export const leaveActionSchema = z.object({
  approverId: z.string().min(1, 'Approver ID is required'),
  comments: z.string().max(500).optional(),
});

// Payroll schemas
export const processPayrollSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  payPeriodStart: z.string().datetime().or(z.date()),
  payPeriodEnd: z.string().datetime().or(z.date()),
  baseSalary: z.number().positive('Base salary must be positive'),
  allowances: z.number().nonnegative('Allowances cannot be negative').optional(),
  deductions: z.number().nonnegative('Deductions cannot be negative').optional(),
  taxAmount: z.number().nonnegative('Tax amount cannot be negative').optional(),
  bonus: z.number().nonnegative('Bonus cannot be negative').optional(),
});

// Document schemas
export const createDocumentSchema = z.object({
  employeeId: z.string().optional(),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  category: z.enum(['CONTRACT', 'POLICY', 'CERTIFICATE', 'ID', 'PAYSLIP', 'PERFORMANCE', 'OTHER']),
  tags: z.array(z.string()).optional(),
});

// Onboarding schemas
export const createOnboardingChecklistSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  templateId: z.string().optional(),
  startDate: z.string().datetime().or(z.date()),
  expectedCompletionDate: z.string().datetime().or(z.date()),
});

export const updateOnboardingTaskSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED']),
  notes: z.string().max(1000).optional(),
  completedBy: z.string().optional(),
});

// Asset schemas
export const createAssetSchema = z.object({
  name: z.string().min(1, 'Asset name is required').max(200),
  category: z.enum(['LAPTOP', 'PHONE', 'TABLET', 'MONITOR', 'KEYBOARD', 'MOUSE', 'HEADSET', 'OTHER']),
  serialNumber: z.string().min(1, 'Serial number is required').max(100),
  purchaseDate: z.string().datetime().or(z.date()),
  purchasePrice: z.number().positive('Purchase price must be positive'),
  status: z.enum(['AVAILABLE', 'ASSIGNED', 'UNDER_REPAIR', 'RETIRED']).optional(),
  description: z.string().max(1000).optional(),
});

export const assignAssetSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  assignedDate: z.string().datetime().or(z.date()).optional(),
  notes: z.string().max(500).optional(),
});

export const returnAssetSchema = z.object({
  returnDate: z.string().datetime().or(z.date()).optional(),
  condition: z.string().max(500).optional(),
  notes: z.string().max(500).optional(),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
