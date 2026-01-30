import { PrismaClient, Company } from '@prisma/client';

const prisma = new PrismaClient();

export class CompanyService {
  /**
   * Create a new company
   */
  static async createCompany(data: {
    name: string;
    legalName?: string;
    domain?: string;
    logo?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    phone?: string;
    email?: string;
    website?: string;
    taxId?: string;
    registrationNumber?: string;
    panNumber?: string;
    gstNumber?: string;
    settings?: any;
  }): Promise<Company> {
    // Check if domain exists
    if (data.domain) {
      const existing = await prisma.company.findUnique({
        where: { domain: data.domain },
      });

      if (existing) {
        throw new Error('Company with this domain already exists');
      }
    }

    return prisma.company.create({
      data: {
        name: data.name,
        legalName: data.legalName,
        domain: data.domain,
        logo: data.logo,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
        phone: data.phone,
        email: data.email,
        website: data.website,
        taxId: data.taxId,
        registrationNumber: data.registrationNumber,
        panNumber: data.panNumber,
        gstNumber: data.gstNumber,
        settings: data.settings,
        onboardingDate: new Date(),
      },
    });
  }

  /**
   * Get company by ID
   */
  static async getCompanyById(companyId: string): Promise<Company | null> {
    return prisma.company.findUnique({
      where: { id: companyId },
      include: {
        locations: true,
        departments: true,
        designations: true,
      },
    });
  }

  /**
   * Get company by domain
   */
  static async getCompanyByDomain(domain: string): Promise<Company | null> {
    return prisma.company.findUnique({
      where: { domain },
    });
  }

  /**
   * Update company
   */
  static async updateCompany(
    companyId: string,
    data: Partial<Company>
  ): Promise<Company> {
    return prisma.company.update({
      where: { id: companyId },
      data,
    });
  }

  /**
   * Soft delete company (set isActive to false)
   */
  static async deleteCompany(companyId: string): Promise<void> {
    await prisma.company.update({
      where: { id: companyId },
      data: { isActive: false },
    });
  }

  /**
   * Get all companies (for super admin)
   */
  static async getAllCompanies(filters?: {
    isActive?: boolean;
    search?: string;
  }): Promise<Company[]> {
    const where: any = {};

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { domain: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return prisma.company.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }
}

