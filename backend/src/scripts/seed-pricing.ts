/**
 * Seed Pricing Data
 * GrandHR - Initial pricing plans and add-ons
 */

import { PrismaClient, PlanType, AddOnType } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPricing() {
  console.log('🌱 Seeding pricing data...');

  // Seed Plans
  const plans = [
    {
      type: PlanType.STARTER,
      name: 'Starter',
      description: 'Perfect for small businesses getting started with HR management',
      pricePerEmployee: 49,
      minEmployees: 5,
      maxEmployees: 50,
      setupFee: 2999,
      isActive: true,
      isPopular: false,
      features: [
        'Employee Management',
        'Attendance',
        'Leave Management',
        'Holiday Calendar',
        'Basic Reports',
      ],
      displayOrder: 1,
    },
    {
      type: PlanType.PROFESSIONAL,
      name: 'Professional',
      description: 'Most popular plan for growing businesses with payroll needs',
      pricePerEmployee: 99,
      minEmployees: 25,
      maxEmployees: 200,
      setupFee: 4999,
      isActive: true,
      isPopular: true,
      features: [
        'Everything in Starter',
        'Payroll',
        'Statutory Compliance (PF, ESI, PT)',
        'Payslips',
        'Role-based Access',
        'CSV / PDF Reports',
      ],
      displayOrder: 2,
    },
    {
      type: PlanType.ENTERPRISE,
      name: 'Enterprise',
      description: 'Complete solution for large organizations with advanced needs',
      pricePerEmployee: 149,
      minEmployees: 200,
      maxEmployees: null,
      setupFee: 0, // Custom pricing
      isActive: true,
      isPopular: false,
      features: [
        'Everything in Professional',
        'Recruitment & Onboarding',
        'Performance Management',
        'Expense & Reimbursement',
        'Advanced Analytics',
        'Priority Support',
      ],
      displayOrder: 3,
    },
  ];

  for (const planData of plans) {
    await prisma.plan.upsert({
      where: { type: planData.type },
      update: planData,
      create: planData,
    });
    console.log(`✅ Plan: ${planData.name}`);
  }

  // Seed Add-Ons
  const addOns = [
    {
      type: AddOnType.BIOMETRIC_INTEGRATION,
      name: 'Biometric / Device Integration',
      description: 'Integrate with biometric devices and attendance systems',
      price: 1999,
      priceType: 'MONTHLY',
      isActive: true,
      displayOrder: 1,
    },
    {
      type: AddOnType.WHATSAPP_ALERTS,
      name: 'WhatsApp Alerts',
      description: 'Send automated alerts and notifications via WhatsApp',
      price: 0.5,
      priceType: 'PER_UNIT',
      unit: 'message',
      isActive: true,
      displayOrder: 2,
    },
    {
      type: AddOnType.CUSTOM_REPORTS,
      name: 'Custom Reports',
      description: 'Get custom reports tailored to your business needs',
      price: 3000,
      priceType: 'PER_UNIT',
      unit: 'report',
      isActive: true,
      displayOrder: 3,
    },
    {
      type: AddOnType.DEDICATED_SUPPORT,
      name: 'Dedicated HR Support',
      description: 'Get dedicated support from our HR experts',
      price: 10000,
      priceType: 'MONTHLY',
      isActive: true,
      displayOrder: 4,
    },
    {
      type: AddOnType.DATA_MIGRATION,
      name: 'Data Migration',
      description: 'Professional data migration from your existing system',
      price: 5000,
      priceType: 'ONE_TIME',
      isActive: true,
      displayOrder: 5,
    },
  ];

  for (const addOnData of addOns) {
    await prisma.addOn.upsert({
      where: { type: addOnData.type },
      update: addOnData,
      create: addOnData,
    });
    console.log(`✅ Add-On: ${addOnData.name}`);
  }

  console.log('✨ Pricing data seeded successfully!');
}

seedPricing()
  .catch((error) => {
    console.error('❌ Error seeding pricing data:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

