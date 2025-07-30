import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { attendanceService, type AttendanceFilters, type AttendanceStats } from '../services/attendanceService'
import type { AttendanceRecord, WorkSchedule, TimeOffRequest, AttendancePolicy } from '../mocks/data/attendance'

// Query Keys
export const attendanceKeys = {
  all: ['attendance'] as const,
  records: () => [...attendanceKeys.all, 'records'] as const,
  record: (id: string) => [...attendanceKeys.records(), id] as const,
  schedules: () => [...attendanceKeys.all, 'schedules'] as const,
  schedule: (id: string) => [...attendanceKeys.schedules(), id] as const,
  timeOff: () => [...attendanceKeys.all, 'time-off'] as const,
  policies: () => [...attendanceKeys.all, 'policies'] as const,
  stats: (filters?: AttendanceFilters) => [...attendanceKeys.all, 'stats', filters] as const,
}

// Attendance Records Hooks
export const useAttendanceRecords = (filters?: AttendanceFilters) => {
  return useQuery({
    queryKey: attendanceKeys.records(),
    queryFn: () => attendanceService.getAttendanceRecords(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useAttendanceRecord = (id: string) => {
  return useQuery({
    queryKey: attendanceKeys.record(id),
    queryFn: () => attendanceService.getAttendanceRecord(id),
    enabled: !!id,
  })
}

export const useCreateAttendanceRecord = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: attendanceService.createAttendanceRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.records() })
      queryClient.invalidateQueries({ queryKey: attendanceKeys.stats() })
    },
  })
}

export const useUpdateAttendanceRecord = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AttendanceRecord> }) =>
      attendanceService.updateAttendanceRecord(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.record(variables.id) })
      queryClient.invalidateQueries({ queryKey: attendanceKeys.records() })
      queryClient.invalidateQueries({ queryKey: attendanceKeys.stats() })
    },
  })
}

export const useDeleteAttendanceRecord = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: attendanceService.deleteAttendanceRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.records() })
      queryClient.invalidateQueries({ queryKey: attendanceKeys.stats() })
    },
  })
}

// Work Schedules Hooks
export const useWorkSchedules = (employeeId?: string) => {
  return useQuery({
    queryKey: attendanceKeys.schedules(),
    queryFn: () => attendanceService.getWorkSchedules(employeeId),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useCreateWorkSchedule = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: attendanceService.createWorkSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.schedules() })
    },
  })
}

export const useUpdateWorkSchedule = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WorkSchedule> }) =>
      attendanceService.updateWorkSchedule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.schedules() })
    },
  })
}

// Time Off Requests Hooks
export const useTimeOffRequests = (filters?: { employeeId?: string; status?: string }) => {
  return useQuery({
    queryKey: attendanceKeys.timeOff(),
    queryFn: () => attendanceService.getTimeOffRequests(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useCreateTimeOffRequest = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: attendanceService.createTimeOffRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.timeOff() })
    },
  })
}

export const useUpdateTimeOffRequest = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TimeOffRequest> }) =>
      attendanceService.updateTimeOffRequest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.timeOff() })
    },
  })
}

// Attendance Policies Hooks
export const useAttendancePolicies = () => {
  return useQuery({
    queryKey: attendanceKeys.policies(),
    queryFn: attendanceService.getAttendancePolicies,
    staleTime: 30 * 60 * 1000, // 30 minutes
  })
}

// Attendance Statistics Hooks
export const useAttendanceStats = (filters?: AttendanceFilters) => {
  return useQuery({
    queryKey: attendanceKeys.stats(filters),
    queryFn: () => attendanceService.getAttendanceStats(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Clock In/Out Hooks
export const useClockIn = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ employeeId, location }: { employeeId: string; location?: string }) =>
      attendanceService.clockIn(employeeId, location),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.records() })
      queryClient.invalidateQueries({ queryKey: attendanceKeys.stats() })
    },
  })
}

export const useClockOut = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: attendanceService.clockOut,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.records() })
      queryClient.invalidateQueries({ queryKey: attendanceKeys.stats() })
    },
  })
}

export const useStartBreak = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: attendanceService.startBreak,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.records() })
    },
  })
}

export const useEndBreak = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: attendanceService.endBreak,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.records() })
    },
  })
}