import { http, HttpResponse } from 'msw';
import { configDb } from '../data/config';

export const configHandlers = [
  // Get system configuration
  http.get('/api/config/system', () => {
    const config = configDb.systemConfig.findFirst({
      where: { id: { equals: 'system' } }
    });
    
    if (!config) {
      return HttpResponse.json(
        { error: 'System configuration not found' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json(config);
  }),

  // Get user preferences
  http.get('/api/config/user/:userId', ({ params }) => {
    const { userId } = params;
    
    let userPrefs = configDb.userPreferences.findFirst({
      where: { userId: { equals: userId as string } }
    });
    
    if (!userPrefs) {
      // Return default preferences if not found
      const defaultPrefs = {
        id: `${userId}_prefs`,
        userId: userId as string,
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
      };
      return HttpResponse.json(defaultPrefs);
    }
    
    return HttpResponse.json(userPrefs);
  }),

  // Update user preferences
  http.put('/api/config/user/:userId', async ({ params, request }) => {
    const { userId } = params;
    const preferences = await request.json() as any;
    
    // Check if preferences exist
    const existing = configDb.userPreferences.findFirst({
      where: { userId: { equals: userId as string } }
    });
    
    if (existing) {
      // Update existing preferences
      const updated = configDb.userPreferences.update({
        where: { id: { equals: existing.id } },
        data: { ...preferences, userId: userId as string }
      });
      return HttpResponse.json(updated);
    } else {
      // Create new preferences
      const created = configDb.userPreferences.create({
        id: `${userId}_prefs`,
        userId: userId as string,
        ...preferences
      });
      return HttpResponse.json(created);
    }
  }),

  // Get company settings
  http.get('/api/config/company', () => {
    const config = configDb.systemConfig.findFirst({
      where: { id: { equals: 'system' } }
    });
    
    if (!config) {
      return HttpResponse.json(
        { error: 'Company settings not found' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json(config.company);
  }),

  // Get dashboard layouts
  http.get('/api/config/dashboards', ({ request }) => {
    const url = new URL(request.url);
    const userRole = url.searchParams.get('role');
    
    const config = configDb.systemConfig.findFirst({
      where: { id: { equals: 'system' } }
    });
    
    if (!config) {
      return HttpResponse.json([]);
    }
    
    let layouts = config.dashboardLayouts;
    
    if (userRole) {
      layouts = layouts.filter((layout: any) => 
        layout.userRole === userRole || layout.userRole === 'all'
      );
    }
    
    return HttpResponse.json(layouts);
  }),

  // Save dashboard layout
  http.post('/api/config/dashboards', async ({ request }) => {
    const layout = await request.json() as any;
    
    const config = configDb.systemConfig.findFirst({
      where: { id: { equals: 'system' } }
    });
    
    if (!config) {
      return HttpResponse.json(
        { error: 'System configuration not found' },
        { status: 404 }
      );
    }
    
    const existingIndex = config.dashboardLayouts.findIndex((l: any) => l.id === layout.id);
    
    if (existingIndex >= 0) {
      config.dashboardLayouts[existingIndex] = layout;
    } else {
      config.dashboardLayouts.push(layout);
    }
    
    // Update the configuration
    configDb.systemConfig.update({
      where: { id: { equals: 'system' } },
      data: { dashboardLayouts: config.dashboardLayouts }
    });
    
    return HttpResponse.json(layout);
  }),

  // Get workflows
  http.get('/api/config/workflows', ({ request }) => {
    const url = new URL(request.url);
    const module = url.searchParams.get('module');
    
    const config = configDb.systemConfig.findFirst({
      where: { id: { equals: 'system' } }
    });
    
    if (!config) {
      return HttpResponse.json([]);
    }
    
    let workflows = config.workflows.filter((w: any) => w.isActive);
    
    if (module) {
      workflows = workflows.filter((w: any) => w.module === module);
    }
    
    return HttpResponse.json(workflows);
  }),

  // Get report templates
  http.get('/api/config/reports', ({ request }) => {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    
    const config = configDb.systemConfig.findFirst({
      where: { id: { equals: 'system' } }
    });
    
    if (!config) {
      return HttpResponse.json([]);
    }
    
    let templates = config.reportTemplates;
    
    if (type) {
      templates = templates.filter((t: any) => t.type === type);
    }
    
    return HttpResponse.json(templates);
  }),

  // Get feature flags
  http.get('/api/config/features/:featureName', ({ params }) => {
    const { featureName } = params;
    
    const config = configDb.systemConfig.findFirst({
      where: { id: { equals: 'system' } }
    });
    
    if (!config) {
      return HttpResponse.json({ enabled: false });
    }
    
    const feature = config.features[featureName as string];
    return HttpResponse.json(feature || { enabled: false });
  }),

  // Get user role
  http.get('/api/config/role/:userId', ({ params }) => {
    const { userId } = params;
    
    const config = configDb.systemConfig.findFirst({
      where: { id: { equals: 'system' } }
    });
    
    if (!config) {
      return HttpResponse.json(null);
    }
    
    // In a real app, this would come from user authentication
    // For now, return the default Employee role
    const defaultRole = config.roles.find((role: any) => role.name === 'Employee');
    return HttpResponse.json(defaultRole || null);
  }),

  // Check permission
  http.get('/api/config/permission/:userId/:permission', ({ params }) => {
    const { userId, permission } = params;
    
    const config = configDb.systemConfig.findFirst({
      where: { id: { equals: 'system' } }
    });
    
    if (!config) {
      return HttpResponse.json({ hasPermission: false });
    }
    
    // Get user role (default to Employee for now)
    const userRole = config.roles.find((role: any) => role.name === 'Employee') as any;
    
    if (!userRole) {
      return HttpResponse.json({ hasPermission: false });
    }
    
    // Check direct permissions
    if (userRole.permissions?.includes(permission) || userRole.permissions?.includes('*')) {
      return HttpResponse.json({ hasPermission: true });
    }
    
    // Check inherited permissions
    if (userRole.inherits) {
      for (const inheritedRoleId of userRole.inherits) {
        const inheritedRole = config.roles.find((r: any) => r.id === inheritedRoleId) as any;
        if (inheritedRole && (inheritedRole.permissions?.includes(permission) || inheritedRole.permissions?.includes('*'))) {
          return HttpResponse.json({ hasPermission: true });
        }
      }
    }
    
    return HttpResponse.json({ hasPermission: false });
  }),
];