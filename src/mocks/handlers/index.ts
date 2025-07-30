import { employeeHandlers } from './employees';
import { departmentHandlers } from './departments';
import { leaveHandlers } from './leave';
import { attendanceHandlers } from './attendance';
import { payrollHandlers } from './payroll';
import { performanceHandlers } from './performance';
import { authHandlers } from './auth';

export const handlers = [
  ...employeeHandlers,
  ...departmentHandlers,
  ...leaveHandlers,
  ...attendanceHandlers,
  ...payrollHandlers,
  ...performanceHandlers,
  ...authHandlers
];