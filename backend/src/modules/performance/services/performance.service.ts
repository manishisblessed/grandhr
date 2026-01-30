import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PerformanceService {
  /**
   * Create review cycle
   */
  static async createReviewCycle(data: {
    companyId: string;
    name: string;
    type: string;
    startDate: Date;
    endDate: Date;
    selfReviewDeadline?: Date;
    managerReviewDeadline?: Date;
  }) {
    return prisma.reviewCycle.create({
      data: {
        ...data,
        status: 'DRAFT',
      },
    });
  }

  /**
   * Activate review cycle
   */
  static async activateReviewCycle(reviewCycleId: string) {
    return prisma.reviewCycle.update({
      where: { id: reviewCycleId },
      data: { status: 'ACTIVE' },
    });
  }

  /**
   * Create goal
   */
  static async createGoal(data: {
    employeeId: string;
    reviewCycleId?: string;
    title: string;
    description?: string;
    type: string;
    target?: string;
    dueDate?: Date;
  }) {
    return prisma.goal.create({
      data: {
        ...data,
        progress: 0,
        status: 'ACTIVE',
      },
    });
  }

  /**
   * Update goal progress
   */
  static async updateGoalProgress(
    goalId: string,
    progress: number
  ) {
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
    });

    if (!goal) {
      throw new Error('Goal not found');
    }

    const updated = await prisma.goal.update({
      where: { id: goalId },
      data: {
        progress: Math.min(100, Math.max(0, progress)),
        status: progress >= 100 ? 'COMPLETED' : goal.status,
      },
    });

    return updated;
  }

  /**
   * Create performance review
   */
  static async createPerformanceReview(data: {
    employeeId: string;
    reviewerId: string;
    reviewCycleId?: string;
    period: string;
  }) {
    return prisma.performanceReview.create({
      data: {
        ...data,
        status: 'DRAFT',
      },
    });
  }

  /**
   * Submit self review
   */
  static async submitSelfReview(
    reviewId: string,
    selfRating: number,
    selfFeedback: string,
    achievements?: string
  ) {
    return prisma.performanceReview.update({
      where: { id: reviewId },
      data: {
        selfRating,
        selfFeedback,
        achievements,
        status: 'SELF_REVIEW',
        submittedAt: new Date(),
      },
    });
  }

  /**
   * Submit manager review
   */
  static async submitManagerReview(
    reviewId: string,
    rating: number,
    feedback: string,
    goals?: string
  ) {
    return prisma.performanceReview.update({
      where: { id: reviewId },
      data: {
        rating,
        feedback,
        goals,
        status: 'MANAGER_REVIEW',
      },
    });
  }

  /**
   * Approve review
   */
  static async approveReview(
    reviewId: string
  ) {
    return prisma.performanceReview.update({
      where: { id: reviewId },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
      },
    });
  }

  /**
   * Get employee goals
   */
  static async getEmployeeGoals(
    employeeId: string,
    reviewCycleId?: string
  ) {
    const where: any = { employeeId };

    if (reviewCycleId) {
      where.reviewCycleId = reviewCycleId;
    }

    return prisma.goal.findMany({
      where,
      include: {
        reviewCycle: true,
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  /**
   * Get employee reviews
   */
  static async getEmployeeReviews(
    employeeId: string,
    reviewCycleId?: string
  ) {
    const where: any = { employeeId };

    if (reviewCycleId) {
      where.reviewCycleId = reviewCycleId;
    }

    return prisma.performanceReview.findMany({
      where,
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        reviewCycle: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

