import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ShiftService {
  /**
   * Create shift
   */
  static async createShift(data: {
    companyId: string;
    name: string;
    code?: string;
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
    breakDuration?: number; // in minutes
    gracePeriod?: number; // in minutes
    lateThreshold?: number; // in minutes
    earlyThreshold?: number; // in minutes
    workingHours: number;
    isFlexible?: boolean;
  }) {
    // Check if code exists
    if (data.code) {
      const existing = await prisma.shift.findFirst({
        where: {
          companyId: data.companyId,
          code: data.code,
        },
      });

      if (existing) {
        throw new Error('Shift with this code already exists');
      }
    }

    return prisma.shift.create({
      data: {
        companyId: data.companyId,
        name: data.name,
        code: data.code,
        startTime: data.startTime,
        endTime: data.endTime,
        breakDuration: data.breakDuration || 0,
        gracePeriod: data.gracePeriod || 15,
        lateThreshold: data.lateThreshold || 30,
        earlyThreshold: data.earlyThreshold || 30,
        workingHours: data.workingHours,
        isFlexible: data.isFlexible || false,
      },
    });
  }

  /**
   * Get shifts for company
   */
  static async getShifts(companyId: string) {
    return prisma.shift.findMany({
      where: {
        companyId,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get shift by ID
   */
  static async getShiftById(shiftId: string) {
    return prisma.shift.findUnique({
      where: { id: shiftId },
    });
  }

  /**
   * Update shift
   */
  static async updateShift(shiftId: string, data: any) {
    return prisma.shift.update({
      where: { id: shiftId },
      data,
    });
  }

  /**
   * Delete shift (soft delete)
   */
  static async deleteShift(shiftId: string) {
    return prisma.shift.update({
      where: { id: shiftId },
      data: { isActive: false },
    });
  }
}

