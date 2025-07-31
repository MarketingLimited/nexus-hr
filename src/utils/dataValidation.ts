import { z } from 'zod';

// Data validation schemas
export const EmployeeSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  department: z.string().min(1),
  position: z.string().min(1),
  status: z.enum(['active', 'inactive', 'terminated']),
  startDate: z.string().datetime(),
  salary: z.number().positive().optional(),
  managerId: z.string().uuid().optional(),
  location: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const DepartmentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  managerId: z.string().uuid().optional(),
  location: z.string().optional(),
  budget: z.number().positive().optional(),
  headcount: z.number().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const LeaveRequestSchema = z.object({
  id: z.string().uuid(),
  employeeId: z.string().uuid(),
  type: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  days: z.number().positive(),
  status: z.enum(['pending', 'approved', 'rejected', 'cancelled']),
  reason: z.string().optional(),
  comments: z.string().optional(),
  approvedBy: z.string().uuid().optional(),
  approvedAt: z.string().datetime().optional(),
  rejectedBy: z.string().uuid().optional(),
  rejectedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const PayslipSchema = z.object({
  id: z.string().uuid(),
  employeeId: z.string().uuid(),
  payPeriod: z.string(),
  baseSalary: z.number().positive(),
  allowances: z.number().nonnegative(),
  deductions: z.number().nonnegative(),
  grossSalary: z.number().positive(),
  netSalary: z.number().positive(),
  status: z.enum(['draft', 'processed', 'paid']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const AttendanceRecordSchema = z.object({
  id: z.string().uuid(),
  employeeId: z.string().uuid(),
  date: z.string().datetime(),
  clockIn: z.string().datetime().optional(),
  clockOut: z.string().datetime().optional(),
  breakDuration: z.number().nonnegative(),
  hoursWorked: z.number().nonnegative(),
  overtime: z.number().nonnegative(),
  status: z.enum(['present', 'absent', 'late', 'half_day']),
  location: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const PerformanceReviewSchema = z.object({
  id: z.string().uuid(),
  employeeId: z.string().uuid(),
  reviewerId: z.string().uuid(),
  period: z.string(),
  overallScore: z.number().min(1).max(5),
  goals: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    status: z.enum(['not_started', 'in_progress', 'completed']),
    score: z.number().min(1).max(5).optional()
  })),
  feedback: z.string().optional(),
  status: z.enum(['draft', 'submitted', 'completed']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

// Data relationship validation
export class DataValidator {
  // Validate foreign key relationships
  static validateEmployeeDepartment(employee: any, departments: any[]): boolean {
    return departments.some(dept => dept.id === employee.department);
  }

  static validateManagerEmployee(employee: any, employees: any[]): boolean {
    if (!employee.managerId) return true;
    return employees.some(emp => emp.id === employee.managerId);
  }

  static validateLeaveEmployee(leave: any, employees: any[]): boolean {
    return employees.some(emp => emp.id === leave.employeeId);
  }

  static validatePayslipEmployee(payslip: any, employees: any[]): boolean {
    return employees.some(emp => emp.id === payslip.employeeId);
  }

  // Validate data consistency
  static validateLeaveRequest(leave: any): string[] {
    const errors: string[] = [];
    
    const startDate = new Date(leave.startDate);
    const endDate = new Date(leave.endDate);
    
    if (startDate >= endDate) {
      errors.push('Start date must be before end date');
    }
    
    if (startDate < new Date()) {
      errors.push('Start date cannot be in the past');
    }
    
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff !== leave.days) {
      errors.push('Days calculated does not match date range');
    }
    
    return errors;
  }

  static validateAttendanceRecord(attendance: any): string[] {
    const errors: string[] = [];
    
    if (attendance.clockIn && attendance.clockOut) {
      const clockIn = new Date(attendance.clockIn);
      const clockOut = new Date(attendance.clockOut);
      
      if (clockIn >= clockOut) {
        errors.push('Clock in time must be before clock out time');
      }
      
      const hoursWorked = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);
      const expectedHours = hoursWorked - (attendance.breakDuration / 60);
      
      if (Math.abs(expectedHours - attendance.hoursWorked) > 0.1) {
        errors.push('Hours worked calculation is incorrect');
      }
    }
    
    return errors;
  }

  static validatePayslip(payslip: any): string[] {
    const errors: string[] = [];
    
    const calculatedGross = payslip.baseSalary + payslip.allowances;
    if (Math.abs(calculatedGross - payslip.grossSalary) > 0.01) {
      errors.push('Gross salary calculation is incorrect');
    }
    
    const calculatedNet = payslip.grossSalary - payslip.deductions;
    if (Math.abs(calculatedNet - payslip.netSalary) > 0.01) {
      errors.push('Net salary calculation is incorrect');
    }
    
    if (payslip.deductions > payslip.grossSalary) {
      errors.push('Deductions cannot exceed gross salary');
    }
    
    return errors;
  }

  // Cascading update validation
  static getCascadingUpdates(entityType: string, entityId: string, action: 'update' | 'delete'): Array<{
    table: string;
    field: string;
    action: 'update' | 'delete' | 'validate';
  }> {
    const cascades: Array<{ table: string; field: string; action: 'update' | 'delete' | 'validate' }> = [];
    
    switch (entityType) {
      case 'employee':
        if (action === 'delete') {
          cascades.push(
            { table: 'leave_requests', field: 'employeeId', action: 'delete' },
            { table: 'payslips', field: 'employeeId', action: 'delete' },
            { table: 'attendance_records', field: 'employeeId', action: 'delete' },
            { table: 'performance_reviews', field: 'employeeId', action: 'delete' },
            { table: 'employees', field: 'managerId', action: 'update' } // Set to null
          );
        }
        break;
        
      case 'department':
        if (action === 'delete') {
          cascades.push(
            { table: 'employees', field: 'department', action: 'validate' } // Prevent deletion if has employees
          );
        }
        break;
        
      case 'leave_type':
        if (action === 'delete') {
          cascades.push(
            { table: 'leave_requests', field: 'type', action: 'validate' } // Prevent deletion if used
          );
        }
        break;
    }
    
    return cascades;
  }
}

// Data seeding utilities
export class DataSeeder {
  static async seedDatabase(): Promise<void> {
    // This would reset and populate the database with initial data
    console.log('Seeding database with initial data...');
    
    // Clear existing data
    localStorage.removeItem('msw-employees');
    localStorage.removeItem('msw-departments');
    localStorage.removeItem('msw-leave-requests');
    localStorage.removeItem('msw-payslips');
    
    // Generate fresh seed data
    const seedData = {
      employees: this.generateEmployees(50),
      departments: this.generateDepartments(8),
      leaveRequests: this.generateLeaveRequests(100),
      payslips: this.generatePayslips(200)
    };
    
    // Store seed data
    Object.entries(seedData).forEach(([key, data]) => {
      localStorage.setItem(`msw-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, JSON.stringify(data));
    });
    
    console.log('Database seeding completed');
  }

  private static generateEmployees(count: number): any[] {
    // Generate realistic employee data
    return Array.from({ length: count }, (_, i) => ({
      id: `emp-${i + 1}`,
      email: `employee${i + 1}@company.com`,
      firstName: `First${i + 1}`,
      lastName: `Last${i + 1}`,
      department: `dept-${Math.floor(Math.random() * 8) + 1}`,
      position: ['Manager', 'Developer', 'Analyst', 'Coordinator'][Math.floor(Math.random() * 4)],
      status: 'active',
      startDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      salary: 50000 + Math.random() * 100000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
  }

  private static generateDepartments(count: number): any[] {
    const deptNames = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Legal', 'IT'];
    return Array.from({ length: count }, (_, i) => ({
      id: `dept-${i + 1}`,
      name: deptNames[i],
      description: `${deptNames[i]} department`,
      location: ['New York', 'San Francisco', 'Chicago', 'Austin'][Math.floor(Math.random() * 4)],
      budget: 100000 + Math.random() * 500000,
      headcount: 5 + Math.floor(Math.random() * 20),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
  }

  private static generateLeaveRequests(count: number): any[] {
    return Array.from({ length: count }, (_, i) => ({
      id: `leave-${i + 1}`,
      employeeId: `emp-${Math.floor(Math.random() * 50) + 1}`,
      type: ['Annual', 'Sick', 'Personal', 'Maternity'][Math.floor(Math.random() * 4)],
      startDate: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      days: Math.floor(Math.random() * 10) + 1,
      status: ['pending', 'approved', 'rejected'][Math.floor(Math.random() * 3)],
      reason: 'Sample leave request',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
  }

  private static generatePayslips(count: number): any[] {
    return Array.from({ length: count }, (_, i) => ({
      id: `payslip-${i + 1}`,
      employeeId: `emp-${Math.floor(Math.random() * 50) + 1}`,
      payPeriod: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}`,
      baseSalary: 5000 + Math.random() * 10000,
      allowances: Math.random() * 1000,
      deductions: Math.random() * 2000,
      grossSalary: 0, // Will be calculated
      netSalary: 0, // Will be calculated
      status: 'processed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })).map(payslip => {
      payslip.grossSalary = payslip.baseSalary + payslip.allowances;
      payslip.netSalary = payslip.grossSalary - payslip.deductions;
      return payslip;
    });
  }

  static async resetDatabase(): Promise<void> {
    // Clear all MSW data from localStorage
    const keys = Object.keys(localStorage).filter(key => key.startsWith('msw-'));
    keys.forEach(key => localStorage.removeItem(key));
    
    // Reseed with fresh data
    await this.seedDatabase();
  }
}