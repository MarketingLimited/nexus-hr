import { Router } from 'express';
import {
  getAttendanceRecords,
  clockIn,
  clockOut,
  getAttendanceStats,
  markAbsent,
  updateAttendance,
  getEmployeeAttendanceSummary,
  exportAttendanceReport,
} from '../controllers/attendanceController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/records', getAttendanceRecords);
router.get('/stats', getAttendanceStats);
router.get('/summary/:employeeId', getEmployeeAttendanceSummary);
router.get('/export', authorize('ADMIN', 'HR'), exportAttendanceReport);
router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);
router.post('/mark-absent', authorize('ADMIN', 'HR', 'MANAGER'), markAbsent);
router.put('/:id', authorize('ADMIN', 'HR'), updateAttendance);

export default router;
