import { api, ApiResponse, PaginatedResponse } from './api'
import type { AttendanceRecord, WorkSchedule, TimeOffRequest, AttendancePolicy } from '../mocks/data/attendance'

export interface AttendanceFilters {
  employeeId?: string
  startDate?: string
  endDate?: string
  status?: string
  page?: number
  limit?: number
}

export interface AttendanceStats {
  totalDays: number
  presentDays: number
  absentDays: number
  lateDays: number
  totalHours: number
  overtimeHours: number
  averageHoursPerDay: number
  attendanceRate: number
}

export const attendanceService = {
  // Attendance Records
  getAttendanceRecords: (filters: AttendanceFilters = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString())
      }
    })
    
    return api.get<ApiResponse<AttendanceRecord[]>>(`/attendance/records?${params}`)
  },

  getAttendanceRecord: (id: string) => 
    api.get<ApiResponse<AttendanceRecord>>(`/attendance/records/${id}`),

  createAttendanceRecord: (recordData: Partial<AttendanceRecord>) => 
    api.post<ApiResponse<AttendanceRecord>>('/attendance/records', recordData),

  updateAttendanceRecord: (id: string, recordData: Partial<AttendanceRecord>) => 
    api.put<ApiResponse<AttendanceRecord>>(`/attendance/records/${id}`, recordData),

  deleteAttendanceRecord: (id: string) => 
    api.delete<ApiResponse<{ message: string }>>(`/attendance/records/${id}`),

  // Work Schedules
  getWorkSchedules: (employeeId?: string) => {
    const params = employeeId ? `?employeeId=${employeeId}` : ''
    return api.get<ApiResponse<WorkSchedule[]>>(`/attendance/schedules${params}`)
  },

  createWorkSchedule: (scheduleData: Partial<WorkSchedule>) => 
    api.post<ApiResponse<WorkSchedule>>('/attendance/schedules', scheduleData),

  updateWorkSchedule: (id: string, scheduleData: Partial<WorkSchedule>) => 
    api.put<ApiResponse<WorkSchedule>>(`/attendance/schedules/${id}`, scheduleData),

  // Time Off Requests
  getTimeOffRequests: (filters: { employeeId?: string; status?: string } = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value)
      }
    })
    
    return api.get<ApiResponse<TimeOffRequest[]>>(`/attendance/time-off?${params}`)
  },

  createTimeOffRequest: (requestData: Partial<TimeOffRequest>) => 
    api.post<ApiResponse<TimeOffRequest>>('/attendance/time-off', requestData),

  updateTimeOffRequest: (id: string, requestData: Partial<TimeOffRequest>) => 
    api.put<ApiResponse<TimeOffRequest>>(`/attendance/time-off/${id}`, requestData),

  // Attendance Policies
  getAttendancePolicies: () => 
    api.get<ApiResponse<AttendancePolicy[]>>('/attendance/policies'),

  // Attendance Statistics
  getAttendanceStats: (filters: AttendanceFilters = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString())
      }
    })
    
    return api.get<ApiResponse<AttendanceStats>>(`/attendance/stats?${params}`)
  },

  // Clock In/Out Operations
  clockIn: (employeeId: string, location?: string) => {
    const clockInData = {
      employeeId,
      clockIn: new Date().toISOString(),
      location: location || 'Office',
      date: new Date().toISOString().split('T')[0]
    }
    
    return api.post<ApiResponse<AttendanceRecord>>('/attendance/records', clockInData)
  },

  clockOut: (recordId: string) => {
    const clockOutData = {
      clockOut: new Date().toISOString()
    }
    
    return api.put<ApiResponse<AttendanceRecord>>(`/attendance/records/${recordId}`, clockOutData)
  },

  startBreak: (recordId: string) => {
    const breakData = {
      breakStart: new Date().toISOString()
    }
    
    return api.put<ApiResponse<AttendanceRecord>>(`/attendance/records/${recordId}`, breakData)
  },

  endBreak: (recordId: string) => {
    const breakData = {
      breakEnd: new Date().toISOString()
    }
    
    return api.put<ApiResponse<AttendanceRecord>>(`/attendance/records/${recordId}`, breakData)
  }
}