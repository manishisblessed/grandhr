import { PrismaClient, EmploymentStatus, LifecycleEventType } from '@prisma/client';

const prisma = new PrismaClient();

export class EmployeeLifecycleService {
  /**
   * Start probation
   */
  static async startProbation(
    employeeId: string,
    probationEndDate: Date,
    initiatedBy: string
  ) {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new Error('Employee not found');
    }

    // Update employee
    const updated = await prisma.employee.update({
      where: { id: employeeId },
      data: {
        employmentStatus: EmploymentStatus.PROBATION,
        probationEndDate,
      },
    });

    // Create lifecycle event
    await prisma.employeeLifecycleEvent.create({
      data: {
        employeeId,
        eventType: LifecycleEventType.PROBATION_START,
        eventDate: new Date(),
        newValue: { probationEndDate },
        initiatedBy,
        status: 'APPROVED',
      },
    });

    return updated;
  }

  /**
   * Confirm employee (end probation)
   */
  static async confirmEmployee(
    employeeId: string,
    confirmationDate: Date,
    approvedBy: string
  ) {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new Error('Employee not found');
    }

    const previousStatus = employee.employmentStatus;

    // Update employee
    const updated = await prisma.employee.update({
      where: { id: employeeId },
      data: {
        employmentStatus: EmploymentStatus.CONFIRMED,
        confirmationDate,
      },
    });

    // Create lifecycle event
    await prisma.employeeLifecycleEvent.create({
      data: {
        employeeId,
        eventType: LifecycleEventType.CONFIRMATION,
        eventDate: confirmationDate,
        previousValue: { status: previousStatus },
        newValue: { status: EmploymentStatus.CONFIRMED },
        approvedBy,
        approvedAt: new Date(),
        status: 'APPROVED',
      },
    });

    return updated;
  }

  /**
   * Transfer employee
   */
  static async transferEmployee(
    employeeId: string,
    data: {
      newDepartmentId?: string;
      newLocationId?: string;
      newDesignationId?: string;
      transferDate: Date;
      reason?: string;
    },
    initiatedBy: string
  ) {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new Error('Employee not found');
    }

    const previousValue = {
      departmentId: employee.departmentId,
      locationId: employee.locationId,
      designationId: employee.designationId,
    };

    // Update employee
    const updated = await prisma.employee.update({
      where: { id: employeeId },
      data: {
        departmentId: data.newDepartmentId || employee.departmentId,
        locationId: data.newLocationId || employee.locationId,
        designationId: data.newDesignationId || employee.designationId,
      },
    });

    // Create lifecycle event
    await prisma.employeeLifecycleEvent.create({
      data: {
        employeeId,
        eventType: LifecycleEventType.TRANSFER,
        eventDate: data.transferDate,
        previousValue,
        newValue: {
          departmentId: updated.departmentId,
          locationId: updated.locationId,
          designationId: updated.designationId,
        },
        reason: data.reason,
        initiatedBy,
        status: 'PENDING',
      },
    });

    return updated;
  }

  /**
   * Promote employee
   */
  static async promoteEmployee(
    employeeId: string,
    data: {
      newDesignationId: string;
      newSalary?: number;
      promotionDate: Date;
      reason?: string;
    },
    initiatedBy: string
  ) {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new Error('Employee not found');
    }

    const previousValue = {
      designationId: employee.designationId,
      salary: employee.salary,
    };

    // Update employee
    const updated = await prisma.employee.update({
      where: { id: employeeId },
      data: {
        designationId: data.newDesignationId,
        salary: data.newSalary || employee.salary,
      },
    });

    // Create lifecycle event
    await prisma.employeeLifecycleEvent.create({
      data: {
        employeeId,
        eventType: LifecycleEventType.PROMOTION,
        eventDate: data.promotionDate,
        previousValue,
        newValue: {
          designationId: updated.designationId,
          salary: updated.salary,
        },
        reason: data.reason,
        initiatedBy,
        status: 'PENDING',
      },
    });

    return updated;
  }

  /**
   * Process resignation
   */
  static async processResignation(
    employeeId: string,
    data: {
      resignationDate: Date;
      lastWorkingDate: Date;
      reason?: string;
    },
    initiatedBy: string
  ) {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new Error('Employee not found');
    }

    // Update employee
    const updated = await prisma.employee.update({
      where: { id: employeeId },
      data: {
        employmentStatus: EmploymentStatus.RESIGNED,
        exitDate: data.lastWorkingDate,
        exitReason: data.reason,
        isActive: false,
      },
    });

    // Create lifecycle event
    await prisma.employeeLifecycleEvent.create({
      data: {
        employeeId,
        eventType: LifecycleEventType.RESIGNATION,
        eventDate: data.resignationDate,
        newValue: {
          lastWorkingDate: data.lastWorkingDate,
          reason: data.reason,
        },
        reason: data.reason,
        initiatedBy,
        status: 'APPROVED',
      },
    });

    return updated;
  }

  /**
   * Terminate employee
   */
  static async terminateEmployee(
    employeeId: string,
    data: {
      terminationDate: Date;
      reason: string;
    },
    initiatedBy: string
  ) {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new Error('Employee not found');
    }

    // Update employee
    const updated = await prisma.employee.update({
      where: { id: employeeId },
      data: {
        employmentStatus: EmploymentStatus.TERMINATED,
        exitDate: data.terminationDate,
        exitReason: data.reason,
        isActive: false,
      },
    });

    // Create lifecycle event
    await prisma.employeeLifecycleEvent.create({
      data: {
        employeeId,
        eventType: LifecycleEventType.TERMINATION,
        eventDate: data.terminationDate,
        newValue: {
          reason: data.reason,
        },
        reason: data.reason,
        initiatedBy,
        status: 'APPROVED',
      },
    });

    return updated;
  }

  /**
   * Get employee lifecycle history
   */
  static async getLifecycleHistory(employeeId: string) {
    return prisma.employeeLifecycleEvent.findMany({
      where: { employeeId },
      orderBy: { eventDate: 'desc' },
    });
  }

  /**
   * Approve lifecycle event
   */
  static async approveLifecycleEvent(
    eventId: string,
    approvedBy: string
  ) {
    return prisma.employeeLifecycleEvent.update({
      where: { id: eventId },
      data: {
        status: 'APPROVED',
        approvedBy,
        approvedAt: new Date(),
      },
    });
  }
}

