import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { z } from 'zod';
import { sendRenderedEmail } from '../utils/email.util';
import { renderPayslipReadyEmail } from '../utils/email-templates';
import { createNotificationHelper } from './notification.controller';

const prisma = new PrismaClient();

const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const monthLabel = (month: number, year: number) =>
  `${MONTH_LABELS[Math.max(0, Math.min(11, month - 1))]} ${year}`;

/**
 * Notify the employee that their payslip is ready: in-app notification +
 * branded email. Best-effort, never throws.
 */
const notifyPayslipReady = async (payrollId: string) => {
  try {
    const payroll = await prisma.payroll.findUnique({
      where: { id: payrollId },
      include: {
        employee: {
          include: {
            user: { select: { id: true, email: true } },
          },
        },
      },
    });
    if (!payroll || !payroll.employee.user) return;

    const employeeName = `${payroll.employee.firstName} ${payroll.employee.lastName}`.trim();
    const label = monthLabel(payroll.month, payroll.year);

    await createNotificationHelper(
      payroll.employee.user.id,
      `Payslip ready · ${label}`,
      `Your payslip for ${label} is now available. Net pay: ₹${Math.round(payroll.netSalary).toLocaleString('en-IN')}.`,
      'SUCCESS',
      '/employee/salary',
    );

    const rendered = renderPayslipReadyEmail({
      employeeName,
      monthLabel: label,
      baseSalary: payroll.baseSalary,
      allowances: payroll.allowances,
      deductions: payroll.deductions,
      tax: payroll.tax,
      netSalary: payroll.netSalary,
    });

    sendRenderedEmail(payroll.employee.user.email, rendered).catch((err) =>
      console.error('Failed to send payslip-ready email:', err),
    );
  } catch (error: any) {
    console.error('notifyPayslipReady failed:', error?.message || error);
  }
};

const createPayrollSchema = z.object({
  employeeId: z.string(),
  month: z.number().min(1).max(12),
  year: z.number(),
  baseSalary: z.number(),
  allowances: z.number().optional(),
  deductions: z.number().optional(),
  tax: z.number().optional(),
  notes: z.string().optional(),
});

export const createPayroll = async (req: AuthRequest, res: Response) => {
  try {
    const data = createPayrollSchema.parse(req.body);
    const { employeeId, month, year, baseSalary, allowances = 0, deductions = 0, tax = 0 } = data;

    // Check if payroll already exists
    const existing = await prisma.payroll.findUnique({
      where: {
        employeeId_month_year: {
          employeeId,
          month,
          year,
        },
      },
    });

    if (existing) {
      return res.status(400).json({ message: 'Payroll already exists for this month' });
    }

    const netSalary = baseSalary + allowances - deductions - tax;

    const payroll = await prisma.payroll.create({
      data: {
        employeeId,
        month,
        year,
        baseSalary,
        allowances,
        deductions,
        tax,
        netSalary,
        notes: data.notes,
      },
      include: {
        employee: {
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

    res.status(201).json({
      message: 'Payroll created successfully',
      payroll,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: error.message || 'Failed to create payroll' });
  }
};

export const generatePayroll = async (req: AuthRequest, res: Response) => {
  try {
    const { month, year } = req.body;

    if (!month || !year) {
      return res.status(400).json({ message: 'Month and year are required' });
    }

    // Get all active employees
    const employees = await prisma.employee.findMany({
      where: { isActive: true },
    });

    const payrolls = [];

    for (const employee of employees) {
      // Check if payroll already exists
      const existing = await prisma.payroll.findUnique({
        where: {
          employeeId_month_year: {
            employeeId: employee.id,
            month,
            year,
          },
        },
      });

      if (existing) {
        continue;
      }

      const baseSalary = employee.salary || 0;
      const allowances = 0; // Can be calculated based on employee data
      const deductions = 0; // Can be calculated based on attendance, leaves, etc.
      const tax = baseSalary * 0.1; // Simple 10% tax calculation
      const netSalary = baseSalary + allowances - deductions - tax;

      const payroll = await prisma.payroll.create({
        data: {
          employeeId: employee.id,
          month,
          year,
          baseSalary,
          allowances,
          deductions,
          tax,
          netSalary,
        },
      });

      payrolls.push(payroll);
    }

    res.json({
      message: `Generated ${payrolls.length} payroll records`,
      payrolls,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to generate payroll' });
  }
};

export const getPayrolls = async (req: AuthRequest, res: Response) => {
  try {
    const { month, year, employeeId, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (month) where.month = parseInt(month as string);
    if (year) where.year = parseInt(year as string);
    if (employeeId) where.employeeId = employeeId;

    const [payrolls, total] = await Promise.all([
      prisma.payroll.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeId: true,
              designation: true,
            },
          },
        },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      }),
      prisma.payroll.count({ where }),
    ]);

    res.json({
      payrolls,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch payrolls' });
  }
};

export const getMyPayrolls = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { page = '1', limit = '12' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { employee: true },
    });

    if (!user || !user.employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const [payrolls, total] = await Promise.all([
      prisma.payroll.findMany({
        where: { employeeId: user.employee.id },
        skip,
        take: limitNum,
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      }),
      prisma.payroll.count({ where: { employeeId: user.employee.id } }),
    ]);

    res.json({
      payrolls,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch payrolls' });
  }
};

export const getPayrollById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;
    const userRole = req.userRole!;

    const payroll = await prisma.payroll.findUnique({
      where: { id },
      include: {
        employee: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!payroll) {
      return res.status(404).json({ message: 'Payroll not found' });
    }

    // Check if user has access (own payroll or any HR-level role)
    const HR_ROLES = ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR', 'MANAGER'];
    if (!HR_ROLES.includes(userRole) && payroll.employee.userId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ payroll });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch payroll' });
  }
};

export const updatePayroll = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const previous = await prisma.payroll.findUnique({ where: { id } });
    if (!previous) {
      return res.status(404).json({ message: 'Payroll not found' });
    }

    // Recalculate net salary if financial fields are updated
    if (
      updateData.baseSalary !== undefined ||
      updateData.allowances !== undefined ||
      updateData.deductions !== undefined ||
      updateData.tax !== undefined
    ) {
      const baseSalary = updateData.baseSalary ?? previous.baseSalary;
      const allowances = updateData.allowances ?? previous.allowances;
      const deductions = updateData.deductions ?? previous.deductions;
      const tax = updateData.tax ?? previous.tax;
      updateData.netSalary = baseSalary + allowances - deductions - tax;
    }

    const payroll = await prisma.payroll.update({
      where: { id },
      data: updateData,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeId: true,
          },
        },
      },
    });

    // When a payslip is finalised (PAID), send the employee a notification + email.
    const becamePaid = previous.status !== 'PAID' && payroll.status === 'PAID';
    if (becamePaid) {
      void notifyPayslipReady(payroll.id);
    }

    res.json({
      message: becamePaid
        ? 'Payroll marked as paid — the employee has been notified.'
        : 'Payroll updated successfully',
      payroll,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update payroll' });
  }
};

