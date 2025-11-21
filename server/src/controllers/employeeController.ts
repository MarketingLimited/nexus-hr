import { Request, Response } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { hashPassword, generateTemporaryPassword } from '../utils/password';

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

    // Generate a secure temporary password
    const temporaryPassword = generateTemporaryPassword();
    const hashedPassword = await hashPassword(temporaryPassword);

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
            password: hashedPassword,
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

// Bulk import employees
export const bulkImportEmployees = async (req: Request, res: Response) => {
  try {
    const { employees } = req.body; // Array of employee data

    if (!Array.isArray(employees) || employees.length === 0) {
      throw new AppError('Invalid employee data', 400);
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as any[],
    };

    for (const empData of employees) {
      try {
        const temporaryPassword = generateTemporaryPassword();
        const hashedPassword = await hashPassword(temporaryPassword);

        await prisma.employee.create({
          data: {
            employeeId: empData.employeeId || `EMP${Date.now()}`,
            firstName: empData.firstName,
            lastName: empData.lastName,
            email: empData.email,
            phone: empData.phone,
            position: empData.position,
            department: empData.department,
            location: empData.location,
            hireDate: new Date(empData.hireDate),
            salary: empData.salary,
            manager: empData.manager,
            skills: empData.skills || [],
            status: 'ACTIVE',
            user: {
              create: {
                email: empData.email,
                password: hashedPassword,
                firstName: empData.firstName,
                lastName: empData.lastName,
                role: empData.role || 'EMPLOYEE',
              },
            },
          },
        });

        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          email: empData.email,
          error: error.message,
        });
      }
    }

    res.json({
      status: 'success',
      data: results,
      message: `Imported ${results.success} employees, ${results.failed} failed`,
    });
  } catch (error) {
    throw new AppError('Bulk import failed', 500);
  }
};

// Export employees
export const exportEmployees = async (req: Request, res: Response) => {
  try {
    const { format = 'json' } = req.query;

    const employees = await prisma.employee.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (format === 'csv') {
      // Convert to CSV format
      const headers = [
        'Employee ID',
        'First Name',
        'Last Name',
        'Email',
        'Phone',
        'Position',
        'Department',
        'Location',
        'Hire Date',
        'Status',
      ];

      const csvRows = [headers.join(',')];

      employees.forEach((emp) => {
        const row = [
          emp.employeeId,
          emp.firstName,
          emp.lastName,
          emp.email,
          emp.phone || '',
          emp.position,
          emp.department,
          emp.location,
          emp.hireDate.toISOString().split('T')[0],
          emp.status,
        ];
        csvRows.push(row.join(','));
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=employees.csv');
      res.send(csvRows.join('\n'));
    } else {
      // JSON format
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=employees.json');
      res.json({
        status: 'success',
        data: employees,
        exportedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    throw new AppError('Employee export failed', 500);
  }
};

// Advanced search
export const advancedSearch = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 50,
      search,
      department,
      position,
      status,
      location,
      hiredAfter,
      hiredBefore,
      salaryMin,
      salaryMax,
      skills,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {};

    // Text search
    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { employeeId: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    // Filters
    if (department) where.department = department;
    if (position) where.position = position;
    if (status) where.status = status;
    if (location) where.location = location;

    // Date range filters
    if (hiredAfter || hiredBefore) {
      where.hireDate = {};
      if (hiredAfter) where.hireDate.gte = new Date(hiredAfter as string);
      if (hiredBefore) where.hireDate.lte = new Date(hiredBefore as string);
    }

    // Salary range
    if (salaryMin || salaryMax) {
      where.salary = {};
      if (salaryMin) where.salary.gte = Number(salaryMin);
      if (salaryMax) where.salary.lte = Number(salaryMax);
    }

    // Skills filter
    if (skills) {
      const skillsArray = (skills as string).split(',');
      where.skills = {
        hasEvery: skillsArray,
      };
    }

    // Sorting
    const orderBy: any = {};
    orderBy[sortBy as string] = sortOrder;

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip,
        take,
        orderBy,
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
    throw new AppError('Advanced search failed', 500);
  }
};
