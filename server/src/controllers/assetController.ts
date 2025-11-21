import { Response } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// Create asset
export const createAsset = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      category,
      serialNumber,
      purchaseDate,
      purchasePrice,
      status = 'AVAILABLE',
      description,
    } = req.body;

    const asset = await prisma.asset.create({
      data: {
        name,
        category,
        serialNumber,
        purchaseDate: new Date(purchaseDate),
        purchasePrice,
        status,
        description,
      },
    });

    res.status(201).json({
      status: 'success',
      data: asset,
      message: 'Asset created successfully',
    });
  } catch (error) {
    throw new AppError('Failed to create asset', 500);
  }
};

// Get all assets (with filtering)
export const getAssets = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 50, category, status, search } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {};

    if (category) where.category = category;
    if (status) where.status = status;

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { serialNumber: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          employee: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              department: true,
            },
          },
        },
      }),
      prisma.asset.count({ where }),
    ]);

    res.json({
      status: 'success',
      data: assets,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    throw new AppError('Failed to fetch assets', 500);
  }
};

// Get single asset
export const getAsset = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            department: true,
            position: true,
          },
        },
      },
    });

    if (!asset) {
      throw new AppError('Asset not found', 404);
    }

    res.json({
      status: 'success',
      data: asset,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch asset', 500);
  }
};

// Update asset
export const updateAsset = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.purchaseDate) {
      updateData.purchaseDate = new Date(updateData.purchaseDate);
    }

    const asset = await prisma.asset.update({
      where: { id },
      data: updateData,
    });

    res.json({
      status: 'success',
      data: asset,
      message: 'Asset updated successfully',
    });
  } catch (error) {
    throw new AppError('Failed to update asset', 500);
  }
};

// Delete asset
export const deleteAsset = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.asset.delete({
      where: { id },
    });

    res.json({
      status: 'success',
      message: 'Asset deleted successfully',
    });
  } catch (error) {
    throw new AppError('Failed to delete asset', 500);
  }
};

// Assign asset to employee
export const assignAsset = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { employeeId, assignedDate = new Date(), notes } = req.body;

    const asset = await prisma.asset.update({
      where: { id },
      data: {
        employeeId,
        assignedDate: new Date(assignedDate),
        status: 'ASSIGNED',
        notes,
      },
    });

    res.json({
      status: 'success',
      data: asset,
      message: 'Asset assigned successfully',
    });
  } catch (error) {
    throw new AppError('Failed to assign asset', 500);
  }
};

// Return asset from employee
export const returnAsset = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { returnDate = new Date(), condition, notes } = req.body;

    const asset = await prisma.asset.update({
      where: { id },
      data: {
        employeeId: null,
        assignedDate: null,
        returnDate: new Date(returnDate),
        status: 'AVAILABLE',
        condition,
        notes: notes || asset.notes,
      },
    });

    res.json({
      status: 'success',
      data: asset,
      message: 'Asset returned successfully',
    });
  } catch (error) {
    throw new AppError('Failed to return asset', 500);
  }
};

// Get assets assigned to an employee
export const getEmployeeAssets = async (req: AuthRequest, res: Response) => {
  try {
    const { employeeId } = req.params;

    const assets = await prisma.asset.findMany({
      where: {
        employeeId,
        status: 'ASSIGNED',
      },
      orderBy: { assignedDate: 'desc' },
    });

    res.json({
      status: 'success',
      data: assets,
    });
  } catch (error) {
    throw new AppError('Failed to fetch employee assets', 500);
  }
};
