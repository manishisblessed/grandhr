import express from 'express';
import { RoleService } from '../services/role.service';
import { authenticate, authorize, requirePermission } from '../middleware/auth.middleware';
import { Permission } from '@prisma/client';
import { z } from 'zod';

const router = express.Router();

const createRoleSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  permissions: z.array(z.string()),
});

const updateRoleSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

/**
 * Get all roles
 */
router.get(
  '/',
  authenticate,
  requirePermission(Permission.SETTINGS_VIEW),
  async (req, res) => {
    try {
      const companyId = (req as any).companyId;
      const roles = await RoleService.getRoles(companyId);
      res.json({ roles });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * Get role by ID
 */
router.get(
  '/:id',
  authenticate,
  requirePermission(Permission.SETTINGS_VIEW),
  async (req, res) => {
    try {
      const role = await RoleService.getRoleById(req.params.id);
      if (!role) {
        return res.status(404).json({ message: 'Role not found' });
      }
      res.json({ role });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * Create role
 */
router.post(
  '/',
  authenticate,
  authorize('SUPER_ADMIN', 'COMPANY_ADMIN'),
  requirePermission(Permission.SETTINGS_UPDATE),
  async (req, res) => {
    try {
      const data = createRoleSchema.parse(req.body);
      const companyId = (req as any).companyId;

      const role = await RoleService.createRole({
        ...data,
        companyId,
        permissions: data.permissions as any,
      });

      res.status(201).json({
        message: 'Role created successfully',
        role,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Validation error',
          errors: error.errors,
        });
      }
      res.status(400).json({ message: error.message });
    }
  }
);

/**
 * Update role
 */
router.put(
  '/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'COMPANY_ADMIN'),
  requirePermission(Permission.SETTINGS_UPDATE),
  async (req, res) => {
    try {
      const data = updateRoleSchema.parse(req.body);
      const role = await RoleService.updateRole(req.params.id, {
        ...data,
        permissions: data.permissions as any,
      });

      res.json({
        message: 'Role updated successfully',
        role,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Validation error',
          errors: error.errors,
        });
      }
      res.status(400).json({ message: error.message });
    }
  }
);

/**
 * Delete role
 */
router.delete(
  '/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'COMPANY_ADMIN'),
  requirePermission(Permission.SETTINGS_UPDATE),
  async (req, res) => {
    try {
      await RoleService.deleteRole(req.params.id);
      res.json({ message: 'Role deleted successfully' });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
);

export default router;

