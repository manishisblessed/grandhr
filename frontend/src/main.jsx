import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './style.css';
import { AuthProvider } from './contexts/AuthContext';
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
import HRLogin from './components/HRLogin';
import HRRegister from './components/HRRegister';
import HRDashboard from './components/HRDashboard';
import Employees from './components/Employees';
import Leaves from './components/Leaves';
import Attendance from './components/Attendance';
import Payroll from './components/Payroll';
import Automation from './components/Automation';
import Support from './components/Support';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
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
          
          {/* App pages - with navbar */}
          <Route element={<AppLayout />}>
            <Route path="/offer-letter" element={<OfferLetter />} />
            <Route path="/salary-slip" element={<SalarySlip />} />
            <Route path="/appointment-letter" element={<AppointmentLetter />} />
            <Route path="/increment-letter" element={<IncrementLetter />} />
            <Route path="/relieving-letter" element={<RelievingLetter />} />
            <Route path="/termination-letter" element={<TerminationLetter />} />
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
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);

