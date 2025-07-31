import { faker } from '@faker-js/faker'
import { vi } from 'vitest'

// Seed faker for consistent test data
faker.seed(123)

/**
 * Advanced mock data factory with relationships
 */
export class MockDataFactory {
  private static departments = new Map<string, any>()
  private static roles = new Map<string, any>()
  private static employees = new Map<string, any>()

  /**
   * Create a mock department with consistent data
   */
  static createDepartment(overrides: Partial<any> = {}) {
    const id = overrides.id || faker.string.uuid()
    
    const department = {
      id,
      name: faker.helpers.arrayElement(['Engineering', 'Human Resources', 'Finance', 'Marketing', 'Operations', 'Sales']),
      description: faker.lorem.paragraph(),
      managerId: faker.string.uuid(),
      location: faker.location.city(),
      budget: faker.number.int({ min: 100000, max: 2000000 }),
      employeeCount: faker.number.int({ min: 5, max: 100 }),
      costCenter: faker.string.alphanumeric(6).toUpperCase(),
      isActive: true,
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
      ...overrides
    }

    this.departments.set(id, department)
    return department
  }

  /**
   * Create a mock role with permissions
   */
  static createRole(overrides: Partial<any> = {}) {
    const id = overrides.id || faker.string.uuid()
    
    const role = {
      id,
      name: faker.helpers.arrayElement(['Admin', 'Manager', 'Employee', 'HR Specialist', 'Contractor']),
      description: faker.lorem.sentence(),
      level: faker.number.int({ min: 1, max: 5 }),
      permissions: faker.helpers.arrayElements(['read', 'write', 'delete', 'admin', 'approve', 'report'], { min: 1, max: 4 }),
      departmentId: faker.string.uuid(),
      isActive: true,
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
      ...overrides
    }

    this.roles.set(id, role)
    return role
  }

  /**
   * Create a mock employee with relationships
   */
  static createEmployee(overrides: Partial<any> = {}) {
    const id = overrides.id || faker.string.uuid()
    const departmentId = overrides.departmentId || Array.from(this.departments.keys())[0] || this.createDepartment().id
    const roleId = overrides.roleId || Array.from(this.roles.keys())[0] || this.createRole().id
    
    const employee = {
      id,
      employeeId: faker.string.alphanumeric(8).toUpperCase(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      avatar: faker.image.avatar(),
      dateOfBirth: faker.date.birthdate({ min: 22, max: 65, mode: 'age' }).toISOString(),
      gender: faker.helpers.arrayElement(['male', 'female', 'other', 'prefer-not-to-say']),
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zipCode: faker.location.zipCode(),
        country: faker.location.country()
      },
      department: this.departments.get(departmentId) || this.createDepartment({ id: departmentId }),
      role: this.roles.get(roleId) || this.createRole({ id: roleId }),
      managerId: faker.string.uuid(),
      startDate: faker.date.past({ years: 5 }).toISOString(),
      endDate: null,
      salary: faker.number.int({ min: 30000, max: 200000 }),
      currency: 'USD',
      employmentType: faker.helpers.arrayElement(['full-time', 'part-time', 'contract', 'intern']),
      status: faker.helpers.arrayElement(['active', 'inactive', 'terminated', 'on-leave']),
      skills: faker.helpers.arrayElements(['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'SQL'], { min: 2, max: 5 }),
      certifications: faker.helpers.arrayElements(['AWS', 'Google Cloud', 'Azure', 'Scrum Master', 'PMP'], { min: 0, max: 2 }),
      emergencyContact: {
        name: faker.person.fullName(),
        relationship: faker.helpers.arrayElement(['spouse', 'parent', 'sibling', 'friend']),
        phone: faker.phone.number(),
        email: faker.internet.email()
      },
      bankDetails: {
        accountNumber: faker.finance.accountNumber(),
        routingNumber: faker.finance.routingNumber(),
        bankName: faker.company.name() + ' Bank'
      },
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
      ...overrides
    }

    this.employees.set(id, employee)
    return employee
  }

  /**
   * Create mock attendance record
   */
  static createAttendanceRecord(employeeId?: string, overrides: Partial<any> = {}) {
    const employee = employeeId ? this.employees.get(employeeId) : Array.from(this.employees.values())[0]
    if (!employee && !employeeId) {
      throw new Error('No employee found. Create an employee first.')
    }

    return {
      id: faker.string.uuid(),
      employeeId: employeeId || employee.id,
      employee: employee || null,
      date: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
      clockIn: faker.date.recent({ days: 1 }).toISOString(),
      clockOut: faker.date.recent({ days: 1 }).toISOString(),
      breakStart: faker.date.recent({ days: 1 }).toISOString(),
      breakEnd: faker.date.recent({ days: 1 }).toISOString(),
      totalHours: faker.number.float({ min: 6, max: 10, fractionDigits: 2 }),
      overtimeHours: faker.number.float({ min: 0, max: 4, fractionDigits: 2 }),
      status: faker.helpers.arrayElement(['present', 'absent', 'late', 'half-day', 'sick', 'vacation']),
      location: faker.helpers.arrayElement(['office', 'remote', 'client-site']),
      notes: faker.lorem.sentence(),
      approvedBy: faker.string.uuid(),
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
      ...overrides
    }
  }

  /**
   * Create mock leave request
   */
  static createLeaveRequest(employeeId?: string, overrides: Partial<any> = {}) {
    const employee = employeeId ? this.employees.get(employeeId) : Array.from(this.employees.values())[0]
    if (!employee && !employeeId) {
      throw new Error('No employee found. Create an employee first.')
    }

    const startDate = faker.date.future()
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + faker.number.int({ min: 1, max: 15 }))

    return {
      id: faker.string.uuid(),
      employeeId: employeeId || employee.id,
      employee: employee || null,
      type: faker.helpers.arrayElement(['annual', 'sick', 'personal', 'maternity', 'paternity', 'bereavement']),
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      days: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
      reason: faker.lorem.paragraph(),
      status: faker.helpers.arrayElement(['pending', 'approved', 'rejected', 'cancelled']),
      approverId: faker.string.uuid(),
      approvedAt: faker.date.recent().toISOString(),
      rejectionReason: null,
      documents: [],
      appliedAt: faker.date.recent().toISOString(),
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
      ...overrides
    }
  }

  /**
   * Create mock payroll record
   */
  static createPayrollRecord(employeeId?: string, overrides: Partial<any> = {}) {
    const employee = employeeId ? this.employees.get(employeeId) : Array.from(this.employees.values())[0]
    if (!employee && !employeeId) {
      throw new Error('No employee found. Create an employee first.')
    }

    const grossSalary = employee?.salary || 50000
    const tax = grossSalary * 0.25
    const benefits = grossSalary * 0.15
    const netSalary = grossSalary - tax - benefits

    return {
      id: faker.string.uuid(),
      employeeId: employeeId || employee.id,
      employee: employee || null,
      payPeriod: {
        start: faker.date.past().toISOString().split('T')[0],
        end: faker.date.recent().toISOString().split('T')[0]
      },
      grossSalary,
      basicSalary: grossSalary * 0.7,
      allowances: {
        housing: grossSalary * 0.1,
        transport: grossSalary * 0.05,
        medical: grossSalary * 0.05,
        other: grossSalary * 0.1
      },
      deductions: {
        tax,
        socialSecurity: grossSalary * 0.05,
        insurance: grossSalary * 0.02,
        retirement: grossSalary * 0.08,
        other: 0
      },
      overtime: {
        hours: faker.number.float({ min: 0, max: 20, fractionDigits: 2 }),
        rate: 25,
        amount: faker.number.float({ min: 0, max: 500, fractionDigits: 2 })
      },
      bonus: faker.number.int({ min: 0, max: 5000 }),
      netSalary,
      paymentMethod: faker.helpers.arrayElement(['bank-transfer', 'check', 'cash']),
      paymentStatus: faker.helpers.arrayElement(['pending', 'processed', 'failed', 'cancelled']),
      paymentDate: faker.date.recent().toISOString(),
      processedBy: faker.string.uuid(),
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
      ...overrides
    }
  }

  /**
   * Create mock performance review
   */
  static createPerformanceReview(employeeId?: string, overrides: Partial<any> = {}) {
    const employee = employeeId ? this.employees.get(employeeId) : Array.from(this.employees.values())[0]
    if (!employee && !employeeId) {
      throw new Error('No employee found. Create an employee first.')
    }

    return {
      id: faker.string.uuid(),
      employeeId: employeeId || employee.id,
      employee: employee || null,
      reviewerId: faker.string.uuid(),
      reviewPeriod: {
        start: faker.date.past({ years: 1 }).toISOString().split('T')[0],
        end: faker.date.recent().toISOString().split('T')[0]
      },
      type: faker.helpers.arrayElement(['annual', 'quarterly', 'probation', 'promotion']),
      status: faker.helpers.arrayElement(['draft', 'pending', 'completed', 'approved']),
      overallRating: faker.number.int({ min: 1, max: 5 }),
      categories: {
        technical: faker.number.int({ min: 1, max: 5 }),
        communication: faker.number.int({ min: 1, max: 5 }),
        teamwork: faker.number.int({ min: 1, max: 5 }),
        leadership: faker.number.int({ min: 1, max: 5 }),
        initiative: faker.number.int({ min: 1, max: 5 })
      },
      goals: Array.from({ length: faker.number.int({ min: 2, max: 5 }) }, () => ({
        id: faker.string.uuid(),
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
        status: faker.helpers.arrayElement(['not-started', 'in-progress', 'completed', 'exceeded']),
        weight: faker.number.int({ min: 10, max: 30 }),
        rating: faker.number.int({ min: 1, max: 5 })
      })),
      feedback: {
        strengths: faker.lorem.paragraph(),
        improvements: faker.lorem.paragraph(),
        managerComments: faker.lorem.paragraph(),
        employeeSelfReview: faker.lorem.paragraph()
      },
      nextReviewDate: faker.date.future().toISOString().split('T')[0],
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
      ...overrides
    }
  }

  /**
   * Create multiple employees with relationships
   */
  static createEmployeeBatch(count: number = 10, options: { 
    withDepartments?: boolean
    withRoles?: boolean
    withAttendance?: boolean
    withLeaveRequests?: boolean
  } = {}) {
    const { withDepartments = true, withRoles = true, withAttendance = false, withLeaveRequests = false } = options

    // Create departments if needed
    if (withDepartments && this.departments.size === 0) {
      for (let i = 0; i < 5; i++) {
        this.createDepartment()
      }
    }

    // Create roles if needed
    if (withRoles && this.roles.size === 0) {
      for (let i = 0; i < 3; i++) {
        this.createRole()
      }
    }

    // Create employees
    const employees = []
    for (let i = 0; i < count; i++) {
      const employee = this.createEmployee()
      employees.push(employee)

      // Create related records if requested
      if (withAttendance) {
        for (let j = 0; j < faker.number.int({ min: 5, max: 20 }); j++) {
          this.createAttendanceRecord(employee.id)
        }
      }

      if (withLeaveRequests) {
        for (let j = 0; j < faker.number.int({ min: 1, max: 5 }); j++) {
          this.createLeaveRequest(employee.id)
        }
      }
    }

    return employees
  }

  /**
   * Clear all cached data
   */
  static clearAll() {
    this.departments.clear()
    this.roles.clear()
    this.employees.clear()
  }

  /**
   * Get all created data
   */
  static getAllData() {
    return {
      departments: Array.from(this.departments.values()),
      roles: Array.from(this.roles.values()),
      employees: Array.from(this.employees.values())
    }
  }
}

/**
 * Mock API responses factory
 */
export class MockAPIFactory {
  /**
   * Create paginated response
   */
  static createPaginatedResponse<T>(data: T[], page: number = 1, limit: number = 10) {
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedData = data.slice(startIndex, endIndex)
    
    return {
      data: paginatedData,
      meta: {
        currentPage: page,
        totalPages: Math.ceil(data.length / limit),
        totalItems: data.length,
        itemsPerPage: limit,
        hasNextPage: endIndex < data.length,
        hasPreviousPage: page > 1
      }
    }
  }

  /**
   * Create success response
   */
  static createSuccessResponse<T>(data: T, message: string = 'Success') {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Create error response
   */
  static createErrorResponse(message: string, code: number = 400, details?: any) {
    return {
      success: false,
      error: {
        message,
        code,
        details,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Create validation error response
   */
  static createValidationErrorResponse(errors: Record<string, string[]>) {
    return {
      success: false,
      error: {
        message: 'Validation failed',
        code: 422,
        validation: errors,
        timestamp: new Date().toISOString()
      }
    }
  }
}

/**
 * Create mock handlers for MSW
 */
export const createMockHandlers = () => {
  return {
    // Employee handlers
    employees: {
      getAll: vi.fn().mockResolvedValue(MockAPIFactory.createPaginatedResponse(MockDataFactory.createEmployeeBatch(20))),
      getById: vi.fn().mockResolvedValue(MockAPIFactory.createSuccessResponse(MockDataFactory.createEmployee())),
      create: vi.fn().mockResolvedValue(MockAPIFactory.createSuccessResponse(MockDataFactory.createEmployee())),
      update: vi.fn().mockResolvedValue(MockAPIFactory.createSuccessResponse(MockDataFactory.createEmployee())),
      delete: vi.fn().mockResolvedValue(MockAPIFactory.createSuccessResponse(null, 'Employee deleted'))
    },

    // Department handlers
    departments: {
      getAll: vi.fn().mockResolvedValue(MockAPIFactory.createSuccessResponse(Array.from({ length: 5 }, () => MockDataFactory.createDepartment()))),
      getById: vi.fn().mockResolvedValue(MockAPIFactory.createSuccessResponse(MockDataFactory.createDepartment())),
      create: vi.fn().mockResolvedValue(MockAPIFactory.createSuccessResponse(MockDataFactory.createDepartment())),
      update: vi.fn().mockResolvedValue(MockAPIFactory.createSuccessResponse(MockDataFactory.createDepartment())),
      delete: vi.fn().mockResolvedValue(MockAPIFactory.createSuccessResponse(null, 'Department deleted'))
    },

    // Attendance handlers
    attendance: {
      getRecords: vi.fn().mockResolvedValue(MockAPIFactory.createPaginatedResponse(Array.from({ length: 50 }, () => MockDataFactory.createAttendanceRecord()))),
      clockIn: vi.fn().mockResolvedValue(MockAPIFactory.createSuccessResponse(MockDataFactory.createAttendanceRecord())),
      clockOut: vi.fn().mockResolvedValue(MockAPIFactory.createSuccessResponse(MockDataFactory.createAttendanceRecord())),
      getStats: vi.fn().mockResolvedValue(MockAPIFactory.createSuccessResponse({
        totalDays: 30,
        presentDays: 25,
        absentDays: 3,
        attendanceRate: 83.33
      }))
    },

    // Leave handlers
    leave: {
      getRequests: vi.fn().mockResolvedValue(MockAPIFactory.createPaginatedResponse(Array.from({ length: 15 }, () => MockDataFactory.createLeaveRequest()))),
      create: vi.fn().mockResolvedValue(MockAPIFactory.createSuccessResponse(MockDataFactory.createLeaveRequest())),
      approve: vi.fn().mockResolvedValue(MockAPIFactory.createSuccessResponse(MockDataFactory.createLeaveRequest({ status: 'approved' }))),
      reject: vi.fn().mockResolvedValue(MockAPIFactory.createSuccessResponse(MockDataFactory.createLeaveRequest({ status: 'rejected' })))
    },

    // Auth handlers
    auth: {
      login: vi.fn().mockResolvedValue(MockAPIFactory.createSuccessResponse({
        user: MockDataFactory.createEmployee(),
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token'
      })),
      logout: vi.fn().mockResolvedValue(MockAPIFactory.createSuccessResponse(null, 'Logged out successfully')),
      refresh: vi.fn().mockResolvedValue(MockAPIFactory.createSuccessResponse({ token: 'new-mock-jwt-token' }))
    }
  }
}

/**
 * Reset all mock data
 */
export const resetMockData = () => {
  MockDataFactory.clearAll()
  faker.seed(123) // Reset to consistent seed
}