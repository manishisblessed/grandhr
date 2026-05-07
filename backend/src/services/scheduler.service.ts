import { PrismaClient } from '@prisma/client';
import { AutomationService } from './automation.service';

const prisma = new PrismaClient();

/**
 * Job Scheduler Service - Runs automation jobs based on schedule
 */
export class SchedulerService {
  private static intervalId: NodeJS.Timeout | null = null;

  /**
   * Start the scheduler
   */
  static start() {
    console.log('🔄 Starting automation scheduler...');
    
    // Check for jobs every minute
    this.intervalId = setInterval(async () => {
      await this.checkAndRunJobs();
    }, 60000); // Check every minute

    // Delay initial check to allow database connection to be established
    setTimeout(async () => {
      await this.checkAndRunJobs();
    }, 5000); // Wait 5 seconds before first check
  }

  /**
   * Stop the scheduler
   */
  static stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('⏹️ Automation scheduler stopped');
    }
  }

  /**
   * Check for jobs that need to run
   */
  private static async checkAndRunJobs() {
    try {
      // Check database connection first
      try {
        // Sanity-check that DATABASE_URL is set and looks like a supported provider.
        const url = process.env.DATABASE_URL || '';
        const isSupported =
          url.startsWith('postgresql://') ||
          url.startsWith('postgres://') ||
          url.startsWith('mongodb://') ||
          url.startsWith('mongodb+srv://');
        if (!isSupported) {
          console.warn('⚠️  DATABASE_URL not configured properly, skipping scheduler check');
          return;
        }
        await prisma.user.findFirst({ take: 1 });
      } catch (connectionError: any) {
        // Silently skip if database is not available or misconfigured
        const errorMessage = connectionError.message || '';
        const errorCode = connectionError.code || '';
        const errorName = connectionError.name || '';
        
        const metaMessage = connectionError.meta?.message || '';
        
        // Check for various database connection/authentication errors
        const isDatabaseError = 
          errorMessage.includes("Can't reach database server") || 
          errorMessage.includes("P1001") ||
          errorMessage.includes("the URL must start with the protocol") ||
          errorMessage.includes("Error validating datasource") ||
          errorMessage.includes("empty database name not allowed") ||
          errorMessage.includes("SCRAM failure") ||
          errorMessage.includes("authentication failed") ||
          errorMessage.includes("bad auth") ||
          metaMessage.includes("empty database name not allowed") ||
          errorCode === 'P1012' ||
          errorCode === 'P2010' ||
          errorName === 'PrismaClientInitializationError' ||
          errorName === 'PrismaClientKnownRequestError' ||
          errorName === 'PrismaClientUnknownRequestError';
        
        if (isDatabaseError) {
          console.warn('⚠️  Database not configured or unavailable (check DATABASE_URL on server), skipping scheduler check');
          return;
        }
        // Re-throw unexpected errors
        throw connectionError;
      }

      const now = new Date();
      
      // Find jobs that are due to run
      const jobs = await prisma.automationJob.findMany({
        where: {
          isActive: true,
          status: { not: 'RUNNING' },
          nextRun: {
            lte: now,
          },
        },
      });

      for (const job of jobs) {
        try {
          console.log(`🚀 Running automation job: ${job.name} (${job.type})`);

          // Update status to running
          await prisma.automationJob.update({
            where: { id: job.id },
            data: {
              status: 'RUNNING',
              lastRun: new Date(),
            },
          });

          // Execute the job
          let result;
          switch (job.type) {
            case 'AUTO_PAYROLL':
              result = await AutomationService.autoProcessPayroll(
                job.companyId || undefined
              );
              break;
            case 'AUTO_ATTENDANCE':
              result = await AutomationService.autoMarkAttendance(
                job.companyId || undefined
              );
              break;
            case 'AUTO_LEAVE_BALANCE':
              result = await AutomationService.autoUpdateLeaveBalances(
                job.companyId || undefined
              );
              break;
            case 'AUTO_REMINDER':
              result = await AutomationService.sendReminders(
                job.companyId || undefined
              );
              break;
            default:
              throw new Error(`Unknown job type: ${job.type}`);
          }

          // Calculate next run time
          const nextRun = this.calculateNextRun(job.schedule, now);

          // Update job status
          await prisma.automationJob.update({
            where: { id: job.id },
            data: {
              status: 'COMPLETED',
              runCount: { increment: 1 },
              nextRun,
              error: null,
            },
          });

          console.log(`✅ Job completed: ${job.name}`, result);
        } catch (error: any) {
          console.error(`❌ Job failed: ${job.name}`, error);

          // Update job status with error
          await prisma.automationJob.update({
            where: { id: job.id },
            data: {
              status: 'FAILED',
              error: error.message,
            },
          });
        }
      }
    } catch (error: any) {
      // Only log non-connection errors to avoid spam
      if (!error.message?.includes("Can't reach database server") && 
          !error.message?.includes("P1001")) {
        console.error('Error in scheduler:', error);
      }
    }
  }

  /**
   * Calculate next run time based on schedule
   */
  private static calculateNextRun(schedule: string, fromDate: Date = new Date()): Date {
    const next = new Date(fromDate);

    // Parse common schedule patterns
    // Daily: "0 0 * * *" or "daily"
    if (schedule.includes('daily') || schedule === '0 0 * * *') {
      next.setDate(next.getDate() + 1);
      next.setHours(0, 0, 0, 0);
    }
    // Weekly: "0 0 * * 0" or "weekly"
    else if (schedule.includes('weekly') || schedule.includes('0 0 * * 0')) {
      const daysUntilSunday = (7 - next.getDay()) % 7 || 7;
      next.setDate(next.getDate() + daysUntilSunday);
      next.setHours(0, 0, 0, 0);
    }
    // Monthly: "0 0 1 * *" or "monthly"
    else if (schedule.includes('monthly') || schedule.includes('0 0 1 * *')) {
      next.setMonth(next.getMonth() + 1);
      next.setDate(1);
      next.setHours(0, 0, 0, 0);
    }
    // First of month: "0 0 1 * *"
    else if (schedule.includes('0 0 1 * *')) {
      next.setMonth(next.getMonth() + 1);
      next.setDate(1);
      next.setHours(0, 0, 0, 0);
    }
    // Every hour: "0 * * * *"
    else if (schedule === '0 * * * *') {
      next.setHours(next.getHours() + 1);
      next.setMinutes(0);
      next.setSeconds(0);
    }
    // Custom time (format: "HH:MM")
    else if (/^\d{2}:\d{2}$/.test(schedule)) {
      const [hours, minutes] = schedule.split(':').map(Number);
      next.setHours(hours, minutes, 0, 0);
      if (next <= fromDate) {
        next.setDate(next.getDate() + 1);
      }
    }
    // Default: next day
    else {
      next.setDate(next.getDate() + 1);
      next.setHours(0, 0, 0, 0);
    }

    return next;
  }
}

// Scheduler is started from index.ts to ensure proper initialization order
// No auto-start here to avoid duplicate initialization

