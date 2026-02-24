export type UserRole = 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'HR' | 'MANAGER' | 'EMPLOYEE';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  companyId?: string;
  isActive: boolean;
  lastLogin?: string;
  employee?: Employee;
}

export interface Employee {
  id: string;
  userId: string;
  companyId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  joiningDate?: string;
  departmentId?: string;
  designationId?: string;
  managerId?: string;
  salary?: number;
  employmentStatus?: string;
  isActive: boolean;
  department?: { id: string; name: string };
  designation?: { id: string; name: string };
}

export interface Leave {
  id: string;
  employeeId: string;
  type: LeaveType;
  durationType: 'FULL_DAY' | 'HALF_DAY' | 'HOURLY';
  startDate: string;
  endDate: string;
  days: number;
  hours?: number;
  reason: string;
  status: LeaveStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectedReason?: string;
  createdAt: string;
  employee?: Employee;
}

export type LeaveType = 'SICK' | 'CASUAL' | 'EARNED' | 'MATERNITY' | 'PATERNITY' | 'UNPAID';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface LeaveBalance {
  leaveType: LeaveType;
  accrued: number;
  used: number;
  balance: number;
  carryForward: number;
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  totalHours?: number;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'ON_LEAVE';
  isLate: boolean;
  lateMinutes?: number;
  notes?: string;
}

export interface Payroll {
  id: string;
  employeeId: string;
  month: number;
  year: number;
  baseSalary: number;
  allowances: number;
  deductions: number;
  pf: number;
  esi: number;
  pt: number;
  tds: number;
  tax: number;
  netSalary: number;
  paidDate?: string;
  status: 'DRAFT' | 'PROCESSED' | 'PAID';
  payslipUrl?: string;
  employee?: Employee;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalEmployees?: number;
  presentToday?: number;
  pendingLeaves?: number;
  totalPayroll?: number;
  leaveBalance?: LeaveBalance[];
  recentAttendance?: Attendance[];
  upcomingLeaves?: Leave[];
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
