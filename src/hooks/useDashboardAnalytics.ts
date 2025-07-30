import { useMemo } from 'react';
import { useDashboardData } from './useDataManager';
import { CalculationUtils } from '../utils/calculations';

export interface DashboardStats {
  totalEmployees: {
    value: number;
    change: string;
    changeType: 'positive' | 'negative' | 'neutral';
  };
  pendingLeaveRequests: {
    value: number;
    change: string;
    changeType: 'positive' | 'negative' | 'neutral';
  };
  monthlyPayroll: {
    value: string;
    change: string;
    changeType: 'positive' | 'negative' | 'neutral';
  };
  performanceReviews: {
    value: string;
    change: string;
    changeType: 'positive' | 'negative' | 'neutral';
  };
}

export interface ModuleStats {
  employees: {
    active: number;
    newThisMonth: number;
    notifications: number;
  };
  leave: {
    pendingRequests: number;
    approvedToday: number;
    notifications: number;
  };
  payroll: {
    nextPayrollDays: number;
    totalAmount: string;
  };
  performance: {
    completionRate: number;
    dueThisWeek: number;
    notifications: number;
  };
  onboarding: {
    activeProcesses: number;
    completionRate: number;
    notifications: number;
  };
  attendance: {
    presentToday: number;
    lateArrivals: number;
  };
}

export function useDashboardAnalytics() {
  const {
    employees,
    departments,
    leave,
    payroll,
    performance,
    attendance,
    notifications,
    loading,
    error
  } = useDashboardData();

  const dashboardStats = useMemo<DashboardStats | null>(() => {
    if (!employees || !leave || !payroll || !performance) return null;

    const employeeStats = CalculationUtils.calculateEmployeeStats(employees.employees);
    const leaveStats = CalculationUtils.calculateLeaveStats(leave);
    const payrollStats = CalculationUtils.calculatePayrollStats(payroll, employees.employees);
    const performanceStats = CalculationUtils.calculatePerformanceStats(performance);

    return {
      totalEmployees: {
        value: employeeStats.total,
        change: `+${employeeStats.newHiresThisMonth}`,
        changeType: employeeStats.newHiresThisMonth > 0 ? 'positive' : 'neutral'
      },
      pendingLeaveRequests: {
        value: leaveStats.pendingRequests,
        change: leaveStats.pendingRequests > 10 ? '+3' : '0',
        changeType: 'neutral'
      },
      monthlyPayroll: {
        value: `$${Math.round(payrollStats.totalPayrollCost / 1000)}K`,
        change: '+2.1%',
        changeType: 'positive'
      },
      performanceReviews: {
        value: `${Math.round(performanceStats.reviewCompletionRate)}%`,
        change: '+5.2%',
        changeType: 'positive'
      }
    };
  }, [employees, leave, payroll, performance]);

  const moduleStats = useMemo<ModuleStats | null>(() => {
    if (!employees || !leave || !payroll || !performance || !attendance) return null;

    const employeeStats = CalculationUtils.calculateEmployeeStats(employees.employees);
    const leaveStats = CalculationUtils.calculateLeaveStats(leave);
    const payrollStats = CalculationUtils.calculatePayrollStats(payroll, employees.employees);
    const performanceStats = CalculationUtils.calculatePerformanceStats(performance);
    const attendanceStats = CalculationUtils.calculateAttendanceStats(attendance, employees.employees);

    return {
      employees: {
        active: employeeStats.active,
        newThisMonth: employeeStats.newHiresThisMonth,
        notifications: 3 // Could be calculated from notifications data
      },
      leave: {
        pendingRequests: leaveStats.pendingRequests,
        approvedToday: leaveStats.approvedRequests,
        notifications: leaveStats.pendingRequests
      },
      payroll: {
        nextPayrollDays: 5, // This would come from config or calculation
        totalAmount: `$${Math.round(payrollStats.totalPayrollCost / 1000)}K`
      },
      performance: {
        completionRate: Math.round(performanceStats.reviewCompletionRate),
        dueThisWeek: 12, // Would be calculated from performance data
        notifications: 5
      },
      onboarding: {
        activeProcesses: 8, // Would come from onboarding data
        completionRate: 92,
        notifications: 2
      },
      attendance: {
        presentToday: attendanceStats.presentToday,
        lateArrivals: attendanceStats.lateToday
      }
    };
  }, [employees, leave, payroll, performance, attendance]);

  const recentActivities = useMemo(() => {
    if (!notifications) return [];
    
    return notifications.notifications
      .filter(notification => notification.status === 'unread')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(notification => ({
        id: notification.id,
        user: {
          name: `User ${notification.senderId}`, // Would be resolved from employees data
          email: `user${notification.senderId}@company.com`,
          avatar: "/placeholder.svg"
        },
        action: notification.message,
        type: notification.category,
        status: notification.priority,
        timestamp: new Date(notification.createdAt)
      }));
  }, [notifications]);

  return {
    dashboardStats,
    moduleStats,
    recentActivities,
    loading,
    error
  };
}