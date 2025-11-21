import { Router } from 'express';
import {
  getAttendanceRecords,
  clockIn,
  clockOut,
  getAttendanceStats,
} from '../controllers/attendanceController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/records', getAttendanceRecords);
router.get('/stats', getAttendanceStats);
router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);

export default router;
