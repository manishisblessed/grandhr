import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  getSuperAdminDashboard,
  getAllCompanies,
  getCompanyDetails,
  toggleCompanyStatus,
  deleteCompany,
  getAllUsers,
  toggleUserStatus,
  updateUserRole,
  getGlobalStats,
  getAllSubscriptions,
} from '../controllers/superAdmin.controller';

const router = express.Router();

router.use(authenticate, authorize('SUPER_ADMIN'));

router.get('/dashboard', getSuperAdminDashboard);
router.get('/companies', getAllCompanies);
router.get('/companies/:id', getCompanyDetails);
router.put('/companies/:id/toggle', toggleCompanyStatus);
router.delete('/companies/:id', deleteCompany);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle', toggleUserStatus);
router.put('/users/:id/role', updateUserRole);
router.get('/stats', getGlobalStats);
router.get('/subscriptions', getAllSubscriptions);

export default router;
