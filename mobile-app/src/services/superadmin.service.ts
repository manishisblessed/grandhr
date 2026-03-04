import api from './api';

export const SuperAdminService = {
  getDashboard: () => api.get('/super-admin/dashboard'),

  getCompanies: (params?: { page?: number; search?: string; status?: string }) =>
    api.get('/super-admin/companies', { params: { limit: 20, ...params } }),

  getCompanyById: (id: string) => api.get(`/super-admin/companies/${id}`),

  toggleCompany: (id: string) => api.put(`/super-admin/companies/${id}/toggle`),

  deleteCompany: (id: string) => api.delete(`/super-admin/companies/${id}`),

  getUsers: (params?: { page?: number; search?: string; role?: string }) =>
    api.get('/super-admin/users', { params: { limit: 20, ...params } }),

  toggleUser: (id: string) => api.put(`/super-admin/users/${id}/toggle`),

  updateUserRole: (id: string, role: string) =>
    api.put(`/super-admin/users/${id}/role`, { role }),

  getSubscriptions: () => api.get('/super-admin/subscriptions'),

  getActivityLogs: (params?: { page?: number; action?: string }) =>
    api.get('/super-admin/activity-logs', { params: { limit: 20, ...params } }),
};
