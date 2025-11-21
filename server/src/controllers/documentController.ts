import { Request, Response } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

export const getDocuments = async (req: Request, res: Response) => {
  try {
    const { employeeId, category, type } = req.query;

    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    if (category) where.category = category;
    if (type) where.type = type;

    const documents = await prisma.document.findMany({
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
      orderBy: { uploadedAt: 'desc' },
    });

    res.json({
      status: 'success',
      data: documents,
    });
  } catch (error) {
    throw new AppError('Failed to fetch documents', 500);
  }
};

export const getDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        employee: true,
        permissions: true,
      },
    });

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    res.json({
      status: 'success',
      data: document,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to fetch document', 500);
  }
};

export const createDocument = async (req: Request, res: Response) => {
  try {
    const {
      name,
      type,
      category,
      filePath,
      fileSize,
      mimeType,
      employeeId,
      tags = [],
    } = req.body;

    const userId = (req as any).user.id;

    const document = await prisma.document.create({
      data: {
        name,
        type,
        category,
        filePath,
        fileSize,
        mimeType,
        employeeId,
        tags,
        uploadedBy: userId,
      },
    });

    res.status(201).json({
      status: 'success',
      data: document,
    });
  } catch (error) {
    throw new AppError('Failed to create document', 500);
  }
};

export const deleteDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.document.delete({
      where: { id },
    });

    res.json({
      status: 'success',
      message: 'Document deleted successfully',
    });
  } catch (error) {
    throw new AppError('Failed to delete document', 500);
  }
};
