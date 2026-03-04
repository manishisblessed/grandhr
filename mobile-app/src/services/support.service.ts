import api from './api';

export interface SupportTicket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  replies?: TicketReply[];
}

export interface TicketReply {
  id: string;
  message: string;
  isInternal: boolean;
  createdAt: string;
  user?: { name?: string; email: string; role: string };
}

export const SupportService = {
  getAll: () => api.get<{ tickets: SupportTicket[] }>('/support'),

  getById: (id: string) =>
    api.get<{ ticket: SupportTicket }>(`/support/${id}`),

  create: (data: {
    title: string;
    description: string;
    category: string;
    priority: string;
  }) => api.post('/support', data),

  reply: (id: string, message: string) =>
    api.post(`/support/${id}/reply`, { message, isInternal: false }),

  updateStatus: (id: string, status: string, resolution?: string) =>
    api.patch(`/support/${id}/status`, { status, resolution }),
};
