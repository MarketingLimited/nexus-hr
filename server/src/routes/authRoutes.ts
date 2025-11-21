import { Router } from 'express';
import {
  register,
  login,
  getProfile,
  logout,
  refreshToken,
  requestPasswordReset,
  resetPassword,
  changePassword,
  verifyEmail,
  requestEmailVerification,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/password-reset/request', requestPasswordReset);
router.post('/password-reset', resetPassword);
router.post('/email/verify', verifyEmail);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.post('/logout', authenticate, logout);
router.post('/refresh', authenticate, refreshToken);
router.post('/password/change', authenticate, changePassword);
router.post('/email/verification/request', authenticate, requestEmailVerification);

export default router;
