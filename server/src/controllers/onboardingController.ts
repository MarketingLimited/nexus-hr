import { Response } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// Create onboarding checklist for an employee
export const createOnboardingChecklist = async (req: AuthRequest, res: Response) => {
  try {
    const { employeeId, templateId, startDate, expectedCompletionDate } = req.body;

    const checklist = await prisma.onboardingChecklist.create({
      data: {
        employeeId,
        startDate: new Date(startDate),
        expectedCompletionDate: new Date(expectedCompletionDate),
        status: 'PENDING',
      },
    });

    // Create default onboarding tasks
    const defaultTasks = [
      { title: 'Complete employment contract', description: 'Sign and submit employment contract', order: 1, daysToComplete: 1 },
      { title: 'Setup workspace and equipment', description: 'Assign desk, computer, and necessary equipment', order: 2, daysToComplete: 1 },
      { title: 'Create company accounts', description: 'Email, Slack, and other company tool accounts', order: 3, daysToComplete: 1 },
      { title: 'Review company policies', description: 'Read and acknowledge company handbook', order: 4, daysToComplete: 3 },
      { title: 'Meet the team', description: 'Introduction to team members and key stakeholders', order: 5, daysToComplete: 5 },
      { title: 'Complete training modules', description: 'Mandatory training on tools and processes', order: 6, daysToComplete: 7 },
      { title: 'Set initial goals', description: 'Meet with manager to set 30-60-90 day goals', order: 7, daysToComplete: 7 },
      { title: 'Submit tax and bank documents', description: 'Provide tax forms and bank details for payroll', order: 8, daysToComplete: 3 },
    ];

    const tasks = await Promise.all(
      defaultTasks.map((task) =>
        prisma.onboardingTask.create({
          data: {
            checklistId: checklist.id,
            ...task,
            status: 'PENDING',
          },
        })
      )
    );

    res.status(201).json({
      status: 'success',
      data: {
        ...checklist,
        tasks,
      },
      message: 'Onboarding checklist created successfully',
    });
  } catch (error) {
    throw new AppError('Failed to create onboarding checklist', 500);
  }
};

// Get onboarding checklist for an employee
export const getOnboardingChecklist = async (req: AuthRequest, res: Response) => {
  try {
    const { employeeId } = req.params;

    const checklist = await prisma.onboardingChecklist.findFirst({
      where: { employeeId },
      include: {
        tasks: {
          orderBy: { order: 'asc' },
        },
        employee: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            position: true,
            department: true,
          },
        },
      },
    });

    if (!checklist) {
      throw new AppError('Onboarding checklist not found', 404);
    }

    res.json({
      status: 'success',
      data: checklist,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch onboarding checklist', 500);
  }
};

// Update onboarding task status
export const updateOnboardingTask = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const { status, notes, completedBy } = req.body;

    const updateData: any = { status, notes };

    if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
      updateData.completedBy = completedBy || req.user?.id;
    }

    const task = await prisma.onboardingTask.update({
      where: { id: taskId },
      data: updateData,
    });

    // Check if all tasks are completed and update checklist status
    const checklist = await prisma.onboardingChecklist.findUnique({
      where: { id: task.checklistId },
      include: { tasks: true },
    });

    if (checklist) {
      const allCompleted = checklist.tasks.every((t) => t.status === 'COMPLETED' || t.status === 'SKIPPED');
      if (allCompleted && checklist.status !== 'COMPLETED') {
        await prisma.onboardingChecklist.update({
          where: { id: checklist.id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
          },
        });
      }
    }

    res.json({
      status: 'success',
      data: task,
      message: 'Task updated successfully',
    });
  } catch (error) {
    throw new AppError('Failed to update onboarding task', 500);
  }
};

// Get onboarding templates
export const getOnboardingTemplates = async (req: AuthRequest, res: Response) => {
  try {
    // For now, return static templates. In a real app, these would come from database
    const templates = [
      {
        id: '1',
        name: 'Standard Employee Onboarding',
        description: 'Default onboarding process for all employees',
        duration: 30,
        tasks: 8,
      },
      {
        id: '2',
        name: 'Engineering Onboarding',
        description: 'Technical onboarding for engineering roles',
        duration: 45,
        tasks: 12,
      },
      {
        id: '3',
        name: 'Sales Onboarding',
        description: 'Sales-specific onboarding with customer interaction training',
        duration: 30,
        tasks: 10,
      },
      {
        id: '4',
        name: 'Manager Onboarding',
        description: 'Leadership onboarding for management positions',
        duration: 60,
        tasks: 15,
      },
    ];

    res.json({
      status: 'success',
      data: templates,
    });
  } catch (error) {
    throw new AppError('Failed to fetch onboarding templates', 500);
  }
};

// Assign onboarding checklist
export const assignOnboarding = async (req: AuthRequest, res: Response) => {
  try {
    const { employeeId, templateId, assignedBy } = req.body;

    // Check if employee already has an onboarding checklist
    const existing = await prisma.onboardingChecklist.findFirst({
      where: { employeeId },
    });

    if (existing) {
      throw new AppError('Employee already has an onboarding checklist', 400);
    }

    // Create new checklist with 30-day completion window
    const startDate = new Date();
    const expectedCompletionDate = new Date();
    expectedCompletionDate.setDate(expectedCompletionDate.getDate() + 30);

    const checklist = await prisma.onboardingChecklist.create({
      data: {
        employeeId,
        startDate,
        expectedCompletionDate,
        status: 'IN_PROGRESS',
      },
    });

    res.status(201).json({
      status: 'success',
      data: checklist,
      message: 'Onboarding assigned successfully',
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to assign onboarding', 500);
  }
};

// Get onboarding progress for an employee
export const getOnboardingProgress = async (req: AuthRequest, res: Response) => {
  try {
    const { employeeId } = req.params;

    const checklist = await prisma.onboardingChecklist.findFirst({
      where: { employeeId },
      include: {
        tasks: true,
      },
    });

    if (!checklist) {
      throw new AppError('Onboarding checklist not found', 404);
    }

    const totalTasks = checklist.tasks.length;
    const completedTasks = checklist.tasks.filter((t) => t.status === 'COMPLETED').length;
    const inProgressTasks = checklist.tasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const pendingTasks = checklist.tasks.filter((t) => t.status === 'PENDING').length;

    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Calculate days since start
    const daysSinceStart = Math.floor(
      (new Date().getTime() - checklist.startDate.getTime()) / (1000 * 3600 * 24)
    );

    // Calculate days remaining
    const daysRemaining = Math.floor(
      (checklist.expectedCompletionDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24)
    );

    res.json({
      status: 'success',
      data: {
        checklistId: checklist.id,
        employeeId,
        status: checklist.status,
        progress: {
          percentage: progressPercentage,
          completedTasks,
          inProgressTasks,
          pendingTasks,
          totalTasks,
        },
        timeline: {
          startDate: checklist.startDate,
          expectedCompletionDate: checklist.expectedCompletionDate,
          daysSinceStart,
          daysRemaining,
          isOverdue: daysRemaining < 0,
        },
      },
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch onboarding progress', 500);
  }
};
