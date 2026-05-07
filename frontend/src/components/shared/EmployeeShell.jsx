import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  CalendarCheck2,
  Plane,
  FileText,
  IdCard,
  Wallet,
  Bell,
  User,
  Smartphone,
} from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { PageTransition } from './PageTransition';

const items = [
  {
    label: 'My space',
    items: [
      { to: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/employee/profile', label: 'Profile', icon: User },
      { to: '/employee/id-card', label: 'ID Card', icon: IdCard },
    ],
  },
  {
    label: 'Time',
    items: [
      { to: '/employee/attendance', label: 'Attendance', icon: CalendarCheck2 },
      { to: '/employee/leaves', label: 'Leaves', icon: Plane },
    ],
  },
  {
    label: 'Money & Documents',
    items: [
      { to: '/employee/salary', label: 'Salary slips', icon: Wallet },
      { to: '/employee/documents', label: 'My documents', icon: FileText },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/employee/notifications', label: 'Notifications', icon: Bell },
      { to: '/employee/mobile-app', label: 'Mobile app', icon: Smartphone, badge: 'NEW' },
    ],
  },
];

export function EmployeeShell({ title }) {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar items={items} header="GrandHR" />
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
