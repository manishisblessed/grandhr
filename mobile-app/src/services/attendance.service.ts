import api from './api';
import { Attendance } from '../types';

export const AttendanceService = {
  getMyAttendance: (params?: { startDate?: string; endDate?: string }) =>
    api.get<Attendance[]>('/attendance/my-attendance', { params }),

  clockIn: () => api.post<Attendance>('/attendance/clock-in'),

  clockOut: () => api.post<Attendance>('/attendance/clock-out'),

  getByDate: (date: string) => api.get<Attendance[]>(`/attendance/date/${date}`),

  getByEmployee: (employeeId: string, params?: { startDate?: string; endDate?: string }) =>
    api.get<Attendance[]>(`/attendance/employee/${employeeId}`, { params }),
};
