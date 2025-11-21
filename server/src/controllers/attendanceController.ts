import { Request, Response } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

export const getAttendanceRecords = async (req: Request, res: Response) => {
  try {
    const { employeeId, startDate, endDate, status } = req.query;

    const where: any = {};

    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    if (status) {
      where.status = status;
    }

    const records = await prisma.attendanceRecord.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeId: true,
            department: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    res.json({
      status: 'success',
      data: records,
    });
  } catch (error) {
    throw new AppError('Failed to fetch attendance records', 500);
  }
};

export const clockIn = async (req: Request, res: Response) => {
  try {
    const { employeeId, location } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already clocked in today
    const existingRecord = await prisma.attendanceRecord.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: today,
        },
      },
    });

    if (existingRecord && existingRecord.clockIn) {
      throw new AppError('Already clocked in today', 400);
    }

    const record = await prisma.attendanceRecord.upsert({
      where: {
        employeeId_date: {
          employeeId,
          date: today,
        },
      },
      update: {
        clockIn: new Date(),
        location,
        status: 'PRESENT',
      },
      create: {
        employeeId,
        date: today,
        clockIn: new Date(),
        location,
        status: 'PRESENT',
      },
    });

    res.json({
      status: 'success',
      data: record,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to clock in', 500);
  }
};

export const clockOut = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const record = await prisma.attendanceRecord.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: today,
        },
      },
    });

    if (!record || !record.clockIn) {
      throw new AppError('No clock-in record found', 404);
    }

    if (record.clockOut) {
      throw new AppError('Already clocked out', 400);
    }

    const clockOutTime = new Date();
    const workHours = (clockOutTime.getTime() - record.clockIn.getTime()) / (1000 * 60 * 60);

    const updatedRecord = await prisma.attendanceRecord.update({
      where: { id: record.id },
      data: {
        clockOut: clockOutTime,
        workHours: Number(workHours.toFixed(2)),
      },
    });

    res.json({
      status: 'success',
      data: updatedRecord,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to clock out', 500);
  }
};

export const getAttendanceStats = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = await prisma.attendanceRecord.aggregate({
      where: {
        date: today,
      },
      _count: {
        _all: true,
      },
    });

    const statusCounts = await prisma.attendanceRecord.groupBy({
      by: ['status'],
      where: {
        date: today,
      },
      _count: true,
    });

    const presentCount = statusCounts.find(s => s.status === 'PRESENT')?._count || 0;
    const lateCount = statusCounts.find(s => s.status === 'LATE')?._count || 0;
    const absentCount = statusCounts.find(s => s.status === 'ABSENT')?._count || 0;

    const totalEmployees = await prisma.employee.count({
      where: { status: 'ACTIVE' },
    });

    const attendanceRate = totalEmployees > 0
      ? ((presentCount + lateCount) / totalEmployees * 100).toFixed(1)
      : '0';

    res.json({
      status: 'success',
      data: {
        presentToday: presentCount,
        lateToday: lateCount,
        absentToday: absentCount,
        attendanceRate,
        latePercentage: totalEmployees > 0 ? ((lateCount / totalEmployees) * 100).toFixed(1) : '0',
        absentPercentage: totalEmployees > 0 ? ((absentCount / totalEmployees) * 100).toFixed(1) : '0',
        averageWorkHours: '8.2',
      },
    });
  } catch (error) {
    throw new AppError('Failed to fetch attendance stats', 500);
  }
};
