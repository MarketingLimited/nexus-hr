import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { createTestQueryClient } from '../test-utils'
import { 
  useAttendanceRecords,
  useAttendanceRecord,
  useCreateAttendanceRecord,
  useUpdateAttendanceRecord,
  useDeleteAttendanceRecord,
  useWorkSchedules,
  useCreateWorkSchedule,
  useUpdateWorkSchedule,
  useTimeOffRequests,
  useCreateTimeOffRequest,
  useUpdateTimeOffRequest,
  useAttendancePolicies,
  useAttendanceStats,
  useClockIn,
  useClockOut,
  useStartBreak,
  useEndBreak,
  attendanceKeys
} from '../useAttendance'
import { attendanceService } from '../../services/attendanceService'

// Mock dependencies
vi.mock('../../services/attendanceService', () => ({
  attendanceService: {
    getAttendanceRecords: vi.fn(),
    getAttendanceRecord: vi.fn(),
    createAttendanceRecord: vi.fn(),
    updateAttendanceRecord: vi.fn(),
    deleteAttendanceRecord: vi.fn(),
    getWorkSchedules: vi.fn(),
    createWorkSchedule: vi.fn(),
    updateWorkSchedule: vi.fn(),
    getTimeOffRequests: vi.fn(),
    createTimeOffRequest: vi.fn(),
    updateTimeOffRequest: vi.fn(),
    getAttendancePolicies: vi.fn(),
    getAttendanceStats: vi.fn(),
    clockIn: vi.fn(),
    clockOut: vi.fn(),
    startBreak: vi.fn(),
    endBreak: vi.fn()
  }
}))

describe('useAttendance Hooks', () => {
  let queryClient: QueryClient
  let wrapper: any

  beforeEach(() => {
    queryClient = createTestQueryClient()
    wrapper = ({ children }: { children: React.ReactNode }) => 
      React.createElement(QueryClientProvider, { client: queryClient }, children)
    vi.clearAllMocks()
  })

  afterEach(() => {
    queryClient.clear()
  })

  describe('useAttendanceRecords', () => {
    it('should fetch attendance records with filters', async () => {
      const mockRecords = {
        data: [
          { 
            id: 'att-1', 
            employeeId: 'emp-1', 
            date: '2024-01-15',
            clockIn: '09:00:00',
            status: 'present'
          },
          { 
            id: 'att-2', 
            employeeId: 'emp-2', 
            date: '2024-01-15',
            clockIn: '09:15:00',
            status: 'late'
          }
        ]
      }
      vi.mocked(attendanceService.getAttendanceRecords).mockResolvedValue(mockRecords)

      const filters = { employeeId: 'emp-1', startDate: '2024-01-01' }
      const { result } = renderHook(() => useAttendanceRecords(filters), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockRecords)
      expect(attendanceService.getAttendanceRecords).toHaveBeenCalledWith(filters)
    })

    it('should use stale time of 5 minutes', () => {
      const { result } = renderHook(() => useAttendanceRecords(), { wrapper })
      
      const query = queryClient.getQueryCache().find({ queryKey: attendanceKeys.records() })
      expect(query?.options.staleTime).toBe(5 * 60 * 1000)
    })
  })

  describe('useAttendanceRecord', () => {
    it('should fetch single attendance record by ID', async () => {
      const mockRecord = {
        data: {
          id: 'att-1',
          employeeId: 'emp-1',
          date: '2024-01-15',
          clockIn: '09:00:00',
          clockOut: '17:00:00',
          status: 'present',
          workingHours: 8
        }
      }
      vi.mocked(attendanceService.getAttendanceRecord).mockResolvedValue(mockRecord)

      const { result } = renderHook(() => useAttendanceRecord('att-1'), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockRecord)
      expect(attendanceService.getAttendanceRecord).toHaveBeenCalledWith('att-1')
    })

    it('should not fetch when ID is empty', () => {
      const { result } = renderHook(() => useAttendanceRecord(''), { wrapper })

      expect(result.current.isFetching).toBe(false)
      expect(attendanceService.getAttendanceRecord).not.toHaveBeenCalled()
    })
  })

  describe('useCreateAttendanceRecord', () => {
    it('should create attendance record successfully', async () => {
      const mockRecord = {
        data: {
          id: 'att-new',
          employeeId: 'emp-1',
          date: '2024-01-16',
          status: 'present'
        }
      }
      vi.mocked(attendanceService.createAttendanceRecord).mockResolvedValue(mockRecord)

      const { result } = renderHook(() => useCreateAttendanceRecord(), { wrapper })

      const newRecord = {
        employeeId: 'emp-1',
        date: '2024-01-16',
        clockIn: '09:00:00',
        status: 'present'
      }
      result.current.mutate(newRecord)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(attendanceService.createAttendanceRecord).toHaveBeenCalledWith(newRecord)
    })

    it('should invalidate records and stats queries on success', async () => {
      const mockRecord = { data: { id: 'att-new' } }
      vi.mocked(attendanceService.createAttendanceRecord).mockResolvedValue(mockRecord)

      // Pre-populate cache
      queryClient.setQueryData(attendanceKeys.records(), { data: [] })
      queryClient.setQueryData(attendanceKeys.stats(), { data: {} })

      const { result } = renderHook(() => useCreateAttendanceRecord(), { wrapper })

      result.current.mutate({ employeeId: 'emp-1', date: '2024-01-16' })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // Verify cache invalidation
      const recordsQuery = queryClient.getQueryCache().find({ queryKey: attendanceKeys.records() })
      const statsQuery = queryClient.getQueryCache().find({ queryKey: attendanceKeys.stats() })
      expect(recordsQuery?.isStale()).toBe(true)
      expect(statsQuery?.isStale()).toBe(true)
    })
  })

  describe('useUpdateAttendanceRecord', () => {
    it('should update attendance record successfully', async () => {
      const mockUpdatedRecord = {
        data: {
          id: 'att-1',
          employeeId: 'emp-1',
          clockOut: '17:30:00',
          workingHours: 8.5
        }
      }
      vi.mocked(attendanceService.updateAttendanceRecord).mockResolvedValue(mockUpdatedRecord)

      const { result } = renderHook(() => useUpdateAttendanceRecord(), { wrapper })

      const updateData = {
        id: 'att-1',
        data: { clockOut: '17:30:00', workingHours: 8.5 }
      }
      result.current.mutate(updateData)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(attendanceService.updateAttendanceRecord).toHaveBeenCalledWith('att-1', updateData.data)
    })
  })

  describe('useWorkSchedules', () => {
    it('should fetch work schedules', async () => {
      const mockSchedules = {
        data: [
          {
            id: 'sched-1',
            employeeId: 'emp-1',
            dayOfWeek: 'Monday',
            startTime: '09:00:00',
            endTime: '17:00:00'
          }
        ]
      }
      vi.mocked(attendanceService.getWorkSchedules).mockResolvedValue(mockSchedules)

      const { result } = renderHook(() => useWorkSchedules('emp-1'), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockSchedules)
      expect(attendanceService.getWorkSchedules).toHaveBeenCalledWith('emp-1')
    })

    it('should use stale time of 10 minutes', () => {
      const { result } = renderHook(() => useWorkSchedules(), { wrapper })
      
      const query = queryClient.getQueryCache().find({ queryKey: attendanceKeys.schedules() })
      expect(query?.options.staleTime).toBe(10 * 60 * 1000)
    })
  })

  describe('useTimeOffRequests', () => {
    it('should fetch time off requests with filters', async () => {
      const mockRequests = {
        data: [
          {
            id: 'time-off-1',
            employeeId: 'emp-1',
            startDate: '2024-01-20',
            endDate: '2024-01-21',
            status: 'pending'
          }
        ]
      }
      vi.mocked(attendanceService.getTimeOffRequests).mockResolvedValue(mockRequests)

      const filters = { employeeId: 'emp-1', status: 'pending' }
      const { result } = renderHook(() => useTimeOffRequests(filters), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockRequests)
      expect(attendanceService.getTimeOffRequests).toHaveBeenCalledWith(filters)
    })
  })

  describe('useAttendancePolicies', () => {
    it('should fetch attendance policies', async () => {
      const mockPolicies = {
        data: [
          {
            id: 'policy-1',
            name: 'Standard Hours',
            description: 'Standard working hours policy'
          }
        ]
      }
      vi.mocked(attendanceService.getAttendancePolicies).mockResolvedValue(mockPolicies)

      const { result } = renderHook(() => useAttendancePolicies(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockPolicies)
      expect(attendanceService.getAttendancePolicies).toHaveBeenCalledOnce()
    })

    it('should use stale time of 30 minutes', () => {
      const { result } = renderHook(() => useAttendancePolicies(), { wrapper })
      
      const query = queryClient.getQueryCache().find({ queryKey: attendanceKeys.policies() })
      expect(query?.options.staleTime).toBe(30 * 60 * 1000)
    })
  })

  describe('useAttendanceStats', () => {
    it('should fetch attendance statistics', async () => {
      const mockStats = {
        data: {
          totalRecords: 100,
          presentCount: 85,
          absentCount: 10,
          lateCount: 5,
          attendanceRate: 85
        }
      }
      vi.mocked(attendanceService.getAttendanceStats).mockResolvedValue(mockStats)

      const filters = { employeeId: 'emp-1', startDate: '2024-01-01' }
      const { result } = renderHook(() => useAttendanceStats(filters), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockStats)
      expect(attendanceService.getAttendanceStats).toHaveBeenCalledWith(filters)
    })

    it('should use stale time of 2 minutes', () => {
      const { result } = renderHook(() => useAttendanceStats(), { wrapper })
      
      const query = queryClient.getQueryCache().find({ queryKey: attendanceKeys.stats() })
      expect(query?.options.staleTime).toBe(2 * 60 * 1000)
    })
  })

  describe('Clock Operations', () => {
    describe('useClockIn', () => {
      it('should clock in successfully', async () => {
        const mockResponse = { data: { id: 'att-new', status: 'clocked-in' } }
        vi.mocked(attendanceService.clockIn).mockResolvedValue(mockResponse)

        const { result } = renderHook(() => useClockIn(), { wrapper })

        result.current.mutate({ employeeId: 'emp-1', location: 'Office A' })

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true)
        })

        expect(attendanceService.clockIn).toHaveBeenCalledWith('emp-1', 'Office A')
      })
    })

    describe('useClockOut', () => {
      it('should clock out successfully', async () => {
        const mockResponse = { data: { id: 'att-1', status: 'clocked-out' } }
        vi.mocked(attendanceService.clockOut).mockResolvedValue(mockResponse)

        const { result } = renderHook(() => useClockOut(), { wrapper })

        result.current.mutate('att-1')

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true)
        })

        expect(attendanceService.clockOut).toHaveBeenCalledWith('att-1')
      })
    })

    describe('useStartBreak', () => {
      it('should start break successfully', async () => {
        const mockResponse = { data: { id: 'att-1', status: 'on-break' } }
        vi.mocked(attendanceService.startBreak).mockResolvedValue(mockResponse)

        const { result } = renderHook(() => useStartBreak(), { wrapper })

        result.current.mutate('att-1')

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true)
        })

        expect(attendanceService.startBreak).toHaveBeenCalledWith('att-1')
      })
    })

    describe('useEndBreak', () => {
      it('should end break successfully', async () => {
        const mockResponse = { data: { id: 'att-1', status: 'active' } }
        vi.mocked(attendanceService.endBreak).mockResolvedValue(mockResponse)

        const { result } = renderHook(() => useEndBreak(), { wrapper })

        result.current.mutate('att-1')

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true)
        })

        expect(attendanceService.endBreak).toHaveBeenCalledWith('att-1')
      })
    })
  })

  describe('Query Keys', () => {
    it('should generate correct query keys', () => {
      expect(attendanceKeys.all).toEqual(['attendance'])
      expect(attendanceKeys.records()).toEqual(['attendance', 'records'])
      expect(attendanceKeys.record('att-1')).toEqual(['attendance', 'records', 'att-1'])
      expect(attendanceKeys.schedules()).toEqual(['attendance', 'schedules'])
      expect(attendanceKeys.schedule('sched-1')).toEqual(['attendance', 'schedules', 'sched-1'])
      expect(attendanceKeys.timeOff()).toEqual(['attendance', 'time-off'])
      expect(attendanceKeys.policies()).toEqual(['attendance', 'policies'])
      expect(attendanceKeys.stats({ employeeId: 'emp-1' })).toEqual(['attendance', 'stats', { employeeId: 'emp-1' }])
    })
  })
})