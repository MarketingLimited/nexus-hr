import { Request, Response } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

// Performance Reviews
export const getPerformanceReviews = async (req: Request, res: Response) => {
  try {
    const { employeeId, status } = req.query;

    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;

    const reviews = await prisma.performanceReview.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      status: 'success',
      data: reviews,
    });
  } catch (error) {
    throw new AppError('Failed to fetch performance reviews', 500);
  }
};

export const createPerformanceReview = async (req: Request, res: Response) => {
  try {
    const review = await prisma.performanceReview.create({
      data: req.body,
    });

    res.status(201).json({
      status: 'success',
      data: review,
    });
  } catch (error) {
    throw new AppError('Failed to create performance review', 500);
  }
};

// Goals
export const getGoals = async (req: Request, res: Response) => {
  try {
    const { employeeId, status } = req.query;

    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;

    const goals = await prisma.goal.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      status: 'success',
      data: goals,
    });
  } catch (error) {
    throw new AppError('Failed to fetch goals', 500);
  }
};

export const createGoal = async (req: Request, res: Response) => {
  try {
    const goal = await prisma.goal.create({
      data: req.body,
    });

    res.status(201).json({
      status: 'success',
      data: goal,
    });
  } catch (error) {
    throw new AppError('Failed to create goal', 500);
  }
};

export const updateGoal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const goal = await prisma.goal.update({
      where: { id },
      data: req.body,
    });

    res.json({
      status: 'success',
      data: goal,
    });
  } catch (error) {
    throw new AppError('Failed to update goal', 500);
  }
};

// Feedback
export const getFeedback = async (req: Request, res: Response) => {
  try {
    const { toEmployeeId, fromEmployeeId, status } = req.query;

    const where: any = {};
    if (toEmployeeId) where.toEmployeeId = toEmployeeId;
    if (fromEmployeeId) where.fromEmployeeId = fromEmployeeId;
    if (status) where.status = status;

    const feedback = await prisma.feedback.findMany({
      where,
      include: {
        toEmployee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        fromEmployee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      status: 'success',
      data: feedback,
    });
  } catch (error) {
    throw new AppError('Failed to fetch feedback', 500);
  }
};

export const createFeedback = async (req: Request, res: Response) => {
  try {
    const feedback = await prisma.feedback.create({
      data: req.body,
    });

    res.status(201).json({
      status: 'success',
      data: feedback,
    });
  } catch (error) {
    throw new AppError('Failed to create feedback', 500);
  }
};
