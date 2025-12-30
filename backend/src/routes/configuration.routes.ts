import express from 'express';
import {
  getConfigurations,
  getConfiguration,
  upsertConfiguration,
  deleteConfiguration,
} from '../controllers/configuration.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', authenticate, getConfigurations);
router.get('/:key', authenticate, getConfiguration);
router.post('/', authenticate, upsertConfiguration);
router.put('/:key', authenticate, upsertConfiguration);
router.delete('/:key', authenticate, deleteConfiguration);

export default router;

