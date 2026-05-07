import express from 'express';
import multer from 'multer';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  listTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  uploadTemplate,
  previewTemplate,
  sendTemplate,
} from '../controllers/template.controller';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

router.use(authenticate);

router.get('/', listTemplates);
router.get('/:id', getTemplate);
router.post('/', authorize('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR'), createTemplate);
router.put('/:id', authorize('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR'), updateTemplate);
router.delete('/:id', authorize('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR'), deleteTemplate);
router.post('/upload', authorize('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR'), upload.single('file'), uploadTemplate);
router.post('/:id/preview', previewTemplate);
router.post('/:id/send', authorize('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR'), sendTemplate);

export default router;
