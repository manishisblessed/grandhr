import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { blastLimiter } from '../middleware/rateLimiter.middleware';
import {
  listEmailTemplates,
  previewEmailTemplate,
  sendTestEmailTemplate,
} from '../controllers/emailTemplate.controller';

const router = express.Router();

router.use(authenticate);

const HR_ROLES = ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR', 'MANAGER'] as const;

router.get('/', authorize(...HR_ROLES), listEmailTemplates);
router.post('/:key/preview', authorize(...HR_ROLES), previewEmailTemplate);
router.post('/:key/test', authorize(...HR_ROLES), blastLimiter, sendTestEmailTemplate);

export default router;
