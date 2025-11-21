import { Response } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// Create leave request
export const createLeaveRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { employeeId, leaveType, startDate, endDate, reason, isHalfDay = false } = req.body;

    // Calculate number of days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = isHalfDay ? 0.5 : Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        employeeId,
        leaveType,
        startDate: start,
        endDate: end,
        reason,
        days,
        status: 'PENDING',
      },
    });

    res.status(201).json({
      status: 'success',
      data: leaveRequest,
    });
  } catch (error) {
    throw new AppError('Failed to create leave request', 500);
  }
};

// Get all leave requests (with filtering)
export const getLeaveRequests = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 50, employeeId, status, leaveType, startDate, endDate } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {};

    if (employeeId) where.employeeId = employeeId as string;
    if (status) where.status = status;
    if (leaveType) where.leaveType = leaveType;

    if (startDate || endDate) {
      where.AND = [];
      if (startDate) {
        where.AND.push({ startDate: { gte: new Date(startDate as string) } });
      }
      if (endDate) {
        where.AND.push({ endDate: { lte: new Date(endDate as string) } });
      }
    }

    const [leaveRequests, total] = await Promise.all([
      prisma.leaveRequest.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          employee: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              department: true,
            },
          },
        },
      }),
      prisma.leaveRequest.count({ where }),
    ]);

    res.json({
      status: 'success',
      data: leaveRequests,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    throw new AppError('Failed to fetch leave requests', 500);
  }
};

// Get single leave request
export const getLeaveRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            department: true,
            position: true,
          },
        },
      },
    });

    if (!leaveRequest) {
      throw new AppError('Leave request not found', 404);
    }

    res.json({
      status: 'success',
      data: leaveRequest,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch leave request', 500);
  }
};

// Update leave request
export const updateLeaveRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Recalculate days if dates changed
    if (updateData.startDate || updateData.endDate) {
      const existing = await prisma.leaveRequest.findUnique({ where: { id } });
      if (!existing) throw new AppError('Leave request not found', 404);

      const start = updateData.startDate ? new Date(updateData.startDate) : existing.startDate;
      const end = updateData.endDate ? new Date(updateData.endDate) : existing.endDate;
      updateData.days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;

      if (updateData.startDate) updateData.startDate = start;
      if (updateData.endDate) updateData.endDate = end;
    }

    const leaveRequest = await prisma.leaveRequest.update({
      where: { id },
      data: updateData,
    });

    res.json({
      status: 'success',
      data: leaveRequest,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to update leave request', 500);
  }
};

// Delete leave request
export const deleteLeaveRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.leaveRequest.delete({
      where: { id },
    });

    res.json({
      status: 'success',
      message: 'Leave request deleted successfully',
    });
  } catch (error) {
    throw new AppError('Failed to delete leave request', 500);
  }
};

// Approve leave request
export const approveLeaveRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { approverId, comments } = req.body;

    const leaveRequest = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy: approverId,
        approvedAt: new Date(),
        approverComments: comments,
      },
    });

    res.json({
      status: 'success',
      data: leaveRequest,
      message: 'Leave request approved successfully',
    });
  } catch (error) {
    throw new AppError('Failed to approve leave request', 500);
  }
};

// Reject leave request
export const rejectLeaveRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { approverId, comments } = req.body;

    const leaveRequest = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        approvedBy: approverId,
        approvedAt: new Date(),
        approverComments: comments,
      },
    });

    res.json({
      status: 'success',
      data: leaveRequest,
      message: 'Leave request rejected',
    });
  } catch (error) {
    throw new AppError('Failed to reject leave request', 500);
  }
};

// Get leave balance for an employee
export const getLeaveBalance = async (req: AuthRequest, res: Response) => {
  try {
    const { employeeId } = req.params;
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31);

    // Get all approved leave requests for the year
    const approvedLeaves = await prisma.leaveRequest.findMany({
      where: {
        employeeId,
        status: 'APPROVED',
        startDate: { gte: yearStart },
        endDate: { lte: yearEnd },
      },
    });

    // Calculate used days by leave type
    const leaveBalance: any = {
      ANNUAL: { total: 20, used: 0, remaining: 20 },
      SICK: { total: 10, used: 0, remaining: 10 },
      PERSONAL: { total: 5, used: 0, remaining: 5 },
      MATERNITY: { total: 90, used: 0, remaining: 90 },
      PATERNITY: { total: 10, used: 0, remaining: 10 },
      UNPAID: { total: 0, used: 0, remaining: 0 },
      BEREAVEMENT: { total: 3, used: 0, remaining: 3 },
    };

    approvedLeaves.forEach((leave) => {
      if (leaveBalance[leave.leaveType]) {
        leaveBalance[leave.leaveType].used += leave.days;
        leaveBalance[leave.leaveType].remaining =
          leaveBalance[leave.leaveType].total - leaveBalance[leave.leaveType].used;
      }
    });

    res.json({
      status: 'success',
      data: {
        employeeId,
        year: currentYear,
        balance: leaveBalance,
      },
    });
  } catch (error) {
    throw new AppError('Failed to fetch leave balance', 500);
  }
};

// Get leave calendar (all employees)
export const getLeaveCalendar = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate, department } = req.query;

    const where: any = {
      status: 'APPROVED',
    };

    if (startDate && endDate) {
      where.AND = [
        { startDate: { lte: new Date(endDate as string) } },
        { endDate: { gte: new Date(startDate as string) } },
      ];
    }

    if (department) {
      where.employee = {
        department: department as string,
      };
    }

    const leaves = await prisma.leaveRequest.findMany({
      where,
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            department: true,
            position: true,
          },
        },
      },
      orderBy: { startDate: 'asc' },
    });

    res.json({
      status: 'success',
      data: leaves,
    });
  } catch (error) {
    throw new AppError('Failed to fetch leave calendar', 500);
  }
};

// Get leave policies
export const getLeavePolicies = async (req: AuthRequest, res: Response) => {
  try {
    // For now, return static policies. In a real app, these would come from database
    const policies = [
      {
        id: '1',
        leaveType: 'ANNUAL',
        name: 'Annual Leave',
        daysPerYear: 20,
        carryOver: true,
        maxCarryOver: 5,
        description: 'Standard annual leave entitlement',
      },
      {
        id: '2',
        leaveType: 'SICK',
        name: 'Sick Leave',
        daysPerYear: 10,
        carryOver: false,
        maxCarryOver: 0,
        description: 'Sick leave with medical certificate required after 3 days',
      },
      {
        id: '3',
        leaveType: 'PERSONAL',
        name: 'Personal Leave',
        daysPerYear: 5,
        carryOver: false,
        maxCarryOver: 0,
        description: 'Personal or family emergency leave',
      },
      {
        id: '4',
        leaveType: 'MATERNITY',
        name: 'Maternity Leave',
        daysPerYear: 90,
        carryOver: false,
        maxCarryOver: 0,
        description: 'Maternity leave for new mothers',
      },
      {
        id: '5',
        leaveType: 'PATERNITY',
        name: 'Paternity Leave',
        daysPerYear: 10,
        carryOver: false,
        maxCarryOver: 0,
        description: 'Paternity leave for new fathers',
      },
      {
        id: '6',
        leaveType: 'BEREAVEMENT',
        name: 'Bereavement Leave',
        daysPerYear: 3,
        carryOver: false,
        maxCarryOver: 0,
        description: 'Leave for immediate family bereavement',
      },
    ];

    res.json({
      status: 'success',
      data: policies,
    });
  } catch (error) {
    throw new AppError('Failed to fetch leave policies', 500);
  }
};

// Create leave policy (admin only)
export const createLeavePolicy = async (req: AuthRequest, res: Response) => {
  try {
    const policyData = req.body;

    // In a real app, this would save to database
    // For now, return a mock response
    res.status(201).json({
      status: 'success',
      data: {
        id: Date.now().toString(),
        ...policyData,
        createdAt: new Date(),
      },
      message: 'Leave policy created successfully',
    });
  } catch (error) {
    throw new AppError('Failed to create leave policy', 500);
  }
};
