import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import {
  clockIn,
  clockOut,
  getAttendanceRecords,
  getAttendanceStats,
  markAbsent,
} from './attendanceController';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

// Mock dependencies
vi.mock('../config/database', () => ({
  default: {
    attendanceRecord: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
      aggregate: vi.fn(),
      groupBy: vi.fn(),
    },
    employee: {
      count: vi.fn(),
    },
  },
}));

describe('AttendanceController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRequest = {
      body: {},
      params: {},
      query: {},
    };

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  describe('clockIn', () => {
    it('should clock in employee successfully', async () => {
      mockRequest.body = {
        employeeId: 'emp-123',
        location: 'Office',
      };

      vi.mocked(prisma.attendanceRecord.findUnique).mockResolvedValue(null);

      const mockRecord = {
        id: 'attendance-123',
        employeeId: 'emp-123',
        date: new Date(),
        clockIn: new Date(),
        clockOut: null,
        status: 'PRESENT',
        workHours: null,
        breakMinutes: 0,
        location: 'Office',
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.attendanceRecord.upsert).mockResolvedValue(mockRecord);

      await clockIn(mockRequest as Request, mockResponse as Response);

      expect(prisma.attendanceRecord.upsert).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockRecord,
      });
    });

    it('should throw error if already clocked in today', async () => {
      mockRequest.body = {
        employeeId: 'emp-123',
        location: 'Office',
      };

      const existingRecord = {
        id: 'attendance-123',
        employeeId: 'emp-123',
        date: new Date(),
        clockIn: new Date(),
        clockOut: null,
        status: 'PRESENT',
      };

      vi.mocked(prisma.attendanceRecord.findUnique).mockResolvedValue(existingRecord as any);

      await expect(
        clockIn(mockRequest as Request, mockResponse as Response)
      ).rejects.toThrow(AppError);
    });
  });

  describe('clockOut', () => {
    it('should clock out employee successfully', async () => {
      mockRequest.body = {
        employeeId: 'emp-123',
      };

      const clockInTime = new Date();
      clockInTime.setHours(9, 0, 0, 0);

      const existingRecord = {
        id: 'attendance-123',
        employeeId: 'emp-123',
        date: new Date(),
        clockIn: clockInTime,
        clockOut: null,
        status: 'PRESENT',
      };

      vi.mocked(prisma.attendanceRecord.findUnique).mockResolvedValue(existingRecord as any);

      const updatedRecord = {
        ...existingRecord,
        clockOut: new Date(),
        workHours: 8.5,
      };

      vi.mocked(prisma.attendanceRecord.update).mockResolvedValue(updatedRecord as any);

      await clockOut(mockRequest as Request, mockResponse as Response);

      expect(prisma.attendanceRecord.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'attendance-123' },
          data: expect.objectContaining({
            clockOut: expect.any(Date),
            workHours: expect.any(Number),
          }),
        })
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: updatedRecord,
      });
    });

    it('should throw error if no clock-in record found', async () => {
      mockRequest.body = {
        employeeId: 'emp-123',
      };

      vi.mocked(prisma.attendanceRecord.findUnique).mockResolvedValue(null);

      await expect(
        clockOut(mockRequest as Request, mockResponse as Response)
      ).rejects.toThrow(AppError);
    });

    it('should throw error if already clocked out', async () => {
      mockRequest.body = {
        employeeId: 'emp-123',
      };

      const existingRecord = {
        id: 'attendance-123',
        employeeId: 'emp-123',
        clockIn: new Date(),
        clockOut: new Date(),
      };

      vi.mocked(prisma.attendanceRecord.findUnique).mockResolvedValue(existingRecord as any);

      await expect(
        clockOut(mockRequest as Request, mockResponse as Response)
      ).rejects.toThrow(AppError);
    });
  });

  describe('getAttendanceRecords', () => {
    it('should return attendance records', async () => {
      mockRequest.query = {};

      const mockRecords = [
        {
          id: 'attendance-1',
          employeeId: 'emp-1',
          date: new Date(),
          clockIn: new Date(),
          clockOut: new Date(),
          status: 'PRESENT',
          workHours: 8,
          employee: {
            id: 'emp-1',
            firstName: 'John',
            lastName: 'Doe',
            employeeId: 'EMP001',
            department: 'Engineering',
          },
        },
      ];

      vi.mocked(prisma.attendanceRecord.findMany).mockResolvedValue(mockRecords as any);

      await getAttendanceRecords(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockRecords,
      });
    });

    it('should filter by employee ID', async () => {
      mockRequest.query = { employeeId: 'emp-123' };

      vi.mocked(prisma.attendanceRecord.findMany).mockResolvedValue([]);

      await getAttendanceRecords(mockRequest as Request, mockResponse as Response);

      expect(prisma.attendanceRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            employeeId: 'emp-123',
          }),
        })
      );
    });

    it('should filter by date range', async () => {
      mockRequest.query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      };

      vi.mocked(prisma.attendanceRecord.findMany).mockResolvedValue([]);

      await getAttendanceRecords(mockRequest as Request, mockResponse as Response);

      expect(prisma.attendanceRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            date: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
        })
      );
    });
  });

  describe('getAttendanceStats', () => {
    it('should return attendance statistics', async () => {
      vi.mocked(prisma.attendanceRecord.aggregate).mockResolvedValue({
        _count: { _all: 50 },
      } as any);

      vi.mocked(prisma.attendanceRecord.groupBy).mockResolvedValue([
        { status: 'PRESENT', _count: 40 },
        { status: 'LATE', _count: 5 },
        { status: 'ABSENT', _count: 5 },
      ] as any);

      vi.mocked(prisma.employee.count).mockResolvedValue(100);

      await getAttendanceStats(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: expect.objectContaining({
          presentToday: 40,
          lateToday: 5,
          absentToday: 5,
          attendanceRate: expect.any(String),
          latePercentage: expect.any(String),
          absentPercentage: expect.any(String),
          averageWorkHours: expect.any(String),
        }),
      });
    });
  });

  describe('markAbsent', () => {
    it('should mark employee as absent successfully', async () => {
      mockRequest.body = {
        employeeId: 'emp-123',
        date: '2024-12-25',
        notes: 'Called in sick',
      };

      vi.mocked(prisma.attendanceRecord.findUnique).mockResolvedValue(null);

      const mockRecord = {
        id: 'attendance-123',
        employeeId: 'emp-123',
        date: new Date('2024-12-25'),
        clockIn: null,
        clockOut: null,
        status: 'ABSENT',
        notes: 'Called in sick',
        workHours: null,
        breakMinutes: 0,
        location: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.attendanceRecord.create).mockResolvedValue(mockRecord);

      await markAbsent(mockRequest as Request, mockResponse as Response);

      expect(prisma.attendanceRecord.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          employeeId: 'emp-123',
          status: 'ABSENT',
          notes: 'Called in sick',
        }),
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockRecord,
        message: 'Employee marked as absent',
      });
    });

    it('should throw error if record already exists', async () => {
      mockRequest.body = {
        employeeId: 'emp-123',
        date: '2024-12-25',
      };

      vi.mocked(prisma.attendanceRecord.findUnique).mockResolvedValue({
        id: 'existing-record',
      } as any);

      await expect(
        markAbsent(mockRequest as Request, mockResponse as Response)
      ).rejects.toThrow(AppError);
    });
  });
});
