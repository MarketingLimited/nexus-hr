import { Router } from 'express';
import {
  getPerformanceReviews,
  createPerformanceReview,
  getPerformanceReview,
  updatePerformanceReview,
  getGoals,
  createGoal,
  getGoal,
  updateGoal,
  deleteGoal,
  getFeedback,
  createFeedback,
  updateFeedback,
  deleteFeedback,
  getEmployeePerformanceStats,
  exportPerformanceReport,
} from '../controllers/performanceController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Reviews
router.get('/reviews', getPerformanceReviews);
router.get('/reviews/:id', getPerformanceReview);
router.post('/reviews', authorize('ADMIN', 'HR', 'MANAGER'), createPerformanceReview);
router.put('/reviews/:id', authorize('ADMIN', 'HR', 'MANAGER'), updatePerformanceReview);

// Goals
router.get('/goals', getGoals);
router.get('/goals/:id', getGoal);
router.post('/goals', createGoal);
router.put('/goals/:id', updateGoal);
router.delete('/goals/:id', deleteGoal);

// Feedback
router.get('/feedback', getFeedback);
router.post('/feedback', createFeedback);
router.put('/feedback/:id', updateFeedback);
router.delete('/feedback/:id', deleteFeedback);

// Statistics and Reports
router.get('/stats/:employeeId', getEmployeePerformanceStats);
router.get('/export', authorize('ADMIN', 'HR'), exportPerformanceReport);

export default router;
