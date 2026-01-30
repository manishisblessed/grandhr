import express from 'express';
import { registerCompany } from '../controllers/company.controller';
import { authLimiter } from '../middleware/rateLimiter.middleware';

const router = express.Router();

router.post('/register', authLimiter, registerCompany);

export default router;

