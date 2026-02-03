import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '../utils/jwt.util';
import { z } from 'zod';

const prisma = new PrismaClient();

const companyRegisterSchema = z.object({
  company: z.object({
    name: z.string().min(1, 'Company name is required'),
    legalName: z.string().optional(),
    domain: z.string().optional(),
    email: z.string().email('Invalid company email address'),
    phone: z.string().optional(),
    website: z.string().optional().refine(
      (val) => !val || val === '' || /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(val),
      { message: 'Invalid website URL' }
    ),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
    taxId: z.string().optional(),
    registrationNumber: z.string().optional(),
    panNumber: z.string().optional(),
    gstNumber: z.string().optional(),
  }),
  admin: z.object({
    email: z.string().email('Invalid admin email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    role: z.enum(['COMPANY_ADMIN', 'HR', 'MANAGER', 'EMPLOYEE']).optional(),
  }),
});

/**
 * Register a new company with admin user
 */
export const registerCompany = async (req: Request, res: Response) => {
  try {
    const data = companyRegisterSchema.parse(req.body);
    const { company: companyData, admin: adminData } = data;

    // Check if company email already exists
    const existingCompany = await prisma.company.findFirst({
      where: {
        OR: [
          { email: companyData.email },
          ...(companyData.domain ? [{ domain: companyData.domain }] : []),
        ],
      },
    });

    if (existingCompany) {
      return res.status(400).json({
        message: 'Company with this email or domain already exists',
      });
    }

    // Check if admin user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminData.email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email already exists',
      });
    }

    // Create company and admin user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Check if domain exists (within transaction)
      if (companyData.domain) {
        const existingDomain = await tx.company.findUnique({
          where: { domain: companyData.domain },
        });
        if (existingDomain) {
          throw new Error('Company with this domain already exists');
        }
      }

      // Create company within transaction
      const company = await tx.company.create({
        data: {
          name: companyData.name,
          legalName: companyData.legalName,
          domain: companyData.domain,
          email: companyData.email,
          phone: companyData.phone,
          website: companyData.website || undefined,
          address: companyData.address,
          city: companyData.city,
          state: companyData.state,
          zipCode: companyData.zipCode,
          country: companyData.country,
          taxId: companyData.taxId,
          registrationNumber: companyData.registrationNumber,
          panNumber: companyData.panNumber,
          gstNumber: companyData.gstNumber,
          onboardingDate: new Date(),
        },
      });

      // Hash admin password
      const hashedPassword = await bcrypt.hash(adminData.password, 10);

      // Generate employee ID for admin
      const empId = `ADM${Date.now()}`;

      // Create admin user
      const user = await tx.user.create({
        data: {
          email: adminData.email,
          password: hashedPassword,
          role: adminData.role || 'COMPANY_ADMIN',
          companyId: company.id,
          employee: {
            create: {
              employeeId: empId,
              firstName: adminData.firstName,
              lastName: adminData.lastName,
              companyId: company.id,
            },
          },
        },
        include: {
          employee: true,
        },
      });

      return { company, user };
    });

    // Generate token for the admin user
    const token = generateToken(result.user.id, result.user.role);

    res.status(201).json({
      message: 'Company registered successfully',
      company: {
        id: result.company.id,
        name: result.company.name,
        email: result.company.email,
        domain: result.company.domain,
      },
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        companyId: result.user.companyId,
        employee: result.user.employee,
      },
      token,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors,
      });
    }
    console.error('Company registration error:', error);
    res.status(500).json({
      message: error.message || 'Company registration failed',
    });
  }
};

