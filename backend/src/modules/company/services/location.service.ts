import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class LocationService {
  /**
   * Create location
   */
  static async createLocation(data: {
    companyId: string;
    name: string;
    code?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    phone?: string;
    email?: string;
    isHeadOffice?: boolean;
  }) {
    // Check if code exists
    if (data.code) {
      const existing = await prisma.location.findFirst({
        where: {
          companyId: data.companyId,
          code: data.code,
        },
      });

      if (existing) {
        throw new Error('Location with this code already exists');
      }
    }

    return prisma.location.create({
      data,
    });
  }

  /**
   * Get locations for company
   */
  static async getLocations(companyId: string) {
    return prisma.location.findMany({
      where: {
        companyId,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get location by ID
   */
  static async getLocationById(locationId: string) {
    return prisma.location.findUnique({
      where: { id: locationId },
    });
  }

  /**
   * Update location
   */
  static async updateLocation(
    locationId: string,
    data: any
  ) {
    return prisma.location.update({
      where: { id: locationId },
      data,
    });
  }

  /**
   * Delete location (soft delete)
   */
  static async deleteLocation(locationId: string) {
    return prisma.location.update({
      where: { id: locationId },
      data: { isActive: false },
    });
  }
}

