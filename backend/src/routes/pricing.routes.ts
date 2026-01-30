/**
 * Pricing Routes
 * GrandHR - SaaS Pricing System
 */

import express from 'express';
import {
  calculatePrice,
  getPlans,
  getAddOns,
  getPlanById,
  validatePlan,
  getSubscription,
} from '../controllers/pricing.controller';

const router = express.Router();

// Public routes
router.get('/plans', getPlans);
router.get('/plans/:id', getPlanById);
router.get('/add-ons', getAddOns);
router.post('/calculate', calculatePrice);
router.post('/validate', validatePlan);

// Protected routes (require authentication)
router.get('/subscription/:companyId', getSubscription);

export default router;

