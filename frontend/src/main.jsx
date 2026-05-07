import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import './style.css';

import { queryClient } from './lib/queryClient';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { TooltipProvider } from './components/ui/tooltip';
import { Toaster } from './components/ui/sonner';

import RoleRoute, { FullPageLoader } from './components/shared/RoleRoute';
import { AdminShell } from './components/shared/AdminShell';
import { EmployeeShell } from './components/shared/EmployeeShell';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { listenForInstallPrompt, registerServiceWorker } from './lib/pwa';
import { initSentry } from './lib/sentry';

// Eagerly loaded — these are critical first-impression pages and small layout shells.
import LandingNew from './pages/landing/LandingNew';
import HRLoginNew from './pages/auth/HRLoginNew';
import EmployeeLoginNew from './pages/auth/EmployeeLoginNew';
import AppLayout from './components/AppLayout';
import WhatsAppWidget from './components/WhatsAppWidget';

// Lazy — split so the landing page never waits on these.
const Landing = lazy(() => import('./components/Landing'));

const AdminDashboardNew = lazy(() => import('./pages/admin/AdminDashboardNew'));
const TemplateStudio = lazy(() => import('./pages/admin/TemplateStudio'));
const EmailStudio = lazy(() => import('./pages/admin/EmailStudio'));
const HRTeam = lazy(() => import('./pages/admin/HRTeam'));
const HRLeavesQueue = lazy(() => import('./pages/admin/HRLeavesQueue'));
const HRAttendance = lazy(() => import('./pages/admin/HRAttendance'));
const HRPayroll = lazy(() => import('./pages/admin/HRPayroll'));
const HRReports = lazy(() => import('./pages/admin/HRReports'));
const MobileAppPage = lazy(() => import('./pages/shared/MobileAppPage'));

const EmployeeDashboardNew = lazy(() => import('./pages/employee/EmployeeDashboardNew'));
const EmployeeIdCard = lazy(() => import('./pages/employee/EmployeeIdCard'));
const EmployeeDocuments = lazy(() => import('./pages/employee/EmployeeDocuments'));
const EmployeeLeaves = lazy(() => import('./pages/employee/EmployeeLeaves'));
const EmployeeAttendance = lazy(() => import('./pages/employee/EmployeeAttendance'));
const EmployeeSalary = lazy(() => import('./pages/employee/EmployeeSalary'));
const EmployeeProfile = lazy(() => import('./pages/employee/EmployeeProfile'));

// Legacy / supporting pages — fully lazy so they don't bloat the initial bundle.
const OfferLetter = lazy(() => import('./components/OfferLetter'));
const SalarySlip = lazy(() => import('./components/SalarySlip'));
const AppointmentLetter = lazy(() => import('./components/AppointmentLetter'));
const IncrementLetter = lazy(() => import('./components/IncrementLetter'));
const RelievingLetter = lazy(() => import('./components/RelievingLetter'));
const TerminationLetter = lazy(() => import('./components/TerminationLetter'));
const WarningLetter = lazy(() => import('./components/WarningLetter'));
const ExperienceLetter = lazy(() => import('./components/ExperienceLetter'));
const Hierarchy = lazy(() => import('./components/Hierarchy'));
const Register = lazy(() => import('./components/Register'));
const HRRegister = lazy(() => import('./components/HRRegister'));
const CompanyOnboarding = lazy(() => import('./components/CompanyOnboarding'));
const Employees = lazy(() => import('./components/Employees'));
const Leaves = lazy(() => import('./components/Leaves'));
const Attendance = lazy(() => import('./components/Attendance'));
const Payroll = lazy(() => import('./components/Payroll'));
const Automation = lazy(() => import('./components/Automation'));
const Support = lazy(() => import('./components/Support'));
const HelpCenter = lazy(() => import('./components/HelpCenter'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./components/TermsOfService'));
const Resources = lazy(() => import('./components/Resources'));
const Solutions = lazy(() => import('./components/Solutions'));
const Features = lazy(() => import('./components/Features'));
const Pricing = lazy(() => import('./components/Pricing'));
const About = lazy(() => import('./components/About'));
const Contact = lazy(() => import('./components/Contact'));
const NotificationsPage = lazy(() => import('./components/NotificationsPage'));
const SuperAdminDashboard = lazy(() => import('./components/SuperAdminDashboard'));
const ForgotPassword = lazy(() => import('./components/ForgotPassword'));
const ForgotUsername = lazy(() => import('./components/ForgotUsername'));
const ResetPassword = lazy(() => import('./components/ResetPassword'));

initSentry();
registerServiceWorker();
listenForInstallPrompt();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthProvider>
            <NotificationProvider>
              <TooltipProvider delayDuration={150}>
                <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                  <Suspense fallback={<FullPageLoader label="Loading…" />}>
                    <Routes>
                      {/* Landing */}
                      <Route path="/" element={<LandingNew />} />
                      <Route path="/legacy" element={<Landing />} />

                      {/* Auth pages */}
                      <Route path="/login" element={<EmployeeLoginNew />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/hr/login" element={<HRLoginNew />} />
                      <Route path="/hr/register" element={<HRRegister />} />
                      <Route path="/hr/company-onboarding" element={<CompanyOnboarding />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/forgot-username" element={<ForgotUsername />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                      <Route path="/hr-login" element={<Navigate to="/hr/login" replace />} />

                      {/* HR / Admin shell */}
                      <Route
                        element={
                          <RoleRoute roles={['HR', 'COMPANY_ADMIN', 'SUPER_ADMIN', 'MANAGER']}>
                            <AdminShell />
                          </RoleRoute>
                        }
                      >
                        <Route path="/hr/dashboard" element={<AdminDashboardNew />} />
                        <Route path="/hr/employees" element={<HRTeam />} />
                        <Route path="/hr/employees/legacy" element={<Employees />} />
                        <Route path="/hr/leaves" element={<HRLeavesQueue />} />
                        <Route path="/hr/leaves/legacy" element={<Leaves />} />
                        <Route path="/hr/attendance" element={<HRAttendance />} />
                        <Route path="/hr/attendance/legacy" element={<Attendance />} />
                        <Route path="/hr/payroll" element={<HRPayroll />} />
                        <Route path="/hr/payroll/legacy" element={<Payroll />} />
                        <Route path="/hr/reports" element={<HRReports />} />
                        <Route path="/hr/mobile-app" element={<MobileAppPage />} />
                        <Route path="/hr/automation" element={<Automation />} />
                        <Route path="/hr/support" element={<Support />} />
                        <Route path="/hr/notifications" element={<NotificationsPage />} />
                        <Route path="/hr/templates" element={<TemplateStudio />} />
                        <Route path="/hr/email-studio" element={<EmailStudio />} />
                      </Route>

                      {/* Employee shell */}
                      <Route
                        element={
                          <RoleRoute>
                            <EmployeeShell />
                          </RoleRoute>
                        }
                      >
                        <Route path="/employee/dashboard" element={<EmployeeDashboardNew />} />
                        <Route path="/employee/notifications" element={<NotificationsPage />} />
                        <Route path="/employee/id-card" element={<EmployeeIdCard />} />
                        <Route path="/employee/documents" element={<EmployeeDocuments />} />
                        <Route path="/employee/profile" element={<EmployeeProfile />} />
                        <Route path="/employee/attendance" element={<EmployeeAttendance />} />
                        <Route path="/employee/leaves" element={<EmployeeLeaves />} />
                        <Route path="/employee/salary" element={<EmployeeSalary />} />
                        <Route path="/employee/mobile-app" element={<MobileAppPage />} />
                      </Route>

                      {/* Super-admin still uses its own page */}
                      <Route
                        path="/super-admin"
                        element={
                          <RoleRoute roles={['SUPER_ADMIN']}>
                            <SuperAdminDashboard />
                          </RoleRoute>
                        }
                      />

                      {/* Document tools (existing pages) */}
                      <Route element={<AppLayout />}>
                        <Route path="/offer-letter" element={<RoleRoute roles={['HR', 'COMPANY_ADMIN', 'SUPER_ADMIN', 'MANAGER']}><OfferLetter /></RoleRoute>} />
                        <Route path="/salary-slip" element={<RoleRoute roles={['HR', 'COMPANY_ADMIN', 'SUPER_ADMIN', 'MANAGER']}><SalarySlip /></RoleRoute>} />
                        <Route path="/appointment-letter" element={<RoleRoute roles={['HR', 'COMPANY_ADMIN', 'SUPER_ADMIN', 'MANAGER']}><AppointmentLetter /></RoleRoute>} />
                        <Route path="/increment-letter" element={<RoleRoute roles={['HR', 'COMPANY_ADMIN', 'SUPER_ADMIN', 'MANAGER']}><IncrementLetter /></RoleRoute>} />
                        <Route path="/relieving-letter" element={<RoleRoute roles={['HR', 'COMPANY_ADMIN', 'SUPER_ADMIN', 'MANAGER']}><RelievingLetter /></RoleRoute>} />
                        <Route path="/termination-letter" element={<RoleRoute roles={['HR', 'COMPANY_ADMIN', 'SUPER_ADMIN', 'MANAGER']}><TerminationLetter /></RoleRoute>} />
                        <Route path="/warning-letter" element={<RoleRoute roles={['HR', 'COMPANY_ADMIN', 'SUPER_ADMIN', 'MANAGER']}><WarningLetter /></RoleRoute>} />
                        <Route path="/experience-letter" element={<RoleRoute roles={['HR', 'COMPANY_ADMIN', 'SUPER_ADMIN', 'MANAGER']}><ExperienceLetter /></RoleRoute>} />
                        <Route path="/hierarchy" element={<RoleRoute><Hierarchy /></RoleRoute>} />
                        <Route path="/solutions" element={<Solutions />} />
                        <Route path="/features" element={<Features />} />
                        <Route path="/pricing" element={<Pricing />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/help-center" element={<HelpCenter />} />
                        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                        <Route path="/terms-of-service" element={<TermsOfService />} />
                        <Route path="/resources" element={<Resources />} />
                      </Route>

                      {/* 404 */}
                      <Route
                        path="*"
                        element={
                          <div className="min-h-screen grid place-items-center bg-background bg-mesh p-6">
                            <div className="text-center">
                              <p className="font-display text-7xl font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
                                404
                              </p>
                              <p className="text-xl text-muted-foreground mt-3">Page not found</p>
                              <a
                                href="/"
                                className="inline-flex mt-6 items-center justify-center rounded-lg bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-glow transition-shadow"
                              >
                                Go home
                              </a>
                            </div>
                          </div>
                        }
                      />
                    </Routes>
                  </Suspense>

                  <WhatsAppWidget />
                  <Toaster />
                </BrowserRouter>
              </TooltipProvider>
            </NotificationProvider>
          </AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
