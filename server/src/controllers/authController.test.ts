import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import {
  register,
  login,
  getProfile,
  logout,
  refreshToken,
  changePassword,
} from './authController';
import prisma from '../config/database';
import * as passwordUtils from '../utils/password';
import * as jwtUtils from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';

// Mock dependencies
vi.mock('../config/database', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('../utils/password', () => ({
  hashPassword: vi.fn(),
  comparePassword: vi.fn(),
  validatePasswordStrength: vi.fn(),
  generateTemporaryPassword: vi.fn(),
}));

vi.mock('../utils/jwt', () => ({
  generateToken: vi.fn(),
}));

describe('AuthController', () => {
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

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
        role: 'EMPLOYEE',
      };

      mockRequest.body = userData;

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(passwordUtils.hashPassword).mockResolvedValue('hashedPassword123');
      vi.mocked(prisma.user.create).mockResolvedValue({
        id: 'user-123',
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        password: 'hashedPassword123',
        createdAt: new Date(),
        updatedAt: new Date(),
        employee: null,
      });
      vi.mocked(jwtUtils.generateToken).mockReturnValue('mock-token');

      await register(mockRequest as Request, mockResponse as Response);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: userData.email },
      });
      expect(passwordUtils.hashPassword).toHaveBeenCalledWith(userData.password);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: expect.objectContaining({
          token: 'mock-token',
          user: expect.objectContaining({
            email: userData.email,
          }),
        }),
      });
    });

    it('should throw error if user already exists', async () => {
      mockRequest.body = {
        email: 'existing@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'existing-user',
        email: 'existing@example.com',
        password: 'hashedPassword',
        firstName: 'John',
        lastName: 'Doe',
        role: 'EMPLOYEE',
        createdAt: new Date(),
        updatedAt: new Date(),
        employee: null,
      });

      await expect(
        register(mockRequest as Request, mockResponse as Response)
      ).rejects.toThrow(AppError);
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      mockRequest.body = loginData;

      const mockUser = {
        id: 'user-123',
        email: loginData.email,
        password: 'hashedPassword123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'EMPLOYEE',
        createdAt: new Date(),
        updatedAt: new Date(),
        employee: {
          id: 'emp-123',
          employeeId: 'EMP001',
          firstName: 'John',
          lastName: 'Doe',
          email: loginData.email,
          position: 'Developer',
          department: 'Engineering',
          location: 'Remote',
          hireDate: new Date(),
          status: 'ACTIVE',
          userId: 'user-123',
          phone: null,
          salary: null,
          manager: null,
          skills: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      vi.mocked(passwordUtils.comparePassword).mockResolvedValue(true);
      vi.mocked(jwtUtils.generateToken).mockReturnValue('mock-token');

      await login(mockRequest as Request, mockResponse as Response);

      expect(passwordUtils.comparePassword).toHaveBeenCalledWith(
        loginData.password,
        mockUser.password
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: expect.objectContaining({
          token: 'mock-token',
          user: expect.objectContaining({
            email: loginData.email,
          }),
        }),
      });
    });

    it('should throw error with invalid password', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        password: 'hashedPassword123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'EMPLOYEE',
        createdAt: new Date(),
        updatedAt: new Date(),
        employee: null,
      });
      vi.mocked(passwordUtils.comparePassword).mockResolvedValue(false);

      await expect(
        login(mockRequest as Request, mockResponse as Response)
      ).rejects.toThrow(AppError);
    });

    it('should throw error if user not found', async () => {
      mockRequest.body = {
        email: 'nonexistent@example.com',
        password: 'Password123!',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(
        login(mockRequest as Request, mockResponse as Response)
      ).rejects.toThrow(AppError);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      (mockRequest as any).user = { id: 'user-123' };

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'EMPLOYEE',
        employee: null,
        createdAt: new Date(),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

      await getProfile(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: { user: mockUser },
      });
    });

    it('should throw error if user not found', async () => {
      (mockRequest as any).user = { id: 'nonexistent' };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(
        getProfile(mockRequest as Request, mockResponse as Response)
      ).rejects.toThrow(AppError);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      await logout(mockRequest as any, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Logged out successfully',
      });
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      (mockRequest as any).user = { id: 'user-123' };

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'EMPLOYEE',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(jwtUtils.generateToken).mockReturnValue('new-mock-token');

      await refreshToken(mockRequest as any, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: { token: 'new-mock-token' },
      });
    });

    it('should throw error if no user ID', async () => {
      (mockRequest as any).user = {};

      await expect(
        refreshToken(mockRequest as any, mockResponse as Response)
      ).rejects.toThrow(AppError);
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      (mockRequest as any).user = { id: 'user-123' };
      mockRequest.body = {
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
      };

      const mockUser = {
        id: 'user-123',
        password: 'hashedOldPassword',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(passwordUtils.comparePassword).mockResolvedValue(true);
      vi.mocked(passwordUtils.validatePasswordStrength).mockReturnValue({
        valid: true,
        errors: [],
      });
      vi.mocked(passwordUtils.hashPassword).mockResolvedValue('hashedNewPassword');

      await changePassword(mockRequest as any, mockResponse as Response);

      expect(passwordUtils.comparePassword).toHaveBeenCalledWith(
        'OldPassword123!',
        'hashedOldPassword'
      );
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { password: 'hashedNewPassword' },
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Password changed successfully',
      });
    });

    it('should throw error if current password is incorrect', async () => {
      (mockRequest as any).user = { id: 'user-123' };
      mockRequest.body = {
        currentPassword: 'WrongPassword',
        newPassword: 'NewPassword123!',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-123',
        password: 'hashedPassword',
      } as any);
      vi.mocked(passwordUtils.comparePassword).mockResolvedValue(false);

      await expect(
        changePassword(mockRequest as any, mockResponse as Response)
      ).rejects.toThrow(AppError);
    });

    it('should throw error if new password is weak', async () => {
      (mockRequest as any).user = { id: 'user-123' };
      mockRequest.body = {
        currentPassword: 'OldPassword123!',
        newPassword: 'weak',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-123',
        password: 'hashedPassword',
      } as any);
      vi.mocked(passwordUtils.comparePassword).mockResolvedValue(true);
      vi.mocked(passwordUtils.validatePasswordStrength).mockReturnValue({
        valid: false,
        errors: ['Password too weak'],
      });

      await expect(
        changePassword(mockRequest as any, mockResponse as Response)
      ).rejects.toThrow(AppError);
    });
  });
});
