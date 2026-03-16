import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra as { apiUrl?: string } | undefined;
export const API_BASE_URL = extra?.apiUrl ?? 'https://api.grandhr.in/api';

export const WHATSAPP_NUMBER = '919090702705';
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
export const WHATSAPP_MESSAGE = 'Hi GrandHR! I need help with HR management.';

export const TOKEN_KEY = 'grandhr_token';
export const USER_KEY = 'grandhr_user';

export const LEAVE_TYPES = [
  { label: 'Casual Leave', value: 'CASUAL_LEAVE' },
  { label: 'Sick Leave', value: 'SICK_LEAVE' },
  { label: 'Earned Leave', value: 'EARNED_LEAVE' },
  { label: 'Maternity Leave', value: 'MATERNITY_LEAVE' },
  { label: 'Paternity Leave', value: 'PATERNITY_LEAVE' },
  { label: 'Comp Off', value: 'COMP_OFF' },
  { label: 'Loss of Pay', value: 'LOP' },
] as const;

export const TICKET_CATEGORIES = [
  { label: 'Technical', value: 'TECHNICAL' },
  { label: 'Billing', value: 'BILLING' },
  { label: 'Feature Request', value: 'FEATURE_REQUEST' },
  { label: 'Bug', value: 'BUG' },
  { label: 'Other', value: 'OTHER' },
] as const;

export const TICKET_PRIORITIES = [
  { label: 'Low', value: 'LOW' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'High', value: 'HIGH' },
  { label: 'Urgent', value: 'URGENT' },
] as const;

export const TICKET_STATUS_COLORS: Record<string, string> = {
  OPEN: '#3B82F6',
  IN_PROGRESS: '#F59E0B',
  RESOLVED: '#10B981',
  CLOSED: '#64748B',
};

export const PRIORITY_COLORS: Record<string, string> = {
  LOW: '#64748B',
  MEDIUM: '#3B82F6',
  HIGH: '#F59E0B',
  URGENT: '#EF4444',
};

export const AUTOMATION_TYPES = [
  { label: 'Auto Payroll', value: 'AUTO_PAYROLL' },
  { label: 'Auto Attendance', value: 'AUTO_ATTENDANCE' },
  { label: 'Auto Leave Balance', value: 'AUTO_LEAVE_BALANCE' },
  { label: 'Auto Reminder', value: 'AUTO_REMINDER' },
] as const;

export const EMPLOYEE_ROLES = [
  { label: 'Employee', value: 'EMPLOYEE' },
  { label: 'Manager', value: 'MANAGER' },
  { label: 'HR', value: 'HR' },
  { label: 'Company Admin', value: 'COMPANY_ADMIN' },
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
