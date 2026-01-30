import { PrismaClient, LeaveType, LeaveStatus, LeaveDurationType } from '@prisma/client';
import { LeaveBalanceService } from './leave-balance.service';
import { LeavePolicyService } from './leave-policy.service';

const prisma = new PrismaClient();

export class LeaveService {
  /**
   * Calculate leave days
   */
  static calculateLeaveDays(
    startDate: Date,
    endDate: Date,
    durationType: LeaveDurationType,
    startTime?: string,
    endTime?: string
  ): number {
    if (durationType === LeaveDurationType.FULL_DAY) {
      const diffTime = endDate.getTime() - startDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    } else if (durationType === LeaveDurationType.HALF_DAY) {
      return 0.5;
    } else if (durationType === LeaveDurationType.HOURLY && startTime && endTime) {
      // Calculate hours
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      const hours = (endMinutes - startMinutes) / 60;
      return hours / 8; // Convert to days (assuming 8 hours per day)
    }
    return 0;
  }

  /**
   * Apply for leave
   */
  static async applyForLeave(data: {
    employeeId: string;
    type: LeaveType;
    durationType: LeaveDurationType;
    startDate: Date;
    endDate: Date;
    startTime?: string;
    endTime?: string;
    reason?: string;
  }) {
    const employee = await prisma.employee.findUnique({
      where: { id: data.employeeId },
    });

    if (!employee || !employee.companyId) {
      throw new Error('Employee not found');
    }

    // Get policy
    const policy = await LeavePolicyService.getPolicyByType(
      employee.companyId,
      data.type
    );

    if (!policy) {
      throw new Error(`No active policy found for ${data.type}`);
    }

    // Check if half-day/hourly is allowed
    if (
      data.durationType === LeaveDurationType.HALF_DAY &&
      !policy.halfDayAllowed
    ) {
      throw new Error('Half-day leave is not allowed for this leave type');
    }

    if (
      data.durationType === LeaveDurationType.HOURLY &&
      !policy.hourlyAllowed
    ) {
      throw new Error('Hourly leave is not allowed for this leave type');
    }

    // Calculate days
    const days = this.calculateLeaveDays(
      data.startDate,
      data.endDate,
      data.durationType,
      data.startTime,
      data.endTime
    );

    // Check balance
    const year = data.startDate.getFullYear();
    const balance = await LeaveBalanceService.getBalance(
      data.employeeId,
      data.type,
      year
    );

    if (balance.balance < days) {
      throw new Error('Insufficient leave balance');
    }

    // Create leave
    const leave = await prisma.leave.create({
      data: {
        employeeId: data.employeeId,
        type: data.type,
        durationType: data.durationType,
        startDate: data.startDate,
        endDate: data.endDate,
        startTime: data.startTime,
        endTime: data.endTime,
        days,
        hours: data.durationType === LeaveDurationType.HOURLY ? days * 8 : undefined,
        reason: data.reason,
        status: policy.requiresApproval
          ? LeaveStatus.PENDING
          : LeaveStatus.APPROVED,
      },
    });

    // If auto-approved, update balance
    if (!policy.requiresApproval) {
      await LeaveBalanceService.updateBalanceOnLeaveStatusChange(
        leave.id,
        'PENDING',
        'APPROVED'
      );
    }

    return leave;
  }

  /**
   * Approve leave
   */
  static async approveLeave(
    leaveId: string,
    approvedBy: string
  ) {
    const leave = await prisma.leave.findUnique({
      where: { id: leaveId },
    });

    if (!leave) {
      throw new Error('Leave not found');
    }

    if (leave.status === LeaveStatus.APPROVED) {
      throw new Error('Leave already approved');
    }

    const oldStatus = leave.status;

    // Update leave
    const updated = await prisma.leave.update({
      where: { id: leaveId },
      data: {
        status: LeaveStatus.APPROVED,
        approvedBy,
        approvedAt: new Date(),
      },
    });

    // Update balance
    await LeaveBalanceService.updateBalanceOnLeaveStatusChange(
      leaveId,
      oldStatus,
      'APPROVED'
    );

    return updated;
  }

  /**
   * Reject leave
   */
  static async rejectLeave(
    leaveId: string,
    rejectedBy: string,
    rejectedReason: string
  ) {
    const leave = await prisma.leave.findUnique({
      where: { id: leaveId },
    });

    if (!leave) {
      throw new Error('Leave not found');
    }

    return prisma.leave.update({
      where: { id: leaveId },
      data: {
        status: LeaveStatus.REJECTED,
        approvedBy: rejectedBy,
        approvedAt: new Date(),
        rejectedReason,
      },
    });
  }

  /**
   * Get employee leaves
   */
  static async getEmployeeLeaves(
    employeeId: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      status?: LeaveStatus;
      type?: LeaveType;
    }
  ) {
    const where: any = { employeeId };

    if (filters?.startDate || filters?.endDate) {
      where.OR = [
        {
          startDate: {
            gte: filters.startDate,
            lte: filters.endDate,
          },
        },
        {
          endDate: {
            gte: filters.startDate,
            lte: filters.endDate,
          },
        },
      ];
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    return prisma.leave.findMany({
      where,
      orderBy: { startDate: 'desc' },
    });
  }
}

