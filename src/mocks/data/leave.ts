import { faker } from '@faker-js/faker'

export interface LeaveType {
  id: string
  name: string
  description: string
  maxDays: number
  carryForward: boolean
  requiresApproval: boolean
  color: string
  createdAt: string
}

export interface LeaveRequest {
  id: string
  employeeId: string
  leaveTypeId: string
  startDate: string
  endDate: string
  days: number
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  approvedBy: string | null
  approvedAt: string | null
  comments: string | null
  createdAt: string
  updatedAt: string
}

export interface LeaveBalance {
  id: string
  employeeId: string
  leaveTypeId: string
  allocated: number
  used: number
  pending: number
  remaining: number
  year: number
  createdAt: string
  updatedAt: string
}

const leaveTypeData = [
  { name: 'Annual Leave', description: 'Yearly vacation days', maxDays: 25, color: '#10B981' },
  { name: 'Sick Leave', description: 'Medical leave for illness', maxDays: 15, color: '#EF4444' },
  { name: 'Personal Leave', description: 'Personal time off', maxDays: 5, color: '#8B5CF6' },
  { name: 'Maternity Leave', description: 'Maternity leave for new mothers', maxDays: 90, color: '#F59E0B' },
  { name: 'Paternity Leave', description: 'Paternity leave for new fathers', maxDays: 14, color: '#3B82F6' },
  { name: 'Bereavement Leave', description: 'Leave for family loss', maxDays: 7, color: '#6B7280' },
  { name: 'Study Leave', description: 'Educational development leave', maxDays: 10, color: '#06B6D4' }
]

export const generateLeaveTypes = (): LeaveType[] => {
  return leaveTypeData.map(type => ({
    id: faker.string.uuid(),
    name: type.name,
    description: type.description,
    maxDays: type.maxDays,
    carryForward: faker.datatype.boolean({ probability: 0.3 }),
    requiresApproval: true,
    color: type.color,
    createdAt: faker.date.past({ years: 2 }).toISOString()
  }))
}

export const generateLeaveRequests = (employeeIds: string[], leaveTypeIds: string[], count: number = 100): LeaveRequest[] => {
  const statuses: LeaveRequest['status'][] = ['pending', 'approved', 'rejected', 'cancelled']
  
  return Array.from({ length: count }, () => {
    const startDate = faker.date.between({ 
      from: new Date(2024, 0, 1), 
      to: new Date(2024, 11, 31) 
    })
    const endDate = faker.date.soon({ days: faker.number.int({ min: 1, max: 14 }), refDate: startDate })
    const status = faker.helpers.weightedArrayElement([
      { weight: 20, value: 'pending' },
      { weight: 60, value: 'approved' },
      { weight: 15, value: 'rejected' },
      { weight: 5, value: 'cancelled' }
    ])
    
    return {
      id: faker.string.uuid(),
      employeeId: faker.helpers.arrayElement(employeeIds),
      leaveTypeId: faker.helpers.arrayElement(leaveTypeIds),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      days: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
      reason: faker.lorem.sentence(),
      status,
      approvedBy: status === 'approved' ? faker.string.uuid() : null,
      approvedAt: status === 'approved' ? faker.date.recent().toISOString() : null,
      comments: faker.helpers.maybe(() => faker.lorem.paragraph(), { probability: 0.3 }),
      createdAt: faker.date.past({ years: 1 }).toISOString(),
      updatedAt: faker.date.recent().toISOString()
    }
  })
}

export const generateLeaveBalances = (employeeIds: string[], leaveTypeIds: string[]): LeaveBalance[] => {
  const balances: LeaveBalance[] = []
  
  employeeIds.forEach(employeeId => {
    leaveTypeIds.forEach(leaveTypeId => {
      const allocated = faker.number.int({ min: 10, max: 30 })
      const used = faker.number.int({ min: 0, max: allocated })
      const pending = faker.number.int({ min: 0, max: Math.min(3, allocated - used) })
      
      balances.push({
        id: faker.string.uuid(),
        employeeId,
        leaveTypeId,
        allocated,
        used,
        pending,
        remaining: allocated - used - pending,
        year: 2024,
        createdAt: faker.date.past().toISOString(),
        updatedAt: faker.date.recent().toISOString()
      })
    })
  })
  
  return balances
}

export const mockLeaveTypes = generateLeaveTypes()