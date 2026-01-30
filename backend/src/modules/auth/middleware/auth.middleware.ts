import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { Permission } from '@prisma/client';

export interface AuthRequest extends Request {
  userId?: string;
  companyId?: string;
  userRole?: string;
  permissions?: Permission[];
}

/**
 * Authenticate user and attach user info to request
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = AuthService.verifyToken(token);
    req.userId = decoded.userId;
    req.companyId = decoded.companyId;
    req.userRole = decoded.role;
    req.permissions = decoded.permissions || [];

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

/**
 * Authorize by role
 */
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userRole) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.userRole)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};

/**
 * Authorize by permission (granular permission check)
 */
export const requirePermission = (...permissions: Permission[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!req.permissions || req.permissions.length === 0) {
      return res.status(403).json({ message: 'No permissions assigned' });
    }

    const hasPermission = permissions.some((permission) =>
      req.permissions?.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({
        message: 'Insufficient permissions',
        required: permissions,
        has: req.permissions,
      });
    }

    next();
  };
};

/**
 * Ensure user belongs to company (multi-tenant isolation)
 */
export const requireCompany = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.companyId) {
    return res.status(403).json({ message: 'Company context required' });
  }

  // If companyId is provided in params/body, verify it matches user's company
  const requestedCompanyId =
    req.params.companyId || req.body.companyId || req.query.companyId;

  if (requestedCompanyId && requestedCompanyId !== req.companyId) {
    return res.status(403).json({
      message: 'Access denied: Company mismatch',
    });
  }

  next();
};

/**
 * Combined middleware: authenticate + require company
 */
export const authenticateAndRequireCompany = [
  authenticate,
  requireCompany,
];

