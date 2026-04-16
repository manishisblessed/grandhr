import api from './api';
import { User } from '../types';

interface LoginResponse {
  user: User;
  token: string;
}

export const AuthService = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>('/auth/login', { email, password }),

  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    employeeId?: string;
    role: string;
  }) => api.post<LoginResponse>('/auth/register', data),

  getProfile: () => api.get<User>('/auth/profile'),

  logout: () => api.post('/auth/logout').catch(() => {}),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/auth/change-password', { currentPassword, newPassword }),

  /**
   * Initiates account deletion. Requires password re-authentication to
   * guard against lost-device / session-hijack deletions.
   *
   * Google Play Developer Policy (Dec 2023): apps with user accounts must
   * offer an in-app way to request account + data deletion.
   */
  deleteAccount: (currentPassword: string) =>
    api.post('/auth/delete-account', { currentPassword }),
};
