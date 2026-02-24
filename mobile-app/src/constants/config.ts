import Constants from 'expo-constants';

export const API_BASE_URL =
  Constants.expoConfig?.extra?.apiUrl || 'http://localhost:5000/api';

export const TOKEN_KEY = 'grandhr_token';
export const USER_KEY = 'grandhr_user';

export const LEAVE_TYPES = [
  { label: 'Sick Leave', value: 'SICK' },
  { label: 'Casual Leave', value: 'CASUAL' },
  { label: 'Earned Leave', value: 'EARNED' },
  { label: 'Maternity Leave', value: 'MATERNITY' },
  { label: 'Paternity Leave', value: 'PATERNITY' },
  { label: 'Unpaid Leave', value: 'UNPAID' },
] as const;

export const LEAVE_STATUS_COLORS: Record<string, string> = {
  PENDING: '#F59E0B',
  APPROVED: '#10B981',
  REJECTED: '#EF4444',
  CANCELLED: '#64748B',
};

export const ATTENDANCE_STATUS_COLORS: Record<string, string> = {
  PRESENT: '#10B981',
  ABSENT: '#EF4444',
  LATE: '#F59E0B',
  HALF_DAY: '#3B82F6',
  ON_LEAVE: '#8B5CF6',
};

export const ADMIN_ROLES = ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR', 'MANAGER'];
