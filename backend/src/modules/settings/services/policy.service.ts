import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PolicyService {
  /**
   * Create policy
   */
  static async createPolicy(data: {
    companyId: string;
    name: string;
    category: string;
    policyType: string;
    effectiveFrom: Date;
    effectiveTo?: Date;
    config: any;
    description?: string;
    createdBy: string;
  }) {
    // Get latest version
    const latest = await prisma.policy.findFirst({
      where: {
        companyId: data.companyId,
        name: data.name,
      },
      orderBy: { version: 'desc' },
    });

    const version = latest ? latest.version + 1 : 1;

    return prisma.policy.create({
      data: {
        ...data,
        version,
        previousVersion: latest?.id,
      },
    });
  }

  /**
   * Get active policy
   */
  static async getActivePolicy(
    companyId: string,
    name: string,
    date: Date = new Date()
  ) {
    return prisma.policy.findFirst({
      where: {
        companyId,
        name,
        isActive: true,
        effectiveFrom: { lte: date },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: date } },
        ],
      },
      orderBy: { version: 'desc' },
    });
  }

  /**
   * Get policy by category
   */
  static async getPoliciesByCategory(
    companyId: string,
    category: string,
    date: Date = new Date()
  ) {
    return prisma.policy.findMany({
      where: {
        companyId,
        category,
        isActive: true,
        effectiveFrom: { lte: date },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: date } },
        ],
      },
      orderBy: { version: 'desc' },
    });
  }

  /**
   * Resolve policy (get effective policy for a given date)
   */
  static async resolvePolicy(
    companyId: string,
    name: string,
    date: Date = new Date()
  ) {
    const policy = await this.getActivePolicy(companyId, name, date);

    if (!policy) {
      // Try to get default/global policy
      return prisma.policy.findFirst({
        where: {
          companyId: null as any,
          name,
          isActive: true,
          effectiveFrom: { lte: date },
          OR: [
            { effectiveTo: null },
            { effectiveTo: { gte: date } },
          ],
        },
        orderBy: { version: 'desc' },
      });
    }

    return policy;
  }

  /**
   * Deactivate policy
   */
  static async deactivatePolicy(policyId: string) {
    return prisma.policy.update({
      where: { id: policyId },
      data: {
        isActive: false,
        effectiveTo: new Date(),
      },
    });
  }

  /**
   * Get policy history
   */
  static async getPolicyHistory(
    companyId: string,
    name: string
  ) {
    return prisma.policy.findMany({
      where: {
        companyId,
        name,
      },
      orderBy: { version: 'desc' },
    });
  }
}

