import { Router } from 'express';
import {
  createOnboardingChecklist,
  getOnboardingChecklist,
  updateOnboardingTask,
  getOnboardingTemplates,
  assignOnboarding,
  getOnboardingProgress,
} from '../controllers/onboardingController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createOnboardingChecklistSchema, updateOnboardingTaskSchema } from '../validators/schemas';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Onboarding checklist routes
router.post(
  '/checklists',
  authorize('ADMIN', 'HR'),
  validate(createOnboardingChecklistSchema),
  createOnboardingChecklist
);

router.get('/checklists/:employeeId', getOnboardingChecklist);

// Task updates
router.put('/tasks/:taskId', validate(updateOnboardingTaskSchema), updateOnboardingTask);

// Templates
router.get('/templates', getOnboardingTemplates);

// Assign onboarding
router.post('/assign', authorize('ADMIN', 'HR'), assignOnboarding);

// Progress tracking
router.get('/progress/:employeeId', getOnboardingProgress);

export default router;
