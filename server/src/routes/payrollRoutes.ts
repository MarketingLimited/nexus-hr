import { Router } from 'express';
import {
  processPayroll,
  getPayrollRecords,
  getPayrollRecord,
  getEmployeePayrollRecords,
  updatePayrollRecord,
  sendPayslip,
  getTaxSummary,
} from '../controllers/payrollController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { processPayrollSchema } from '../validators/schemas';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Payroll processing (HR and Admin only)
router.post(
  '/process',
  authorize('ADMIN', 'HR'),
  validate(processPayrollSchema),
  processPayroll
);

// Get all payroll records (HR and Admin only)
router.get('/records', authorize('ADMIN', 'HR'), getPayrollRecords);

// Get single payroll record
router.get('/records/:id', getPayrollRecord);

// Get payroll records for specific employee
router.get('/records/employee/:employeeId', getEmployeePayrollRecords);

// Update payroll record (HR and Admin only)
router.put('/records/:id', authorize('ADMIN', 'HR'), updatePayrollRecord);

// Send payslip (HR and Admin only)
router.post('/payslips/:id/send', authorize('ADMIN', 'HR'), sendPayslip);

// Get tax summary
router.get('/tax-summary/:year', authorize('ADMIN', 'HR'), getTaxSummary);

export default router;
