import api from './api';
import { Notification } from '../types';

export const NotificationService = {
  getAll: () => api.get<Notification[]>('/notifications'),

  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),

  markAllAsRead: () => api.put('/notifications/read-all'),

  delete: (id: string) => api.delete(`/notifications/${id}`),

  clearAll: () => api.delete('/notifications'),
};
