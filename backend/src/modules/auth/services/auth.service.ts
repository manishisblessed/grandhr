import { PrismaClient, User, UserRole, Permission } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export interface TokenPayload {
  userId: string;
  companyId?: string;
  role: UserRole;
  permissions?: Permission[];
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
    companyId?: string;
    permissions: Permission[];
  };
}

export class AuthService {
  /**
   * Register a new user with company scope
   */
  static async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    companyId?: string;
    role?: UserRole;
    employeeId?: string;
  }): Promise<{ user: User; token: string; refreshToken: string }> {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Generate employee ID if not provided
    const empId = data.employeeId || `EMP${Date.now()}`;

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        role: data.role || UserRole.EMPLOYEE,
        companyId: data.companyId,
        employee: {
          create: {
            employeeId: empId,
            firstName: data.firstName,
            lastName: data.lastName,
            companyId: data.companyId,
          },
        },
      },
      include: {
        employee: true,
      },
    });

    // Get user permissions
    const permissions = await this.getUserPermissions(user.id);

    // Generate tokens
    const token = this.generateToken({
      userId: user.id,
      companyId: user.companyId || undefined,
      role: user.role,
      permissions,
    });

    const refreshToken = this.generateRefreshToken(user.id);

    // Update user with refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return { user, token, refreshToken };
  }

  /**
   * Login user with company scope
   */
  static async login(
    email: string,
    password: string
  ): Promise<LoginResponse> {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        employee: true,
        company: true,
      },
    });

    if (!user || !user.isActive) {
      throw new Error('Invalid credentials or account inactive');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Get user permissions
    const permissions = await this.getUserPermissions(user.id);

    // Generate tokens
    const token = this.generateToken({
      userId: user.id,
      companyId: user.companyId || undefined,
      role: user.role,
      permissions,
    });

    const refreshToken = this.generateRefreshToken(user.id);

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken,
        lastLogin: new Date(),
      },
    });

    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId || undefined,
        permissions,
      },
    };
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string): Promise<{
    token: string;
    refreshToken: string;
  }> {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || 'refresh_secret'
      ) as { userId: string };

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || user.refreshToken !== refreshToken || !user.isActive) {
        throw new Error('Invalid refresh token');
      }

      // Get user permissions
      const permissions = await this.getUserPermissions(user.id);

      // Generate new tokens
      const newToken = this.generateToken({
        userId: user.id,
        companyId: user.companyId || undefined,
        role: user.role,
        permissions,
      });

      const newRefreshToken = this.generateRefreshToken(user.id);

      // Update user
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: newRefreshToken },
      });

      return {
        token: newToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Invite user to company
   */
  static async inviteUser(data: {
    email: string;
    companyId: string;
    role: UserRole;
    invitedBy: string;
    permissions?: Permission[];
  }): Promise<User> {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-12);
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    // Create invited user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        role: data.role,
        companyId: data.companyId,
        invited: true,
        invitedBy: data.invitedBy,
        invitedAt: new Date(),
      },
    });

    // Assign role and permissions if provided
    if (data.permissions && data.permissions.length > 0) {
      await prisma.userRolePermission.create({
        data: {
          userId: user.id,
          permissions: data.permissions,
          grantedBy: data.invitedBy,
        },
      });
    }

    // TODO: Send invitation email with temporary password

    return user;
  }

  /**
   * Get user permissions (from role + direct permissions)
   */
  static async getUserPermissions(userId: string): Promise<Permission[]> {
    const userRolePermission = await prisma.userRolePermission.findFirst({
      where: { userId },
      include: { role: true },
    });

    const permissions: Permission[] = [];

    // Get permissions from role
    if (userRolePermission?.role) {
      permissions.push(...userRolePermission.role.permissions);
    }

    // Get direct permissions
    if (userRolePermission?.permissions) {
      permissions.push(...userRolePermission.permissions);
    }

    // Remove duplicates
    return Array.from(new Set(permissions));
  }

  /**
   * Generate JWT access token
   */
  static generateToken(payload: TokenPayload): string {
    const secret = process.env.JWT_SECRET || 'secret';
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

    return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(userId: string): string {
    const secret = process.env.JWT_REFRESH_SECRET || 'refresh_secret';
    const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

    return jwt.sign({ userId }, secret, { expiresIn } as jwt.SignOptions);
  }

  /**
   * Verify token
   */
  static verifyToken(token: string): TokenPayload {
    const secret = process.env.JWT_SECRET || 'secret';
    return jwt.verify(token, secret) as TokenPayload;
  }

  /**
   * Logout user (invalidate refresh token)
   */
  static async logout(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  /**
   * Change password
   */
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  /**
   * Reset password (for invited users)
   */
  static async resetPassword(
    userId: string,
    newPassword: string
  ): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        invited: false,
      },
    });
  }
}

