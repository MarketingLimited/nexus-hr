import { Router } from 'express';
import {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  bulkImportEmployees,
  exportEmployees,
  advancedSearch,
} from '../controllers/employeeController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getEmployees);
router.get('/search/advanced', advancedSearch);
router.get('/export', authorize('ADMIN', 'HR'), exportEmployees);
router.get('/:id', getEmployee);
router.post('/', authorize('ADMIN', 'HR'), createEmployee);
router.post('/bulk-import', authorize('ADMIN', 'HR'), bulkImportEmployees);
router.put('/:id', authorize('ADMIN', 'HR'), updateEmployee);
router.delete('/:id', authorize('ADMIN'), deleteEmployee);

export default router;
