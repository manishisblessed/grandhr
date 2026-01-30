import { PrismaClient, LeaveType } from '@prisma/client';
import { LeavePolicyService } from './leave-policy.service';

const prisma = new PrismaClient();

export class LeaveBalanceService {
  /**
   * Calculate and update leave balance
   */
  static async calculateBalance(
    employeeId: string,
    leaveType: LeaveType,
    year: number
  ) {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee || !employee.companyId) {
      throw new Error('Employee not found or company not assigned');
    }

    // Get active policy
    const policy = await LeavePolicyService.getPolicyByType(
      employee.companyId,
      leaveType
    );

    if (!policy) {
      throw new Error(`No active policy found for ${leaveType}`);
    }

    // Get existing balance
    let balance = await prisma.leaveBalance.findFirst({
      where: {
        employeeId,
        leaveType,
        year,
      },
    });

    // Calculate accrual
    const currentDate = new Date();
    const startOfYear = new Date(year, 0, 1);
    const monthsElapsed = Math.max(
      0,
      (currentDate.getMonth() - startOfYear.getMonth()) +
        (currentDate.getFullYear() - year) * 12
    );

    const accrued = policy.accrualRate
      ? monthsElapsed * policy.accrualRate
      : 0;

    // Get used leaves
    const leaves = await prisma.leave.findMany({
      where: {
        employeeId,
        type: leaveType,
        startDate: {
          gte: startOfYear,
          lt: new Date(year + 1, 0, 1),
        },
        status: 'APPROVED',
      },
    });

    const used = leaves.reduce((sum, leave) => sum + leave.days, 0);

    // Calculate carry forward
    let carryForward = 0;
    if (policy.carryForward && balance) {
      const previousYearBalance = balance.balance;
      carryForward = policy.maxCarryForward
        ? Math.min(previousYearBalance, policy.maxCarryForward)
        : previousYearBalance;
    }

    // Calculate current balance
    const currentBalance = accrued + carryForward - used;

    // Update or create balance
    if (balance) {
      balance = await prisma.leaveBalance.update({
        where: { id: balance.id },
        data: {
          accrued,
          used,
          balance: currentBalance,
          carryForward,
        },
      });
    } else {
      balance = await prisma.leaveBalance.create({
        data: {
          employeeId,
          leaveType,
          accrued,
          used,
          balance: currentBalance,
          carryForward,
          year,
        },
      });
    }

    return balance;
  }

  /**
   * Get leave balance
   */
  static async getBalance(
    employeeId: string,
    leaveType: LeaveType,
    year: number
  ) {
    let balance = await prisma.leaveBalance.findFirst({
      where: {
        employeeId,
        leaveType,
        year,
      },
    });

    // If balance doesn't exist, calculate it
    if (!balance) {
      balance = await this.calculateBalance(employeeId, leaveType, year);
    }

    return balance;
  }

  /**
   * Get all balances for employee
   */
  static async getAllBalances(employeeId: string, year: number) {
    const balances = await prisma.leaveBalance.findMany({
      where: {
        employeeId,
        year,
      },
    });

    // Get all leave types and ensure balance exists for each
    const leaveTypes = Object.values(LeaveType);
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee || !employee.companyId) {
      return balances;
    }

    for (const leaveType of leaveTypes) {
      const exists = balances.find((b) => b.leaveType === leaveType);
      if (!exists) {
        try {
          const newBalance = await this.calculateBalance(
            employeeId,
            leaveType,
            year
          );
          balances.push(newBalance);
        } catch (error) {
          // Policy might not exist for this leave type
        }
      }
    }

    return balances;
  }

  /**
   * Update balance when leave is approved/rejected
   */
  static async updateBalanceOnLeaveStatusChange(
    leaveId: string,
    oldStatus: string,
    newStatus: string
  ) {
    const leave = await prisma.leave.findUnique({
      where: { id: leaveId },
    });

    if (!leave) {
      return;
    }

    const year = leave.startDate.getFullYear();

    if (oldStatus === 'APPROVED' && newStatus !== 'APPROVED') {
      // Revert the deduction
      const balance = await this.getBalance(leave.employeeId, leave.type, year);
      await prisma.leaveBalance.update({
        where: { id: balance.id },
        data: {
          used: Math.max(0, balance.used - leave.days),
          balance: balance.balance + leave.days,
        },
      });
    } else if (oldStatus !== 'APPROVED' && newStatus === 'APPROVED') {
      // Deduct from balance
      const balance = await this.getBalance(leave.employeeId, leave.type, year);
      await prisma.leaveBalance.update({
        where: { id: balance.id },
        data: {
          used: balance.used + leave.days,
          balance: Math.max(0, balance.balance - leave.days),
        },
      });
    }
  }
}

