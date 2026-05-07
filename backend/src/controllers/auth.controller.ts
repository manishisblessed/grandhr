import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '../utils/jwt.util';
import { AuthRequest } from '../middleware/auth.middleware';
import { z } from 'zod';
import { sendRenderedEmail } from '../utils/email.util';
import {
  renderAccountDetailsEmail,
  renderPasswordChangedEmail,
  renderPasswordResetEmail,
} from '../utils/email-templates';

const prisma = new PrismaClient();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  employeeId: z.string().optional(),
  role: z.enum(['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR', 'MANAGER', 'EMPLOYEE']).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const register = async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);
    const { email, password, firstName, lastName, employeeId, role } = data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate employee ID if not provided
    const empId = employeeId || `EMP${Date.now()}`;

    // Create user and employee
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: (role as any) || 'EMPLOYEE',
        employee: {
          create: {
            employeeId: empId,
            firstName,
            lastName,
          },
        },
      },
      include: { employee: true },
    });

    const token = generateToken(user.id, user.role);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        employee: user.employee,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: error.message || 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);
    const email = String(data.email).trim().toLowerCase();
    const { password } = data;

    // Find user (lookup with lowercase so casing never causes login to fail)
    const user = await prisma.user.findUnique({
      where: { email },
      include: { employee: true },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.isActive === false) {
      return res.status(403).json({ message: 'Your account has been deactivated. Please contact support@grandhr.in.' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user.id, user.role);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        employee: user.employee,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: error.message || 'Login failed' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { employee: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        employee: user.employee,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const updateData = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        employee: {
          update: {
            ...updateData,
          },
        },
      },
      include: { employee: true },
    });

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        employee: user.employee,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update profile' });
  }
};

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
      include: { employee: true },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
    }

    const secret = process.env.JWT_SECRET || 'secret';
    const resetToken = jwt.sign(
      { userId: user.id, purpose: 'password_reset' },
      secret,
      { expiresIn: '1h' }
    );

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;
    const userName = user.employee?.firstName || user.email;

    await sendRenderedEmail(
      user.email,
      renderPasswordResetEmail({ userName, resetLink, expiryLabel: '1 hour' }),
    );

    res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = resetPasswordSchema.parse(req.body);

    const secret = process.env.JWT_SECRET || 'secret';
    let decoded: any;
    try {
      decoded = jwt.verify(token, secret);
    } catch {
      return res.status(400).json({ message: 'Invalid or expired reset link. Please request a new one.' });
    }

    if (decoded.purpose !== 'password_reset') {
      return res.status(400).json({ message: 'Invalid reset token.' });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      return res.status(404).json({ message: 'Account not found.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: decoded.userId },
      data: { password: hashedPassword },
    });

    const userName = user.email.split('@')[0];
    await sendRenderedEmail(
      user.email,
      renderPasswordChangedEmail({
        userName,
        supportEmail: 'support@grandhr.in',
        supportPhone: '+91-9090702705',
      }),
    );

    res.json({ message: 'Password has been reset successfully. You can now log in with your new password.' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0]?.message || 'Validation error' });
    }
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

const forgotUsernameSchema = z.object({
  email: z.string().email(),
});

export const forgotUsername = async (req: Request, res: Response) => {
  try {
    const { email } = forgotUsernameSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
      include: { employee: true },
    });

    if (!user) {
      return res.json({ message: 'If an account with that email exists, the login details have been sent.' });
    }

    const userName = user.employee
      ? `${user.employee.firstName} ${user.employee.lastName}`
      : 'User';

    await sendRenderedEmail(
      user.email,
      renderAccountDetailsEmail({
        userName,
        email: user.email,
        employeeId: user.employee?.employeeId,
        role: user.role,
      }),
    );

    res.json({ message: 'If an account with that email exists, the login details have been sent.' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

