import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../middleware/auth.middleware';
import { z } from 'zod';
import { sendEmployeeWelcomeEmail } from '../utils/email.util';

const prisma = new PrismaClient();

const createEmployeeSchema = z.object({
  email: z.string().email(),
  // Password is optional — if omitted, the server generates a strong temp password
  // and emails it to the employee with a note to change it on first login.
  password: z.string().min(6).optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  employeeId: z.string().optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  salary: z.number().optional(),
  managerId: z.string().optional(),
  role: z.enum(['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR', 'MANAGER', 'EMPLOYEE']).optional(),
});

/** Generate a memorable but secure temp password (e.g. "Bright-Falcon-4291"). */
const generateTempPassword = (): string => {
  const adjectives = ['Bright', 'Bold', 'Calm', 'Swift', 'Quiet', 'Brave', 'Wise', 'Kind', 'Sharp', 'Sunny'];
  const animals = ['Falcon', 'Otter', 'Tiger', 'Panda', 'Eagle', 'Lynx', 'Lion', 'Wolf', 'Hawk', 'Bear'];
  const a = adjectives[Math.floor(Math.random() * adjectives.length)];
  const b = animals[Math.floor(Math.random() * animals.length)];
  const n = String(Math.floor(1000 + Math.random() * 9000));
  return `${a}-${b}-${n}`;
};

export const getAllEmployees = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '10', search, department } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      isActive: true,
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { employeeId: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (department) {
      where.department = department;
    }

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeId: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.employee.count({ where }),
    ]);

    res.json({
      employees,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch employees' });
  }
};

export const getEmployeeById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeId: true,
          },
        },
        subordinates: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeId: true,
            designation: true,
          },
        },
      },
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ employee });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch employee' });
  }
};

export const createEmployee = async (req: AuthRequest, res: Response) => {
  try {
    const data = createEmployeeSchema.parse(req.body);
    const { email, password: providedPassword, employeeId, role, ...employeeData } = data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    const tempPasswordGenerated = !providedPassword;
    const password = providedPassword || generateTempPassword();

    const hashedPassword = await bcrypt.hash(password, 10);
    const empId = employeeId || `EMP${Date.now()}`;
    const dateOfBirth = employeeData.dateOfBirth
      ? new Date(employeeData.dateOfBirth)
      : undefined;

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: (role as any) || 'EMPLOYEE',
        companyId: req.companyId || undefined,
        invitedBy: req.userId || undefined,
        invitedAt: new Date(),
        invited: true,
        employee: {
          create: {
            employeeId: empId,
            firstName: employeeData.firstName,
            lastName: employeeData.lastName,
            email,
            phone: employeeData.phone,
            address: employeeData.address,
            city: employeeData.city,
            state: employeeData.state,
            zipCode: employeeData.zipCode,
            country: employeeData.country,
            salary: employeeData.salary,
            dateOfBirth,
            companyId: req.companyId || undefined,
            managerId: employeeData.managerId || undefined,
          },
        },
      },
      include: { employee: true },
    });

    const employeeName = `${employeeData.firstName} ${employeeData.lastName}`;
    sendEmployeeWelcomeEmail(
      email,
      employeeName,
      password,
      empId
    ).catch((emailError) => {
      console.error('Failed to send welcome email:', emailError);
    });

    res.status(201).json({
      message: tempPasswordGenerated
        ? 'Employee created. A temporary password has been emailed to them.'
        : 'Employee created successfully. Welcome email sent with credentials.',
      tempPasswordGenerated,
      employee: user.employee ? {
        ...user.employee,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      } : null,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: error.message || 'Failed to create employee' });
  }
};

/**
 * POST /api/employees/:id/resend-credentials
 * Generates a fresh temporary password for the employee and emails it.
 * Useful when an employee says "I never received my email" or "I lost my password".
 */
export const resendCredentials = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!employee || !employee.user) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const newPassword = generateTempPassword();
    const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: employee.userId },
      data: { password: hashed },
    });

    sendEmployeeWelcomeEmail(
      employee.user.email,
      `${employee.firstName} ${employee.lastName}`,
      newPassword,
      employee.employeeId
    ).catch((err) => console.error('Failed to resend welcome email:', err));

    res.json({
      message: 'New credentials emailed to the employee.',
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to resend credentials' });
  }
};

export const updateEmployee = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.dateOfBirth) {
      updateData.dateOfBirth = new Date(updateData.dateOfBirth);
    }

    const employee = await prisma.employee.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    res.json({
      message: 'Employee updated successfully',
      employee,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update employee' });
  }
};

export const deleteEmployee = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Soft delete - set isActive to false
    const employee = await prisma.employee.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({
      message: 'Employee deleted successfully',
      employee,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to delete employee' });
  }
};

export const getEmployeesByDepartment = async (req: AuthRequest, res: Response) => {
  try {
    const { department } = req.params;

    const employees = await prisma.employee.findMany({
      where: {
        departmentId: department,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    res.json({ employees });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch employees' });
  }
};

