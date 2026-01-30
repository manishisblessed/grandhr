import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { z } from 'zod';
import { sendEmail } from '../utils/email.util';
import { createNotificationHelper } from './notification.controller';

const prisma = new PrismaClient();

const applyLeaveSchema = z.object({
  type: z.enum(['SICK_LEAVE', 'CASUAL_LEAVE', 'EARNED_LEAVE', 'MATERNITY_LEAVE', 'PATERNITY_LEAVE', 'COMP_OFF', 'LOP']),
  startDate: z.string(),
  endDate: z.string(),
  reason: z.string().optional(),
});

const calculateDays = (startDate: Date, endDate: Date): number => {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
};

const getLeaveTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    CASUAL_LEAVE: 'Casual Leave',
    SICK_LEAVE: 'Sick Leave',
    EARNED_LEAVE: 'Earned Leave',
    MATERNITY_LEAVE: 'Maternity Leave',
    PATERNITY_LEAVE: 'Paternity Leave',
    COMP_OFF: 'Compensatory Off',
    LOP: 'Loss of Pay',
  };
  return labels[type] || type;
};

export const applyLeave = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const data = applyLeaveSchema.parse(req.body);

    // Get employee
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { employee: true },
    });

    if (!user || !user.employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (startDate > endDate) {
      return res.status(400).json({ message: 'Start date must be before end date' });
    }

    const days = calculateDays(startDate, endDate);

    const leave = await prisma.leave.create({
      data: {
        employeeId: user.employee.id,
        type: data.type,
        startDate,
        endDate,
        days,
        reason: data.reason,
      },
    });

    // Create notification for the employee
    await createNotificationHelper(
      userId,
      'Leave Request Submitted',
      `Your ${getLeaveTypeLabel(data.type)} request for ${days} day(s) has been submitted and is pending approval.`,
      'LEAVE',
      '/hr/leaves'
    );

    // Notify HR/Managers about new leave request
    const hrUsers = await prisma.user.findMany({
      where: {
        role: { in: ['COMPANY_ADMIN', 'HR', 'MANAGER'] as const },
        isActive: true,
      },
    });

    for (const hr of hrUsers) {
      await createNotificationHelper(
        hr.id,
        'New Leave Request',
        `${user.employee.firstName} ${user.employee.lastName} has applied for ${getLeaveTypeLabel(data.type)} (${days} days).`,
        'LEAVE',
        '/hr/leaves'
      );
    }

    res.status(201).json({
      message: 'Leave applied successfully',
      leave,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: error.message || 'Failed to apply leave' });
  }
};

export const getLeaves = async (req: AuthRequest, res: Response) => {
  try {
    const { status, type, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const [leaves, total] = await Promise.all([
      prisma.leave.findMany({
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
              department: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.leave.count({ where }),
    ]);

    res.json({
      leaves,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch leaves' });
  }
};

export const getEmployeeLeaves = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { employee: true },
    });

    if (!user || !user.employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const leaves = await prisma.leave.findMany({
      where: { employeeId: user.employee.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ leaves });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch leaves' });
  }
};

export const getLeaveById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const leave = await prisma.leave.findUnique({
      where: { id },
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

    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }

    res.json({ leave });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch leave' });
  }
};

export const updateLeaveStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, rejectedReason } = req.body;

    if (!['APPROVED', 'REJECTED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updateData: any = {
      status,
      approvedBy: req.userId,
      approvedAt: new Date(),
    };

    if (status === 'REJECTED' && rejectedReason) {
      updateData.rejectedReason = rejectedReason;
    }

    const leave = await prisma.leave.update({
      where: { id },
      data: updateData,
      include: {
        employee: {
          include: {
            user: true,
          },
        },
      },
    });

    // Get approver info
    const approver = await prisma.user.findUnique({
      where: { id: req.userId! },
      include: { employee: true },
    });

    const approverName = approver?.employee 
      ? `${approver.employee.firstName} ${approver.employee.lastName}`
      : approver?.email || 'HR Team';

    // Create in-app notification for the employee
    if (leave.employee.user) {
      const notificationTitle = status === 'APPROVED' 
        ? 'Leave Request Approved! ✅' 
        : 'Leave Request Rejected ❌';
      
      const notificationMessage = status === 'APPROVED'
        ? `Your ${getLeaveTypeLabel(leave.type)} request for ${leave.days} day(s) from ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()} has been approved by ${approverName}.`
        : `Your ${getLeaveTypeLabel(leave.type)} request has been rejected by ${approverName}. Reason: ${rejectedReason || 'Not specified'}`;

      await createNotificationHelper(
        leave.employee.user.id,
        notificationTitle,
        notificationMessage,
        status === 'APPROVED' ? 'SUCCESS' : 'WARNING',
        '/hr/leaves'
      );

      // Send email notification
      const emailSubject = status === 'APPROVED'
        ? `Leave Request Approved - GrandHR`
        : `Leave Request Rejected - GrandHR`;

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${status === 'APPROVED' ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .detail-row:last-child { border-bottom: none; }
            .label { font-weight: bold; color: #666; }
            .value { color: #333; }
            .status { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; }
            .status-approved { background: #D1FAE5; color: #065F46; }
            .status-rejected { background: #FEE2E2; color: #991B1B; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${status === 'APPROVED' ? '✅ Leave Approved!' : '❌ Leave Rejected'}</h1>
            </div>
            <div class="content">
              <p>Dear ${leave.employee.firstName},</p>
              
              <p>Your leave request has been <strong>${status.toLowerCase()}</strong> by ${approverName}.</p>
              
              <div class="details">
                <div class="detail-row">
                  <span class="label">Leave Type:</span>
                  <span class="value">${getLeaveTypeLabel(leave.type)}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Duration:</span>
                  <span class="value">${new Date(leave.startDate).toLocaleDateString()} - ${new Date(leave.endDate).toLocaleDateString()}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Days:</span>
                  <span class="value">${leave.days} day(s)</span>
                </div>
                <div class="detail-row">
                  <span class="label">Status:</span>
                  <span class="status ${status === 'APPROVED' ? 'status-approved' : 'status-rejected'}">${status}</span>
                </div>
                ${status === 'REJECTED' && rejectedReason ? `
                <div class="detail-row">
                  <span class="label">Reason:</span>
                  <span class="value">${rejectedReason}</span>
                </div>
                ` : ''}
              </div>
              
              ${status === 'APPROVED' 
                ? `<p>Your leave has been recorded in the system. Enjoy your time off!</p>`
                : `<p>If you have any questions about this decision, please contact your HR department.</p>`
              }
              
              <div class="footer">
                <p>© ${new Date().getFullYear()} GrandHR. All rights reserved.</p>
                <p>This is an automated email. Please do not reply.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      // Send email (don't wait for it)
      sendEmail(leave.employee.user.email, emailSubject, emailHtml).catch(err => {
        console.error('Failed to send leave status email:', err);
      });
    }

    res.json({
      message: 'Leave status updated successfully',
      leave,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update leave status' });
  }
};

export const getLeaveBalance = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { employee: true },
    });

    if (!user || !user.employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Get approved leaves for current year
    const currentYear = new Date().getFullYear();
    const approvedLeaves = await prisma.leave.findMany({
      where: {
        employeeId: user.employee.id,
        status: 'APPROVED',
        startDate: {
          gte: new Date(`${currentYear}-01-01`),
          lte: new Date(`${currentYear}-12-31`),
        },
      },
    });

    const usedLeaves = approvedLeaves.reduce((sum, leave) => sum + leave.days, 0);

    // Default leave balances (can be configured per employee)
    const leaveBalances = {
      SICK_LEAVE: { total: 12, used: 0, remaining: 12 },
      CASUAL_LEAVE: { total: 12, used: 0, remaining: 12 },
      EARNED_LEAVE: { total: 15, used: 0, remaining: 15 },
      MATERNITY_LEAVE: { total: 26, used: 0, remaining: 26 },
      PATERNITY_LEAVE: { total: 5, used: 0, remaining: 5 },
      COMP_OFF: { total: 0, used: 0, remaining: 0 },
      LOP: { total: 0, used: 0, remaining: 0 },
    };

    // Calculate used leaves by type
    approvedLeaves.forEach((leave) => {
      if (leaveBalances[leave.type as keyof typeof leaveBalances]) {
        leaveBalances[leave.type as keyof typeof leaveBalances].used += leave.days;
        leaveBalances[leave.type as keyof typeof leaveBalances].remaining -= leave.days;
      }
    });

    res.json({
      year: currentYear,
      totalUsed: usedLeaves,
      balances: leaveBalances,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch leave balance' });
  }
};
