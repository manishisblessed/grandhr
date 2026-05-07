import React, { useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  CalendarCheck2,
  Plane,
  Wallet,
  FileText,
  Bot,
  Bell,
  LifeBuoy,
  Building2,
  Sparkles,
  Settings,
  ShieldCheck,
  Mail,
  BarChart3,
  Smartphone,
} from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { PageTransition } from './PageTransition';
import { useAuth } from '../../contexts/AuthContext';

const baseNavItems = [
  {
    label: 'Overview',
    items: [
      { to: '/hr/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
    ],
  },
  {
    label: 'People',
    items: [
      { to: '/hr/employees', label: 'Employees', icon: Users },
      { to: '/hierarchy', label: 'Org chart', icon: Building2 },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/hr/attendance', label: 'Attendance', icon: CalendarCheck2 },
      { to: '/hr/leaves', label: 'Leaves', icon: Plane },
      { to: '/hr/payroll', label: 'Payroll', icon: Wallet },
      { to: '/hr/reports', label: 'Reports', icon: BarChart3, badge: 'NEW' },
    ],
  },
  {
    label: 'Documents',
    items: [
      { to: '/hr/templates', label: 'Template Studio', icon: Sparkles, badge: 'NEW' },
      { to: '/hr/email-studio', label: 'Email Studio', icon: Mail, badge: 'NEW' },
      { to: '/offer-letter', label: 'Offer letters', icon: FileText },
      { to: '/appointment-letter', label: 'Appointment letters', icon: FileText },
      { to: '/salary-slip', label: 'Salary slips', icon: FileText },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { to: '/hr/automation', label: 'Automation', icon: Bot },
      { to: '/hr/notifications', label: 'Notifications', icon: Bell },
      { to: '/hr/mobile-app', label: 'Mobile app', icon: Smartphone, badge: 'NEW' },
      { to: '/hr/support', label: 'Support', icon: LifeBuoy },
      { to: '/super-admin', label: 'Super Admin', icon: ShieldCheck, superAdminOnly: true },
    ],
  },
];

export function AdminShell({ title }) {
  const location = useLocation();
  const { role } = useAuth();
  const sidebarItems = useMemo(
    () =>
      baseNavItems.map((group) => ({
        ...group,
        items: group.items.filter((item) => !item.superAdminOnly || role === 'SUPER_ADMIN'),
      })),
    [role]
  );
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar items={sidebarItems} header="GrandHR" />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar title={title} />
        <main className="flex-1 overflow-x-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <PageTransition key={location.pathname} className="px-4 md:px-8 py-6">
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
