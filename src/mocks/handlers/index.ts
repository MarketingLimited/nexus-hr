import { http } from 'msw'
import { employeeHandlers } from './employees'
import { departmentHandlers } from './departments'
import { leaveHandlers } from './leave'
import { payrollHandlers } from './payroll'
import { performanceHandlers } from './performance'
import { attendanceHandlers } from './attendance'
import { onboardingHandlers } from './onboarding'
import { notificationHandlers } from './notifications'
import { authHandlers } from './auth'

// Combine all handlers
export const handlers = [
  // Health check endpoint
  http.get('/api/health', () => {
    return Response.json({ status: 'ok', timestamp: new Date().toISOString() })
  }),
  
  // All modular handlers
  ...employeeHandlers,
  ...departmentHandlers,
  ...leaveHandlers,
  ...payrollHandlers,
  ...performanceHandlers,
  ...attendanceHandlers,
  ...onboardingHandlers,
  ...notificationHandlers,
  ...authHandlers,
]