import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class RecruitmentService {
  /**
   * Create job requisition
   */
  static async createJobRequisition(data: {
    companyId: string;
    title: string;
    department?: string;
    location?: string;
    jobType: string;
    experience?: string;
    description?: string;
    requirements?: string;
    openings: number;
    createdBy: string;
  }) {
    return prisma.jobRequisition.create({
      data: {
        ...data,
        status: 'OPEN',
        filled: 0,
      },
    });
  }

  /**
   * Add candidate
   */
  static async addCandidate(data: {
    companyId: string;
    jobRequisitionId?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    resumeUrl?: string;
    coverLetter?: string;
    source?: string;
    experience?: number;
    currentSalary?: number;
    expectedSalary?: number;
    noticePeriod?: number;
  }) {
    return prisma.candidate.create({
      data: {
        ...data,
        currentStage: 'APPLIED',
        status: 'ACTIVE',
      },
    });
  }

  /**
   * Move candidate to next stage
   */
  static async moveCandidateToStage(
    candidateId: string,
    newStage: string,
    changedBy: string,
    notes?: string
  ) {
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
      throw new Error('Candidate not found');
    }

    const oldStage = candidate.currentStage;

    // Update candidate
    const updated = await prisma.candidate.update({
      where: { id: candidateId },
      data: { currentStage: newStage },
    });

    // Create stage history
    await prisma.candidateStageHistory.create({
      data: {
        candidateId,
        fromStage: oldStage,
        toStage: newStage,
        changedBy,
        notes,
      },
    });

    return updated;
  }

  /**
   * Schedule interview
   */
  static async scheduleInterview(data: {
    candidateId: string;
    type: string;
    scheduledAt: Date;
    duration: number;
    interviewerIds: string[];
    location?: string;
    meetingLink?: string;
  }) {
    return prisma.interview.create({
      data: {
        ...data,
        status: 'SCHEDULED',
      },
    });
  }

  /**
   * Update interview feedback
   */
  static async updateInterviewFeedback(
    interviewId: string,
    feedback: string,
    rating: number,
    notes?: string
  ) {
    return prisma.interview.update({
      where: { id: interviewId },
      data: {
        feedback,
        rating,
        notes,
        status: 'COMPLETED',
      },
    });
  }

  /**
   * Convert candidate to employee
   */
  static async convertToEmployee(
    candidateId: string,
    employeeData: {
      employeeId: string;
      userId: string;
      companyId: string;
      firstName: string;
      lastName: string;
      joiningDate: Date;
      departmentId?: string;
      designationId?: string;
      locationId?: string;
      salary?: number;
    }
  ) {
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
      throw new Error('Candidate not found');
    }

    // Create employee
    const employee = await prisma.employee.create({
      data: {
        ...employeeData,
        employmentStatus: 'PROBATION',
      },
    });

    // Update candidate
    await prisma.candidate.update({
      where: { id: candidateId },
      data: {
        status: 'HIRED',
        currentStage: 'HIRED',
        convertedToEmployeeId: employee.id,
      },
    });

    // Update job requisition filled count
    if (candidate.jobRequisitionId) {
      const job = await prisma.jobRequisition.findUnique({
        where: { id: candidate.jobRequisitionId },
      });

      if (job) {
        await prisma.jobRequisition.update({
          where: { id: candidate.jobRequisitionId },
          data: {
            filled: job.filled + 1,
            status: job.filled + 1 >= job.openings ? 'FILLED' : job.status,
          },
        });
      }
    }

    return employee;
  }

  /**
   * Get candidates by stage
   */
  static async getCandidatesByStage(
    companyId: string,
    stage?: string,
    jobRequisitionId?: string
  ) {
    const where: any = { companyId };

    if (stage) {
      where.currentStage = stage;
    }

    if (jobRequisitionId) {
      where.jobRequisitionId = jobRequisitionId;
    }

    return prisma.candidate.findMany({
      where,
      include: {
        jobRequisition: true,
        interviews: true,
        stageHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

