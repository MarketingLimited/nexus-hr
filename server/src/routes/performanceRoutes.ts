import { Router } from 'express';
import {
  getPerformanceReviews,
  createPerformanceReview,
  getGoals,
  createGoal,
  updateGoal,
  getFeedback,
  createFeedback,
} from '../controllers/performanceController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Reviews
router.get('/reviews', getPerformanceReviews);
router.post('/reviews', createPerformanceReview);

// Goals
router.get('/goals', getGoals);
router.post('/goals', createGoal);
router.put('/goals/:id', updateGoal);

// Feedback
router.get('/feedback', getFeedback);
router.post('/feedback', createFeedback);

export default router;
