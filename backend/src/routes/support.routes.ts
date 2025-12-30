import express from 'express';
import {
  getTickets,
  createTicket,
  getTicket,
  replyTicket,
  updateTicketStatus,
} from '../controllers/support.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', authenticate, getTickets);
router.post('/', authenticate, createTicket);
router.get('/:id', authenticate, getTicket);
router.post('/:id/reply', authenticate, replyTicket);
router.patch('/:id/status', authenticate, updateTicketStatus);

export default router;

