import { Request, Response } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

export const getEmployees = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, search, department, status } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { employeeId: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (department) {
      where.department = department;
    }

    if (status) {
      where.status = status;
    }

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.employee.count({ where }),
    ]);

    res.json({
      status: 'success',
      data: employees,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    throw new AppError('Failed to fetch employees', 500);
  }
};

export const getEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            role: true,
          },
        },
      },
    });

    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    res.json({
      status: 'success',
      data: employee,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to fetch employee', 500);
  }
};

export const createEmployee = async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      position,
      department,
      location,
      hireDate,
      salary,
      manager,
      skills = [],
    } = req.body;

    const employee = await prisma.employee.create({
      data: {
        employeeId: `EMP${Date.now()}`,
        firstName,
        lastName,
        email,
        phone,
        position,
        department,
        location,
        hireDate: new Date(hireDate),
        salary,
        manager,
        skills,
        status: 'ACTIVE',
        user: {
          create: {
            email,
            password: 'changeme123', // Should be hashed in production
            firstName,
            lastName,
            role: 'EMPLOYEE',
          },
        },
      },
    });

    res.status(201).json({
      status: 'success',
      data: employee,
    });
  } catch (error) {
    throw new AppError('Failed to create employee', 500);
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const employee = await prisma.employee.update({
      where: { id },
      data: updateData,
    });

    res.json({
      status: 'success',
      data: employee,
    });
  } catch (error) {
    throw new AppError('Failed to update employee', 500);
  }
};

export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.employee.delete({
      where: { id },
    });

    res.json({
      status: 'success',
      message: 'Employee deleted successfully',
    });
  } catch (error) {
    throw new AppError('Failed to delete employee', 500);
  }
};
