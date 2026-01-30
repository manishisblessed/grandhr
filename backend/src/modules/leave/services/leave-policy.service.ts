import { PrismaClient, LeaveType } from '@prisma/client';

const prisma = new PrismaClient();

export class LeavePolicyService {
  /**
   * Create leave policy
   */
  static async createPolicy(data: {
    companyId: string;
    name: string;
    leaveType: LeaveType;
    maxDays?: number;
    accrualRate?: number;
    carryForward?: boolean;
    maxCarryForward?: number;
    requiresApproval?: boolean;
    halfDayAllowed?: boolean;
    hourlyAllowed?: boolean;
    effectiveFrom: Date;
    effectiveTo?: Date;
  }) {
    return prisma.leavePolicy.create({
      data,
    });
  }

  /**
   * Get active policies for company
   */
  static async getActivePolicies(companyId: string, date: Date = new Date()) {
    return prisma.leavePolicy.findMany({
      where: {
        companyId,
        isActive: true,
        effectiveFrom: { lte: date },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: date } },
        ],
      },
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  /**
   * Get policy by leave type
   */
  static async getPolicyByType(
    companyId: string,
    leaveType: LeaveType,
    date: Date = new Date()
  ) {
    return prisma.leavePolicy.findFirst({
      where: {
        companyId,
        leaveType,
        isActive: true,
        effectiveFrom: { lte: date },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: date } },
        ],
      },
      orderBy: { effectiveFrom: 'desc' },
    });
  }
}

