import { SystemConfiguration, UserPreferences, DashboardLayout, Role, Permission } from '../types/configuration';

class ConfigurationService {
  private cache = new Map<string, any>();
  private currentUserId: string = 'default_user'; // In real app, get from auth context

  // Load system configuration
  async loadSystemConfig(): Promise<SystemConfiguration> {
    if (this.cache.has('system_config')) {
      return this.cache.get('system_config');
    }

    try {
      const response = await fetch('/api/config/system');
      if (!response.ok) {
        throw new Error('Failed to load system configuration');
      }
      const config = await response.json();
      this.cache.set('system_config', config);
      return config;
    } catch (error) {
      console.error('Failed to load system configuration:', error);
      return this.getDefaultConfiguration();
    }
  }

  // Load user preferences
  async loadUserPreferences(userId?: string): Promise<UserPreferences> {
    const user = userId || this.currentUserId;
    const cacheKey = `user_preferences_${user}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(`/api/config/user/${user}`);
      if (!response.ok) {
        throw new Error('Failed to load user preferences');
      }
      const userPrefs = await response.json();
      this.cache.set(cacheKey, userPrefs);
      return userPrefs;
    } catch (error) {
      console.error('Failed to load user preferences:', error);
      return this.getDefaultUserPreferences();
    }
  }

  // Save user preferences
  async saveUserPreferences(preferences: UserPreferences, userId?: string): Promise<void> {
    const user = userId || this.currentUserId;
    const cacheKey = `user_preferences_${user}`;
    
    try {
      const response = await fetch(`/api/config/user/${user}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save user preferences');
      }
      
      const updatedPrefs = await response.json();
      
      // Update cache
      this.cache.set(cacheKey, updatedPrefs);
      
      console.log('User preferences saved:', updatedPrefs);
    } catch (error) {
      console.error('Failed to save user preferences:', error);
      throw error;
    }
  }

  // Load dashboard layouts
  async loadDashboardLayouts(userRole?: string): Promise<DashboardLayout[]> {
    try {
      const url = userRole ? `/api/config/dashboards?role=${userRole}` : '/api/config/dashboards';
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to load dashboard layouts');
      }
      
      const layouts = await response.json();
      return layouts;
    } catch (error) {
      console.error('Failed to load dashboard layouts:', error);
      return [this.getDefaultDashboardLayout()];
    }
  }

  // Save dashboard layout
  async saveDashboardLayout(layout: DashboardLayout): Promise<void> {
    try {
      const response = await fetch('/api/config/dashboards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(layout),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save dashboard layout');
      }
      
      const savedLayout = await response.json();
      console.log('Dashboard layout saved:', savedLayout);
    } catch (error) {
      console.error('Failed to save dashboard layout:', error);
      throw error;
    }
  }

  // Role-based access control
  async getUserRole(userId?: string): Promise<Role | null> {
    try {
      const user = userId || this.currentUserId;
      const response = await fetch(`/api/config/role/${user}`);
      
      if (!response.ok) {
        throw new Error('Failed to get user role');
      }
      
      const role = await response.json();
      return role;
    } catch (error) {
      console.error('Failed to get user role:', error);
      return null;
    }
  }

  async hasPermission(permission: string, userId?: string): Promise<boolean> {
    try {
      const user = userId || this.currentUserId;
      const response = await fetch(`/api/config/permission/${user}/${permission}`);
      
      if (!response.ok) {
        throw new Error('Failed to check permission');
      }
      
      const result = await response.json();
      return result.hasPermission;
    } catch (error) {
      console.error('Failed to check permission:', error);
      return false;
    }
  }

  // Feature flags
  async isFeatureEnabled(featureName: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/config/features/${featureName}`);
      
      if (!response.ok) {
        throw new Error('Failed to check feature flag');
      }
      
      const feature = await response.json();
      return feature.enabled || false;
    } catch (error) {
      console.error('Failed to check feature flag:', error);
      return false;
    }
  }

  async getFeatureConfig(featureName: string): Promise<Record<string, any> | null> {
    try {
      const response = await fetch(`/api/config/features/${featureName}`);
      
      if (!response.ok) {
        throw new Error('Failed to get feature config');
      }
      
      const feature = await response.json();
      return feature.config || null;
    } catch (error) {
      console.error('Failed to get feature config:', error);
      return null;
    }
  }

  // Company settings
  async getCompanySettings(): Promise<any> {
    try {
      const response = await fetch('/api/config/company');
      
      if (!response.ok) {
        throw new Error('Failed to get company settings');
      }
      
      const settings = await response.json();
      return settings;
    } catch (error) {
      console.error('Failed to get company settings:', error);
      return this.getDefaultCompanySettings();
    }
  }

  // Workflow management
  async getWorkflows(module?: string): Promise<any[]> {
    try {
      const url = module ? `/api/config/workflows?module=${module}` : '/api/config/workflows';
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to get workflows');
      }
      
      const workflows = await response.json();
      return workflows;
    } catch (error) {
      console.error('Failed to get workflows:', error);
      return [];
    }
  }

  // Report templates
  async getReportTemplates(type?: string): Promise<any[]> {
    try {
      const url = type ? `/api/config/reports?type=${type}` : '/api/config/reports';
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to get report templates');
      }
      
      const templates = await response.json();
      return templates;
    } catch (error) {
      console.error('Failed to get report templates:', error);
      return [];
    }
  }

  // Locale and timezone support
  async getLocaleSettings(): Promise<{ language: string; timezone: string; dateFormat: string; currency: string }> {
    try {
      const preferences = await this.loadUserPreferences();
      const company = await this.getCompanySettings();
      
      return {
        language: preferences.language || 'en-US',
        timezone: preferences.timezone || company.timezone || 'UTC',
        dateFormat: preferences.dateFormat || company.dateFormat || 'MM/dd/yyyy',
        currency: preferences.currency || company.currency || 'USD'
      };
    } catch (error) {
      console.error('Failed to get locale settings:', error);
      return {
        language: 'en-US',
        timezone: 'UTC',
        dateFormat: 'MM/dd/yyyy',
        currency: 'USD'
      };
    }
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Default configurations
  private getDefaultConfiguration(): SystemConfiguration {
    return {
      id: 'default',
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      company: this.getDefaultCompanySettings(),
      userPreferences: {},
      dashboardLayouts: [this.getDefaultDashboardLayout()],
      roles: this.getDefaultRoles(),
      permissions: this.getDefaultPermissions(),
      workflows: [],
      reportTemplates: [],
      features: {
        advancedReporting: { enabled: true },
        auditLog: { enabled: true },
        bulkOperations: { enabled: true },
        customWorkflows: { enabled: false }
      },
      integrations: {}
    };
  }

  private getDefaultUserPreferences(): UserPreferences {
    return {
      theme: 'system',
      language: 'en-US',
      timezone: 'UTC',
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
        refreshInterval: 300000 // 5 minutes
      }
    };
  }

  private getDefaultDashboardLayout(): DashboardLayout {
    return {
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
  }

  private getDefaultCompanySettings(): any {
    return {
      name: 'Your Company',
      logo: '/placeholder.svg',
      address: {
        street: '123 Business St',
        city: 'Business City',
        state: 'BC',
        zipCode: '12345',
        country: 'United States'
      },
      timezone: 'UTC',
      currency: 'USD',
      dateFormat: 'MM/dd/yyyy',
      workingDays: [1, 2, 3, 4, 5], // Monday to Friday
      workingHours: { start: '09:00', end: '17:00' },
      fiscalYearStart: '01-01'
    };
  }

  private getDefaultRoles(): Role[] {
    return [
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
  }

  private getDefaultPermissions(): Permission[] {
    return [
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
  }
}

export const configurationService = new ConfigurationService();