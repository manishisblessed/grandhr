import express from 'express';
import {
  getAutomationJobs,
  createAutomationJob,
  runAutomationJob,
  toggleAutomationJob,
  deleteAutomationJob,
} from '../controllers/automation.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', authenticate, getAutomationJobs);
router.post('/', authenticate, createAutomationJob);
router.post('/:id/run', authenticate, runAutomationJob);
router.patch('/:id/toggle', authenticate, toggleAutomationJob);
router.delete('/:id', authenticate, deleteAutomationJob);

export default router;

