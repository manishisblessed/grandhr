import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class DesignationService {
  /**
   * Create designation
   */
  static async createDesignation(data: {
    companyId: string;
    name: string;
    code?: string;
    level?: number;
    description?: string;
  }) {
    // Check if code exists
    if (data.code) {
      const existing = await prisma.designation.findFirst({
        where: {
          companyId: data.companyId,
          code: data.code,
        },
      });

      if (existing) {
        throw new Error('Designation with this code already exists');
      }
    }

    return prisma.designation.create({
      data,
    });
  }

  /**
   * Get designations for company
   */
  static async getDesignations(companyId: string) {
    return prisma.designation.findMany({
      where: {
        companyId,
        isActive: true,
      },
      orderBy: [{ level: 'asc' }, { name: 'asc' }],
    });
  }

  /**
   * Get designation by ID
   */
  static async getDesignationById(designationId: string) {
    return prisma.designation.findUnique({
      where: { id: designationId },
      include: {
        employees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeId: true,
          },
        },
      },
    });
  }

  /**
   * Update designation
   */
  static async updateDesignation(designationId: string, data: any) {
    return prisma.designation.update({
      where: { id: designationId },
      data,
    });
  }

  /**
   * Delete designation (soft delete)
   */
  static async deleteDesignation(designationId: string) {
    return prisma.designation.update({
      where: { id: designationId },
      data: { isActive: false },
    });
  }
}

