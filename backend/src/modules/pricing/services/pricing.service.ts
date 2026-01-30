/**
 * Pricing Service
 * GrandHR - SaaS Pricing System
 * Handles all pricing calculations and plan management
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface PricingCalculationInput {
  planId: string;
  companyId?: string;
  employeeCount: number;
  billingPeriod: 'MONTHLY' | 'YEARLY';
  addOnIds?: string[];
  addOnQuantities?: { [addOnId: string]: number };
  isFirstInvoice?: boolean;
}

export interface PricingCalculationResult {
  basePrice: number;
  addOnsTotal: number;
  setupFee: number;
  subtotal: number;
  discount: number;
  total: number;
  breakdown: {
    plan: {
      name: string;
      pricePerEmployee: number;
      employeeCount: number;
      total: number;
    };
    addOns: Array<{
      name: string;
      price: number;
      quantity?: number;
      total: number;
    }>;
    setupFee: number;
    discount: {
      amount: number;
      percentage: number;
    };
  };
}

export class PricingService {
  /**
   * Calculate total price for a subscription
   */
  static async calculatePrice(input: PricingCalculationInput): Promise<PricingCalculationResult> {
    const { planId, companyId, employeeCount, billingPeriod, addOnIds = [], addOnQuantities = {}, isFirstInvoice = false } = input;

    // Get plan
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new Error('Plan not found');
    }

    // Check for custom pricing override (Enterprise)
    let pricePerEmployee = plan.pricePerEmployee;
    let setupFee = plan.setupFee;

    if (companyId && plan.type === 'ENTERPRISE') {
      const customPricing = await prisma.customPlanPricing.findUnique({
        where: {
          planId_companyId: {
            planId,
            companyId,
          },
        },
      });

      if (customPricing && customPricing.isActive) {
        pricePerEmployee = customPricing.customPrice;
        if (customPricing.customSetupFee !== null) {
          setupFee = customPricing.customSetupFee;
        }
      }
    }

    // Validate employee count
    if (employeeCount < plan.minEmployees) {
      throw new Error(`Minimum ${plan.minEmployees} employees required for ${plan.name}`);
    }

    if (plan.maxEmployees && employeeCount > plan.maxEmployees) {
      throw new Error(`Maximum ${plan.maxEmployees} employees allowed for ${plan.name}`);
    }

    // Calculate base price
    const basePrice = employeeCount * pricePerEmployee;

    // Get add-ons
    const addOns = await prisma.addOn.findMany({
      where: {
        id: { in: addOnIds },
        isActive: true,
      },
    });

    // Calculate add-ons total
    let addOnsTotal = 0;
    const addOnsBreakdown = addOns.map((addOn) => {
      const quantity = addOnQuantities[addOn.id] || 1;
      let addOnPrice = addOn.price;

      // For usage-based add-ons, multiply by quantity
      if (addOn.priceType === 'PER_UNIT' && quantity > 1) {
        addOnPrice = addOn.price * quantity;
      }

      addOnsTotal += addOnPrice;

      return {
        name: addOn.name,
        price: addOn.price,
        quantity: addOn.priceType === 'PER_UNIT' ? quantity : undefined,
        total: addOnPrice,
      };
    });

    // Calculate subtotal
    const subtotal = basePrice + addOnsTotal + (isFirstInvoice ? setupFee : 0);

    // Apply yearly discount (10% on recurring charges only)
    let discount = 0;
    if (billingPeriod === 'YEARLY') {
      // Discount only on recurring charges (base + add-ons), not setup fee
      const recurringCharges = basePrice + addOnsTotal;
      discount = recurringCharges * 0.1; // 10% discount
    }

    // Calculate total
    const total = subtotal - discount;

    return {
      basePrice,
      addOnsTotal,
      setupFee: isFirstInvoice ? setupFee : 0,
      subtotal,
      discount,
      total,
      breakdown: {
        plan: {
          name: plan.name,
          pricePerEmployee,
          employeeCount,
          total: basePrice,
        },
        addOns: addOnsBreakdown,
        setupFee: isFirstInvoice ? setupFee : 0,
        discount: {
          amount: discount,
          percentage: billingPeriod === 'YEARLY' ? 10 : 0,
        },
      },
    };
  }

  /**
   * Get all active plans
   */
  static async getActivePlans() {
    return prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });
  }

  /**
   * Get all active add-ons
   */
  static async getActiveAddOns() {
    return prisma.addOn.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });
  }

  /**
   * Get plan by ID
   */
  static async getPlanById(planId: string) {
    return prisma.plan.findUnique({
      where: { id: planId },
    });
  }

  /**
   * Get plan by type
   */
  static async getPlanByType(type: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE') {
    return prisma.plan.findUnique({
      where: { type },
    });
  }

  /**
   * Get company subscription
   */
  static async getCompanySubscription(companyId: string) {
    return prisma.subscription.findUnique({
      where: { companyId },
      include: {
        plan: true,
        addOns: {
          include: {
            addOn: true,
          },
        },
      },
    });
  }

  /**
   * Validate plan selection based on employee count
   */
  static async validatePlanSelection(planId: string, employeeCount: number): Promise<{ valid: boolean; error?: string; warning?: string }> {
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return { valid: false, error: 'Plan not found' };
    }

    if (employeeCount < plan.minEmployees) {
      return {
        valid: false,
        error: `Minimum ${plan.minEmployees} employees required for ${plan.name}`,
      };
    }

    if (plan.maxEmployees && employeeCount > plan.maxEmployees) {
      return {
        valid: false,
        error: `Maximum ${plan.maxEmployees} employees allowed for ${plan.name}. Please contact us for Enterprise pricing.`,
      };
    }

    // Warning for Starter plan with payroll requirement
    if (plan.type === 'STARTER' && employeeCount > 50) {
      return {
        valid: true,
        warning: 'Starter plan does not include Payroll. Consider Professional plan for payroll features.',
      };
    }

    return { valid: true };
  }
}

export default PricingService;

