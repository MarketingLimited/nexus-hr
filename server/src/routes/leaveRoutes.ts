import { Router } from 'express';
import {
  createLeaveRequest,
  getLeaveRequests,
  getLeaveRequest,
  updateLeaveRequest,
  deleteLeaveRequest,
  approveLeaveRequest,
  rejectLeaveRequest,
  getLeaveBalance,
  getLeaveCalendar,
  getLeavePolicies,
  createLeavePolicy,
} from '../controllers/leaveController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createLeaveRequestSchema, leaveActionSchema } from '../validators/schemas';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Leave request routes
router.post('/requests', validate(createLeaveRequestSchema), createLeaveRequest);
router.get('/requests', getLeaveRequests);
router.get('/requests/:id', getLeaveRequest);
router.put('/requests/:id', updateLeaveRequest);
router.delete('/requests/:id', deleteLeaveRequest);

// Approval routes (HR and Manager only)
router.post(
  '/requests/:id/approve',
  authorize('ADMIN', 'HR', 'MANAGER'),
  validate(leaveActionSchema),
  approveLeaveRequest
);
router.post(
  '/requests/:id/reject',
  authorize('ADMIN', 'HR', 'MANAGER'),
  validate(leaveActionSchema),
  rejectLeaveRequest
);

// Leave balance
router.get('/balance/:employeeId', getLeaveBalance);

// Leave calendar (all employees on leave)
router.get('/calendar', getLeaveCalendar);

// Leave policies
router.get('/policies', getLeavePolicies);
router.post('/policies', authorize('ADMIN', 'HR'), createLeavePolicy);

export default router;
