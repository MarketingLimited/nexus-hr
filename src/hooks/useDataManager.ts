import { useState, useEffect, useCallback } from 'react';
import { dataService } from '../services/dataService';
import {
  EmployeeData,
  DepartmentData,
  LeaveData,
  PayrollData,
  PerformanceData,
  AttendanceData,
  NotificationData,
  OnboardingData,
  AssetData,
  RoleData,
  ConfigData
} from '../types';

interface UseDataManagerOptions {
  autoLoad?: boolean;
  cacheTimeout?: number;
}

interface DataState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export function useDataManager<T>(
  dataType: string,
  options: UseDataManagerOptions = {}
) {
  const { autoLoad = true, cacheTimeout = 5 * 60 * 1000 } = options; // 5 minutes default cache

  const [state, setState] = useState<DataState<T>>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: null,
  });

  const loadData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      let data: T;
      
      switch (dataType) {
        case 'employees':
          data = await dataService.loadEmployees() as T;
          break;
        case 'departments':
          data = await dataService.loadDepartments() as T;
          break;
        case 'leave':
          data = await dataService.loadLeave() as T;
          break;
        case 'payroll':
          data = await dataService.loadPayroll() as T;
          break;
        case 'performance':
          data = await dataService.loadPerformance() as T;
          break;
        case 'attendance':
          data = await dataService.loadAttendance() as T;
          break;
        case 'notifications':
          data = await dataService.loadNotifications() as T;
          break;
        case 'onboarding':
          data = await dataService.loadOnboarding() as T;
          break;
        case 'assets':
          data = await dataService.loadAssets() as T;
          break;
        case 'roles':
          data = await dataService.loadRoles() as T;
          break;
        case 'config':
          data = await dataService.loadConfig() as T;
          break;
        default:
          throw new Error(`Unknown data type: ${dataType}`);
      }

      setState({
        data,
        loading: false,
        error: null,
        lastUpdated: new Date(),
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load data',
      }));
    }
  }, [dataType]);

  const refreshData = useCallback(() => {
    dataService.clearCacheKey(dataType);
    return loadData();
  }, [dataType, loadData]);

  const updateData = useCallback((newData: T) => {
    setState(prev => ({
      ...prev,
      data: newData,
      lastUpdated: new Date(),
    }));
  }, []);

  // Check if data is stale
  const isStale = useCallback(() => {
    if (!state.lastUpdated) return true;
    return Date.now() - state.lastUpdated.getTime() > cacheTimeout;
  }, [state.lastUpdated, cacheTimeout]);

  // Auto-load data on mount or when stale
  useEffect(() => {
    if (autoLoad && (!state.data || isStale())) {
      loadData();
    }
  }, [autoLoad, loadData, state.data, isStale]);

  return {
    ...state,
    loadData,
    refreshData,
    updateData,
    isStale: isStale(),
  };
}

// Specialized hooks for each data type
export const useEmployees = (options?: UseDataManagerOptions) => 
  useDataManager<EmployeeData>('employees', options);

export const useDepartments = (options?: UseDataManagerOptions) => 
  useDataManager<DepartmentData>('departments', options);

export const useLeave = (options?: UseDataManagerOptions) => 
  useDataManager<LeaveData>('leave', options);

export const usePayroll = (options?: UseDataManagerOptions) => 
  useDataManager<PayrollData>('payroll', options);

export const usePerformance = (options?: UseDataManagerOptions) => 
  useDataManager<PerformanceData>('performance', options);

export const useAttendance = (options?: UseDataManagerOptions) => 
  useDataManager<AttendanceData>('attendance', options);

export const useNotifications = (options?: UseDataManagerOptions) => 
  useDataManager<NotificationData>('notifications', options);

export const useOnboarding = (options?: UseDataManagerOptions) => 
  useDataManager<OnboardingData>('onboarding', options);

export const useAssets = (options?: UseDataManagerOptions) => 
  useDataManager<AssetData>('assets', options);

export const useRoles = (options?: UseDataManagerOptions) => 
  useDataManager<RoleData>('roles', options);

export const useConfig = (options?: UseDataManagerOptions) => 
  useDataManager<ConfigData>('config', options);

// Combined data hook for dashboard
export const useDashboardData = () => {
  const employees = useEmployees();
  const departments = useDepartments();
  const leave = useLeave();
  const payroll = usePayroll();
  const performance = usePerformance();
  const attendance = useAttendance();
  const notifications = useNotifications();

  const loading = employees.loading || departments.loading || leave.loading || 
                  payroll.loading || performance.loading || attendance.loading ||
                  notifications.loading;

  const error = employees.error || departments.error || leave.error || 
                payroll.error || performance.error || attendance.error ||
                notifications.error;

  return {
    employees: employees.data,
    departments: departments.data,
    leave: leave.data,
    payroll: payroll.data,
    performance: performance.data,
    attendance: attendance.data,
    notifications: notifications.data,
    loading,
    error,
    refreshAll: () => {
      employees.refreshData();
      departments.refreshData();
      leave.refreshData();
      payroll.refreshData();
      performance.refreshData();
      attendance.refreshData();
      notifications.refreshData();
    },
  };
};