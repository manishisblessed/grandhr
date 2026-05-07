import api, { unwrap } from './client';

export const notificationsApi = {
  list: (params = {}) => api.get('/notifications', { params }).then(unwrap),
  unreadCount: () => api.get('/notifications/unread-count').then(unwrap).catch(() => ({ count: 0 })),
  markAsRead: (id) => api.post(`/notifications/${id}/read`).then(unwrap),
  markAllAsRead: () => api.post('/notifications/read-all').then(unwrap),
};
