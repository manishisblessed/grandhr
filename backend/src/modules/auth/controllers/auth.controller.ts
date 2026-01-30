import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { RoleService } from '../services/role.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  companyId: z.string().optional(),
  role: z.enum(['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR', 'MANAGER', 'EMPLOYEE']).optional(),
  employeeId: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const inviteUserSchema = z.object({
  email: z.string().email(),
  role: z.enum(['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR', 'MANAGER', 'EMPLOYEE']),
  permissions: z.array(z.string()).optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8),
});

/**
 * Register new user
 */
export const register = async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);

    const result = await AuthService.register(data);

    res.status(201).json({
      message: 'User registered successfully',
      token: result.token,
      refreshToken: result.refreshToken,
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        companyId: result.user.companyId,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors,
      });
    }
    res.status(400).json({ message: error.message || 'Registration failed' });
  }
};

/**
 * Login user
 */
export const login = async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);

    const result = await AuthService.login(data.email, data.password);

    res.json({
      message: 'Login successful',
      ...result,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors,
      });
    }
    res.status(401).json({ message: error.message || 'Login failed' });
  }
};

/**
 * Refresh access token
 */
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token required' });
    }

    const result = await AuthService.refreshToken(refreshToken);

    res.json({
      message: 'Token refreshed successfully',
      ...result,
    });
  } catch (error: any) {
    res.status(401).json({ message: error.message || 'Token refresh failed' });
  }
};

/**
 * Logout user
 */
export const logout = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    await AuthService.logout(userId);

    res.json({ message: 'Logged out successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Logout failed' });
  }
};

/**
 * Get current user profile
 */
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        employee: true,
        company: true,
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const permissions = await AuthService.getUserPermissions(userId);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        company: user.company,
        employee: user.employee,
        permissions,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch profile' });
  }
};

/**
 * Invite user to company
 */
export const inviteUser = async (req: AuthRequest, res: Response) => {
  try {
    const data = inviteUserSchema.parse(req.body);
    const companyId = req.companyId!;
    const invitedBy = req.userId!;

    const user = await AuthService.inviteUser({
      ...data,
      companyId,
      invitedBy,
      permissions: data.permissions as any,
    });

    res.status(201).json({
      message: 'User invited successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors,
      });
    }
    res.status(400).json({ message: error.message || 'Invitation failed' });
  }
};

/**
 * Change password
 */
export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const data = changePasswordSchema.parse(req.body);
    const userId = req.userId!;

    await AuthService.changePassword(
      userId,
      data.currentPassword,
      data.newPassword
    );

    res.json({ message: 'Password changed successfully' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors,
      });
    }
    res.status(400).json({ message: error.message || 'Password change failed' });
  }
};

/**
 * Reset password (for invited users)
 */
export const resetPassword = async (req: AuthRequest, res: Response) => {
  try {
    const data = resetPasswordSchema.parse(req.body);
    const userId = req.userId!;

    await AuthService.resetPassword(userId, data.newPassword);

    res.json({ message: 'Password reset successfully' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors,
      });
    }
    res.status(400).json({ message: error.message || 'Password reset failed' });
  }
};

