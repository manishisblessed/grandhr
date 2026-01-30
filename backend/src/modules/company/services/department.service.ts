import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class DepartmentService {
  /**
   * Create department
   */
  static async createDepartment(data: {
    companyId: string;
    name: string;
    code?: string;
    description?: string;
    parentId?: string;
    headId?: string;
  }) {
    // Check if code exists
    if (data.code) {
      const existing = await prisma.department.findFirst({
        where: {
          companyId: data.companyId,
          code: data.code,
        },
      });

      if (existing) {
        throw new Error('Department with this code already exists');
      }
    }

    return prisma.department.create({
      data,
    });
  }

  /**
   * Get departments for company (with hierarchy)
   */
  static async getDepartments(companyId: string) {
    const departments = await prisma.department.findMany({
      where: {
        companyId,
        isActive: true,
      },
      include: {
        parent: true,
        children: true,
        employees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeId: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Build hierarchy tree
    return this.buildHierarchy(departments);
  }

  /**
   * Build department hierarchy tree
   */
  private static buildHierarchy(departments: any[]) {
    const map = new Map();
    const roots: any[] = [];

    // Create map
    departments.forEach((dept) => {
      map.set(dept.id, { ...dept, children: [] });
    });

    // Build tree
    departments.forEach((dept) => {
      const node = map.get(dept.id);
      if (dept.parentId) {
        const parent = map.get(dept.parentId);
        if (parent) {
          parent.children.push(node);
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  /**
   * Get department by ID
   */
  static async getDepartmentById(departmentId: string) {
    return prisma.department.findUnique({
      where: { id: departmentId },
      include: {
        parent: true,
        children: true,
        employees: true,
      },
    });
  }

  /**
   * Update department
   */
  static async updateDepartment(departmentId: string, data: any) {
    return prisma.department.update({
      where: { id: departmentId },
      data,
    });
  }

  /**
   * Delete department (soft delete)
   */
  static async deleteDepartment(departmentId: string) {
    return prisma.department.update({
      where: { id: departmentId },
      data: { isActive: false },
    });
  }
}

