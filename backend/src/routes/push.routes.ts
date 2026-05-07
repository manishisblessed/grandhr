import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { blastLimiter } from '../middleware/rateLimiter.middleware';
import {
  getPushPublicKey,
  getPushStatus,
  sendTestPush,
  subscribePush,
  unsubscribePush,
} from '../controllers/push.controller';

const router = express.Router();

// Public key is needed before login (theoretically), but pinning to authenticated
// users keeps it simple and there's no cost to that.
router.use(authenticate);

router.get('/public-key', getPushPublicKey);
router.get('/status', getPushStatus);
router.post('/subscribe', subscribePush);
router.post('/unsubscribe', unsubscribePush);
router.post('/test', blastLimiter, sendTestPush);

export default router;
