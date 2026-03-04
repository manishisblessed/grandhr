import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '../utils/jwt.util';
import { AuthRequest } from '../middleware/auth.middleware';
import { z } from 'zod';
import { sendEmail } from '../utils/email.util';

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

    await sendEmail(
      user.email,
      'GrandHR - Reset Your Password',
      `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f7fa; }
          .wrapper { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .card { background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%); padding: 40px 30px; text-align: center; }
          .header img { width: 48px; height: 48px; border-radius: 12px; margin-bottom: 12px; }
          .header h1 { color: #fff; margin: 0; font-size: 24px; font-weight: 700; }
          .header p { color: rgba(255,255,255,0.7); margin: 8px 0 0; font-size: 14px; }
          .body { padding: 40px 30px; }
          .body h2 { color: #1e293b; margin: 0 0 16px; font-size: 20px; }
          .body p { color: #475569; margin: 0 0 16px; font-size: 15px; }
          .btn { display: inline-block; padding: 14px 36px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px; margin: 20px 0; }
          .note { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 20px 0; font-size: 13px; color: #92400e; }
          .footer { text-align: center; padding: 24px 30px; border-top: 1px solid #e2e8f0; }
          .footer p { color: #94a3b8; font-size: 12px; margin: 4px 0; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="card">
            <div class="header">
              <h1>GrandHR</h1>
              <p>Password Reset Request</p>
            </div>
            <div class="body">
              <h2>Hello, ${userName}!</h2>
              <p>We received a request to reset the password for your GrandHR account. Click the button below to set a new password:</p>
              <div style="text-align: center;">
                <a href="${resetLink}" class="btn">Reset My Password</a>
              </div>
              <div class="note">
                This link will expire in <strong>1 hour</strong>. If you didn't request this, you can safely ignore this email.
              </div>
              <p style="font-size: 13px; color: #94a3b8;">If the button doesn't work, copy and paste this link into your browser:<br/><a href="${resetLink}" style="color: #6366f1; word-break: break-all;">${resetLink}</a></p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} GrandHR. All rights reserved.</p>
              <p>E-Block, Shiv Ram Park, Nangloi, New Delhi-110041</p>
              <p>Made by <a href="https://www.shahworks.com/" style="color: #6366f1; text-decoration: none;">Shah Works</a></p>
            </div>
          </div>
        </div>
      </body>
      </html>
      `
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

    // Send confirmation email
    await sendEmail(
      user.email,
      'GrandHR - Password Changed Successfully',
      `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f7fa; }
          .wrapper { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .card { background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #059669, #10b981); padding: 40px 30px; text-align: center; }
          .header h1 { color: #fff; margin: 0; font-size: 24px; }
          .body { padding: 40px 30px; }
          .body p { color: #475569; margin: 0 0 16px; font-size: 15px; }
          .alert { background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 20px 0; font-size: 13px; color: #991b1b; }
          .footer { text-align: center; padding: 24px 30px; border-top: 1px solid #e2e8f0; }
          .footer p { color: #94a3b8; font-size: 12px; margin: 4px 0; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="card">
            <div class="header">
              <h1>Password Changed Successfully</h1>
            </div>
            <div class="body">
              <p>Your GrandHR account password has been changed successfully.</p>
              <p>If you did not make this change, please take immediate action:</p>
              <div class="alert">
                Contact us immediately at <strong>support@grandhr.in</strong> or call <strong>+91-9090702705</strong> if you did not authorize this change.
              </div>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} GrandHR. All rights reserved.</p>
              <p>Made by <a href="https://www.shahworks.com/" style="color: #6366f1; text-decoration: none;">Shah Works</a></p>
            </div>
          </div>
        </div>
      </body>
      </html>
      `
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

    await sendEmail(
      user.email,
      'GrandHR - Your Account Details',
      `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f7fa; }
          .wrapper { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .card { background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 40px 30px; text-align: center; }
          .header h1 { color: #fff; margin: 0; font-size: 24px; }
          .body { padding: 40px 30px; }
          .body p { color: #475569; margin: 0 0 16px; font-size: 15px; }
          .info-box { background: #f0f9ff; border-left: 4px solid #6366f1; padding: 16px 20px; border-radius: 0 10px 10px 0; margin: 20px 0; }
          .info-box .label { font-size: 12px; color: #6366f1; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
          .info-box .value { font-size: 18px; color: #1e293b; font-weight: 700; margin-top: 4px; }
          .btn { display: inline-block; padding: 14px 36px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; text-decoration: none; border-radius: 10px; font-weight: 600; }
          .footer { text-align: center; padding: 24px 30px; border-top: 1px solid #e2e8f0; }
          .footer p { color: #94a3b8; font-size: 12px; margin: 4px 0; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="card">
            <div class="header">
              <h1>GrandHR - Your Account Details</h1>
            </div>
            <div class="body">
              <p>Hello ${userName},</p>
              <p>You requested your login details for GrandHR. Here they are:</p>
              <div class="info-box">
                <div class="label">Your Login Email</div>
                <div class="value">${user.email}</div>
              </div>
              ${user.employee?.employeeId ? `
              <div class="info-box">
                <div class="label">Employee ID</div>
                <div class="value">${user.employee.employeeId}</div>
              </div>
              ` : ''}
              <div class="info-box">
                <div class="label">Account Role</div>
                <div class="value">${user.role.replace('_', ' ')}</div>
              </div>
              <p>If you've also forgotten your password, you can reset it from the login page.</p>
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/hr/login" class="btn">Go to Login</a>
              </div>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} GrandHR. All rights reserved.</p>
              <p>E-Block, Shiv Ram Park, Nangloi, New Delhi-110041</p>
              <p>Made by <a href="https://www.shahworks.com/" style="color: #6366f1; text-decoration: none;">Shah Works</a></p>
            </div>
          </div>
        </div>
      </body>
      </html>
      `
    );

    res.json({ message: 'If an account with that email exists, the login details have been sent.' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

