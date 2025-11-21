import { Router } from 'express';
import {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../controllers/employeeController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getEmployees);
router.get('/:id', getEmployee);
router.post('/', authorize('ADMIN', 'HR'), createEmployee);
router.put('/:id', authorize('ADMIN', 'HR'), updateEmployee);
router.delete('/:id', authorize('ADMIN'), deleteEmployee);

export default router;
