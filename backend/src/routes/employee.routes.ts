import express from 'express';
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeesByDepartment,
  resendCredentials,
} from '../controllers/employee.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

const HR_ROLES = ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR'] as const;

router.get('/', authenticate, getAllEmployees);
router.get('/department/:department', authenticate, getEmployeesByDepartment);
router.get('/:id', authenticate, getEmployeeById);
router.post('/', authenticate, authorize(...HR_ROLES), createEmployee);
router.put('/:id', authenticate, authorize(...HR_ROLES), updateEmployee);
router.delete('/:id', authenticate, authorize(...HR_ROLES), deleteEmployee);
router.post('/:id/resend-credentials', authenticate, authorize(...HR_ROLES), resendCredentials);

export default router;

