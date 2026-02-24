import api from './api';
import { Employee, ApiResponse } from '../types';

export const EmployeeService = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<ApiResponse<Employee[]>>('/employees', { params }),

  getById: (id: string) => api.get<Employee>(`/employees/${id}`),

  create: (data: Partial<Employee>) => api.post<Employee>('/employees', data),

  update: (id: string, data: Partial<Employee>) =>
    api.put<Employee>(`/employees/${id}`, data),

  delete: (id: string) => api.delete(`/employees/${id}`),

  getByDepartment: (department: string) =>
    api.get<Employee[]>(`/employees/department/${department}`),
};
