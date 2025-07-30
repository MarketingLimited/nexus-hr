import { 
  EmployeeData, 
  DepartmentData, 
  LeaveData, 
  PayrollData, 
  PerformanceData, 
  AttendanceData,
  Employee,
  LeaveRequest,
  PerformanceReview,
  Goal
} from '../types';

export class CalculationUtils {
  // Employee Statistics
  static calculateEmployeeStats(employees: Employee[]) {
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const oneQuarterAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());

    const activeEmployees = employees.filter(emp => emp.employmentInfo.status === 'active');
    const inactiveEmployees = employees.filter(emp => emp.employmentInfo.status !== 'active');
    
    const newHiresThisMonth = employees.filter(emp => {
      const startDate = new Date(emp.employmentInfo.startDate);
      return startDate >= oneMonthAgo && emp.employmentInfo.status === 'active';
    });

    const newHiresThisQuarter = employees.filter(emp => {
      const startDate = new Date(emp.employmentInfo.startDate);
      return startDate >= oneQuarterAgo && emp.employmentInfo.status === 'active';
    });

    return {
      total: employees.length,
      active: activeEmployees.length,
      inactive: inactiveEmployees.length,
      newHiresThisMonth: newHiresThisMonth.length,
      newHiresThisQuarter: newHiresThisQuarter.length,
      turnoverRate: this.calculateTurnoverRate(employees),
      averageTenure: this.calculateAverageTenure(activeEmployees),
    };
  }

  static calculateTurnoverRate(employees: Employee[]): number {
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    
    const terminated = employees.filter(emp => 
      emp.employmentInfo.status === 'terminated' &&
      new Date(emp.employmentInfo.startDate) >= oneYearAgo
    );
    
    const averageEmployees = employees.filter(emp => 
      new Date(emp.employmentInfo.startDate) >= oneYearAgo
    );

    return averageEmployees.length > 0 ? (terminated.length / averageEmployees.length) * 100 : 0;
  }

  static calculateAverageTenure(employees: Employee[]): number {
    if (employees.length === 0) return 0;
    
    const now = new Date();
    const totalTenure = employees.reduce((sum, emp) => {
      const startDate = new Date(emp.employmentInfo.startDate);
      const tenureMonths = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      return sum + tenureMonths;
    }, 0);

    return totalTenure / employees.length;
  }

  // Department Statistics
  static calculateDepartmentStats(departments: any[], employees: Employee[]) {
    const departmentEmployeeCounts = departments.map(dept => {
      const deptEmployees = employees.filter(emp => emp.employmentInfo.department === dept.id);
      return {
        ...dept,
        actualEmployeeCount: deptEmployees.length
      };
    });

    const totalTeams = departments.reduce((sum, dept) => sum + dept.teams.length, 0);
    const averageTeamSize = totalTeams > 0 ? 
      departments.reduce((sum, dept) => sum + dept.teams.reduce((teamSum, team) => teamSum + team.members.length, 0), 0) / totalTeams : 0;

    const largestDepartment = departmentEmployeeCounts.reduce((largest, current) => 
      current.actualEmployeeCount > largest.actualEmployeeCount ? current : largest
    );

    return {
      totalDepartments: departments.length,
      totalTeams,
      averageTeamSize: Math.round(averageTeamSize * 10) / 10,
      largestDepartment: largestDepartment.id,
      departmentEmployeeCounts
    };
  }

  // Leave Statistics
  static calculateLeaveStats(leaveData: LeaveData) {
    const { leaveRequests, leaveBalances } = leaveData;
    
    const pendingRequests = leaveRequests.filter(req => req.status === 'pending');
    const approvedRequests = leaveRequests.filter(req => req.status === 'approved');
    const rejectedRequests = leaveRequests.filter(req => req.status === 'rejected');

    // Calculate approval rate
    const totalProcessed = approvedRequests.length + rejectedRequests.length;
    const approvalRate = totalProcessed > 0 ? (approvedRequests.length / totalProcessed) * 100 : 0;

    // Calculate average approval time
    const approvedWithDates = approvedRequests.filter(req => req.approvedDate);
    const averageApprovalTime = approvedWithDates.length > 0 ?
      approvedWithDates.reduce((sum, req) => {
        const requestDate = new Date(req.requestDate);
        const approvedDate = new Date(req.approvedDate!);
        return sum + (approvedDate.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24);
      }, 0) / approvedWithDates.length : 0;

    // Most used leave type
    const leaveTypeCounts = leaveRequests.reduce((counts, req) => {
      counts[req.leaveType] = (counts[req.leaveType] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const mostUsedLeaveType = Object.entries(leaveTypeCounts).reduce((most, [type, count]) => 
      count > most.count ? { type, count } : most
    , { type: '', count: 0 });

    // Calculate leave utilization
    const totalLeaveUsed = leaveBalances.reduce((sum, balance) => sum + balance.used, 0);
    const totalLeaveAllocated = leaveBalances.reduce((sum, balance) => sum + balance.total, 0);
    const utilizationRate = totalLeaveAllocated > 0 ? (totalLeaveUsed / totalLeaveAllocated) * 100 : 0;

    return {
      totalRequests: leaveRequests.length,
      pendingRequests: pendingRequests.length,
      approvedRequests: approvedRequests.length,
      rejectedRequests: rejectedRequests.length,
      approvalRate: Math.round(approvalRate * 10) / 10,
      averageApprovalTime: Math.round(averageApprovalTime * 10) / 10,
      mostUsedLeaveType: mostUsedLeaveType.type,
      utilizationRate: Math.round(utilizationRate * 10) / 10,
      totalLeaveUsed,
      totalLeaveAllocated
    };
  }

  // Payroll Statistics
  static calculatePayrollStats(payrollData: PayrollData, employees: Employee[]) {
    const { payslips, salaryStructures } = payrollData;
    
    const totalGrossPay = payslips.reduce((sum, payslip) => sum + payslip.grossPay, 0);
    const totalNetPay = payslips.reduce((sum, payslip) => sum + payslip.netPay, 0);
    const totalDeductions = payslips.reduce((sum, payslip) => sum + payslip.totalDeductions, 0);

    const salaries = employees.map(emp => emp.employmentInfo.salary);
    const averageSalary = salaries.length > 0 ? salaries.reduce((sum, sal) => sum + sal, 0) / salaries.length : 0;
    const minSalary = Math.min(...salaries);
    const maxSalary = Math.max(...salaries);

    // Calculate tax efficiency
    const effectiveTaxRate = totalGrossPay > 0 ? (totalDeductions / totalGrossPay) * 100 : 0;

    return {
      totalPayrollCost: totalGrossPay,
      totalNetPay,
      totalDeductions,
      averageSalary: Math.round(averageSalary),
      minSalary,
      maxSalary,
      employeesCount: employees.filter(emp => emp.employmentInfo.status === 'active').length,
      effectiveTaxRate: Math.round(effectiveTaxRate * 10) / 10,
      payrollGrowth: this.calculatePayrollGrowth(payslips)
    };
  }

  static calculatePayrollGrowth(payslips: any[]): number {
    // Group payslips by period and calculate growth
    const periodTotals = payslips.reduce((totals, payslip) => {
      totals[payslip.period] = (totals[payslip.period] || 0) + payslip.grossPay;
      return totals;
    }, {} as Record<string, number>);

    const periods = Object.keys(periodTotals).sort();
    if (periods.length < 2) return 0;

    const latest = periodTotals[periods[periods.length - 1]];
    const previous = periodTotals[periods[periods.length - 2]];
    
    return previous > 0 ? ((latest - previous) / previous) * 100 : 0;
  }

  // Performance Statistics
  static calculatePerformanceStats(performanceData: PerformanceData) {
    const { reviews, goals, feedback } = performanceData;
    
    const completedReviews = reviews.filter(review => review.status === 'completed');
    const inProgressReviews = reviews.filter(review => review.status === 'in_progress');
    const overdueReviews = reviews.filter(review => {
      const dueDate = new Date(review.dueDate);
      return review.status !== 'completed' && dueDate < new Date();
    });

    // Calculate average rating
    const ratingsWithValues = completedReviews.filter(review => review.overallRating !== null);
    const averageRating = ratingsWithValues.length > 0 ?
      ratingsWithValues.reduce((sum, review) => sum + review.overallRating!, 0) / ratingsWithValues.length : 0;

    // Goal statistics
    const goalsInProgress = goals.filter(goal => goal.status === 'In Progress');
    const goalsCompleted = goals.filter(goal => goal.status === 'Completed');
    const averageGoalProgress = goals.length > 0 ?
      goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length : 0;

    // Calculate goal achievement rate
    const goalAchievementRate = goals.length > 0 ? (goalsCompleted.length / goals.length) * 100 : 0;

    // Feedback response rate
    const totalFeedbackRequests = feedback.length; // This would need to be calculated based on cycles
    const completedFeedback = feedback.length;
    const feedbackResponseRate = totalFeedbackRequests > 0 ? (completedFeedback / totalFeedbackRequests) * 100 : 0;

    return {
      totalReviews: reviews.length,
      completedReviews: completedReviews.length,
      inProgressReviews: inProgressReviews.length,
      overdueReviews: overdueReviews.length,
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCompletionRate: reviews.length > 0 ? (completedReviews.length / reviews.length) * 100 : 0,
      totalGoals: goals.length,
      goalsInProgress: goalsInProgress.length,
      goalsCompleted: goalsCompleted.length,
      averageGoalProgress: Math.round(averageGoalProgress),
      goalAchievementRate: Math.round(goalAchievementRate * 10) / 10,
      feedbackResponseRate: Math.round(feedbackResponseRate),
    };
  }

  // Attendance Statistics
  static calculateAttendanceStats(attendanceData: AttendanceData, employees: Employee[]) {
    const { attendanceRecords } = attendanceData;
    const today = new Date().toISOString().split('T')[0];
    
    const todayRecords = attendanceRecords.filter(record => record.date === today);
    const presentToday = todayRecords.filter(record => record.status === 'present').length;
    const absentToday = todayRecords.filter(record => record.status === 'absent').length;
    const lateToday = todayRecords.filter(record => record.status === 'late').length;

    // Calculate attendance rate for the current month
    const currentMonth = new Date().toISOString().substring(0, 7);
    const monthRecords = attendanceRecords.filter(record => record.date.startsWith(currentMonth));
    const totalWorkDays = this.getWorkingDaysInMonth(new Date().getFullYear(), new Date().getMonth());
    const attendanceRate = employees.length > 0 && totalWorkDays > 0 ?
      (monthRecords.filter(record => record.status === 'present' || record.status === 'late').length / 
       (employees.filter(emp => emp.employmentInfo.status === 'active').length * totalWorkDays)) * 100 : 0;

    // Calculate average hours per day
    const recordsWithHours = attendanceRecords.filter(record => record.totalHours > 0);
    const averageHoursPerDay = recordsWithHours.length > 0 ?
      recordsWithHours.reduce((sum, record) => sum + record.totalHours, 0) / recordsWithHours.length : 0;

    // Calculate average arrival time
    const recordsWithClockIn = attendanceRecords.filter(record => record.clockIn);
    const averageArrivalMinutes = recordsWithClockIn.length > 0 ?
      recordsWithClockIn.reduce((sum, record) => {
        const [hours, minutes] = record.clockIn!.split(':').map(Number);
        return sum + (hours * 60 + minutes);
      }, 0) / recordsWithClockIn.length : 0;

    const averageArrivalTime = this.minutesToTimeString(averageArrivalMinutes);

    // Calculate overtime hours
    const overtimeRecords = attendanceRecords.filter(record => record.totalHours > 8);
    const overtimeHours = overtimeRecords.reduce((sum, record) => sum + (record.totalHours - 8), 0);

    return {
      totalEmployees: employees.filter(emp => emp.employmentInfo.status === 'active').length,
      presentToday,
      absentToday,
      lateToday,
      attendanceRate: Math.round(attendanceRate * 10) / 10,
      averageHoursPerDay: Math.round(averageHoursPerDay * 10) / 10,
      averageArrivalTime,
      overtimeHours: Math.round(overtimeHours * 10) / 10,
      mostCommonLateReason: this.getMostCommonLateReason(attendanceRecords),
    };
  }

  private static getWorkingDaysInMonth(year: number, month: number): number {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let workingDays = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
        workingDays++;
      }
    }
    
    return workingDays;
  }

  private static minutesToTimeString(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  private static getMostCommonLateReason(records: any[]): string {
    const lateRecords = records.filter(record => record.status === 'late' && record.notes);
    if (lateRecords.length === 0) return 'No data';

    const reasons = lateRecords.reduce((counts, record) => {
      const reason = record.notes.toLowerCase();
      counts[reason] = (counts[reason] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const mostCommon = Object.entries(reasons).reduce((most, [reason, count]) => 
      (count as number) > most.count ? { reason, count: count as number } : most
    , { reason: 'No data', count: 0 });

    return mostCommon.reason;
  }

  // Dashboard summary calculations
  static calculateDashboardSummary(
    employees: Employee[],
    leaveData: LeaveData,
    payrollData: PayrollData,
    performanceData: PerformanceData,
    attendanceData: AttendanceData
  ) {
    return {
      employees: this.calculateEmployeeStats(employees),
      leave: this.calculateLeaveStats(leaveData),
      payroll: this.calculatePayrollStats(payrollData, employees),
      performance: this.calculatePerformanceStats(performanceData),
      attendance: this.calculateAttendanceStats(attendanceData, employees),
    };
  }
}