import { PrismaClient, AttendanceStatus } from '@prisma/client';

const prisma = new PrismaClient();

export interface AttendanceRuleResult {
  isLate: boolean;
  isEarlyDeparture: boolean;
  lateMinutes: number;
  earlyMinutes: number;
  status: AttendanceStatus;
}

export class AttendanceService {
  /**
   * Calculate hours worked
   */
  static calculateHours(
    clockIn: Date,
    clockOut: Date,
    breakDuration: number = 0
  ): number {
    const diffMs = clockOut.getTime() - clockIn.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return Math.max(0, diffHours - breakDuration / 60);
  }

  /**
   * Apply attendance rules (late/early detection)
   */
  static async applyAttendanceRules(
    employeeId: string,
    clockIn: Date,
    clockOut?: Date,
    shiftId?: string
  ): Promise<AttendanceRuleResult> {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { shift: true },
    });

    if (!employee) {
      throw new Error('Employee not found');
    }

    const shift = shiftId
      ? await prisma.shift.findUnique({ where: { id: shiftId } })
      : employee.shift;

    if (!shift) {
      // No shift assigned, default rules
      return {
        isLate: false,
        isEarlyDeparture: false,
        lateMinutes: 0,
        earlyMinutes: 0,
        status: AttendanceStatus.PRESENT,
      };
    }

    // Parse shift times
    const [startHour, startMinute] = shift.startTime.split(':').map(Number);
    const [endHour, endMinute] = shift.endTime.split(':').map(Number);

    const shiftStart = new Date(clockIn);
    shiftStart.setHours(startHour, startMinute, 0, 0);

    const shiftEnd = clockOut ? new Date(clockOut) : new Date();
    shiftEnd.setHours(endHour, endMinute, 0, 0);

    // Check late arrival
    const clockInTime = clockIn.getTime();
    const shiftStartTime = shiftStart.getTime();
    const gracePeriodMs = shift.gracePeriod * 60 * 1000;
    const lateThresholdMs = shift.lateThreshold * 60 * 1000;

    const isLate =
      clockInTime > shiftStartTime + gracePeriodMs &&
      clockInTime <= shiftStartTime + lateThresholdMs;
    const lateMinutes = isLate
      ? Math.floor((clockInTime - shiftStartTime - gracePeriodMs) / (60 * 1000))
      : 0;

    // Check early departure
    let isEarlyDeparture = false;
    let earlyMinutes = 0;

    if (clockOut) {
      const clockOutTime = clockOut.getTime();
      const shiftEndTime = shiftEnd.getTime();
      const earlyThresholdMs = shift.earlyThreshold * 60 * 1000;

      isEarlyDeparture =
        clockOutTime < shiftEndTime - earlyThresholdMs &&
        clockOutTime >= shiftEndTime - (earlyThresholdMs * 2);
      earlyMinutes = isEarlyDeparture
        ? Math.floor((shiftEndTime - clockOutTime - earlyThresholdMs) / (60 * 1000))
        : 0;
    }

    // Determine status
    let status: AttendanceStatus = AttendanceStatus.PRESENT;
    if (isLate) {
      status = AttendanceStatus.LATE;
    } else if (isEarlyDeparture) {
      status = AttendanceStatus.EARLY_DEPARTURE;
    }

    return {
      isLate,
      isEarlyDeparture,
      lateMinutes,
      earlyMinutes,
      status,
    };
  }

  /**
   * Punch in
   */
  static async punchIn(
    employeeId: string,
    date: Date = new Date(),
    notes?: string
  ) {
    const today = new Date(date);
    today.setHours(0, 0, 0, 0);

    // Check if already punched in
    const existing = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: today,
        },
      },
    });

    if (existing && existing.clockIn) {
      throw new Error('Already punched in today');
    }

    // Get employee shift
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { shift: true },
    });

    if (!employee) {
      throw new Error('Employee not found');
    }

    const clockInTime = new Date();
    const rules = await this.applyAttendanceRules(
      employeeId,
      clockInTime,
      undefined,
      employee.shiftId || undefined
    );

    // Create or update attendance
    const attendance = await prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId,
          date: today,
        },
      },
      update: {
        clockIn: clockInTime,
        shiftId: employee.shiftId,
        status: rules.status,
        isLate: rules.isLate,
        lateMinutes: rules.lateMinutes,
        notes,
      },
      create: {
        employeeId,
        date: today,
        clockIn: clockInTime,
        shiftId: employee.shiftId,
        status: rules.status,
        isLate: rules.isLate,
        lateMinutes: rules.lateMinutes,
        notes,
      },
    });

    return attendance;
  }

  /**
   * Punch out
   */
  static async punchOut(
    employeeId: string,
    breakDuration: number = 0,
    date: Date = new Date(),
    notes?: string
  ) {
    const today = new Date(date);
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: today,
        },
      },
    });

    if (!attendance || !attendance.clockIn) {
      throw new Error('Please punch in first');
    }

    if (attendance.clockOut) {
      throw new Error('Already punched out today');
    }

    const clockOutTime = new Date();
    const totalHours = this.calculateHours(
      attendance.clockIn,
      clockOutTime,
      breakDuration
    );

    // Re-apply rules with clock out
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { shift: true },
    });

    const rules = await this.applyAttendanceRules(
      employeeId,
      attendance.clockIn,
      clockOutTime,
      employee?.shiftId || undefined
    );

    // Update attendance
    const updated = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        clockOut: clockOutTime,
        breakDuration,
        totalHours,
        status: rules.status,
        isEarlyDeparture: rules.isEarlyDeparture,
        earlyMinutes: rules.earlyMinutes,
        notes,
      },
    });

    return updated;
  }

  /**
   * Get monthly attendance summary
   */
  static async getMonthlySummary(
    employeeId: string,
    month: number,
    year: number
  ) {
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

    const totalDays = endDate.getDate();
    const presentDays = attendances.filter(
      (a) => a.status === AttendanceStatus.PRESENT
    ).length;
    const absentDays = totalDays - presentDays;
    const leaveDays = attendances.filter(
      (a) => a.status === AttendanceStatus.ON_LEAVE
    ).length;
    const lateCount = attendances.filter((a) => a.isLate).length;
    const earlyCount = attendances.filter((a) => a.isEarlyDeparture).length;
    const totalHours = attendances.reduce(
      (sum, a) => sum + (a.totalHours || 0),
      0
    );

    // Find or create summary
    const existing = await prisma.attendanceSummary.findFirst({
      where: {
        employeeId,
        month,
        year,
      },
    });

    const summary = existing
      ? await prisma.attendanceSummary.update({
          where: { id: existing.id },
          data: {
            totalDays,
            presentDays,
            absentDays,
            leaveDays,
            lateCount,
            earlyCount,
            totalHours,
          },
        })
      : await prisma.attendanceSummary.create({
          data: {
            employeeId,
            month,
            year,
            totalDays,
            presentDays,
            absentDays,
            leaveDays,
            lateCount,
            earlyCount,
            totalHours,
          },
        });

    return summary;
  }

  /**
   * Create regularization request
   */
  static async createRegularizationRequest(data: {
    employeeId: string;
    date: Date;
    clockIn?: Date;
    clockOut?: Date;
    reason: string;
  }) {
    // Check if attendance exists
    const attendance = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: data.employeeId,
          date: data.date,
        },
      },
    });

    const regularization = await prisma.attendanceRegularization.create({
      data: {
        employeeId: data.employeeId,
        date: data.date,
        clockIn: data.clockIn,
        clockOut: data.clockOut,
        reason: data.reason,
      },
    });

    // The FK lives on Attendance (Attendance.regularizationId).
    // Link the freshly-created regularization back to the attendance row, if any.
    if (attendance) {
      await prisma.attendance.update({
        where: { id: attendance.id },
        data: { regularizationId: regularization.id },
      });
    }

    return regularization;
  }

  /**
   * Approve/reject regularization
   */
  static async processRegularization(
    regularizationId: string,
    status: 'APPROVED' | 'REJECTED',
    approvedBy: string,
    rejectedReason?: string
  ) {
    const regularization = await prisma.attendanceRegularization.findUnique({
      where: { id: regularizationId },
    });

    if (!regularization) {
      throw new Error('Regularization request not found');
    }

    const updated = await prisma.attendanceRegularization.update({
      where: { id: regularizationId },
      data: {
        status,
        approvedBy,
        approvedAt: status === 'APPROVED' ? new Date() : undefined,
        rejectedReason: status === 'REJECTED' ? rejectedReason : undefined,
      },
    });

    // If approved, find the linked attendance (via the FK on Attendance) and apply the regularization values.
    if (status === 'APPROVED') {
      const linkedAttendance = await prisma.attendance.findUnique({
        where: { regularizationId: regularizationId },
      });

      if (linkedAttendance) {
        const updateData: any = {};
        if (regularization.clockIn) {
          updateData.clockIn = regularization.clockIn;
        }
        if (regularization.clockOut) {
          updateData.clockOut = regularization.clockOut;
        }
        if (updateData.clockIn && updateData.clockOut) {
          updateData.totalHours = this.calculateHours(
            updateData.clockIn,
            updateData.clockOut
          );
        }
        updateData.status = AttendanceStatus.REGULARIZED;

        await prisma.attendance.update({
          where: { id: linkedAttendance.id },
          data: updateData,
        });
      }
    }

    return updated;
  }
}

