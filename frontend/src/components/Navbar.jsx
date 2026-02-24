import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import logoImg from '../assets/logo.png';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Check if HR user is logged in
  const hrUser = JSON.parse(localStorage.getItem('hr_user') || 'null');
  const isHRLoggedIn = !!hrUser;
  const isHRAdmin = hrUser?.role === 'ADMIN' || hrUser?.role === 'HR' || hrUser?.role === 'MANAGER';

  // Public navigation items - Professional HR platform navigation
  const publicMenuItems = [
    { name: 'Home', path: '/', icon: '🏠', isAnchor: false },
    { name: 'About', path: '/about', icon: 'ℹ️', isAnchor: false },
    { name: 'Features', path: '/features', icon: '⭐', isAnchor: false },
    { name: 'Pricing', path: '/pricing', icon: '💰', isAnchor: false },
    { name: 'Contact', path: '/contact', icon: '📞', isAnchor: false },
  ];

  // Menu items based on role
  const isEmployee = hrUser?.role === 'EMPLOYEE';
  
  const hrMenuItems = isHRLoggedIn ? (
    isEmployee ? [
      // Employee menu - limited options
      { name: 'My Dashboard', path: '/employee/dashboard', icon: '🏠' },
      { name: 'My Profile', path: '/hr/employees', icon: '👤' },
      { name: 'My Leaves', path: '/hr/leaves', icon: '📅' },
      { name: 'My Attendance', path: '/hr/attendance', icon: '⏰' },
      { name: 'My Payslips', path: '/hr/payroll', icon: '💰' },
      { name: 'Support', path: '/hr/support', icon: '💬' },
    ] : [
      // HR/Admin menu - full options
      { name: 'Dashboard', path: '/hr/dashboard', icon: '📊' },
      { name: 'Employees', path: '/hr/employees', icon: '👥' },
      { name: 'Leaves', path: '/hr/leaves', icon: '📅' },
      { name: 'Attendance', path: '/hr/attendance', icon: '⏰' },
      { name: 'Payroll', path: '/hr/payroll', icon: '💰' },
      { name: 'Support', path: '/hr/support', icon: '💬' },
    ]
  ) : [];

  // Combine menu items based on auth status
  const menuItems = isHRLoggedIn ? hrMenuItems : publicMenuItems;

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-200/50 transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link 
            to="/" 
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center space-x-2 group"
          >
            <img src={logoImg} alt="GrandHR" className="h-9 md:h-11 object-contain group-hover:scale-105 transition-all duration-300" />
            <span className="text-xl md:text-2xl font-bold font-display">
              <span className="text-blue-600">Grand</span><span className="text-green-600">HR</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-2">
            {menuItems.map((item) => {
              if (item.requiresHR && !isHRAdmin) return null;
              
              if (item.isAnchor) {
                return (
                  <a
                    key={item.path}
                    href={item.path}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 relative group ${
                      location.hash === item.path.replace('/', '#')
                        ? 'bg-gradient-to-r from-accent-100 to-purple-100 text-accent-700 font-semibold'
                        : 'text-gray-700 hover:text-accent-600 hover:bg-gradient-to-r hover:from-accent-50 hover:to-purple-50'
                    }`}
                  >
                    {item.icon} {item.name}
                  </a>
                );
              }
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 relative group ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-accent-100 to-purple-100 text-accent-700 font-semibold'
                      : 'text-gray-700 hover:text-accent-600 hover:bg-gradient-to-r hover:from-accent-50 hover:to-purple-50'
                  }`}
                >
                  {item.icon} {item.name}
                </Link>
              );
            })}
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isHRLoggedIn ? (
              <div className="flex items-center space-x-4">
                {/* Notification Bell */}
                <NotificationBell />
                
                <span className="text-sm text-gray-600">
                  {hrUser?.employee?.firstName || hrUser?.email}
                </span>
                <button
                  onClick={() => {
                    localStorage.removeItem('hr_token');
                    localStorage.removeItem('hr_user');
                    navigate('/hr/login');
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/hr/login"
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/hr/company-onboarding"
                  className="px-6 py-2.5 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-lg hover:from-slate-900 hover:to-slate-800 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="space-y-2">
              {menuItems.map((item) => {
                if (item.requiresHR && !isHRAdmin) return null;
                
                if (item.isAnchor) {
                  return (
                    <a
                      key={item.path}
                      href={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-2 rounded-lg font-medium transition-colors text-gray-700 hover:bg-gray-100"
                    >
                      {item.icon} {item.name}
                    </a>
                  );
                }
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-4 py-2 rounded-lg font-medium transition-colors ${
                      isActive(item.path)
                        ? 'bg-accent-100 text-accent-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {item.icon} {item.name}
                  </Link>
                );
              })}
              
              <div className="pt-4 border-t border-gray-200">
                {isHRLoggedIn ? (
                  <>
                    <div className="px-4 py-2 text-sm text-gray-600">
                      {hrUser?.employee?.firstName || hrUser?.email}
                    </div>
                    <button
                      onClick={() => {
                        localStorage.removeItem('hr_token');
                        localStorage.removeItem('hr_user');
                        setIsMenuOpen(false);
                        navigate('/hr/login');
                      }}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/hr/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      to="/hr/company-onboarding"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors mt-2"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

