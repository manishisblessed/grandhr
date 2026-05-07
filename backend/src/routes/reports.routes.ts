import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  getHeadcountReport,
  getAttendanceReport,
  getLeaveReport,
  getPayrollReport,
} from '../controllers/reports.controller';

const router = express.Router();

router.use(authenticate);

const HR_ROLES = ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR', 'MANAGER'] as const;

router.get('/headcount', authorize(...HR_ROLES), getHeadcountReport);
router.get('/attendance', authorize(...HR_ROLES), getAttendanceReport);
router.get('/leaves', authorize(...HR_ROLES), getLeaveReport);
router.get('/payroll', authorize(...HR_ROLES), getPayrollReport);

export default router;
