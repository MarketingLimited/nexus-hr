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

// Update document metadata
export const updateDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, type, category, tags, isConfidential, expiryDate } = req.body;

    const updateData: any = {};

    if (name) updateData.name = name;
    if (type) updateData.type = type;
    if (category) updateData.category = category;
    if (tags) updateData.tags = tags;
    if (isConfidential !== undefined) updateData.isConfidential = isConfidential;
    if (expiryDate) updateData.expiryDate = new Date(expiryDate);

    const document = await prisma.document.update({
      where: { id },
      data: updateData,
    });

    res.json({
      status: 'success',
      data: document,
      message: 'Document updated successfully',
    });
  } catch (error) {
    throw new AppError('Failed to update document', 500);
  }
};

// Share document with employees
export const shareDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { employeeIds, canEdit = false, canDelete = false } = req.body;

    if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
      throw new AppError('Employee IDs are required', 400);
    }

    // Create permissions for each employee
    const permissions = await Promise.all(
      employeeIds.map((employeeId: string) =>
        prisma.documentPermission.upsert({
          where: {
            documentId_employeeId: {
              documentId: id,
              employeeId,
            },
          },
          create: {
            documentId: id,
            employeeId,
            canView: true,
            canEdit,
            canDelete,
          },
          update: {
            canView: true,
            canEdit,
            canDelete,
          },
        })
      )
    );

    res.json({
      status: 'success',
      data: permissions,
      message: `Document shared with ${employeeIds.length} employee(s)`,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to share document', 500);
  }
};

// Revoke document access
export const revokeDocumentAccess = async (req: Request, res: Response) => {
  try {
    const { id, employeeId } = req.params;

    await prisma.documentPermission.delete({
      where: {
        documentId_employeeId: {
          documentId: id,
          employeeId,
        },
      },
    });

    res.json({
      status: 'success',
      message: 'Document access revoked successfully',
    });
  } catch (error) {
    throw new AppError('Failed to revoke document access', 500);
  }
};

// Download document
export const downloadDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    // TODO: Implement actual file serving from storage
    // For now, return document metadata with download URL
    res.json({
      status: 'success',
      data: {
        id: document.id,
        name: document.name,
        filePath: document.filePath,
        mimeType: document.mimeType,
        fileSize: document.fileSize,
        downloadUrl: `/api/documents/${id}/file`, // Placeholder
      },
      message: 'Use downloadUrl to fetch the file',
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to download document', 500);
  }
};
