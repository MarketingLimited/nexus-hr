import React, { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { configurationService } from '../services/configurationService';
import { UserPreferences, DashboardLayout, Role } from '../types/configuration';

// Configuration Context
interface ConfigurationContextType {
  userPreferences: UserPreferences | null;
  userRole: Role | null;
  companySettings: any;
  localeSettings: any;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  isFeatureEnabled: (feature: string) => boolean;
  loading: boolean;
  error: string | null;
}

const ConfigurationContext = createContext<ConfigurationContextType | null>(null);

export const ConfigurationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [companySettings, setCompanySettings] = useState<any>(null);
  const [localeSettings, setLocaleSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<Set<string>>(new Set());
  const [features, setFeatures] = useState<Set<string>>(new Set());

  // Load configuration data
  const loadConfiguration = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [prefs, role, company, locale] = await Promise.all([
        configurationService.loadUserPreferences(),
        configurationService.getUserRole(),
        configurationService.getCompanySettings(),
        configurationService.getLocaleSettings()
      ]);

      setUserPreferences(prefs);
      setUserRole(role);
      setCompanySettings(company);
      setLocaleSettings(locale);

      // Load permissions
      if (role) {
        const permissionChecks = await Promise.all(
          role.permissions.map(p => 
            configurationService.hasPermission(p).then(hasIt => ({ permission: p, hasIt }))
          )
        );
        
        const userPermissions = new Set(
          permissionChecks.filter(p => p.hasIt).map(p => p.permission)
        );
        setPermissions(userPermissions);
      }

      // Load feature flags
      const config = await configurationService.loadSystemConfig();
      const enabledFeatures = new Set(
        Object.entries(config.features)
          .filter(([_, feature]) => feature.enabled)
          .map(([name]) => name)
      );
      setFeatures(enabledFeatures);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load configuration');
    } finally {
      setLoading(false);
    }
  }, []);

  // Update user preferences
  const updateUserPreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    if (!userPreferences) return;

    try {
      const updatedPreferences = { ...userPreferences, ...updates };
      await configurationService.saveUserPreferences(updatedPreferences);
      setUserPreferences(updatedPreferences);
    } catch (err) {
      console.error('Failed to update user preferences:', err);
      throw err;
    }
  }, [userPreferences]);

  // Check permissions
  const hasPermission = useCallback((permission: string) => {
    return permissions.has(permission) || permissions.has('*');
  }, [permissions]);

  // Check feature flags
  const isFeatureEnabled = useCallback((feature: string) => {
    return features.has(feature);
  }, [features]);

  // Load configuration on mount
  useEffect(() => {
    loadConfiguration();
  }, [loadConfiguration]);

  const value: ConfigurationContextType = {
    userPreferences,
    userRole,
    companySettings,
    localeSettings,
    updateUserPreferences,
    hasPermission,
    isFeatureEnabled,
    loading,
    error
  };

  return (
    <ConfigurationContext.Provider value={value}>
      {children}
    </ConfigurationContext.Provider>
  );
};

export const useConfiguration = () => {
  const context = useContext(ConfigurationContext);
  if (!context) {
    throw new Error('useConfiguration must be used within a ConfigurationProvider');
  }
  return context;
};

// Specific hooks for different aspects
export const useUserPreferences = () => {
  const { userPreferences, updateUserPreferences, loading, error } = useConfiguration();
  return { userPreferences, updateUserPreferences, loading, error };
};

export const usePermissions = () => {
  const { hasPermission, userRole } = useConfiguration();
  return { hasPermission, userRole };
};

export const useFeatureFlags = () => {
  const { isFeatureEnabled } = useConfiguration();
  return { isFeatureEnabled };
};

export const useCompanySettings = () => {
  const { companySettings, localeSettings } = useConfiguration();
  return { companySettings, localeSettings };
};

// Dashboard layout management
export const useDashboardLayouts = () => {
  const [layouts, setLayouts] = useState<DashboardLayout[]>([]);
  const [activeLayout, setActiveLayout] = useState<DashboardLayout | null>(null);
  const [loading, setLoading] = useState(false);
  const { userRole } = useConfiguration();

  const loadLayouts = useCallback(async () => {
    if (!userRole) return;

    setLoading(true);
    try {
      const layouts = await configurationService.loadDashboardLayouts(userRole.name);
      setLayouts(layouts);
      
      const defaultLayout = layouts.find(l => l.isDefault) || layouts[0];
      setActiveLayout(defaultLayout);
    } catch (error) {
      console.error('Failed to load dashboard layouts:', error);
    } finally {
      setLoading(false);
    }
  }, [userRole]);

  const saveLayout = useCallback(async (layout: DashboardLayout) => {
    try {
      await configurationService.saveDashboardLayout(layout);
      await loadLayouts(); // Reload layouts
    } catch (error) {
      console.error('Failed to save dashboard layout:', error);
      throw error;
    }
  }, [loadLayouts]);

  useEffect(() => {
    loadLayouts();
  }, [loadLayouts]);

  return {
    layouts,
    activeLayout,
    setActiveLayout,
    saveLayout,
    loading
  };
};