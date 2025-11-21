import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from './employeeController';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import * as passwordUtils from '../utils/password';

// Mock dependencies
vi.mock('../config/database', () => ({
  default: {
    employee: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  },
}));

vi.mock('../utils/password', () => ({
  hashPassword: vi.fn(),
  generateTemporaryPassword: vi.fn(),
}));

describe('EmployeeController', () => {
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
      send: vi.fn().mockReturnThis(),
      setHeader: vi.fn().mockReturnThis(),
    };
  });

  describe('getEmployees', () => {
    it('should return paginated list of employees', async () => {
      mockRequest.query = {
        page: '1',
        limit: '50',
      };

      const mockEmployees = [
        {
          id: 'emp-1',
          employeeId: 'EMP001',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          position: 'Developer',
          department: 'Engineering',
          status: 'ACTIVE',
        },
        {
          id: 'emp-2',
          employeeId: 'EMP002',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          position: 'Manager',
          department: 'HR',
          status: 'ACTIVE',
        },
      ];

      vi.mocked(prisma.employee.findMany).mockResolvedValue(mockEmployees as any);
      vi.mocked(prisma.employee.count).mockResolvedValue(2);

      await getEmployees(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockEmployees,
        meta: {
          total: 2,
          page: 1,
          limit: 50,
          totalPages: 1,
        },
      });
    });

    it('should filter employees by search query', async () => {
      mockRequest.query = {
        page: '1',
        limit: '50',
        search: 'john',
      };

      vi.mocked(prisma.employee.findMany).mockResolvedValue([]);
      vi.mocked(prisma.employee.count).mockResolvedValue(0);

      await getEmployees(mockRequest as Request, mockResponse as Response);

      expect(prisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ firstName: expect.any(Object) }),
              expect.objectContaining({ lastName: expect.any(Object) }),
              expect.objectContaining({ email: expect.any(Object) }),
              expect.objectContaining({ employeeId: expect.any(Object) }),
            ]),
          }),
        })
      );
    });

    it('should filter employees by department', async () => {
      mockRequest.query = {
        page: '1',
        limit: '50',
        department: 'Engineering',
      };

      vi.mocked(prisma.employee.findMany).mockResolvedValue([]);
      vi.mocked(prisma.employee.count).mockResolvedValue(0);

      await getEmployees(mockRequest as Request, mockResponse as Response);

      expect(prisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            department: 'Engineering',
          }),
        })
      );
    });

    it('should filter employees by status', async () => {
      mockRequest.query = {
        page: '1',
        limit: '50',
        status: 'ACTIVE',
      };

      vi.mocked(prisma.employee.findMany).mockResolvedValue([]);
      vi.mocked(prisma.employee.count).mockResolvedValue(0);

      await getEmployees(mockRequest as Request, mockResponse as Response);

      expect(prisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'ACTIVE',
          }),
        })
      );
    });
  });

  describe('getEmployee', () => {
    it('should return single employee by ID', async () => {
      mockRequest.params = { id: 'emp-123' };

      const mockEmployee = {
        id: 'emp-123',
        employeeId: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        position: 'Developer',
        department: 'Engineering',
        status: 'ACTIVE',
        user: {
          email: 'john@example.com',
          role: 'EMPLOYEE',
        },
      };

      vi.mocked(prisma.employee.findUnique).mockResolvedValue(mockEmployee as any);

      await getEmployee(mockRequest as Request, mockResponse as Response);

      expect(prisma.employee.findUnique).toHaveBeenCalledWith({
        where: { id: 'emp-123' },
        include: {
          user: {
            select: {
              email: true,
              role: true,
            },
          },
        },
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockEmployee,
      });
    });

    it('should throw error if employee not found', async () => {
      mockRequest.params = { id: 'nonexistent' };

      vi.mocked(prisma.employee.findUnique).mockResolvedValue(null);

      await expect(
        getEmployee(mockRequest as Request, mockResponse as Response)
      ).rejects.toThrow(AppError);
    });
  });

  describe('createEmployee', () => {
    it('should create new employee successfully', async () => {
      const employeeData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        position: 'Developer',
        department: 'Engineering',
        location: 'Remote',
        hireDate: '2024-01-01',
        salary: 80000,
        skills: ['JavaScript', 'TypeScript'],
      };

      mockRequest.body = employeeData;

      vi.mocked(passwordUtils.generateTemporaryPassword).mockReturnValue('TempPass123!');
      vi.mocked(passwordUtils.hashPassword).mockResolvedValue('hashedTempPass');

      const mockCreatedEmployee = {
        id: 'emp-123',
        employeeId: 'EMP1234567890',
        ...employeeData,
        hireDate: new Date(employeeData.hireDate),
        status: 'ACTIVE',
        userId: 'user-123',
        manager: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.employee.create).mockResolvedValue(mockCreatedEmployee as any);

      await createEmployee(mockRequest as Request, mockResponse as Response);

      expect(passwordUtils.generateTemporaryPassword).toHaveBeenCalled();
      expect(passwordUtils.hashPassword).toHaveBeenCalledWith('TempPass123!');
      expect(prisma.employee.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            firstName: employeeData.firstName,
            lastName: employeeData.lastName,
            email: employeeData.email,
            user: expect.objectContaining({
              create: expect.objectContaining({
                email: employeeData.email,
                password: 'hashedTempPass',
                role: 'EMPLOYEE',
              }),
            }),
          }),
        })
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockCreatedEmployee,
      });
    });
  });

  describe('updateEmployee', () => {
    it('should update employee successfully', async () => {
      mockRequest.params = { id: 'emp-123' };
      mockRequest.body = {
        position: 'Senior Developer',
        salary: 90000,
      };

      const mockUpdatedEmployee = {
        id: 'emp-123',
        employeeId: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        position: 'Senior Developer',
        department: 'Engineering',
        location: 'Remote',
        hireDate: new Date(),
        salary: 90000,
        status: 'ACTIVE',
        userId: 'user-123',
        phone: null,
        manager: null,
        skills: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.employee.update).mockResolvedValue(mockUpdatedEmployee);

      await updateEmployee(mockRequest as Request, mockResponse as Response);

      expect(prisma.employee.update).toHaveBeenCalledWith({
        where: { id: 'emp-123' },
        data: mockRequest.body,
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockUpdatedEmployee,
      });
    });
  });

  describe('deleteEmployee', () => {
    it('should delete employee successfully', async () => {
      mockRequest.params = { id: 'emp-123' };

      vi.mocked(prisma.employee.delete).mockResolvedValue({} as any);

      await deleteEmployee(mockRequest as Request, mockResponse as Response);

      expect(prisma.employee.delete).toHaveBeenCalledWith({
        where: { id: 'emp-123' },
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Employee deleted successfully',
      });
    });
  });
});
