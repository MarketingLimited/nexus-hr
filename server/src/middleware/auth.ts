import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, config.jwt.secret) as {
      id: string;
      email: string;
      role: string;
    };

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Check if user can access their own resource or if they're an admin/HR
export const authorizeOwnerOrAdmin = (resourceUserIdParam: string = 'employeeId') => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const resourceUserId = req.params[resourceUserIdParam] || req.body[resourceUserIdParam];

    // Allow if user is admin, HR, or accessing their own resource
    if (req.user.role === 'ADMIN' || req.user.role === 'HR' || req.user.id === resourceUserId) {
      return next();
    }

    return res.status(403).json({ error: 'You can only access your own resources' });
  };
};

// Check specific permissions
export const hasPermission = (...permissions: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Admin and HR have all permissions
    if (req.user.role === 'ADMIN' || req.user.role === 'HR') {
      return next();
    }

    // For now, managers can manage their team
    if (req.user.role === 'MANAGER' && permissions.includes('manage_team')) {
      return next();
    }

    return res.status(403).json({ error: 'Insufficient permissions' });
  };
};
