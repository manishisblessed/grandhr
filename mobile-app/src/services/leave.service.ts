import api from './api';
import { Leave, LeaveBalance } from '../types';

export const LeaveService = {
  getAll: (params?: { status?: string; type?: string }) =>
    api.get<Leave[]>('/leaves', { params }),

  getMyLeaves: () => api.get<Leave[]>('/leaves/my-leaves'),

  getBalance: () => api.get<LeaveBalance[]>('/leaves/balance'),

  apply: (data: {
    type: string;
    durationType: string;
    startDate: string;
    endDate: string;
    reason: string;
  }) => api.post<Leave>('/leaves', data),

  updateStatus: (
    id: string,
    data: { status: string; rejectedReason?: string },
  ) => api.put<Leave>(`/leaves/${id}/status`, data),
};
