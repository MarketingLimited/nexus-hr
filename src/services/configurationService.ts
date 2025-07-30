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
      const response = await fetch('/src/data/config.json');
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
      const config = await this.loadSystemConfig();
      const userPrefs = config.userPreferences[user] || this.getDefaultUserPreferences();
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
      const config = await this.loadSystemConfig();
      config.userPreferences[user] = preferences;
      
      // Update cache
      this.cache.set(cacheKey, preferences);
      this.cache.set('system_config', config);
      
      // In a real application, this would persist to backend
      console.log('User preferences saved:', preferences);
    } catch (error) {
      console.error('Failed to save user preferences:', error);
      throw error;
    }
  }

  // Load dashboard layouts
  async loadDashboardLayouts(userRole?: string): Promise<DashboardLayout[]> {
    try {
      const config = await this.loadSystemConfig();
      let layouts = config.dashboardLayouts;
      
      if (userRole) {
        layouts = layouts.filter(layout => 
          layout.userRole === userRole || layout.userRole === 'all'
        );
      }
      
      return layouts;
    } catch (error) {
      console.error('Failed to load dashboard layouts:', error);
      return [this.getDefaultDashboardLayout()];
    }
  }

  // Save dashboard layout
  async saveDashboardLayout(layout: DashboardLayout): Promise<void> {
    try {
      const config = await this.loadSystemConfig();
      const existingIndex = config.dashboardLayouts.findIndex(l => l.id === layout.id);
      
      if (existingIndex >= 0) {
        config.dashboardLayouts[existingIndex] = layout;
      } else {
        config.dashboardLayouts.push(layout);
      }
      
      this.cache.set('system_config', config);
      console.log('Dashboard layout saved:', layout);
    } catch (error) {
      console.error('Failed to save dashboard layout:', error);
      throw error;
    }
  }

  // Role-based access control
  async getUserRole(userId?: string): Promise<Role | null> {
    try {
      const config = await this.loadSystemConfig();
      const user = userId || this.currentUserId;
      
      // In a real app, this would come from user authentication
      const defaultRole = config.roles.find(role => role.name === 'Employee');
      return defaultRole || null;
    } catch (error) {
      console.error('Failed to get user role:', error);
      return null;
    }
  }

  async hasPermission(permission: string, userId?: string): Promise<boolean> {
    try {
      const userRole = await this.getUserRole(userId);
      if (!userRole) return false;

      const config = await this.loadSystemConfig();
      
      // Check direct permissions
      if (userRole.permissions.includes(permission)) return true;
      
      // Check inherited permissions
      if (userRole.inherits) {
        for (const inheritedRoleId of userRole.inherits) {
          const inheritedRole = config.roles.find(r => r.id === inheritedRoleId);
          if (inheritedRole && inheritedRole.permissions.includes(permission)) {
            return true;
          }
        }
      }
      
      return false;
    } catch (error) {
      console.error('Failed to check permission:', error);
      return false;
    }
  }

  // Feature flags
  async isFeatureEnabled(featureName: string): Promise<boolean> {
    try {
      const config = await this.loadSystemConfig();
      return config.features[featureName]?.enabled || false;
    } catch (error) {
      console.error('Failed to check feature flag:', error);
      return false;
    }
  }

  async getFeatureConfig(featureName: string): Promise<Record<string, any> | null> {
    try {
      const config = await this.loadSystemConfig();
      return config.features[featureName]?.config || null;
    } catch (error) {
      console.error('Failed to get feature config:', error);
      return null;
    }
  }

  // Company settings
  async getCompanySettings(): Promise<any> {
    try {
      const config = await this.loadSystemConfig();
      return config.company;
    } catch (error) {
      console.error('Failed to get company settings:', error);
      return this.getDefaultCompanySettings();
    }
  }

  // Workflow management
  async getWorkflows(module?: string): Promise<any[]> {
    try {
      const config = await this.loadSystemConfig();
      let workflows = config.workflows.filter(w => w.isActive);
      
      if (module) {
        workflows = workflows.filter(w => w.module === module);
      }
      
      return workflows;
    } catch (error) {
      console.error('Failed to get workflows:', error);
      return [];
    }
  }

  // Report templates
  async getReportTemplates(type?: string): Promise<any[]> {
    try {
      const config = await this.loadSystemConfig();
      let templates = config.reportTemplates;
      
      if (type) {
        templates = templates.filter(t => t.type === type);
      }
      
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