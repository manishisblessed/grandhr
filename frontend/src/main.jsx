import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './style.css';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Landing from './components/Landing';
import AppLayout from './components/AppLayout';
import OfferLetter from './components/OfferLetter';
import SalarySlip from './components/SalarySlip';
import AppointmentLetter from './components/AppointmentLetter';
import IncrementLetter from './components/IncrementLetter';
import RelievingLetter from './components/RelievingLetter';
import TerminationLetter from './components/TerminationLetter';
import Hierarchy from './components/Hierarchy';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import HRProtectedRoute from './components/HRProtectedRoute';
import HRLogin from './components/HRLogin';
import HRRegister from './components/HRRegister';
import CompanyOnboarding from './components/CompanyOnboarding';
import HRDashboard from './components/HRDashboard';
import Employees from './components/Employees';
import Leaves from './components/Leaves';
import Attendance from './components/Attendance';
import Payroll from './components/Payroll';
import Automation from './components/Automation';
import Support from './components/Support';
import HelpCenter from './components/HelpCenter';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import Resources from './components/Resources';
import Solutions from './components/Solutions';
import Features from './components/Features';
import Pricing from './components/Pricing';
import About from './components/About';
import Contact from './components/Contact';
import EmployeeDashboard from './components/EmployeeDashboard';
import NotificationsPage from './components/NotificationsPage';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastProvider>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
        <Routes>
          {/* Landing page - no navbar */}
          <Route path="/" element={<Landing />} />
          
          {/* Auth pages - no navbar */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* HR Auth */}
          <Route path="/hr/login" element={<HRLogin />} />
          <Route path="/hr/register" element={<HRRegister />} />
          <Route path="/hr/company-onboarding" element={<CompanyOnboarding />} />
          
          {/* App pages - with navbar */}
          <Route element={<AppLayout />}>
            {/* Document routes - require authentication */}
            <Route 
              path="/offer-letter" 
              element={
                <HRProtectedRoute>
                  <OfferLetter />
                </HRProtectedRoute>
              } 
            />
            <Route 
              path="/salary-slip" 
              element={
                <HRProtectedRoute>
                  <SalarySlip />
                </HRProtectedRoute>
              } 
            />
            <Route 
              path="/appointment-letter" 
              element={
                <HRProtectedRoute>
                  <AppointmentLetter />
                </HRProtectedRoute>
              } 
            />
            <Route 
              path="/increment-letter" 
              element={
                <HRProtectedRoute>
                  <IncrementLetter />
                </HRProtectedRoute>
              } 
            />
            <Route 
              path="/relieving-letter" 
              element={
                <HRProtectedRoute>
                  <RelievingLetter />
                </HRProtectedRoute>
              } 
            />
            <Route 
              path="/termination-letter" 
              element={
                <HRProtectedRoute>
                  <TerminationLetter />
                </HRProtectedRoute>
              } 
            />
            <Route
              path="/hierarchy"
              element={
                <ProtectedRoute>
                  <Hierarchy />
                </ProtectedRoute>
              }
            />
            {/* HR Management Routes */}
            <Route path="/hr/dashboard" element={<HRDashboard />} />
            <Route path="/hr/employees" element={<Employees />} />
            <Route path="/hr/leaves" element={<Leaves />} />
            <Route path="/hr/attendance" element={<Attendance />} />
            <Route path="/hr/payroll" element={<Payroll />} />
            <Route path="/hr/automation" element={<Automation />} />
            <Route path="/hr/support" element={<Support />} />
            <Route path="/hr/notifications" element={<NotificationsPage />} />
            {/* Employee Self-Service */}
            <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
            {/* Public Pages */}
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
        </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ToastProvider>
  </React.StrictMode>
);

