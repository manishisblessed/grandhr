import { Router } from 'express';
import { ChatbotController } from '../controllers/chatbot.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * Chatbot Routes
 * Made by Shah Works - www.shahworks.com
 */

// Get available chatbots
router.get('/', authenticate, ChatbotController.getAvailableChatbots);

// Process chatbot message
router.post('/message', authenticate, ChatbotController.processMessage);

export default router;

