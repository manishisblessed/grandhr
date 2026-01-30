import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AutomationConfig {
  type: string;
  schedule: string;
  config: any;
  companyId?: string;
}

/**
 * Automation Service - Handles all automated HR tasks (Autobots)
 */
export class AutomationService {
  
  /**
   * Auto-process payroll for all active employees
   */
  static async autoProcessPayroll(companyId?: string, month?: number, year?: number) {
    const currentDate = new Date();
    const payrollMonth = month || currentDate.getMonth() + 1;
    const payrollYear = year || currentDate.getFullYear();

    try {
      // Get all active employees
      const employees = await prisma.employee.findMany({
        where: {
          isActive: true,
          ...(companyId && { companyId }),
        },
        include: {
          user: true,
        },
      });

      const results = {
        processed: 0,
        skipped: 0,
        errors: [] as string[],
      };

      for (const employee of employees) {
        try {
          // Check if payroll already exists
          const existing = await prisma.payroll.findUnique({
            where: {
              employeeId_month_year: {
                employeeId: employee.id,
                month: payrollMonth,
                year: payrollYear,
              },
            },
          });

          if (existing) {
            results.skipped++;
            continue;
          }

          // Calculate attendance days
          const attendanceDays = await this.calculateAttendanceDays(
            employee.id,
            payrollMonth,
            payrollYear
          );

          // Calculate leave days
          const leaveDays = await this.calculateLeaveDays(
            employee.id,
            payrollMonth,
            payrollYear
          );

          // Get base salary
          const baseSalary = employee.salary || 0;
          const workingDays = this.getWorkingDays(payrollMonth, payrollYear);
          const presentDays = attendanceDays.present + (leaveDays.approved / 2); // Half days
          
          // Calculate salary based on attendance
          const dailySalary = baseSalary / workingDays;
          const earnedSalary = dailySalary * presentDays;

          // Get company payroll config
          const payrollConfig = await this.getPayrollConfig(companyId);

          // Calculate allowances
          const allowances = this.calculateAllowances(baseSalary, payrollConfig);

          // Calculate deductions
          const deductions = this.calculateDeductions(
            baseSalary,
            attendanceDays.absent,
            leaveDays.lop,
            payrollConfig
          );

          // Calculate tax
          const tax = this.calculateTax(earnedSalary + allowances, payrollConfig);

          // Calculate net salary
          const netSalary = earnedSalary + allowances - deductions - tax;

          // Create payroll record
          await prisma.payroll.create({
            data: {
              employeeId: employee.id,
              month: payrollMonth,
              year: payrollYear,
              baseSalary: earnedSalary,
              allowances,
              deductions,
              tax,
              netSalary,
              status: 'PENDING',
            },
          });

          // Generate salary slip automatically
          await this.generateSalarySlip(employee.id, payrollMonth, payrollYear);

          // Send notification
          await this.sendNotification(employee.userId, {
            title: 'Payroll Processed',
            message: `Your payroll for ${this.getMonthName(payrollMonth)} ${payrollYear} has been processed.`,
            type: 'SUCCESS',
            link: `/hr/payroll`,
          });

          results.processed++;
        } catch (error: any) {
          results.errors.push(`Employee ${employee.employeeId}: ${error.message}`);
        }
      }

      return results;
    } catch (error: any) {
      throw new Error(`Auto-payroll processing failed: ${error.message}`);
    }
  }

  /**
   * Auto-mark attendance for employees
   */
  static async autoMarkAttendance(companyId?: string, date?: Date) {
    const attendanceDate = date || new Date();
    attendanceDate.setHours(0, 0, 0, 0);

    try {
      const employees = await prisma.employee.findMany({
        where: {
          isActive: true,
          ...(companyId && { companyId }),
        },
      });

      const results = {
        marked: 0,
        skipped: 0,
        errors: [] as string[],
      };

      for (const employee of employees) {
        try {
          // Check if attendance already exists
          const existing = await prisma.attendance.findUnique({
            where: {
              employeeId_date: {
                employeeId: employee.id,
                date: attendanceDate,
              },
            },
          });

          if (existing) {
            results.skipped++;
            continue;
          }

          // Check if it's a holiday or weekend
          const isHoliday = await this.isHoliday(attendanceDate, companyId);
          const isWeekend = attendanceDate.getDay() === 0 || attendanceDate.getDay() === 6;

          let status = 'PRESENT';
          if (isHoliday) status = 'HOLIDAY';
          else if (isWeekend) status = 'WEEKEND';

          // Create attendance record
          await prisma.attendance.create({
            data: {
              employeeId: employee.id,
              date: attendanceDate,
              status: status as any,
            },
          });

          results.marked++;
        } catch (error: any) {
          results.errors.push(`Employee ${employee.employeeId}: ${error.message}`);
        }
      }

      return results;
    } catch (error: any) {
      throw new Error(`Auto-attendance marking failed: ${error.message}`);
    }
  }

  /**
   * Auto-update leave balances
   */
  static async autoUpdateLeaveBalances(companyId?: string) {
    try {
      const employees = await prisma.employee.findMany({
        where: {
          isActive: true,
          ...(companyId && { companyId }),
        },
        include: {
          leaves: {
            where: {
              status: 'APPROVED',
              startDate: {
                lte: new Date(),
              },
            },
          },
        },
      });

      const results = {
        updated: 0,
        errors: [] as string[],
      };

      for (const employee of employees) {
        try {
          // Get leave config
          const leaveConfig = await this.getLeaveConfig(companyId);

          // Calculate leave balances
          const balances = this.calculateLeaveBalances(employee.leaves, leaveConfig);

          // Update employee custom fields with leave balances
          const customFields = (employee.customFields as any) || {};
          customFields.leaveBalances = balances;

          await prisma.employee.update({
            where: { id: employee.id },
            data: { customFields },
          });

          results.updated++;
        } catch (error: any) {
          results.errors.push(`Employee ${employee.employeeId}: ${error.message}`);
        }
      }

      return results;
    } catch (error: any) {
      throw new Error(`Auto leave balance update failed: ${error.message}`);
    }
  }

  /**
   * Send automated reminders
   */
  static async sendReminders(companyId?: string) {
    try {
      // Pending leave requests reminder
      await this.remindPendingLeaves(companyId);

      // Missing attendance reminder
      await this.remindMissingAttendance(companyId);

      // Upcoming payroll reminder
      await this.remindUpcomingPayroll(companyId);

      return { success: true };
    } catch (error: any) {
      throw new Error(`Reminder sending failed: ${error.message}`);
    }
  }

  // Helper methods
  private static async calculateAttendanceDays(employeeId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendances = await prisma.attendance.findMany({
      where: {
        employeeId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    return {
      present: attendances.filter(a => a.status === 'PRESENT').length,
      absent: attendances.filter(a => a.status === 'ABSENT').length,
      halfDay: attendances.filter(a => a.status === 'HALF_DAY').length,
      holiday: attendances.filter(a => a.status === 'HOLIDAY').length,
    };
  }

  private static async calculateLeaveDays(employeeId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const leaves = await prisma.leave.findMany({
      where: {
        employeeId,
        status: 'APPROVED',
        OR: [
          {
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          },
        ],
      },
    });

    let totalDays = 0;
    let lopDays = 0;

    for (const leave of leaves) {
      const leaveStart = new Date(Math.max(leave.startDate.getTime(), startDate.getTime()));
      const leaveEnd = new Date(Math.min(leave.endDate.getTime(), endDate.getTime()));
      const days = Math.ceil((leaveEnd.getTime() - leaveStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      if (leave.type === 'LOP') {
        lopDays += days;
      } else {
        totalDays += days;
      }
    }

    return {
      approved: totalDays,
      lop: lopDays,
    };
  }

  private static getWorkingDays(month: number, year: number): number {
    const daysInMonth = new Date(year, month, 0).getDate();
    let workingDays = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
    }

    return workingDays;
  }

  private static async getPayrollConfig(companyId?: string): Promise<any> {
    if (companyId) {
      const config = await prisma.configuration.findUnique({
        where: {
          companyId_key: {
            companyId,
            key: 'PAYROLL_CONFIG',
          },
        },
      });
      if (config) return config.value;
    }

    // Default config
    return {
      allowances: {
        hra: 0.4, // 40% of base
        transport: 0.1,
        medical: 0.05,
      },
      deductions: {
        pf: 0.12, // 12% of base
        esi: 0.0175, // 1.75% of base
        professionalTax: 200,
      },
      taxSlabs: [
        { min: 0, max: 250000, rate: 0 },
        { min: 250000, max: 500000, rate: 0.05 },
        { min: 500000, max: 1000000, rate: 0.20 },
        { min: 1000000, max: Infinity, rate: 0.30 },
      ],
    };
  }

  private static calculateAllowances(baseSalary: number, config: any): number {
    const hra = baseSalary * (config.allowances?.hra || 0);
    const transport = baseSalary * (config.allowances?.transport || 0);
    const medical = baseSalary * (config.allowances?.medical || 0);
    return hra + transport + medical;
  }

  private static calculateDeductions(
    baseSalary: number,
    absentDays: number,
    lopDays: number,
    config: any
  ): number {
    const pf = baseSalary * (config.deductions?.pf || 0);
    const esi = baseSalary * (config.deductions?.esi || 0);
    const professionalTax = config.deductions?.professionalTax || 0;
    const dailySalary = baseSalary / 30;
    const lopDeduction = dailySalary * (absentDays + lopDays);

    return pf + esi + professionalTax + lopDeduction;
  }

  private static calculateTax(taxableIncome: number, config: any): number {
    const slabs = config.taxSlabs || [];
    let tax = 0;
    let remaining = taxableIncome;

    for (const slab of slabs) {
      if (remaining <= 0) break;
      const slabAmount = Math.min(remaining, slab.max - slab.min);
      tax += slabAmount * slab.rate;
      remaining -= slabAmount;
    }

    return tax;
  }

  private static async generateSalarySlip(employeeId: string, month: number, year: number) {
    // This would integrate with the salary slip generation service
    // For now, just log it
    console.log(`Generating salary slip for employee ${employeeId}, ${month}/${year}`);
  }

  private static async sendNotification(userId: string, notification: any) {
    await prisma.notification.create({
      data: {
        userId,
        ...notification,
      },
    });
  }

  private static getMonthName(month: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  }

  private static async isHoliday(date: Date, companyId?: string): Promise<boolean> {
    // Check company-specific holidays from configuration
    if (companyId) {
      const holidayConfig = await prisma.configuration.findUnique({
        where: {
          companyId_key: {
            companyId,
            key: 'HOLIDAYS',
          },
        },
      });

      if (holidayConfig) {
        const holidays = holidayConfig.value as any[];
        const dateStr = date.toISOString().split('T')[0];
        return holidays.some(h => h.date === dateStr);
      }
    }

    return false;
  }

  private static async getLeaveConfig(companyId?: string): Promise<any> {
    if (companyId) {
      const config = await prisma.configuration.findUnique({
        where: {
          companyId_key: {
            companyId,
            key: 'LEAVE_CONFIG',
          },
        },
      });
      if (config) return config.value;
    }

    return {
      sickLeave: 12,
      casualLeave: 12,
      earnedLeave: 15,
      maternityLeave: 26,
      paternityLeave: 7,
    };
  }

  private static calculateLeaveBalances(leaves: any[], config: any): any {
    const balances: any = {
      sickLeave: config.sickLeave || 12,
      casualLeave: config.casualLeave || 12,
      earnedLeave: config.earnedLeave || 15,
      maternityLeave: config.maternityLeave || 26,
      paternityLeave: config.paternityLeave || 7,
    };

    for (const leave of leaves) {
      if (balances[leave.type.toLowerCase()] !== undefined) {
        balances[leave.type.toLowerCase()] -= leave.days;
      }
    }

    return balances;
  }

  private static async remindPendingLeaves(companyId?: string) {
    const pendingLeaves = await prisma.leave.findMany({
      where: {
        status: 'PENDING',
        ...(companyId && {
          employee: { companyId },
        }),
      },
      include: {
        employee: {
          include: {
            user: true,
            manager: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    for (const leave of pendingLeaves) {
      if (leave.employee.manager) {
        await this.sendNotification(leave.employee.manager.userId, {
          title: 'Pending Leave Request',
          message: `${leave.employee.firstName} ${leave.employee.lastName} has a pending leave request.`,
          type: 'WARNING',
          link: `/hr/leaves`,
        });
      }
    }
  }

  private static async remindMissingAttendance(companyId?: string) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const employees = await prisma.employee.findMany({
      where: {
        isActive: true,
        ...(companyId && { companyId }),
      },
      include: {
        user: true,
        attendances: {
          where: {
            date: yesterday,
          },
        },
      },
    });

    for (const employee of employees) {
      if (employee.attendances.length === 0) {
        await this.sendNotification(employee.userId, {
          title: 'Missing Attendance',
          message: 'Please mark your attendance for yesterday.',
          type: 'WARNING',
          link: `/hr/attendance`,
        });
      }
    }
  }

  private static async remindUpcomingPayroll(companyId?: string) {
    const currentDate = new Date();
    const payrollDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 25); // 25th of month

    if (currentDate.getDate() === payrollDate.getDate() - 1) {
      const hrUsers = await prisma.user.findMany({
        where: {
          role: { in: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR'] },
          ...(companyId && { companyId }),
        },
      });

      for (const user of hrUsers) {
        await this.sendNotification(user.id, {
          title: 'Payroll Processing Reminder',
          message: 'Payroll processing is due tomorrow. Please review and process.',
          type: 'INFO',
          link: `/hr/payroll`,
        });
      }
    }
  }
}

