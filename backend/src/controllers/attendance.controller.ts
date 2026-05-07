import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

const calculateHours = (clockIn: Date, clockOut: Date, breakDuration: number = 0): number => {
  const diffMs = clockOut.getTime() - clockIn.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return Math.max(0, diffHours - breakDuration / 60);
};

export const clockIn = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { employee: true },
    });

    if (!user || !user.employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if already clocked in today
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: user.employee.id,
          date: today,
        },
      },
    });

    if (existingAttendance && existingAttendance.clockIn) {
      return res.status(400).json({ message: 'Already clocked in today' });
    }

    const attendance = await prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId: user.employee.id,
          date: today,
        },
      },
      update: {
        clockIn: new Date(),
        status: 'PRESENT',
      },
      create: {
        employeeId: user.employee.id,
        date: today,
        clockIn: new Date(),
        status: 'PRESENT',
      },
    });

    res.json({
      message: 'Clocked in successfully',
      attendance,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to clock in' });
  }
};

export const clockOut = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { breakDuration = 0 } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { employee: true },
    });

    if (!user || !user.employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const attendance = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: user.employee.id,
          date: today,
        },
      },
    });

    if (!attendance || !attendance.clockIn) {
      return res.status(400).json({ message: 'Please clock in first' });
    }

    if (attendance.clockOut) {
      return res.status(400).json({ message: 'Already clocked out today' });
    }

    const clockOutTime = new Date();
    const totalHours = calculateHours(attendance.clockIn, clockOutTime, breakDuration);

    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        clockOut: clockOutTime,
        breakDuration: parseInt(breakDuration),
        totalHours,
      },
    });

    res.json({
      message: 'Clocked out successfully',
      attendance: updatedAttendance,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to clock out' });
  }
};

export const getMyAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { startDate, endDate, page = '1', limit = '30' } = req.query;
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

    const where: any = {
      employeeId: user.employee.id,
    };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    const [attendances, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { date: 'desc' },
      }),
      prisma.attendance.count({ where }),
    ]);

    res.json({
      attendances,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch attendance' });
  }
};

export const getAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate, page = '1', limit = '30' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { employeeId };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    const [attendances, total] = await Promise.all([
      prisma.attendance.findMany({
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
            },
          },
        },
        orderBy: { date: 'desc' },
      }),
      prisma.attendance.count({ where }),
    ]);

    res.json({
      attendances,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch attendance' });
  }
};

export const getAttendanceByDate = async (req: AuthRequest, res: Response) => {
  try {
    const { date } = req.params;
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const attendances = await prisma.attendance.findMany({
      where: { date: targetDate },
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
      orderBy: {
        employee: {
          firstName: 'asc',
        },
      },
    });

    res.json({ attendances });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch attendance' });
  }
};

/**
 * POST /api/attendance/mark
 * HR-only. Upserts an attendance record for an employee on a given date.
 * Useful when an employee forgot to clock in or HR is back-filling a day.
 */
export const markAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const { employeeId, date, status, clockIn, clockOut, notes, breakDuration = 0 } = req.body || {};

    if (!employeeId || !date) {
      return res.status(400).json({ message: 'employeeId and date are required' });
    }

    const target = new Date(date);
    target.setHours(0, 0, 0, 0);

    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    let totalHours: number | undefined;
    if (clockIn && clockOut) {
      totalHours = calculateHours(new Date(clockIn), new Date(clockOut), Number(breakDuration) || 0);
    }

    const attendance = await prisma.attendance.upsert({
      where: { employeeId_date: { employeeId, date: target } },
      create: {
        employeeId,
        date: target,
        status: status || 'PRESENT',
        clockIn: clockIn ? new Date(clockIn) : undefined,
        clockOut: clockOut ? new Date(clockOut) : undefined,
        breakDuration: Number(breakDuration) || 0,
        totalHours,
        notes,
        approvedBy: req.userId,
        approvedAt: new Date(),
      },
      update: {
        status: status || undefined,
        clockIn: clockIn ? new Date(clockIn) : undefined,
        clockOut: clockOut ? new Date(clockOut) : undefined,
        breakDuration: breakDuration !== undefined ? Number(breakDuration) : undefined,
        totalHours,
        notes,
        approvedBy: req.userId,
        approvedAt: new Date(),
      },
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true, employeeId: true },
        },
      },
    });

    res.json({ message: 'Attendance saved', attendance });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to mark attendance' });
  }
};

export const updateAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }
    if (updateData.clockIn) {
      updateData.clockIn = new Date(updateData.clockIn);
    }
    if (updateData.clockOut) {
      updateData.clockOut = new Date(updateData.clockOut);
    }

    // Recalculate hours if clock in/out changed
    if (updateData.clockIn && updateData.clockOut) {
      const attendance = await prisma.attendance.findUnique({ where: { id } });
      if (attendance) {
        updateData.totalHours = calculateHours(
          new Date(updateData.clockIn),
          new Date(updateData.clockOut),
          updateData.breakDuration || attendance.breakDuration || 0
        );
      }
    }

    const attendance = await prisma.attendance.update({
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

    res.json({
      message: 'Attendance updated successfully',
      attendance,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update attendance' });
  }
};

