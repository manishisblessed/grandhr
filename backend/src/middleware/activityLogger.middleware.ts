import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from './auth.middleware';

const prisma = new PrismaClient();

/**
 * Activity Logger Middleware
 * Automatically logs all user actions for audit and analytics
 */
export const activityLogger = async (
  req: AuthRequest | Request,
  res: Response,
  next: NextFunction
) => {
  // Don't log health checks or static assets
  if (req.path === '/api/health' || req.path.startsWith('/static')) {
    return next();
  }

  // Get user info if authenticated
  const authReq = req as AuthRequest;
  const userId = authReq.userId;
  const companyId = authReq.companyId;

  // Extract action from request
  const action = getActionFromRequest(req);
  const entityType = getEntityTypeFromPath(req.path);
  const entityId = req.params.id || req.body?.id || req.query?.id || null;

  // Log activity asynchronously (don't block request)
  if (userId) {
    setImmediate(async () => {
      try {
        await prisma.activityLog.create({
          data: {
            userId,
            companyId: companyId || null,
            action,
            entityType: entityType || null,
            entityId: entityId || null,
            description: `${action} ${entityType || 'resource'}`,
            metadata: {
              method: req.method,
              path: req.path,
              query: req.query,
              body: sanitizeBody(req.body),
            },
            ipAddress: req.ip || req.socket.remoteAddress || null,
            userAgent: req.get('user-agent') || null,
            sessionId: req.headers['x-session-id'] as string || null,
          },
        });
      } catch (error) {
        // Don't fail request if logging fails
        console.error('Activity log error:', error);
      }
    });
  }

  next();
};

/**
 * Extract action type from HTTP method and path
 */
function getActionFromRequest(req: Request): string {
  const method = req.method.toUpperCase();
  const path = req.path.toLowerCase();

  // Map HTTP methods to actions
  if (method === 'GET') {
    if (path.includes('dashboard')) return 'VIEW_DASHBOARD';
    if (path.includes('list') || path.includes('search')) return 'VIEW_LIST';
    return 'VIEW';
  }
  if (method === 'POST') {
    if (path.includes('login')) return 'LOGIN';
    if (path.includes('register')) return 'REGISTER';
    if (path.includes('generate') || path.includes('document')) return 'GENERATE_DOCUMENT';
    if (path.includes('upload')) return 'UPLOAD';
    return 'CREATE';
  }
  if (method === 'PUT' || method === 'PATCH') {
    return 'UPDATE';
  }
  if (method === 'DELETE') {
    return 'DELETE';
  }

  return method;
}

/**
 * Extract entity type from path
 */
function getEntityTypeFromPath(path: string): string | null {
  const pathLower = path.toLowerCase();
  
  if (pathLower.includes('employee')) return 'EMPLOYEE';
  if (pathLower.includes('leave')) return 'LEAVE';
  if (pathLower.includes('attendance')) return 'ATTENDANCE';
  if (pathLower.includes('payroll')) return 'PAYROLL';
  if (pathLower.includes('document')) return 'DOCUMENT';
  if (pathLower.includes('review')) return 'PERFORMANCE_REVIEW';
  if (pathLower.includes('ticket')) return 'SUPPORT_TICKET';
  if (pathLower.includes('company')) return 'COMPANY';
  if (pathLower.includes('chatbot')) return 'CHATBOT';
  
  return null;
}

/**
 * Sanitize request body to remove sensitive data
 */
function sanitizeBody(body: any): any {
  if (!body) return null;
  
  const sanitized = { ...body };
  
  // Remove sensitive fields
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard', 'ssn'];
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
}

