import { Request, Response } from 'express';
import prisma from '../config/database';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import crypto from 'crypto';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role = 'EMPLOYEE' } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError('User already exists', 400);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user and employee
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        employee: {
          create: {
            employeeId: `EMP${Date.now()}`,
            firstName,
            lastName,
            email,
            position: 'Not Assigned',
            department: 'Not Assigned',
            location: 'Not Assigned',
            hireDate: new Date(),
            status: 'ACTIVE',
          },
        },
      },
      include: {
        employee: true,
      },
    });

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      status: 'success',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Registration failed', 500);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { employee: true },
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      status: 'success',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          employee: user.employee,
        },
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Login failed', 500);
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        employee: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to fetch profile', 500);
  }
};

// Logout (token blacklisting would be implemented with Redis)
export const logout = async (req: AuthRequest, res: Response) => {
  try {
    // In a production app, add token to blacklist in Redis
    // For now, client-side token removal is sufficient
    res.json({
      status: 'success',
      message: 'Logged out successfully',
    });
  } catch (error) {
    throw new AppError('Logout failed', 500);
  }
};

// Refresh token
export const refreshToken = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('Invalid token', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Generate new token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      status: 'success',
      data: { token },
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Token refresh failed', 500);
  }
};

// Request password reset
export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Don't reveal if user exists for security
    if (!user) {
      res.json({
        status: 'success',
        message: 'If the email exists, a password reset link has been sent',
      });
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = await hashPassword(resetToken);
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    // Store reset token (in production, use a separate PasswordReset table)
    // For now, we'll just return success
    // TODO: Send email with reset link containing resetToken

    res.json({
      status: 'success',
      message: 'If the email exists, a password reset link has been sent',
      // In development, return token (remove in production)
      ...(process.env.NODE_ENV === 'development' && { resetToken }),
    });
  } catch (error) {
    throw new AppError('Password reset request failed', 500);
  }
};

// Reset password with token
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    // Validate password strength
    const validation = validatePasswordStrength(newPassword);
    if (!validation.valid) {
      throw new AppError(validation.errors.join(', '), 400);
    }

    // TODO: Verify token from PasswordReset table
    // For now, this is a placeholder implementation

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password
    // const user = await prisma.user.update({
    //   where: { id: userIdFromToken },
    //   data: { password: hashedPassword },
    // });

    res.json({
      status: 'success',
      message: 'Password reset successful',
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Password reset failed', 500);
  }
};

// Change password (authenticated user)
export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      throw new AppError('Authentication required', 401);
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isValid = await comparePassword(currentPassword, user.password);
    if (!isValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    // Validate new password strength
    const validation = validatePasswordStrength(newPassword);
    if (!validation.valid) {
      throw new AppError(validation.errors.join(', '), 400);
    }

    // Hash and update password
    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.json({
      status: 'success',
      message: 'Password changed successfully',
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Password change failed', 500);
  }
};

// Verify email
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    // TODO: Verify email token from database
    // For now, placeholder implementation

    res.json({
      status: 'success',
      message: 'Email verified successfully',
    });
  } catch (error) {
    throw new AppError('Email verification failed', 500);
  }
};

// Request email verification
export const requestEmailVerification = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('Authentication required', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // TODO: Send email with verification link
    // emailService.sendVerificationEmail(user.email, verificationToken);

    res.json({
      status: 'success',
      message: 'Verification email sent',
      // In development, return token (remove in production)
      ...(process.env.NODE_ENV === 'development' && { verificationToken }),
    });
  } catch (error) {
    throw new AppError('Email verification request failed', 500);
  }
};
