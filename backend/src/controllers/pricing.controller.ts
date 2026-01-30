/**
 * Pricing Controller
 * GrandHR - SaaS Pricing System API
 */

import { Request, Response } from 'express';
import { PricingService } from '../modules/pricing/services/pricing.service';
import { z } from 'zod';

// Validation schemas
const calculatePriceSchema = z.object({
  planId: z.string(),
  companyId: z.string().optional(),
  employeeCount: z.number().int().min(1),
  billingPeriod: z.enum(['MONTHLY', 'YEARLY']),
  addOnIds: z.array(z.string()).optional(),
  addOnQuantities: z.record(z.string(), z.number()).optional(),
  isFirstInvoice: z.boolean().optional(),
});

const validatePlanSchema = z.object({
  planId: z.string(),
  employeeCount: z.number().int().min(1),
});

/**
 * Calculate pricing
 * POST /api/pricing/calculate
 */
export const calculatePrice = async (req: Request, res: Response) => {
  try {
    const data = calculatePriceSchema.parse(req.body);
    const result = await PricingService.calculatePrice(data);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to calculate price',
    });
  }
};

/**
 * Get all active plans
 * GET /api/pricing/plans
 */
export const getPlans = async (req: Request, res: Response) => {
  try {
    const plans = await PricingService.getActivePlans();
    res.json({
      success: true,
      data: plans,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch plans',
    });
  }
};

/**
 * Get all active add-ons
 * GET /api/pricing/add-ons
 */
export const getAddOns = async (req: Request, res: Response) => {
  try {
    const addOns = await PricingService.getActiveAddOns();
    res.json({
      success: true,
      data: addOns,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch add-ons',
    });
  }
};

/**
 * Get plan by ID
 * GET /api/pricing/plans/:id
 */
export const getPlanById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const plan = await PricingService.getPlanById(id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found',
      });
    }

    res.json({
      success: true,
      data: plan,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch plan',
    });
  }
};

/**
 * Validate plan selection
 * POST /api/pricing/validate
 */
export const validatePlan = async (req: Request, res: Response) => {
  try {
    const data = validatePlanSchema.parse(req.body);
    const result = await PricingService.validatePlanSelection(data.planId, data.employeeCount);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to validate plan',
    });
  }
};

/**
 * Get company subscription
 * GET /api/pricing/subscription/:companyId
 */
export const getSubscription = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const subscription = await PricingService.getCompanySubscription(companyId);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found',
      });
    }

    res.json({
      success: true,
      data: subscription,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch subscription',
    });
  }
};

