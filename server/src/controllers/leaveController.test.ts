import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import {
  createLeaveRequest,
  getLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
  getLeaveBalance,
} from './leaveController';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

// Mock dependencies
vi.mock('../config/database', () => ({
  default: {
    leaveRequest: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    leaveBalance: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

describe('LeaveController', () => {
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

  describe('createLeaveRequest', () => {
    it('should create leave request successfully', async () => {
      const leaveData = {
        employeeId: 'emp-123',
        leaveType: 'ANNUAL',
        startDate: '2024-12-24',
        endDate: '2024-12-31',
        reason: 'Holiday vacation',
        isHalfDay: false,
      };

      mockRequest.body = leaveData;

      const mockLeaveRequest = {
        id: 'leave-123',
        ...leaveData,
        startDate: new Date(leaveData.startDate),
        endDate: new Date(leaveData.endDate),
        days: 8,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
        approverId: null,
        approvedAt: null,
        approverComments: null,
      };

      vi.mocked(prisma.leaveRequest.create).mockResolvedValue(mockLeaveRequest as any);

      await createLeaveRequest(mockRequest as any, mockResponse as Response);

      expect(prisma.leaveRequest.create).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockLeaveRequest,
      });
    });

    it('should calculate half day correctly', async () => {
      mockRequest.body = {
        employeeId: 'emp-123',
        leaveType: 'SICK',
        startDate: '2024-12-24',
        endDate: '2024-12-24',
        reason: 'Doctor appointment',
        isHalfDay: true,
      };

      vi.mocked(prisma.leaveRequest.create).mockResolvedValue({
        id: 'leave-123',
        days: 0.5,
        status: 'PENDING',
      } as any);

      await createLeaveRequest(mockRequest as any, mockResponse as Response);

      expect(prisma.leaveRequest.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            days: 0.5,
          }),
        })
      );
    });
  });

  describe('getLeaveRequests', () => {
    it('should return all leave requests', async () => {
      mockRequest.query = {};

      const mockLeaveRequests = [
        {
          id: 'leave-1',
          employeeId: 'emp-1',
          leaveType: 'ANNUAL',
          startDate: new Date('2024-12-24'),
          endDate: new Date('2024-12-31'),
          days: 8,
          status: 'PENDING',
          employee: {
            id: 'emp-1',
            firstName: 'John',
            lastName: 'Doe',
          },
        },
      ];

      vi.mocked(prisma.leaveRequest.findMany).mockResolvedValue(mockLeaveRequests as any);

      await getLeaveRequests(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockLeaveRequests,
      });
    });

    it('should filter by employee ID', async () => {
      mockRequest.query = { employeeId: 'emp-123' };

      vi.mocked(prisma.leaveRequest.findMany).mockResolvedValue([]);

      await getLeaveRequests(mockRequest as Request, mockResponse as Response);

      expect(prisma.leaveRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            employeeId: 'emp-123',
          }),
        })
      );
    });

    it('should filter by status', async () => {
      mockRequest.query = { status: 'APPROVED' };

      vi.mocked(prisma.leaveRequest.findMany).mockResolvedValue([]);

      await getLeaveRequests(mockRequest as Request, mockResponse as Response);

      expect(prisma.leaveRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'APPROVED',
          }),
        })
      );
    });
  });

  describe('approveLeaveRequest', () => {
    it('should approve leave request successfully', async () => {
      mockRequest.params = { id: 'leave-123' };
      mockRequest.body = {
        approverId: 'manager-123',
        comments: 'Approved for holiday period',
      };

      const mockApprovedLeave = {
        id: 'leave-123',
        employeeId: 'emp-123',
        leaveType: 'ANNUAL',
        startDate: new Date('2024-12-24'),
        endDate: new Date('2024-12-31'),
        days: 8,
        status: 'APPROVED',
        approverId: 'manager-123',
        approvedAt: new Date(),
        approverComments: 'Approved for holiday period',
      };

      vi.mocked(prisma.leaveRequest.update).mockResolvedValue(mockApprovedLeave as any);

      await approveLeaveRequest(mockRequest as any, mockResponse as Response);

      expect(prisma.leaveRequest.update).toHaveBeenCalledWith({
        where: { id: 'leave-123' },
        data: expect.objectContaining({
          status: 'APPROVED',
          approverId: 'manager-123',
          approverComments: 'Approved for holiday period',
          approvedAt: expect.any(Date),
        }),
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockApprovedLeave,
        message: 'Leave request approved',
      });
    });
  });

  describe('rejectLeaveRequest', () => {
    it('should reject leave request successfully', async () => {
      mockRequest.params = { id: 'leave-123' };
      mockRequest.body = {
        approverId: 'manager-123',
        comments: 'Insufficient staffing during this period',
      };

      const mockRejectedLeave = {
        id: 'leave-123',
        status: 'REJECTED',
        approverId: 'manager-123',
        approverComments: 'Insufficient staffing during this period',
      };

      vi.mocked(prisma.leaveRequest.update).mockResolvedValue(mockRejectedLeave as any);

      await rejectLeaveRequest(mockRequest as any, mockResponse as Response);

      expect(prisma.leaveRequest.update).toHaveBeenCalledWith({
        where: { id: 'leave-123' },
        data: expect.objectContaining({
          status: 'REJECTED',
          approverId: 'manager-123',
          approverComments: 'Insufficient staffing during this period',
          approvedAt: expect.any(Date),
        }),
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockRejectedLeave,
        message: 'Leave request rejected',
      });
    });
  });

  describe('getLeaveBalance', () => {
    it('should return leave balance for employee', async () => {
      mockRequest.params = { employeeId: 'emp-123' };

      const mockLeaveBalance = [
        {
          id: 'balance-1',
          employeeId: 'emp-123',
          year: 2024,
          leaveType: 'ANNUAL',
          totalDays: 20,
          usedDays: 5,
          remainingDays: 15,
        },
        {
          id: 'balance-2',
          employeeId: 'emp-123',
          year: 2024,
          leaveType: 'SICK',
          totalDays: 10,
          usedDays: 2,
          remainingDays: 8,
        },
      ];

      vi.mocked(prisma.leaveBalance.findMany).mockResolvedValue(mockLeaveBalance as any);

      await getLeaveBalance(mockRequest as Request, mockResponse as Response);

      expect(prisma.leaveBalance.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          employeeId: 'emp-123',
        }),
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockLeaveBalance,
      });
    });

    it('should filter by year', async () => {
      mockRequest.params = { employeeId: 'emp-123' };
      mockRequest.query = { year: '2024' };

      vi.mocked(prisma.leaveBalance.findMany).mockResolvedValue([]);

      await getLeaveBalance(mockRequest as Request, mockResponse as Response);

      expect(prisma.leaveBalance.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          employeeId: 'emp-123',
          year: 2024,
        }),
      });
    });
  });
});
