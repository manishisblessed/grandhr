import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const getAdminDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    const [
      totalEmployees,
      activeEmployees,
      pendingLeaves,
      todayAttendance,
      monthlyPayrolls,
      recentEmployees,
    ] = await Promise.all([
      prisma.employee.count(),
      prisma.employee.count({ where: { isActive: true } }),
      prisma.leave.count({ where: { status: 'PENDING' } }),
      prisma.attendance.count({
        where: {
          date: today,
          status: 'PRESENT',
        },
      }),
      prisma.payroll.count({
        where: {
          year: today.getFullYear(),
          month: today.getMonth() + 1,
        },
      }),
      prisma.employee.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              email: true,
              role: true,
            },
          },
        },
      }),
    ]);

    // Department-wise employee count
    const departmentStats = await prisma.employee.groupBy({
      by: ['departmentId'],
      where: { isActive: true },
      _count: true,
    });

    // Leave status breakdown
    const leaveStats = await prisma.leave.groupBy({
      by: ['status'],
      _count: true,
    });

    res.json({
      stats: {
        totalEmployees,
        activeEmployees,
        pendingLeaves,
        todayAttendance,
        monthlyPayrolls,
      },
      departmentStats: departmentStats.map((d) => ({
        departmentId: d.departmentId || null,
        count: d._count,
      })),
      leaveStats: leaveStats.map((l) => ({
        status: l.status,
        count: l._count,
      })),
      recentEmployees,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch dashboard data' });
  }
};

export const getEmployeeDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { employee: true },
    });

    if (!user || !user.employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const [
      pendingLeaves,
      approvedLeaves,
      todayAttendance,
      monthlyAttendance,
      recentPayrolls,
      upcomingLeaves,
    ] = await Promise.all([
      prisma.leave.count({
        where: {
          employeeId: user.employee.id,
          status: 'PENDING',
        },
      }),
      prisma.leave.count({
        where: {
          employeeId: user.employee.id,
          status: 'APPROVED',
          startDate: { gte: startOfMonth },
        },
      }),
      prisma.attendance.findUnique({
        where: {
          employeeId_date: {
            employeeId: user.employee.id,
            date: today,
          },
        },
      }),
      prisma.attendance.findMany({
        where: {
          employeeId: user.employee.id,
          date: { gte: startOfMonth },
          status: 'PRESENT',
        },
      }),
      prisma.payroll.findMany({
        where: { employeeId: user.employee.id },
        take: 3,
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      }),
      prisma.leave.findMany({
        where: {
          employeeId: user.employee.id,
          status: 'APPROVED',
          startDate: { gte: today },
        },
        take: 5,
        orderBy: { startDate: 'asc' },
      }),
    ]);

    const totalWorkDays = monthlyAttendance.length;
    const totalHours = monthlyAttendance.reduce((sum, att) => sum + (att.totalHours || 0), 0);

    res.json({
      employee: {
        id: user.employee.id,
        firstName: user.employee.firstName,
        lastName: user.employee.lastName,
        employeeId: user.employee.employeeId,
        designationId: user.employee.designationId,
        departmentId: user.employee.departmentId,
      },
      stats: {
        pendingLeaves,
        approvedLeaves,
        totalWorkDays,
        totalHours: Math.round(totalHours * 100) / 100,
      },
      todayAttendance,
      recentPayrolls,
      upcomingLeaves,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch dashboard data' });
  }
};

