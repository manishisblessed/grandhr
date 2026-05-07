import express from 'express';
import {
  clockIn,
  clockOut,
  getAttendance,
  getMyAttendance,
  getAttendanceByDate,
  updateAttendance,
  markAttendance,
} from '../controllers/attendance.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

const HR_ROLES = ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR', 'MANAGER'] as const;

router.post('/clock-in', authenticate, clockIn);
router.post('/clock-out', authenticate, clockOut);
router.get('/my-attendance', authenticate, getMyAttendance);
router.get('/employee/:employeeId', authenticate, authorize(...HR_ROLES), getAttendance);
router.get('/date/:date', authenticate, getAttendanceByDate);
router.post('/mark', authenticate, authorize('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR'), markAttendance);
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR'), updateAttendance);

export default router;

