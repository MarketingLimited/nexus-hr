import { Response } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// Process payroll for an employee
export const processPayroll = async (req: AuthRequest, res: Response) => {
  try {
    const {
      employeeId,
      payPeriodStart,
      payPeriodEnd,
      baseSalary,
      allowances = 0,
      deductions = 0,
      taxAmount = 0,
      bonus = 0,
    } = req.body;

    // Calculate gross and net salary
    const grossSalary = baseSalary + allowances + bonus;
    const netSalary = grossSalary - deductions - taxAmount;

    const payrollRecord = await prisma.payrollRecord.create({
      data: {
        employeeId,
        payPeriodStart: new Date(payPeriodStart),
        payPeriodEnd: new Date(payPeriodEnd),
        baseSalary,
        allowances,
        deductions,
        taxAmount,
        bonus,
        grossSalary,
        netSalary,
        status: 'PENDING',
        paymentDate: null,
      },
    });

    res.status(201).json({
      status: 'success',
      data: payrollRecord,
      message: 'Payroll processed successfully',
    });
  } catch (error) {
    throw new AppError('Failed to process payroll', 500);
  }
};

// Get all payroll records (with filtering)
export const getPayrollRecords = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 50, employeeId, status, year, month } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {};

    if (employeeId) where.employeeId = employeeId as string;
    if (status) where.status = status;

    if (year || month) {
      where.AND = [];
      if (year && month) {
        const startDate = new Date(Number(year), Number(month) - 1, 1);
        const endDate = new Date(Number(year), Number(month), 0);
        where.AND.push({ payPeriodStart: { gte: startDate } });
        where.AND.push({ payPeriodEnd: { lte: endDate } });
      } else if (year) {
        const startDate = new Date(Number(year), 0, 1);
        const endDate = new Date(Number(year), 11, 31);
        where.AND.push({ payPeriodStart: { gte: startDate } });
        where.AND.push({ payPeriodEnd: { lte: endDate } });
      }
    }

    const [payrollRecords, total] = await Promise.all([
      prisma.payrollRecord.findMany({
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
              position: true,
            },
          },
        },
      }),
      prisma.payrollRecord.count({ where }),
    ]);

    res.json({
      status: 'success',
      data: payrollRecords,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    throw new AppError('Failed to fetch payroll records', 500);
  }
};

// Get single payroll record
export const getPayrollRecord = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const payrollRecord = await prisma.payrollRecord.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            department: true,
            position: true,
            employeeId: true,
          },
        },
      },
    });

    if (!payrollRecord) {
      throw new AppError('Payroll record not found', 404);
    }

    res.json({
      status: 'success',
      data: payrollRecord,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch payroll record', 500);
  }
};

// Get payroll records for a specific employee
export const getEmployeePayrollRecords = async (req: AuthRequest, res: Response) => {
  try {
    const { employeeId } = req.params;
    const { page = 1, limit = 50, year } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = { employeeId };

    if (year) {
      const startDate = new Date(Number(year), 0, 1);
      const endDate = new Date(Number(year), 11, 31);
      where.AND = [
        { payPeriodStart: { gte: startDate } },
        { payPeriodEnd: { lte: endDate } },
      ];
    }

    const [payrollRecords, total] = await Promise.all([
      prisma.payrollRecord.findMany({
        where,
        skip,
        take,
        orderBy: { payPeriodStart: 'desc' },
      }),
      prisma.payrollRecord.count({ where }),
    ]);

    res.json({
      status: 'success',
      data: payrollRecords,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    throw new AppError('Failed to fetch employee payroll records', 500);
  }
};

// Update payroll record
export const updatePayrollRecord = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Recalculate if any salary component changed
    if (updateData.baseSalary !== undefined ||
        updateData.allowances !== undefined ||
        updateData.deductions !== undefined ||
        updateData.taxAmount !== undefined ||
        updateData.bonus !== undefined) {

      const existing = await prisma.payrollRecord.findUnique({ where: { id } });
      if (!existing) throw new AppError('Payroll record not found', 404);

      const baseSalary = updateData.baseSalary ?? existing.baseSalary;
      const allowances = updateData.allowances ?? existing.allowances;
      const bonus = updateData.bonus ?? existing.bonus;
      const deductions = updateData.deductions ?? existing.deductions;
      const taxAmount = updateData.taxAmount ?? existing.taxAmount;

      updateData.grossSalary = baseSalary + allowances + bonus;
      updateData.netSalary = updateData.grossSalary - deductions - taxAmount;
    }

    const payrollRecord = await prisma.payrollRecord.update({
      where: { id },
      data: updateData,
    });

    res.json({
      status: 'success',
      data: payrollRecord,
      message: 'Payroll record updated successfully',
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to update payroll record', 500);
  }
};

// Send payslip (mark as paid and set payment date)
export const sendPayslip = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const payrollRecord = await prisma.payrollRecord.update({
      where: { id },
      data: {
        status: 'PAID',
        paymentDate: new Date(),
      },
    });

    // In a real app, this would trigger an email with the payslip
    res.json({
      status: 'success',
      data: payrollRecord,
      message: 'Payslip sent successfully',
    });
  } catch (error) {
    throw new AppError('Failed to send payslip', 500);
  }
};

// Get tax summary for a year
export const getTaxSummary = async (req: AuthRequest, res: Response) => {
  try {
    const { year } = req.params;
    const { employeeId } = req.query;

    const startDate = new Date(Number(year), 0, 1);
    const endDate = new Date(Number(year), 11, 31);

    const where: any = {
      payPeriodStart: { gte: startDate },
      payPeriodEnd: { lte: endDate },
      status: 'PAID',
    };

    if (employeeId) {
      where.employeeId = employeeId as string;
    }

    const payrollRecords = await prisma.payrollRecord.findMany({
      where,
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            employeeId: true,
          },
        },
      },
    });

    // Calculate totals by employee
    const summaryByEmployee: any = {};

    payrollRecords.forEach((record) => {
      const empId = record.employeeId;
      if (!summaryByEmployee[empId]) {
        summaryByEmployee[empId] = {
          employee: record.employee,
          totalGrossSalary: 0,
          totalTaxAmount: 0,
          totalNetSalary: 0,
          totalBonus: 0,
          paymentCount: 0,
        };
      }

      summaryByEmployee[empId].totalGrossSalary += record.grossSalary;
      summaryByEmployee[empId].totalTaxAmount += record.taxAmount;
      summaryByEmployee[empId].totalNetSalary += record.netSalary;
      summaryByEmployee[empId].totalBonus += record.bonus;
      summaryByEmployee[empId].paymentCount += 1;
    });

    res.json({
      status: 'success',
      data: {
        year: Number(year),
        summary: Object.values(summaryByEmployee),
      },
    });
  } catch (error) {
    throw new AppError('Failed to fetch tax summary', 500);
  }
};
