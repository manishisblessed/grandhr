import api from './api';
import { DashboardStats } from '../types';

export const DashboardService = {
  getAdminStats: () => api.get<DashboardStats>('/dashboard/admin'),

  getEmployeeStats: () => api.get<DashboardStats>('/dashboard/employee'),
};
