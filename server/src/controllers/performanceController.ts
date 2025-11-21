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

// Get single performance review
export const getPerformanceReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const review = await prisma.performanceReview.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeId: true,
            department: true,
            position: true,
          },
        },
      },
    });

    if (!review) {
      throw new AppError('Performance review not found', 404);
    }

    res.json({
      status: 'success',
      data: review,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to fetch performance review', 500);
  }
};

// Update performance review
export const updatePerformanceReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const review = await prisma.performanceReview.update({
      where: { id },
      data: req.body,
    });

    res.json({
      status: 'success',
      data: review,
      message: 'Performance review updated successfully',
    });
  } catch (error) {
    throw new AppError('Failed to update performance review', 500);
  }
};

// Get single goal
export const getGoal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const goal = await prisma.goal.findUnique({
      where: { id },
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
    });

    if (!goal) {
      throw new AppError('Goal not found', 404);
    }

    res.json({
      status: 'success',
      data: goal,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to fetch goal', 500);
  }
};

// Delete goal
export const deleteGoal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.goal.delete({
      where: { id },
    });

    res.json({
      status: 'success',
      message: 'Goal deleted successfully',
    });
  } catch (error) {
    throw new AppError('Failed to delete goal', 500);
  }
};

// Update feedback
export const updateFeedback = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const feedback = await prisma.feedback.update({
      where: { id },
      data: req.body,
    });

    res.json({
      status: 'success',
      data: feedback,
      message: 'Feedback updated successfully',
    });
  } catch (error) {
    throw new AppError('Failed to update feedback', 500);
  }
};

// Delete feedback
export const deleteFeedback = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.feedback.delete({
      where: { id },
    });

    res.json({
      status: 'success',
      message: 'Feedback deleted successfully',
    });
  } catch (error) {
    throw new AppError('Failed to delete feedback', 500);
  }
};

// Get employee performance statistics
export const getEmployeePerformanceStats = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const { year } = req.query;

    const currentYear = year ? Number(year) : new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31, 23, 59, 59);

    // Get reviews for the year
    const reviews = await prisma.performanceReview.findMany({
      where: {
        employeeId,
        reviewPeriodStart: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Get goals for the year
    const goals = await prisma.goal.findMany({
      where: {
        employeeId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Get feedback received
    const feedbackReceived = await prisma.feedback.findMany({
      where: {
        toEmployeeId: employeeId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Get feedback given
    const feedbackGiven = await prisma.feedback.findMany({
      where: {
        fromEmployeeId: employeeId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Calculate statistics
    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.status === 'COMPLETED').length;
    const inProgressGoals = goals.filter(g => g.status === 'IN_PROGRESS').length;
    const notStartedGoals = goals.filter(g => g.status === 'NOT_STARTED').length;
    const goalCompletionRate = totalGoals > 0 ? ((completedGoals / totalGoals) * 100).toFixed(1) : '0';

    const averageRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + Number(r.overallRating), 0) / reviews.length).toFixed(2)
      : '0';

    res.json({
      status: 'success',
      data: {
        employeeId,
        year: currentYear,
        reviews: {
          total: reviews.length,
          averageRating: Number(averageRating),
          latest: reviews[0] || null,
        },
        goals: {
          total: totalGoals,
          completed: completedGoals,
          inProgress: inProgressGoals,
          notStarted: notStartedGoals,
          completionRate: Number(goalCompletionRate),
        },
        feedback: {
          received: feedbackReceived.length,
          given: feedbackGiven.length,
        },
      },
    });
  } catch (error) {
    throw new AppError('Failed to fetch performance statistics', 500);
  }
};

// Export performance report
export const exportPerformanceReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, department, format = 'json' } = req.query;

    const where: any = {};

    if (startDate && endDate) {
      where.reviewPeriodStart = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    const reviews = await prisma.performanceReview.findMany({
      where,
      include: {
        employee: {
          select: {
            employeeId: true,
            firstName: true,
            lastName: true,
            department: true,
            position: true,
          },
        },
      },
      orderBy: { reviewPeriodStart: 'desc' },
    });

    // Filter by department if specified
    const filteredReviews = department
      ? reviews.filter(r => r.employee.department === department)
      : reviews;

    if (format === 'csv') {
      // Generate CSV
      const headers = [
        'Review Date',
        'Employee ID',
        'Employee Name',
        'Department',
        'Position',
        'Review Period Start',
        'Review Period End',
        'Overall Rating',
        'Status',
        'Strengths',
        'Areas for Improvement',
      ];

      const csvRows = [headers.join(',')];

      filteredReviews.forEach((review) => {
        const row = [
          review.reviewDate.toISOString().split('T')[0],
          review.employee.employeeId,
          `${review.employee.firstName} ${review.employee.lastName}`,
          review.employee.department,
          review.employee.position,
          review.reviewPeriodStart.toISOString().split('T')[0],
          review.reviewPeriodEnd.toISOString().split('T')[0],
          review.overallRating.toString(),
          review.status,
          review.strengths || '',
          review.areasForImprovement || '',
        ];
        csvRows.push(row.map(field => `"${field}"`).join(','));
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=performance-report.csv');
      res.send(csvRows.join('\n'));
    } else {
      // JSON format
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=performance-report.json');
      res.json({
        status: 'success',
        data: filteredReviews,
        meta: {
          total: filteredReviews.length,
          startDate,
          endDate,
          department,
          exportedAt: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    throw new AppError('Performance export failed', 500);
  }
};
