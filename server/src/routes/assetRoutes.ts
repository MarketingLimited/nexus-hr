import { Router } from 'express';
import {
  createAsset,
  getAssets,
  getAsset,
  updateAsset,
  deleteAsset,
  assignAsset,
  returnAsset,
  getEmployeeAssets,
} from '../controllers/assetController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createAssetSchema, assignAssetSchema, returnAssetSchema } from '../validators/schemas';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Asset CRUD routes (HR and Admin only for create/update/delete)
router.post('/assets', authorize('ADMIN', 'HR'), validate(createAssetSchema), createAsset);
router.get('/assets', getAssets);
router.get('/assets/:id', getAsset);
router.put('/assets/:id', authorize('ADMIN', 'HR'), updateAsset);
router.delete('/assets/:id', authorize('ADMIN', 'HR'), deleteAsset);

// Asset assignment (HR and Admin only)
router.post('/assets/:id/assign', authorize('ADMIN', 'HR'), validate(assignAssetSchema), assignAsset);
router.post('/assets/:id/return', authorize('ADMIN', 'HR'), validate(returnAssetSchema), returnAsset);

// Get assets for specific employee
router.get('/employee/:employeeId', getEmployeeAssets);

export default router;
