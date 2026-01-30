import { PrismaClient, Role, Permission, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

export class RoleService {
  /**
   * Create a new role
   */
  static async createRole(data: {
    companyId?: string;
    name: string;
    description?: string;
    permissions: Permission[];
  }): Promise<Role> {
    // Check if role exists
    const existing = await prisma.role.findFirst({
      where: {
        companyId: data.companyId || null,
        name: data.name,
      },
    });

    if (existing) {
      throw new Error('Role already exists');
    }

    return prisma.role.create({
      data: {
        companyId: data.companyId,
        name: data.name,
        description: data.description,
        permissions: data.permissions,
      },
    });
  }

  /**
   * Get all roles for a company
   */
  static async getRoles(companyId?: string): Promise<Role[]> {
    return prisma.role.findMany({
      where: {
        companyId: companyId || null,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get role by ID
   */
  static async getRoleById(roleId: string): Promise<Role | null> {
    return prisma.role.findUnique({
      where: { id: roleId },
    });
  }

  /**
   * Update role
   */
  static async updateRole(
    roleId: string,
    data: {
      name?: string;
      description?: string;
      permissions?: Permission[];
      isActive?: boolean;
    }
  ): Promise<Role> {
    return prisma.role.update({
      where: { id: roleId },
      data,
    });
  }

  /**
   * Delete role (soft delete)
   */
  static async deleteRole(roleId: string): Promise<void> {
    await prisma.role.update({
      where: { id: roleId },
      data: { isActive: false },
    });
  }

  /**
   * Assign role to user
   */
  static async assignRoleToUser(data: {
    userId: string;
    roleId: string;
    permissions?: Permission[];
    grantedBy: string;
    expiresAt?: Date;
  }): Promise<void> {
    await prisma.userRolePermission.create({
      data: {
        userId: data.userId,
        roleId: data.roleId,
        permissions: data.permissions || [],
        grantedBy: data.grantedBy,
        expiresAt: data.expiresAt,
      },
    });
  }

  /**
   * Update user permissions
   */
  static async updateUserPermissions(
    userId: string,
    permissions: Permission[],
    grantedBy: string
  ): Promise<void> {
    const existing = await prisma.userRolePermission.findFirst({
      where: { userId },
    });

    if (existing) {
      await prisma.userRolePermission.update({
        where: { id: existing.id },
        data: {
          permissions,
          grantedBy,
        },
      });
    } else {
      await prisma.userRolePermission.create({
        data: {
          userId,
          permissions,
          grantedBy,
        },
      });
    }
  }

  /**
   * Get default permissions for a role
   */
  static getDefaultPermissions(role: UserRole): Permission[] {
    const permissionMap: Record<UserRole, Permission[]> = {
      [UserRole.SUPER_ADMIN]: [
        // All permissions
        Permission.EMPLOYEE_VIEW,
        Permission.EMPLOYEE_CREATE,
        Permission.EMPLOYEE_UPDATE,
        Permission.EMPLOYEE_DELETE,
        Permission.EMPLOYEE_EXPORT,
        Permission.ATTENDANCE_VIEW,
        Permission.ATTENDANCE_CREATE,
        Permission.ATTENDANCE_UPDATE,
        Permission.ATTENDANCE_DELETE,
        Permission.ATTENDANCE_APPROVE,
        Permission.LEAVE_VIEW,
        Permission.LEAVE_CREATE,
        Permission.LEAVE_UPDATE,
        Permission.LEAVE_APPROVE,
        Permission.LEAVE_REJECT,
        Permission.PAYROLL_VIEW,
        Permission.PAYROLL_CREATE,
        Permission.PAYROLL_UPDATE,
        Permission.PAYROLL_PROCESS,
        Permission.PAYROLL_LOCK,
        Permission.RECRUITMENT_VIEW,
        Permission.RECRUITMENT_CREATE,
        Permission.RECRUITMENT_UPDATE,
        Permission.RECRUITMENT_DELETE,
        Permission.PERFORMANCE_VIEW,
        Permission.PERFORMANCE_CREATE,
        Permission.PERFORMANCE_UPDATE,
        Permission.PERFORMANCE_APPROVE,
        Permission.COMPANY_VIEW,
        Permission.COMPANY_UPDATE,
        Permission.COMPANY_DELETE,
        Permission.SETTINGS_VIEW,
        Permission.SETTINGS_UPDATE,
      ],
      [UserRole.COMPANY_ADMIN]: [
        Permission.EMPLOYEE_VIEW,
        Permission.EMPLOYEE_CREATE,
        Permission.EMPLOYEE_UPDATE,
        Permission.EMPLOYEE_DELETE,
        Permission.EMPLOYEE_EXPORT,
        Permission.ATTENDANCE_VIEW,
        Permission.ATTENDANCE_CREATE,
        Permission.ATTENDANCE_UPDATE,
        Permission.ATTENDANCE_DELETE,
        Permission.ATTENDANCE_APPROVE,
        Permission.LEAVE_VIEW,
        Permission.LEAVE_CREATE,
        Permission.LEAVE_UPDATE,
        Permission.LEAVE_APPROVE,
        Permission.LEAVE_REJECT,
        Permission.PAYROLL_VIEW,
        Permission.PAYROLL_CREATE,
        Permission.PAYROLL_UPDATE,
        Permission.PAYROLL_PROCESS,
        Permission.PAYROLL_LOCK,
        Permission.RECRUITMENT_VIEW,
        Permission.RECRUITMENT_CREATE,
        Permission.RECRUITMENT_UPDATE,
        Permission.RECRUITMENT_DELETE,
        Permission.PERFORMANCE_VIEW,
        Permission.PERFORMANCE_CREATE,
        Permission.PERFORMANCE_UPDATE,
        Permission.PERFORMANCE_APPROVE,
        Permission.COMPANY_VIEW,
        Permission.COMPANY_UPDATE,
        Permission.SETTINGS_VIEW,
        Permission.SETTINGS_UPDATE,
      ],
      [UserRole.HR]: [
        Permission.EMPLOYEE_VIEW,
        Permission.EMPLOYEE_CREATE,
        Permission.EMPLOYEE_UPDATE,
        Permission.EMPLOYEE_EXPORT,
        Permission.ATTENDANCE_VIEW,
        Permission.ATTENDANCE_CREATE,
        Permission.ATTENDANCE_UPDATE,
        Permission.ATTENDANCE_APPROVE,
        Permission.LEAVE_VIEW,
        Permission.LEAVE_CREATE,
        Permission.LEAVE_UPDATE,
        Permission.LEAVE_APPROVE,
        Permission.LEAVE_REJECT,
        Permission.PAYROLL_VIEW,
        Permission.PAYROLL_CREATE,
        Permission.PAYROLL_UPDATE,
        Permission.RECRUITMENT_VIEW,
        Permission.RECRUITMENT_CREATE,
        Permission.RECRUITMENT_UPDATE,
        Permission.PERFORMANCE_VIEW,
        Permission.PERFORMANCE_CREATE,
        Permission.PERFORMANCE_UPDATE,
      ],
      [UserRole.MANAGER]: [
        Permission.EMPLOYEE_VIEW,
        Permission.ATTENDANCE_VIEW,
        Permission.ATTENDANCE_APPROVE,
        Permission.LEAVE_VIEW,
        Permission.LEAVE_APPROVE,
        Permission.LEAVE_REJECT,
        Permission.PERFORMANCE_VIEW,
        Permission.PERFORMANCE_CREATE,
        Permission.PERFORMANCE_UPDATE,
        Permission.PERFORMANCE_APPROVE,
      ],
      [UserRole.EMPLOYEE]: [
        Permission.EMPLOYEE_VIEW,
        Permission.ATTENDANCE_VIEW,
        Permission.ATTENDANCE_CREATE,
        Permission.LEAVE_VIEW,
        Permission.LEAVE_CREATE,
      ],
    };

    return permissionMap[role] || [];
  }
}

