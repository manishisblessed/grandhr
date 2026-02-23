import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const getSuperAdminDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalCompanies,
      activeCompanies,
      inactiveCompanies,
      totalUsers,
      totalEmployees,
      totalSubscriptions,
      activeSubscriptions,
      recentActivity,
      newCompaniesThisMonth,
      newUsersThisMonth,
    ] = await Promise.all([
      prisma.company.count(),
      prisma.company.count({ where: { isActive: true } }),
      prisma.company.count({ where: { isActive: false } }),
      prisma.user.count(),
      prisma.employee.count(),
      prisma.subscription.count(),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      prisma.activityLog.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { email: true, role: true },
          },
        },
      }),
      prisma.company.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      prisma.user.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
    ]);

    res.json({
      success: true,
      data: {
        companies: {
          total: totalCompanies,
          active: activeCompanies,
          inactive: inactiveCompanies,
        },
        users: { total: totalUsers },
        employees: { total: totalEmployees },
        revenue: {
          totalSubscriptions,
          activeSubscriptions,
        },
        recentActivity,
        growth: {
          newCompaniesThisMonth,
          newUsersThisMonth,
        },
      },
    });
  } catch (error: any) {
    console.error('getSuperAdminDashboard error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch dashboard data' });
  }
};

export const getAllCompanies = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const status = req.query.status as string;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { domain: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          subscription: {
            include: { plan: { select: { name: true, type: true } } },
          },
          _count: {
            select: {
              employees: true,
              users: true,
            },
          },
        },
      }),
      prisma.company.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        companies,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    console.error('getAllCompanies error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch companies' });
  }
};

export const getCompanyDetails = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
            lastLogin: true,
            createdAt: true,
          },
        },
        employees: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            departmentId: true,
            designationId: true,
            employmentStatus: true,
            joiningDate: true,
            isActive: true,
          },
        },
        subscription: {
          include: {
            plan: true,
            addOns: { include: { addOn: true } },
          },
        },
        departments: {
          select: { id: true, name: true, code: true, isActive: true },
        },
        locations: {
          select: { id: true, name: true, city: true, state: true, country: true, isActive: true },
        },
      },
    });

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const employeeIds = company.employees.map((e) => e.id);

    const [activeLeaves, attendanceToday] = await Promise.all([
      prisma.leave.count({
        where: {
          employeeId: { in: employeeIds },
          status: 'APPROVED',
          startDate: { lte: today },
          endDate: { gte: today },
        },
      }),
      prisma.attendance.count({
        where: {
          employeeId: { in: employeeIds },
          date: { gte: startOfDay, lt: endOfDay },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        ...company,
        stats: {
          employeeCount: company.employees.length,
          userCount: company.users.length,
          activeLeaves,
          attendanceToday,
        },
      },
    });
  } catch (error: any) {
    console.error('getCompanyDetails error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch company details' });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const role = req.query.role as string;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { employee: { firstName: { contains: search, mode: 'insensitive' } } },
        { employee: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
          companyId: true,
          company: {
            select: { id: true, name: true },
          },
          employee: {
            select: {
              id: true,
              employeeId: true,
              firstName: true,
              lastName: true,
              phone: true,
              employmentStatus: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    console.error('getAllUsers error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch users' });
  }
};

export const toggleUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    res.json({
      success: true,
      message: `User ${updated.isActive ? 'activated' : 'deactivated'} successfully`,
      data: updated,
    });
  } catch (error: any) {
    console.error('toggleUserStatus error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to toggle user status' });
  }
};

export const toggleCompanyStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const company = await prisma.company.findUnique({ where: { id } });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    const updated = await prisma.company.update({
      where: { id },
      data: { isActive: !company.isActive },
      select: {
        id: true,
        name: true,
        isActive: true,
      },
    });

    res.json({
      success: true,
      message: `Company ${updated.isActive ? 'activated' : 'deactivated'} successfully`,
      data: updated,
    });
  } catch (error: any) {
    console.error('toggleCompanyStatus error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to toggle company status' });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
      });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    res.json({
      success: true,
      message: `User role updated to ${role} successfully`,
      data: updated,
    });
  } catch (error: any) {
    console.error('updateUserRole error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update user role' });
  }
};

export const deleteCompany = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const hardDelete = req.query.hard === 'true';

    const company = await prisma.company.findUnique({ where: { id } });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    if (hardDelete) {
      await prisma.company.delete({ where: { id } });

      res.json({
        success: true,
        message: 'Company permanently deleted',
      });
    } else {
      await prisma.company.update({
        where: { id },
        data: { isActive: false },
      });

      res.json({
        success: true,
        message: 'Company deactivated (soft delete)',
      });
    }
  } catch (error: any) {
    console.error('deleteCompany error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to delete company' });
  }
};

export const getGlobalStats = async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalDocuments,
      totalAttendance,
      totalLeaves,
      totalPayrolls,
      companiesThisMonth,
      companiesLastMonth,
      usersThisMonth,
      usersLastMonth,
      employeesThisMonth,
      employeesLastMonth,
    ] = await Promise.all([
      prisma.generatedDocument.count(),
      prisma.attendance.count(),
      prisma.leave.count(),
      prisma.payroll.count(),
      prisma.company.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.company.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
      prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.user.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
      prisma.employee.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.employee.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
    ]);

    const calculateGrowth = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    res.json({
      success: true,
      data: {
        totals: {
          documents: totalDocuments,
          attendance: totalAttendance,
          leaves: totalLeaves,
          payrolls: totalPayrolls,
        },
        growth: {
          companies: {
            thisMonth: companiesThisMonth,
            lastMonth: companiesLastMonth,
            percentage: calculateGrowth(companiesThisMonth, companiesLastMonth),
          },
          users: {
            thisMonth: usersThisMonth,
            lastMonth: usersLastMonth,
            percentage: calculateGrowth(usersThisMonth, usersLastMonth),
          },
          employees: {
            thisMonth: employeesThisMonth,
            lastMonth: employeesLastMonth,
            percentage: calculateGrowth(employeesThisMonth, employeesLastMonth),
          },
        },
      },
    });
  } catch (error: any) {
    console.error('getGlobalStats error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch global stats' });
  }
};

export const getAllSubscriptions = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          company: {
            select: { id: true, name: true, email: true, isActive: true },
          },
          plan: {
            select: { id: true, name: true, type: true, pricePerEmployee: true },
          },
          addOns: {
            include: { addOn: { select: { name: true, type: true } } },
          },
        },
      }),
      prisma.subscription.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        subscriptions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    console.error('getAllSubscriptions error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch subscriptions' });
  }
};
