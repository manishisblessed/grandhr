import Constants from 'expo-constants';
import { Flags } from './flags';

const extra = Constants.expoConfig?.extra as { apiUrl?: string } | undefined;
const raw = extra?.apiUrl ?? 'https://api.grandhr.in/api';
export const API_BASE_URL = String(raw).replace(/\/+$/, '');

/**
 * Customer-support channels. The WhatsApp number comes from the
 * EXPO_PUBLIC_SUPPORT_WHATSAPP build flag; when empty the WhatsApp
 * option is hidden everywhere in the UI.
 */
export const SUPPORT_WHATSAPP = Flags.supportWhatsapp;
export const SUPPORT_EMAIL = Flags.supportEmail;
export const WHATSAPP_URL = SUPPORT_WHATSAPP ? `https://wa.me/${SUPPORT_WHATSAPP}` : '';
export const WHATSAPP_MESSAGE = 'Hi GrandHR Support! I need help with my account.';

export const TOKEN_KEY = 'grandhr_token';
export const USER_KEY = 'grandhr_user';
export const CONSENT_KEY = 'grandhr_consent_v1';
export const APP_LOCK_KEY = 'grandhr_app_lock_enabled';
export const LAST_ACTIVE_KEY = 'grandhr_last_active_ms';

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
