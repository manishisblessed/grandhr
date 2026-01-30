import express from 'express';
import {
  saveDocument,
  getMyDocuments,
  getDocument,
  deleteDocument,
  getDocumentStats,
} from '../controllers/generatedDocument.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.post('/', saveDocument);
router.get('/', getMyDocuments);
router.get('/stats', getDocumentStats);
router.get('/:id', getDocument);
router.delete('/:id', deleteDocument);

export default router;

