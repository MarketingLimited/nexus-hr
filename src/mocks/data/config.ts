import { factory, primaryKey } from '@mswjs/data';
import { SystemConfiguration, UserPreferences, DashboardLayout, Role, Permission } from '../../types/configuration';

// Create configuration data model
export const configDb = factory({
  systemConfig: {
    id: primaryKey(String),
    version: String,
    lastUpdated: String,
    company: Object,
    userPreferences: Object,
    dashboardLayouts: Array,
    roles: Array,
    permissions: Array,
    workflows: Array,
    reportTemplates: Array,
    features: Object,
    integrations: Object,
  },
  userPreferences: {
    id: primaryKey(String),
    userId: String,
    theme: String,
    language: String,
    timezone: String,
    dateFormat: String,
    currency: String,
    notifications: Object,
    dashboard: Object,
  },
});

// Default permissions
const defaultPermissions: Permission[] = [
  { id: 'read_employees', name: 'Read Employees', description: 'View employee data', module: 'employees', action: 'read' },
  { id: 'create_employees', name: 'Create Employees', description: 'Add new employees', module: 'employees', action: 'create' },
  { id: 'update_employees', name: 'Update Employees', description: 'Modify employee data', module: 'employees', action: 'update' },
  { id: 'delete_employees', name: 'Delete Employees', description: 'Remove employees', module: 'employees', action: 'delete' },
  { id: 'read_leave', name: 'Read Leave', description: 'View leave requests', module: 'leave', action: 'read' },
  { id: 'approve_leave', name: 'Approve Leave', description: 'Approve/reject leave requests', module: 'leave', action: 'execute' },
  { id: 'read_payroll', name: 'Read Payroll', description: 'View payroll data', module: 'payroll', action: 'read' },
  { id: 'read_performance', name: 'Read Performance', description: 'View performance data', module: 'performance', action: 'read' },
  { id: 'read_own_profile', name: 'Read Own Profile', description: 'View own employee profile', module: 'employees', action: 'read' },
  { id: 'create_leave_request', name: 'Create Leave Request', description: 'Submit leave requests', module: 'leave', action: 'create' },
  { id: 'read_own_payslip', name: 'Read Own Payslip', description: 'View own payslips', module: 'payroll', action: 'read' }
];

// Default roles
const defaultRoles: Role[] = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full system access',
    permissions: ['*'], // All permissions
    isSystem: true
  },
  {
    id: 'hr_manager',
    name: 'HR Manager',
    description: 'HR management access',
    permissions: [
      'read_employees', 'create_employees', 'update_employees',
      'read_leave', 'approve_leave', 'read_payroll', 'read_performance'
    ],
    isSystem: true
  },
  {
    id: 'employee',
    name: 'Employee',
    description: 'Basic employee access',
    permissions: ['read_own_profile', 'create_leave_request', 'read_own_payslip'],
    isSystem: true
  }
];

// Default dashboard layout
const defaultDashboardLayout: DashboardLayout = {
  id: 'default',
  name: 'Default Layout',
  description: 'Standard dashboard layout for all users',
  userRole: 'all',
  isDefault: true,
  widgets: [
    {
      id: 'employee-stats',
      title: 'Employee Statistics',
      type: 'stats',
      position: { x: 0, y: 0, w: 3, h: 2 },
      config: { metric: 'employees' },
      permissions: ['read_employees'],
      visible: true
    },
    {
      id: 'recent-activity',
      title: 'Recent Activity',
      type: 'list',
      position: { x: 3, y: 0, w: 3, h: 4 },
      config: { limit: 10 },
      permissions: ['read_activity'],
      visible: true
    }
  ]
};

// Initialize system configuration with data from config.json
const systemConfiguration: SystemConfiguration = {
  id: 'system',
  version: '2.1.0',
  lastUpdated: new Date().toISOString(),
  company: {
    name: "TechCorp Solutions",
    logo: "/company-logo.png",
    address: {
      street: "123 Business Center",
      city: "San Francisco",
      state: "CA",
      zipCode: "94105",
      country: "USA"
    },
    timezone: "America/Los_Angeles",
    currency: "USD",
    dateFormat: "MM/dd/yyyy",
    workingDays: [1, 2, 3, 4, 5], // Monday to Friday
    workingHours: { start: "09:00", end: "17:00" },
    fiscalYearStart: "01-01"
  },
  userPreferences: {
    default_user: {
      theme: 'system',
      language: 'en-US',
      timezone: 'America/Los_Angeles',
      dateFormat: 'MM/dd/yyyy',
      currency: 'USD',
      notifications: {
        email: true,
        push: true,
        desktop: false
      },
      dashboard: {
        layout: 'grid',
        widgets: ['stats', 'recent-activity', 'quick-actions'],
        refreshInterval: 300000
      }
    }
  },
  dashboardLayouts: [defaultDashboardLayout],
  roles: defaultRoles,
  permissions: defaultPermissions,
  workflows: [],
  reportTemplates: [],
  features: {
    employee_management: { enabled: true },
    leave_management: { enabled: true },
    payroll: { enabled: true },
    performance: { enabled: true },
    attendance: { enabled: true },
    onboarding: { enabled: true },
    assets: { enabled: true },
    notifications: { enabled: true },
    reports: { enabled: true },
    document_management: { enabled: true },
    time_tracking: { enabled: true },
    expense_management: { enabled: false },
    recruitment: { enabled: false },
    training: { enabled: false },
    advancedReporting: { enabled: true },
    auditLog: { enabled: true },
    bulkOperations: { enabled: true },
    customWorkflows: { enabled: false }
  },
  integrations: {
    slack: { enabled: false, config: { webhookUrl: "" } },
    email: { 
      enabled: true, 
      config: { 
        provider: "smtp", 
        host: "smtp.company.com", 
        port: 587, 
        secure: true 
      } 
    },
    calendar: { enabled: true, config: { provider: "google" } },
    sso: { enabled: false, config: { provider: "" } }
  }
};

// Initialize default data
configDb.systemConfig.create(systemConfiguration);

// Create default user preferences
configDb.userPreferences.create({
  id: 'default_user_prefs',
  userId: 'default_user',
  theme: 'system',
  language: 'en-US',
  timezone: 'America/Los_Angeles',
  dateFormat: 'MM/dd/yyyy',
  currency: 'USD',
  notifications: {
    email: true,
    push: true,
    desktop: false
  },
  dashboard: {
    layout: 'grid',
    widgets: ['stats', 'recent-activity', 'quick-actions'],
    refreshInterval: 300000
  }
});

export { systemConfiguration };