import express from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  inviteUser,
  changePassword,
  resetPassword,
} from '../controllers/auth.controller';
import { authenticate, authorize, requirePermission } from '../middleware/auth.middleware';
import { authLimiter } from '../../../middleware/rateLimiter.middleware';
import { Permission } from '@prisma/client';

const router = express.Router();

// Public routes
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh-token', refreshToken);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/profile', authenticate, getProfile);
router.put('/change-password', authenticate, changePassword);
router.put('/reset-password', authenticate, resetPassword);

// Admin routes
router.post(
  '/invite',
  authenticate,
  authorize('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR'),
  requirePermission(Permission.EMPLOYEE_CREATE),
  inviteUser
);

export default router;

