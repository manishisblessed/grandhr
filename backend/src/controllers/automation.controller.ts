import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AutomationService } from '../services/automation.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { z } from 'zod';

const prisma = new PrismaClient();

const createJobSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['AUTO_PAYROLL', 'AUTO_ATTENDANCE', 'AUTO_LEAVE_BALANCE', 'AUTO_REMINDER']),
  schedule: z.string(), // Cron expression
  config: z.record(z.any()).optional(),
});

// Get all automation jobs
export const getAutomationJobs = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const jobs = await prisma.automationJob.findMany({
      where: {
        companyId: user.companyId || undefined,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ jobs });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch automation jobs' });
  }
};

// Create automation job
export const createAutomationJob = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const data = createJobSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    if (!user || !['ADMIN', 'HR'].includes(user.role)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Calculate next run time (simplified - would use cron parser in production)
    const nextRun = calculateNextRun(data.schedule);

    const job = await prisma.automationJob.create({
      data: {
        companyId: user.companyId || undefined,
        name: data.name,
        type: data.type,
        schedule: data.schedule,
        config: data.config || {},
        nextRun,
      },
    });

    res.status(201).json({ message: 'Automation job created', job });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: error.message || 'Failed to create automation job' });
  }
};

// Run automation job manually
export const runAutomationJob = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !['ADMIN', 'HR'].includes(user.role)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const job = await prisma.automationJob.findUnique({
      where: { id },
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Update job status
    await prisma.automationJob.update({
      where: { id },
      data: {
        status: 'RUNNING',
        lastRun: new Date(),
      },
    });

    let result;
    try {
      switch (job.type) {
        case 'AUTO_PAYROLL':
          result = await AutomationService.autoProcessPayroll(job.companyId || undefined);
          break;
        case 'AUTO_ATTENDANCE':
          result = await AutomationService.autoMarkAttendance(job.companyId || undefined);
          break;
        case 'AUTO_LEAVE_BALANCE':
          result = await AutomationService.autoUpdateLeaveBalances(job.companyId || undefined);
          break;
        case 'AUTO_REMINDER':
          result = await AutomationService.sendReminders(job.companyId || undefined);
          break;
        default:
          throw new Error('Unknown job type');
      }

      // Update job status
      await prisma.automationJob.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          runCount: { increment: 1 },
          nextRun: calculateNextRun(job.schedule),
        },
      });

      res.json({ message: 'Job executed successfully', result });
    } catch (error: any) {
      await prisma.automationJob.update({
        where: { id },
        data: {
          status: 'FAILED',
          error: error.message,
        },
      });

      throw error;
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to run automation job' });
  }
};

// Toggle automation job
export const toggleAutomationJob = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !['ADMIN', 'HR'].includes(user.role)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const job = await prisma.automationJob.update({
      where: { id },
      data: { isActive },
    });

    res.json({ message: 'Job updated', job });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update job' });
  }
};

// Delete automation job
export const deleteAutomationJob = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !['ADMIN', 'HR'].includes(user.role)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await prisma.automationJob.delete({
      where: { id },
    });

    res.json({ message: 'Job deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to delete job' });
  }
};

// Helper function to calculate next run time (simplified)
function calculateNextRun(schedule: string): Date {
  // This is a simplified version
  // In production, use a proper cron parser like 'node-cron'
  const now = new Date();
  const next = new Date(now);
  
  // Simple parsing for common patterns
  if (schedule.includes('daily') || schedule === '0 0 * * *') {
    next.setDate(next.getDate() + 1);
    next.setHours(0, 0, 0, 0);
  } else if (schedule.includes('weekly') || schedule.includes('0 0 * * 0')) {
    next.setDate(next.getDate() + 7);
    next.setHours(0, 0, 0, 0);
  } else if (schedule.includes('monthly') || schedule.includes('0 0 1 * *')) {
    next.setMonth(next.getMonth() + 1);
    next.setDate(1);
    next.setHours(0, 0, 0, 0);
  } else {
    // Default: next day
    next.setDate(next.getDate() + 1);
  }

  return next;
}

