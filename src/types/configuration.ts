// Configuration Types
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
  };
  dashboard: {
    layout: 'grid' | 'list';
    widgets: string[];
    refreshInterval: number;
  };
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'stats' | 'chart' | 'list' | 'table' | 'custom';
  position: { x: number; y: number; w: number; h: number };
  config: Record<string, any>;
  permissions: string[];
  visible: boolean;
}

export interface DashboardLayout {
  id: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  isDefault: boolean;
  userRole: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'execute';
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  inherits?: string[];
  isSystem: boolean;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'approval' | 'notification' | 'action' | 'condition';
  config: Record<string, any>;
  nextSteps: string[];
  conditions?: Record<string, any>;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  module: string;
  trigger: string;
  steps: WorkflowStep[];
  isActive: boolean;
}

export interface CompanySettings {
  name: string;
  logo: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  timezone: string;
  currency: string;
  dateFormat: string;
  workingDays: number[];
  workingHours: { start: string; end: string };
  fiscalYearStart: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'employee' | 'leave' | 'payroll' | 'performance' | 'attendance';
  fields: string[];
  filters: Record<string, any>;
  groupBy?: string[];
  sortBy?: { field: string; order: 'asc' | 'desc' }[];
  format: 'table' | 'chart' | 'summary';
  permissions: string[];
}

export interface SystemConfiguration {
  id: string;
  version: string;
  lastUpdated: string;
  company: CompanySettings;
  userPreferences: Record<string, UserPreferences>;
  dashboardLayouts: DashboardLayout[];
  roles: Role[];
  permissions: Permission[];
  workflows: Workflow[];
  reportTemplates: ReportTemplate[];
  features: {
    [key: string]: {
      enabled: boolean;
      config?: Record<string, any>;
    };
  };
  integrations: {
    [key: string]: {
      enabled: boolean;
      config: Record<string, any>;
    };
  };
}