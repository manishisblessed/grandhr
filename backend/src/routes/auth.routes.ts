import express from 'express';
import { register, login, getProfile, updateProfile, forgotPassword, resetPassword, forgotUsername } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authLimiter, sensitiveLimiter } from '../middleware/rateLimiter.middleware';

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/forgot-password', sensitiveLimiter, forgotPassword);
router.post('/reset-password', sensitiveLimiter, resetPassword);
router.post('/forgot-username', sensitiveLimiter, forgotUsername);

export default router;
