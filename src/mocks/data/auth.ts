import { faker } from '@faker-js/faker'

export interface User {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  avatar: string
  role: Role
  permissions: Permission[]
  isActive: boolean
  lastLogin: string | null
  passwordChangedAt: string
  mfaEnabled: boolean
  profileCompleteness: number
  createdAt: string
  updatedAt: string
}

export interface Role {
  id: string
  name: string
  description: string
  level: number // 1 = Employee, 2 = Manager, 3 = Admin, 4 = Super Admin
  permissions: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Permission {
  id: string
  name: string
  description: string
  resource: string
  action: 'create' | 'read' | 'update' | 'delete' | 'manage'
  scope: 'own' | 'department' | 'all'
  createdAt: string
}

export interface Session {
  id: string
  userId: string
  token: string
  refreshToken: string
  deviceInfo: {
    userAgent: string
    ip: string
    location: string
    device: string
  }
  isActive: boolean
  expiresAt: string
  createdAt: string
  lastAccessedAt: string
}

export interface AuditLog {
  id: string
  userId: string
  action: string
  resource: string
  resourceId: string | null
  details: Record<string, any>
  ipAddress: string
  userAgent: string
  timestamp: string
  result: 'success' | 'failure' | 'blocked'
}

// Define standard permissions
export const permissions: Permission[] = [
  // Employee Management
  { id: '1', name: 'employees.read', description: 'View employee data', resource: 'employees', action: 'read', scope: 'own', createdAt: faker.date.past().toISOString() },
  { id: '2', name: 'employees.read.department', description: 'View department employees', resource: 'employees', action: 'read', scope: 'department', createdAt: faker.date.past().toISOString() },
  { id: '3', name: 'employees.read.all', description: 'View all employees', resource: 'employees', action: 'read', scope: 'all', createdAt: faker.date.past().toISOString() },
  { id: '4', name: 'employees.create', description: 'Create new employees', resource: 'employees', action: 'create', scope: 'all', createdAt: faker.date.past().toISOString() },
  { id: '5', name: 'employees.update', description: 'Update employee data', resource: 'employees', action: 'update', scope: 'department', createdAt: faker.date.past().toISOString() },
  { id: '6', name: 'employees.delete', description: 'Delete employees', resource: 'employees', action: 'delete', scope: 'all', createdAt: faker.date.past().toISOString() },
  
  // Leave Management
  { id: '7', name: 'leave.read', description: 'View own leave data', resource: 'leave', action: 'read', scope: 'own', createdAt: faker.date.past().toISOString() },
  { id: '8', name: 'leave.create', description: 'Submit leave requests', resource: 'leave', action: 'create', scope: 'own', createdAt: faker.date.past().toISOString() },
  { id: '9', name: 'leave.approve', description: 'Approve leave requests', resource: 'leave', action: 'update', scope: 'department', createdAt: faker.date.past().toISOString() },
  { id: '10', name: 'leave.manage', description: 'Manage all leave requests', resource: 'leave', action: 'manage', scope: 'all', createdAt: faker.date.past().toISOString() },
  
  // Payroll
  { id: '11', name: 'payroll.read', description: 'View own payroll data', resource: 'payroll', action: 'read', scope: 'own', createdAt: faker.date.past().toISOString() },
  { id: '12', name: 'payroll.manage', description: 'Manage payroll processing', resource: 'payroll', action: 'manage', scope: 'all', createdAt: faker.date.past().toISOString() },
  
  // Performance
  { id: '13', name: 'performance.read', description: 'View own performance data', resource: 'performance', action: 'read', scope: 'own', createdAt: faker.date.past().toISOString() },
  { id: '14', name: 'performance.review', description: 'Conduct performance reviews', resource: 'performance', action: 'update', scope: 'department', createdAt: faker.date.past().toISOString() },
  { id: '15', name: 'performance.manage', description: 'Manage all performance data', resource: 'performance', action: 'manage', scope: 'all', createdAt: faker.date.past().toISOString() },
  
  // Attendance
  { id: '16', name: 'attendance.read', description: 'View own attendance', resource: 'attendance', action: 'read', scope: 'own', createdAt: faker.date.past().toISOString() },
  { id: '17', name: 'attendance.track', description: 'Track team attendance', resource: 'attendance', action: 'read', scope: 'department', createdAt: faker.date.past().toISOString() },
  { id: '18', name: 'attendance.manage', description: 'Manage all attendance data', resource: 'attendance', action: 'manage', scope: 'all', createdAt: faker.date.past().toISOString() },
  
  // Reports
  { id: '19', name: 'reports.read', description: 'View reports', resource: 'reports', action: 'read', scope: 'department', createdAt: faker.date.past().toISOString() },
  { id: '20', name: 'reports.create', description: 'Create custom reports', resource: 'reports', action: 'create', scope: 'all', createdAt: faker.date.past().toISOString() },
  
  // System Administration
  { id: '21', name: 'system.configure', description: 'Configure system settings', resource: 'system', action: 'manage', scope: 'all', createdAt: faker.date.past().toISOString() },
  { id: '22', name: 'users.manage', description: 'Manage user accounts', resource: 'users', action: 'manage', scope: 'all', createdAt: faker.date.past().toISOString() },
  { id: '23', name: 'roles.manage', description: 'Manage roles and permissions', resource: 'roles', action: 'manage', scope: 'all', createdAt: faker.date.past().toISOString() }
]

// Define standard roles
export const roles: Role[] = [
  {
    id: '1',
    name: 'Employee',
    description: 'Standard employee with basic access',
    level: 1,
    permissions: ['1', '7', '8', '11', '13', '16'],
    isActive: true,
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString()
  },
  {
    id: '2',
    name: 'Manager',
    description: 'Department manager with team oversight',
    level: 2,
    permissions: ['1', '2', '5', '7', '8', '9', '11', '13', '14', '16', '17', '19'],
    isActive: true,
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString()
  },
  {
    id: '3',
    name: 'HR Manager',
    description: 'HR personnel with employee management access',
    level: 3,
    permissions: ['3', '4', '5', '6', '10', '11', '12', '15', '18', '19', '20'],
    isActive: true,
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString()
  },
  {
    id: '4',
    name: 'Admin',
    description: 'System administrator with full access',
    level: 4,
    permissions: permissions.map(p => p.id),
    isActive: true,
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString()
  }
]

// Demo users for testing
const demoUsers: User[] = [
  {
    id: 'demo-admin',
    username: 'admin',
    email: 'admin@company.com',
    firstName: 'Admin',
    lastName: 'User',
    avatar: faker.image.avatar(),
    role: roles[3], // Admin
    permissions: permissions.filter(p => roles[3].permissions.includes(p.id)),
    isActive: true,
    lastLogin: new Date().toISOString(),
    passwordChangedAt: faker.date.past({ years: 1 }).toISOString(),
    mfaEnabled: false,
    profileCompleteness: 100,
    createdAt: faker.date.past({ years: 2 }).toISOString(),
    updatedAt: faker.date.recent().toISOString()
  },
  {
    id: 'demo-hr',
    username: 'hr',
    email: 'hr@company.com',
    firstName: 'HR',
    lastName: 'Manager',
    avatar: faker.image.avatar(),
    role: roles[2], // HR Manager
    permissions: permissions.filter(p => roles[2].permissions.includes(p.id)),
    isActive: true,
    lastLogin: new Date().toISOString(),
    passwordChangedAt: faker.date.past({ years: 1 }).toISOString(),
    mfaEnabled: false,
    profileCompleteness: 100,
    createdAt: faker.date.past({ years: 2 }).toISOString(),
    updatedAt: faker.date.recent().toISOString()
  },
  {
    id: 'demo-manager',
    username: 'manager',
    email: 'manager@company.com',
    firstName: 'Team',
    lastName: 'Manager',
    avatar: faker.image.avatar(),
    role: roles[1], // Manager
    permissions: permissions.filter(p => roles[1].permissions.includes(p.id)),
    isActive: true,
    lastLogin: new Date().toISOString(),
    passwordChangedAt: faker.date.past({ years: 1 }).toISOString(),
    mfaEnabled: false,
    profileCompleteness: 100,
    createdAt: faker.date.past({ years: 2 }).toISOString(),
    updatedAt: faker.date.recent().toISOString()
  },
  {
    id: 'demo-employee',
    username: 'employee',
    email: 'employee@company.com',
    firstName: 'John',
    lastName: 'Employee',
    avatar: faker.image.avatar(),
    role: roles[0], // Employee
    permissions: permissions.filter(p => roles[0].permissions.includes(p.id)),
    isActive: true,
    lastLogin: new Date().toISOString(),
    passwordChangedAt: faker.date.past({ years: 1 }).toISOString(),
    mfaEnabled: false,
    profileCompleteness: 90,
    createdAt: faker.date.past({ years: 2 }).toISOString(),
    updatedAt: faker.date.recent().toISOString()
  }
]

export const generateUsers = (count: number = 50): User[] => {
  const randomUsers = Array.from({ length: count - demoUsers.length }, () => {
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()
    const role = faker.helpers.weightedArrayElement([
      { weight: 70, value: roles[0] }, // Employee
      { weight: 20, value: roles[1] }, // Manager
      { weight: 8, value: roles[2] },  // HR Manager
      { weight: 2, value: roles[3] }   // Admin
    ])
    
    const userPermissions = permissions.filter(p => role.permissions.includes(p.id))
    
    return {
      id: faker.string.uuid(),
      username: faker.internet.username({ firstName, lastName }).toLowerCase(),
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      firstName,
      lastName,
      avatar: faker.image.avatar(),
      role,
      permissions: userPermissions,
      isActive: faker.datatype.boolean({ probability: 0.95 }),
      lastLogin: faker.helpers.maybe(() => faker.date.recent().toISOString(), { probability: 0.8 }),
      passwordChangedAt: faker.date.past({ years: 1 }).toISOString(),
      mfaEnabled: faker.datatype.boolean({ probability: 0.4 }),
      profileCompleteness: faker.number.int({ min: 60, max: 100 }),
      createdAt: faker.date.past({ years: 2 }).toISOString(),
      updatedAt: faker.date.recent().toISOString()
    }
  })
  
  return [...demoUsers, ...randomUsers]
}

export const generateSessions = (userIds: string[], count: number = 100): Session[] => {
  const devices = ['Chrome/Windows', 'Safari/macOS', 'Chrome/Android', 'Safari/iOS', 'Firefox/Linux']
  
  return Array.from({ length: count }, () => {
    const createdAt = faker.date.past({ years: 1 })
    const expiresAt = new Date(createdAt)
    expiresAt.setDate(expiresAt.getDate() + 30) // 30-day sessions
    
    return {
      id: faker.string.uuid(),
      userId: faker.helpers.arrayElement(userIds),
      token: faker.string.alphanumeric(64),
      refreshToken: faker.string.alphanumeric(64),
      deviceInfo: {
        userAgent: faker.helpers.arrayElement(devices),
        ip: faker.internet.ip(),
        location: `${faker.location.city()}, ${faker.location.country()}`,
        device: faker.helpers.arrayElement(['Desktop', 'Mobile', 'Tablet'])
      },
      isActive: faker.datatype.boolean({ probability: 0.7 }),
      expiresAt: expiresAt.toISOString(),
      createdAt: createdAt.toISOString(),
      lastAccessedAt: faker.date.between({ from: createdAt, to: new Date() }).toISOString()
    }
  })
}

export const generateAuditLogs = (userIds: string[], count: number = 500): AuditLog[] => {
  const actions = [
    'login', 'logout', 'password_change', 'profile_update', 'employee_create',
    'employee_update', 'employee_delete', 'leave_request', 'leave_approve',
    'payroll_process', 'report_generate', 'settings_update'
  ]
  
  const resources = [
    'auth', 'users', 'employees', 'leave', 'payroll', 'performance',
    'attendance', 'reports', 'settings', 'roles'
  ]
  
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    userId: faker.helpers.arrayElement(userIds),
    action: faker.helpers.arrayElement(actions),
    resource: faker.helpers.arrayElement(resources),
    resourceId: faker.helpers.maybe(() => faker.string.uuid(), { probability: 0.7 }),
    details: {
      changes: faker.helpers.maybe(() => ({
        field: faker.lorem.word(),
        oldValue: faker.lorem.word(),
        newValue: faker.lorem.word()
      }), { probability: 0.5 }),
      metadata: {
        source: 'web_app',
        version: '1.0.0'
      }
    },
    ipAddress: faker.internet.ip(),
    userAgent: faker.internet.userAgent(),
    timestamp: faker.date.past({ years: 1 }).toISOString(),
    result: faker.helpers.weightedArrayElement([
      { weight: 85, value: 'success' },
      { weight: 10, value: 'failure' },
      { weight: 5, value: 'blocked' }
    ])
  }))
}

export const mockUsers = generateUsers(50)
export const mockSessions = generateSessions(mockUsers.map(u => u.id))
export const mockAuditLogs = generateAuditLogs(mockUsers.map(u => u.id))