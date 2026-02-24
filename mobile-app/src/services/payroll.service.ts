import api from './api';
import { Payroll } from '../types';

export const PayrollService = {
  getMyPayrolls: () => api.get<Payroll[]>('/payroll/my-payrolls'),

  getAll: (params?: { month?: number; year?: number; status?: string }) =>
    api.get<Payroll[]>('/payroll', { params }),

  getById: (id: string) => api.get<Payroll>(`/payroll/${id}`),
};
