// Employee Types
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: Address;
  avatar: string;
}

export interface EmploymentInfo {
  employeeId: string;
  startDate: string;
  position: string;
  department: string;
  manager: string;
  salary: number;
  employmentType: string;
  status: 'active' | 'inactive' | 'terminated';
  workLocation: 'Remote' | 'Office' | 'Hybrid';
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface Employee {
  id: string;
  personalInfo: PersonalInfo;
  employmentInfo: EmploymentInfo;
  skills: string[];
  certifications: string[];
  emergencyContact: EmergencyContact;
}

export interface EmployeeData {
  employees: Employee[];
  statistics: {
    total: number;
    active: number;
    inactive: number;
    newHiresThisMonth: number;
    newHiresThisQuarter: number;
  };
}

// Department Types
export interface Team {
  id: string;
  name: string;
  lead: string;
  members: string[];
}

export interface Department {
  id: string;
  name: string;
  description: string;
  head: string;
  location: string;
  budget: number;
  employeeCount: number;
  teams: Team[];
}

export interface DepartmentData {
  departments: Department[];
  statistics: {
    totalDepartments: number;
    totalTeams: number;
    averageTeamSize: number;
    largestDepartment: string;
  };
}

// Leave Types
export interface LeaveType {
  id: string;
  name: string;
  description: string;
  color: string;
  defaultDays: number;
  carryOverDays: number;
  requiresApproval: boolean;
  advanceNoticeDays: number;
}

export interface LeaveBalance {
  employeeId: string;
  leaveType: string;
  total: number;
  used: number;
  remaining: number;
  carryOver: number;
  expiring: number;
  expiryDate: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  approvedBy?: string;
  approvedDate?: string;
  emergencyContact: {
    name: string;
    phone: string;
  };
}

export interface ApprovalStep {
  step: number;
  role: string;
  required: boolean;
  timeLimit: number;
  conditions?: string[];
}

export interface LeaveData {
  leaveTypes: LeaveType[];
  leaveBalances: LeaveBalance[];
  leaveRequests: LeaveRequest[];
  approvalWorkflow: ApprovalStep[];
  statistics: {
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    averageApprovalTime: number;
    mostUsedLeaveType: string;
  };
}

// Payroll Types
export interface SalaryComponents {
  base: number;
  healthAllowance: number;
  transportAllowance: number;
  mealAllowance: number;
}

export interface Deductions {
  federalTax: number;
  stateTax: number;
  socialSecurity: number;
  medicare: number;
  healthInsurance: number;
  retirement401k: number;
}

export interface SalaryStructure {
  id: string;
  title: string;
  baseSalary: number;
  currency: string;
  payFrequency: string;
  components: SalaryComponents;
  deductions: Deductions;
}

export interface Earnings {
  baseSalary: number;
  healthAllowance: number;
  transportAllowance: number;
  mealAllowance: number;
  overtime: number;
  bonus: number;
}

export interface PayslipDeductions {
  federalTax: number;
  stateTax: number;
  socialSecurity: number;
  medicare: number;
  healthInsurance: number;
  retirement401k: number;
}

export interface Payslip {
  id: string;
  employeeId: string;
  period: string;
  payDate: string;
  earnings: Earnings;
  deductions: PayslipDeductions;
  netPay: number;
  grossPay: number;
  totalDeductions: number;
}

export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
  type: 'federal' | 'state';
}

export interface ProcessingStep {
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  duration: string;
}

export interface PayrollCycle {
  period: string;
  status: 'pending' | 'in_progress' | 'completed';
  employeesProcessed: number;
  totalGrossPay: number;
  totalDeductions: number;
  totalNetPay: number;
  processedDate?: string;
}

export interface PayrollData {
  salaryStructures: SalaryStructure[];
  payslips: Payslip[];
  taxBrackets: TaxBracket[];
  payrollProcessing: {
    currentCycle: PayrollCycle;
    steps: ProcessingStep[];
  };
  statistics: {
    totalPayrollCost: number;
    averageSalary: number;
    totalTaxDeductions: number;
    employeesCount: number;
  };
}

// Performance Types
export interface ActionItem {
  item: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewerId: string;
  period: string;
  type: string;
  status: 'pending' | 'in_progress' | 'completed';
  overallRating: number | null;
  submittedDate: string | null;
  dueDate: string;
  ratings: Record<string, number>;
  comments: Record<string, string>;
  actionItems: ActionItem[];
}

export interface KeyResult {
  id: string;
  description: string;
  completed: boolean;
  dueDate: string;
}

export interface GoalUpdate {
  date: string;
  progress: number;
  comment: string;
}

export interface Goal {
  id: string;
  employeeId: string;
  title: string;
  description: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Planning' | 'In Progress' | 'Completed' | 'On Hold';
  progress: number;
  startDate: string;
  dueDate: string;
  keyResults: KeyResult[];
  updates: GoalUpdate[];
}

export interface Feedback {
  id: string;
  reviewId: string;
  fromEmployeeId: string;
  toEmployeeId: string;
  type: 'manager' | 'peer' | 'subordinate' | 'self' | 'customer';
  submittedDate: string;
  ratings: Record<string, number>;
  comments: string;
}

export interface FeedbackCycle {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'draft';
  participants: string[];
  providers: string[];
  completionRate: number;
}

export interface PerformanceData {
  reviews: PerformanceReview[];
  goals: Goal[];
  feedback: Feedback[];
  feedbackCycles: FeedbackCycle[];
  statistics: {
    totalReviews: number;
    completedReviews: number;
    inProgressReviews: number;
    averageRating: number;
    totalGoals: number;
    goalsInProgress: number;
    goalsCompleted: number;
    averageGoalProgress: number;
    feedbackResponseRate: number;
  };
}

// Attendance Types
export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  breakTime: number;
  totalHours: number;
  status: 'present' | 'absent' | 'late' | 'half-day';
  location: string;
  notes: string;
}

export interface WorkingHours {
  start: string;
  end: string;
}

export interface Schedule {
  employeeId: string;
  workingHours: Record<string, WorkingHours | null>;
  workLocation: string;
  timeZone: string;
}

export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  breakDuration: number;
  daysOfWeek: string[];
}

export interface TimeActivity {
  project: string;
  startTime: string;
  endTime: string;
  duration: number;
  description: string;
}

export interface TimeTracking {
  employeeId: string;
  date: string;
  activities: TimeActivity[];
}

export interface AttendanceData {
  attendanceRecords: AttendanceRecord[];
  schedules: Schedule[];
  shifts: Shift[];
  timeTracking: TimeTracking[];
  statistics: {
    totalEmployees: number;
    presentToday: number;
    absentToday: number;
    lateToday: number;
    averageHoursPerDay: number;
    averageArrivalTime: string;
    attendanceRate: number;
    overtimeHours: number;
    mostCommonLateReason: string;
  };
}

// Other types...
export interface NotificationData {
  notifications: any[];
  notificationTypes: any[];
  notificationSettings: any[];
  statistics: any;
}

export interface OnboardingData {
  taskTemplates: any[];
  newHires: any[];
  onboardingPlans: any[];
  checklistProgress: any[];
  statistics: any;
}

export interface AssetData {
  assets: any[];
  categories: any[];
  assignments: any[];
  maintenanceRecords: any[];
  statistics: any;
}

export interface RoleData {
  roles: any[];
  permissions: any[];
  userRoles: any[];
  roleHierarchy: any;
}

export interface ConfigData {
  company: any;
  application: any;
  features: any;
  workingDays: any;
  workingHours: any;
  holidays: any[];
  leavePolicy: any;
  payrollSettings: any;
  performanceSettings: any;
  attendanceSettings: any;
  security: any;
  notifications: any;
  integrations: any;
}
