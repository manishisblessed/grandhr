import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class FeatureToggleService {
  /**
   * Get feature toggle
   */
  static async getToggle(
    companyId: string | null,
    key: string
  ): Promise<boolean> {
    // Try company-specific toggle first
    const companyToggle = companyId
      ? await prisma.featureToggle.findUnique({
          where: {
            companyId_key: {
              companyId: companyId as string,
              key,
            },
          },
        })
      : null;

    if (companyToggle) {
      return companyToggle.value;
    }

    // Fall back to global toggle
    const globalToggle = await prisma.featureToggle.findFirst({
      where: {
        companyId: null,
        key,
      },
    });

    return globalToggle?.value || false;
  }

  /**
   * Set feature toggle
   */
  static async setToggle(
    companyId: string | null,
    key: string,
    value: boolean,
    description?: string
  ) {
    const where = companyId
      ? { companyId_key: { companyId, key } }
      : { companyId_key: { companyId: null as any, key } };
    
    return prisma.featureToggle.upsert({
      where: where as any,
      update: {
        value,
        description,
      },
      create: {
        companyId,
        key,
        value,
        description,
      },
    });
  }

  /**
   * Get all toggles for company
   */
  static async getAllToggles(companyId: string | null) {
    return prisma.featureToggle.findMany({
      where: {
        companyId,
        isActive: true,
      },
    });
  }
}

