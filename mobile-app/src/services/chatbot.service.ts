import api from './api';

export interface ChatBot {
  type: string;
  name: string;
  description: string;
  icon: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  message: string;
  suggestions?: string[];
  timestamp: Date;
}

export const ChatbotService = {
  getAvailable: () => api.get<{ chatbots: ChatBot[] }>('/chatbot'),

  sendMessage: (chatbotType: string, message: string) =>
    api.post<{
      response: {
        message: string;
        suggestions?: string[];
        actionRequired?: boolean;
        actionType?: string;
        actionData?: any;
      };
    }>('/chatbot/message', { chatbotType, message }),
};
