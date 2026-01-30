import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface PayrollComponent {
  name: string;
  amount: number;
  type: 'EARNING' | 'DEDUCTION';
}

export class PayrollService {
  /**
   * Calculate payroll for employee
   */
  static async calculatePayroll(
    employeeId: string,
    month: number,
    year: number
  ) {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        salaryStructures: {
          where: {
            isActive: true,
            effectiveFrom: { lte: new Date(year, month - 1, 1) },
            OR: [
              { effectiveTo: null },
              { effectiveTo: { gte: new Date(year, month - 1, 1) } },
            ],
          },
          orderBy: { effectiveFrom: 'desc' },
          take: 1,
        },
      },
    });

    if (!employee) {
      throw new Error('Employee not found');
    }

    const salaryStructure = employee.salaryStructures[0];
    if (!salaryStructure) {
      throw new Error('No active salary structure found');
    }

    const components = salaryStructure.components as any;
    const earnings = components.earnings || [];
    const deductions = components.deductions || [];

    // Calculate base salary
    const baseSalary = employee.salary || salaryStructure.baseSalary;

    // Calculate total earnings
    const totalEarnings = earnings.reduce(
      (sum: number, e: any) => sum + (e.amount || 0),
      baseSalary
    );

    // Get attendance days
    const attendanceSummary = await prisma.attendanceSummary.findFirst({
      where: {
        employeeId,
        month,
        year,
      },
    });

    const workingDays = attendanceSummary?.presentDays || 0;
    const totalDays = attendanceSummary?.totalDays || 0;

    // Calculate pro-rated salary if needed
    const actualEarnings =
      totalDays > 0 ? (totalEarnings * workingDays) / totalDays : totalEarnings;

    // Calculate statutory deductions (Indian compliance)
    const pf = this.calculatePF(actualEarnings);
    const esi = this.calculateESI(actualEarnings);
    const pt = this.calculatePT(actualEarnings);
    const tds = this.calculateTDS(actualEarnings);

    // Calculate other deductions
    const totalDeductions =
      deductions.reduce((sum: number, d: any) => sum + (d.amount || 0), 0) +
      pf +
      esi +
      pt +
      tds;

    // Calculate net salary
    const netSalary = actualEarnings - totalDeductions;

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

    if (existing && existing.isLocked) {
      throw new Error('Payroll is locked and cannot be modified');
    }

    // Create or update payroll
    const payroll = existing
      ? await prisma.payroll.update({
          where: { id: existing.id },
          data: {
            baseSalary: actualEarnings,
            allowances: earnings.reduce(
              (sum: number, e: any) => sum + (e.amount || 0),
              0
            ),
            deductions: totalDeductions,
            pf,
            esi,
            pt,
            tds,
            tax: tds,
            netSalary,
            attendanceDays: workingDays,
            leaveDays: attendanceSummary?.leaveDays || 0,
            lopDays: attendanceSummary?.absentDays || 0,
          },
        })
      : await prisma.payroll.create({
          data: {
            employeeId,
            month,
            year,
            baseSalary: actualEarnings,
            allowances: earnings.reduce(
              (sum: number, e: any) => sum + (e.amount || 0),
              0
            ),
            deductions: totalDeductions,
            pf,
            esi,
            pt,
            tds,
            tax: tds,
            netSalary,
            attendanceDays: workingDays,
            leaveDays: attendanceSummary?.leaveDays || 0,
            lopDays: attendanceSummary?.absentDays || 0,
            status: 'PENDING',
          },
        });

    return payroll;
  }

  /**
   * Calculate PF (Provident Fund) - 12% of basic salary
   */
  static calculatePF(grossSalary: number): number {
    const pfLimit = 15000; // PF limit in India
    const basicSalary = Math.min(grossSalary * 0.4, pfLimit); // Assuming 40% is basic
    return basicSalary * 0.12; // 12% of basic
  }

  /**
   * Calculate ESI (Employee State Insurance) - 0.75% of gross
   */
  static calculateESI(grossSalary: number): number {
    const esiLimit = 21000; // ESI limit in India
    if (grossSalary > esiLimit) {
      return 0;
    }
    return grossSalary * 0.0075; // 0.75%
  }

  /**
   * Calculate Professional Tax (varies by state)
   */
  static calculatePT(grossSalary: number): number {
    // Simplified PT calculation (varies by state)
    if (grossSalary <= 5000) return 0;
    if (grossSalary <= 10000) return 150;
    if (grossSalary <= 15000) return 175;
    return 200;
  }

  /**
   * Calculate TDS (Tax Deducted at Source)
   */
  static calculateTDS(grossSalary: number): number {
    // Simplified TDS calculation (should use actual tax slabs)
    const annualSalary = grossSalary * 12;
    let tax = 0;

    if (annualSalary <= 250000) {
      tax = 0;
    } else if (annualSalary <= 500000) {
      tax = (annualSalary - 250000) * 0.05;
    } else if (annualSalary <= 1000000) {
      tax = 12500 + (annualSalary - 500000) * 0.2;
    } else {
      tax = 112500 + (annualSalary - 1000000) * 0.3;
    }

    return tax / 12; // Monthly TDS
  }

  /**
   * Lock payroll (make it immutable)
   */
  static async lockPayroll(
    payrollId: string,
    lockedBy: string
  ) {
    return prisma.payroll.update({
      where: { id: payrollId },
      data: {
        isLocked: true,
        lockedAt: new Date(),
        lockedBy,
        status: 'PROCESSED',
      },
    });
  }

  /**
   * Process payroll for all employees
   */
  static async processPayrollForCompany(
    companyId: string,
    month: number,
    year: number
  ) {
    const employees = await prisma.employee.findMany({
      where: {
        companyId,
        isActive: true,
      },
    });

    const results = [];

    for (const employee of employees) {
      try {
        const payroll = await this.calculatePayroll(
          employee.id,
          month,
          year
        );
        results.push({ employeeId: employee.id, success: true, payroll });
      } catch (error: any) {
        results.push({
          employeeId: employee.id,
          success: false,
          error: error.message,
        });
      }
    }

    return results;
  }
}

