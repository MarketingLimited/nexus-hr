import { faker } from '@faker-js/faker'

// Mock user for authentication tests
export const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  role: 'admin',
  avatar: faker.image.avatar(),
  department: 'IT',
  position: 'Senior Developer',
  status: 'active' as const,
  permissions: ['read', 'write', 'delete', 'admin'],
}

// Mock employee data
export const createMockEmployee = (overrides = {}) => ({
  id: faker.string.uuid(),
  employeeId: faker.string.alphanumeric(6).toUpperCase(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  department: faker.helpers.arrayElement(['IT', 'HR', 'Finance', 'Marketing', 'Operations']),
  position: faker.person.jobTitle(),
  status: faker.helpers.arrayElement(['active', 'inactive', 'pending']),
  avatar: faker.image.avatar(),
  phone: faker.phone.number(),
  address: faker.location.streetAddress(),
  hireDate: faker.date.past().toISOString(),
  salary: faker.number.int({ min: 30000, max: 150000 }),
  ...overrides,
})

// Mock department data
export const createMockDepartment = (overrides = {}) => ({
  id: faker.string.uuid(),
  name: faker.helpers.arrayElement(['IT', 'HR', 'Finance', 'Marketing', 'Operations']),
  description: faker.lorem.sentence(),
  manager: faker.person.fullName(),
  location: faker.location.city(),
  budget: faker.number.int({ min: 100000, max: 1000000 }),
  employeeCount: faker.number.int({ min: 5, max: 50 }),
  ...overrides,
})

// Mock attendance record
export const createMockAttendance = (overrides = {}) => ({
  id: faker.string.uuid(),
  employeeId: faker.string.uuid(),
  date: faker.date.recent().toISOString(),
  clockIn: faker.date.recent().toISOString(),
  clockOut: faker.date.recent().toISOString(),
  breakTime: faker.number.int({ min: 30, max: 120 }),
  totalHours: faker.number.float({ min: 6, max: 10, fractionDigits: 2 }),
  status: faker.helpers.arrayElement(['present', 'absent', 'late', 'half-day']),
  ...overrides,
})

// Mock leave request
export const createMockLeaveRequest = (overrides = {}) => ({
  id: faker.string.uuid(),
  employeeId: faker.string.uuid(),
  type: faker.helpers.arrayElement(['annual', 'sick', 'personal', 'maternity', 'paternity']),
  startDate: faker.date.future().toISOString(),
  endDate: faker.date.future().toISOString(),
  days: faker.number.int({ min: 1, max: 30 }),
  status: faker.helpers.arrayElement(['pending', 'approved', 'rejected']),
  reason: faker.lorem.sentence(),
  approvedBy: faker.string.uuid(),
  appliedDate: faker.date.recent().toISOString(),
  ...overrides,
})

// Authentication helpers
export const mockAuthToken = 'mock-jwt-token'
export const mockRefreshToken = 'mock-refresh-token'

export const mockAuthResponse = {
  user: mockUser,
  token: mockAuthToken,
  refreshToken: mockRefreshToken,
}

// Test data reset utility
export const resetTestData = () => {
  // Clear any stored test data
  localStorage.clear()
  sessionStorage.clear()
}

// Create arrays of mock data for list tests
export const createMockEmployees = (count = 10) =>
  Array.from({ length: count }, () => createMockEmployee())

export const createMockDepartments = (count = 5) =>
  Array.from({ length: count }, () => createMockDepartment())

export const createMockAttendanceRecords = (count = 20) =>
  Array.from({ length: count }, () => createMockAttendance())

export const createMockLeaveRequests = (count = 15) =>
  Array.from({ length: count }, () => createMockLeaveRequest())