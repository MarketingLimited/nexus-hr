import { http, delay } from 'msw'
import { employeeHandlers } from './employees'
import { departmentHandlers } from './departments'
import { leaveHandlers } from './leave'
import { payrollHandlers } from './payroll'
import { authHandlers } from './auth'
import { attendanceHandlers } from './attendance'
import { performanceHandlers } from './performance'
import { notificationHandlers } from './notifications'
import { onboardingHandlers } from './onboarding'
import { assetHandlers } from './assets'
import { documentHandlers } from './documents'

export const handlers = [
  ...employeeHandlers,
  ...departmentHandlers,
  ...leaveHandlers,
  ...payrollHandlers,
  ...authHandlers,
  ...attendanceHandlers,
  ...performanceHandlers,
  ...notificationHandlers,
  ...onboardingHandlers,
  ...assetHandlers,
  ...documentHandlers,
  
  // Health check endpoint with realistic delay
  http.get('/api/health', async () => {
    await delay(Math.random() * 400 + 100)
    
    // Simulate errors occasionally
    if (Math.random() < 0.02) {
      return new Response('Network Error', { status: 500 })
    }
    
    return Response.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(Math.random() * 86400),
      version: '1.0.0'
    })
  })
]