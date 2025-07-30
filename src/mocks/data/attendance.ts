import { faker } from '@faker-js/faker'

export interface AttendanceRecord {
  id: string
  employeeId: string
  date: string
  clockIn: string | null
  clockOut: string | null
  breakStart: string | null
  breakEnd: string | null
  totalHours: number
  overtimeHours: number
  status: 'present' | 'absent' | 'late' | 'half_day' | 'holiday' | 'sick'
  location: string
  notes: string | null
  approvedBy: string | null
  createdAt: string
  updatedAt: string
}

export interface WorkSchedule {
  id: string
  employeeId: string
  dayOfWeek: number // 0-6 (Sunday-Saturday)
  startTime: string
  endTime: string
  breakDuration: number // minutes
  isWorkingDay: boolean
  effectiveFrom: string
  effectiveTo: string | null
  createdAt: string
}

export interface TimeOffRequest {
  id: string
  employeeId: string
  date: string
  reason: string
  type: 'sick' | 'personal' | 'emergency' | 'appointment'
  status: 'pending' | 'approved' | 'rejected'
  requestedAt: string
  approvedBy: string | null
  approvedAt: string | null
  notes: string | null
}

export interface AttendancePolicy {
  id: string
  name: string
  description: string
  rules: {
    coreHours: { start: string; end: string }
    flexibleHours: boolean
    minimumHours: number
    maximumHours: number
    overtimeThreshold: number
    lateThreshold: number // minutes
    earlyLeaveThreshold: number // minutes
  }
  departments: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const locations = ['Office', 'Remote', 'Client Site', 'Field Work', 'Home Office']
const statuses: AttendanceRecord['status'][] = ['present', 'absent', 'late', 'half_day', 'holiday', 'sick']

export const generateAttendanceRecords = (employeeIds: string[], days: number = 90): AttendanceRecord[] => {
  const records: AttendanceRecord[] = []
  
  employeeIds.forEach(employeeId => {
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      // Skip weekends for most employees (90% probability)
      if ((date.getDay() === 0 || date.getDay() === 6) && faker.datatype.boolean({ probability: 0.9 })) {
        continue
      }
      
      const status = faker.helpers.weightedArrayElement([
        { weight: 70, value: 'present' },
        { weight: 10, value: 'late' },
        { weight: 8, value: 'absent' },
        { weight: 5, value: 'half_day' },
        { weight: 4, value: 'sick' },
        { weight: 3, value: 'holiday' }
      ])
      
      let clockIn: string | null = null
      let clockOut: string | null = null
      let breakStart: string | null = null
      let breakEnd: string | null = null
      let totalHours = 0
      let overtimeHours = 0
      
      if (status === 'present' || status === 'late') {
        const baseClockIn = status === 'late' 
          ? faker.date.between({ 
              from: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 9, 15),
              to: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 10, 30)
            })
          : faker.date.between({
              from: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 8, 30),
              to: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 9, 15)
            })
        
        clockIn = baseClockIn.toISOString()
        
        const clockOutTime = new Date(baseClockIn)
        clockOutTime.setHours(clockOutTime.getHours() + faker.number.int({ min: 8, max: 10 }))
        clockOutTime.setMinutes(clockOutTime.getMinutes() + faker.number.int({ min: 0, max: 59 }))
        clockOut = clockOutTime.toISOString()
        
        // Break times
        const breakStartTime = new Date(baseClockIn)
        breakStartTime.setHours(breakStartTime.getHours() + faker.number.int({ min: 3, max: 5 }))
        breakStart = breakStartTime.toISOString()
        
        const breakEndTime = new Date(breakStartTime)
        breakEndTime.setMinutes(breakEndTime.getMinutes() + faker.number.int({ min: 30, max: 60 }))
        breakEnd = breakEndTime.toISOString()
        
        // Calculate hours
        const workMinutes = (clockOutTime.getTime() - baseClockIn.getTime()) / (1000 * 60)
        const breakMinutes = (breakEndTime.getTime() - breakStartTime.getTime()) / (1000 * 60)
        totalHours = Math.round(((workMinutes - breakMinutes) / 60) * 100) / 100
        overtimeHours = Math.max(0, totalHours - 8)
      } else if (status === 'half_day') {
        const baseClockIn = faker.date.between({
          from: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 8, 30),
          to: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 9, 15)
        })
        
        clockIn = baseClockIn.toISOString()
        
        const clockOutTime = new Date(baseClockIn)
        clockOutTime.setHours(clockOutTime.getHours() + 4)
        clockOut = clockOutTime.toISOString()
        
        totalHours = 4
      }
      
      records.push({
        id: faker.string.uuid(),
        employeeId,
        date: date.toISOString().split('T')[0],
        clockIn,
        clockOut,
        breakStart,
        breakEnd,
        totalHours,
        overtimeHours,
        status,
        location: faker.helpers.arrayElement(locations),
        notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.2 }),
        approvedBy: (status === 'sick' || status === 'half_day') ? faker.string.uuid() : null,
        createdAt: date.toISOString(),
        updatedAt: faker.date.recent().toISOString()
      })
    }
  })
  
  return records
}

export const generateWorkSchedules = (employeeIds: string[]): WorkSchedule[] => {
  const schedules: WorkSchedule[] = []
  
  employeeIds.forEach(employeeId => {
    // Standard work week (Monday to Friday)
    for (let day = 1; day <= 5; day++) {
      schedules.push({
        id: faker.string.uuid(),
        employeeId,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '18:00',
        breakDuration: 60,
        isWorkingDay: true,
        effectiveFrom: faker.date.past({ years: 1 }).toISOString(),
        effectiveTo: null,
        createdAt: faker.date.past({ years: 1 }).toISOString()
      })
    }
    
    // Weekend (non-working days for most employees)
    schedules.push({
      id: faker.string.uuid(),
      employeeId,
      dayOfWeek: 0, // Sunday
      startTime: '00:00',
      endTime: '00:00',
      breakDuration: 0,
      isWorkingDay: false,
      effectiveFrom: faker.date.past({ years: 1 }).toISOString(),
      effectiveTo: null,
      createdAt: faker.date.past({ years: 1 }).toISOString()
    })
    
    schedules.push({
      id: faker.string.uuid(),
      employeeId,
      dayOfWeek: 6, // Saturday
      startTime: '00:00',
      endTime: '00:00',
      breakDuration: 0,
      isWorkingDay: false,
      effectiveFrom: faker.date.past({ years: 1 }).toISOString(),
      effectiveTo: null,
      createdAt: faker.date.past({ years: 1 }).toISOString()
    })
  })
  
  return schedules
}

export const generateTimeOffRequests = (employeeIds: string[], count: number = 50): TimeOffRequest[] => {
  return Array.from({ length: count }, () => {
    const requestedAt = faker.date.past({ years: 1 })
    const status = faker.helpers.weightedArrayElement([
      { weight: 60, value: 'approved' },
      { weight: 25, value: 'pending' },
      { weight: 15, value: 'rejected' }
    ])
    
    return {
      id: faker.string.uuid(),
      employeeId: faker.helpers.arrayElement(employeeIds),
      date: faker.date.between({ 
        from: requestedAt, 
        to: faker.date.future({ years: 1 }) 
      }).toISOString().split('T')[0],
      reason: faker.lorem.sentence(),
      type: faker.helpers.arrayElement(['sick', 'personal', 'emergency', 'appointment']),
      status,
      requestedAt: requestedAt.toISOString(),
      approvedBy: status !== 'pending' ? faker.string.uuid() : null,
      approvedAt: status !== 'pending' ? faker.date.between({ from: requestedAt, to: new Date() }).toISOString() : null,
      notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 })
    }
  })
}

export const mockAttendancePolicies: AttendancePolicy[] = [
  {
    id: faker.string.uuid(),
    name: 'Standard Office Policy',
    description: 'Standard attendance policy for office-based employees',
    rules: {
      coreHours: { start: '10:00', end: '15:00' },
      flexibleHours: true,
      minimumHours: 8,
      maximumHours: 12,
      overtimeThreshold: 8,
      lateThreshold: 15,
      earlyLeaveThreshold: 30
    },
    departments: ['Engineering', 'Finance', 'HR'],
    isActive: true,
    createdAt: faker.date.past({ years: 1 }).toISOString(),
    updatedAt: faker.date.recent().toISOString()
  },
  {
    id: faker.string.uuid(),
    name: 'Remote Work Policy',
    description: 'Flexible attendance policy for remote employees',
    rules: {
      coreHours: { start: '11:00', end: '14:00' },
      flexibleHours: true,
      minimumHours: 8,
      maximumHours: 10,
      overtimeThreshold: 8,
      lateThreshold: 30,
      earlyLeaveThreshold: 60
    },
    departments: ['Engineering', 'Marketing'],
    isActive: true,
    createdAt: faker.date.past({ years: 1 }).toISOString(),
    updatedAt: faker.date.recent().toISOString()
  }
]