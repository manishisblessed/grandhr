import { Request, Response } from 'express';
import { ChatbotService, ChatbotType } from '../services/chatbot.service';

/**
 * Chatbot Controller
 * Made by Shah Works - www.shahworks.com
 */

export class ChatbotController {
  /**
   * Process chatbot message
   */
  static async processMessage(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const companyId = (req as any).user?.companyId || null;
      const { chatbotType, message } = req.body;

      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      if (!message || !message.trim()) {
        return res.status(400).json({ message: 'Message is required' });
      }

      if (!chatbotType || !Object.values(ChatbotType).includes(chatbotType)) {
        return res.status(400).json({ message: 'Invalid chatbot type' });
      }

      const response = await ChatbotService.processMessage(
        userId,
        companyId,
        chatbotType as ChatbotType,
        message
      );

      res.json({
        success: true,
        response
      });
    } catch (error: any) {
      console.error('Chatbot controller error:', error);
      res.status(500).json({
        message: 'Failed to process message',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get available chatbots
   */
  static async getAvailableChatbots(req: Request, res: Response) {
    try {
      const chatbots = ChatbotService.getAvailableChatbots();
      res.json({
        success: true,
        chatbots
      });
    } catch (error: any) {
      console.error('Error getting chatbots:', error);
      res.status(500).json({
        message: 'Failed to get chatbots',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

