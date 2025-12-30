import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../middleware/auth.middleware';
import { z } from 'zod';
import { sendEmployeeWelcomeEmail } from '../utils/email.util';

const prisma = new PrismaClient();

const createEmployeeSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
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
  role: z.enum(['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE']).optional(),
});

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
    const { email, password, employeeId, role, ...employeeData } = data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate employee ID if not provided
    const empId = employeeId || `EMP${Date.now()}`;

    // Parse date if provided
    const dateOfBirth = employeeData.dateOfBirth
      ? new Date(employeeData.dateOfBirth)
      : undefined;

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role || 'EMPLOYEE',
        employee: {
          create: {
            employeeId: empId,
            ...employeeData,
            dateOfBirth,
          },
        },
      },
      include: { employee: true },
    });

    // Send welcome email with credentials to employee
    const employeeName = `${employeeData.firstName} ${employeeData.lastName}`;
    sendEmployeeWelcomeEmail(
      email,
      employeeName,
      password, // Send plain password (only time it's sent)
      empId
    ).catch((emailError) => {
      // Log email error but don't fail employee creation
      console.error('Failed to send welcome email:', emailError);
    });

    res.status(201).json({
      message: 'Employee created successfully. Welcome email sent with credentials.',
      employee: {
        ...user.employee,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: error.message || 'Failed to create employee' });
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
        department,
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

