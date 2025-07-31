import { QueryClient } from '@tanstack/react-query'

export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })

// Mock complete data structures for testing
export const createMockAttendanceRecord = (overrides = {}) => ({
  id: 'att-1',
  employeeId: 'emp-1',
  date: '2024-01-15',
  clockIn: '09:00:00',
  clockOut: '17:00:00',
  breakStart: '12:00:00',
  breakEnd: '13:00:00',
  totalHours: 8,
  overtimeHours: 0,
  status: 'present' as const,
  location: 'Office',
  notes: null,
  approvedBy: null,
  createdAt: '2024-01-15T09:00:00Z',
  updatedAt: '2024-01-15T09:00:00Z',
  ...overrides
})

export const createMockUser = (overrides = {}) => ({
  id: 'user-1',
  username: 'johndoe',
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe',
  avatar: 'https://example.com/avatar.jpg',
  role: {
    id: 'role-1',
    name: 'Employee',
    description: 'Standard employee',
    level: 1,
    permissions: ['read'],
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  permissions: [{
    id: 'perm-1',
    name: 'read',
    description: 'Read access',
    resource: 'general',
    action: 'read' as const,
    scope: 'own' as const,
    createdAt: '2024-01-01T00:00:00Z'
  }],
  isActive: true,
  lastLogin: '2024-01-15T08:00:00Z',
  passwordChangedAt: '2024-01-01T00:00:00Z',
  mfaEnabled: false,
  profileCompleteness: 100,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T08:00:00Z',
  ...overrides
})

export const createMockWorkSchedule = (overrides = {}) => ({
  id: 'sched-1',
  employeeId: 'emp-1',
  dayOfWeek: 1,
  startTime: '09:00:00',
  endTime: '17:00:00',
  breakDuration: 60,
  isWorkingDay: true,
  effectiveFrom: '2024-01-01T00:00:00Z',
  effectiveTo: null,
  createdAt: '2024-01-01T00:00:00Z',
  ...overrides
})

export const createMockTimeOffRequest = (overrides = {}) => ({
  id: 'time-off-1',
  employeeId: 'emp-1',
  date: '2024-01-20',
  reason: 'Vacation',
  type: 'personal' as const,
  status: 'pending' as const,
  requestedAt: '2024-01-10T10:00:00Z',
  approvedBy: null,
  approvedAt: null,
  notes: null,
  ...overrides
})

export const createMockAttendancePolicy = (overrides = {}) => ({
  id: 'policy-1',
  name: 'Standard Hours',
  description: 'Standard working hours policy',
  rules: {
    coreHours: { start: '10:00', end: '15:00' },
    flexibleHours: true,
    minimumHours: 8,
    maximumHours: 12,
    overtimeThreshold: 8,
    lateThreshold: 15,
    earlyLeaveThreshold: 30
  },
  departments: ['Engineering'],
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides
})

export const createMockAttendanceStats = (overrides = {}) => ({
  totalDays: 30,
  presentDays: 25,
  absentDays: 3,
  lateDays: 2,
  sickDays: 1,
  vacationDays: 2,
  attendanceRate: 83.33,
  avgWorkingHours: 8.2,
  ...overrides
})