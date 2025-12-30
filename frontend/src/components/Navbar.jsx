import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Check if HR user is logged in
  const hrUser = JSON.parse(localStorage.getItem('hr_user') || 'null');
  const isHRLoggedIn = !!hrUser;
  const isHRAdmin = hrUser?.role === 'ADMIN' || hrUser?.role === 'HR' || hrUser?.role === 'MANAGER';

  // Public navigation items - Professional HR platform navigation
  const publicMenuItems = [
    { name: 'Solutions', path: '/#solutions', icon: '💼', isAnchor: true },
    { name: 'Features', path: '/#features', icon: '⭐', isAnchor: true },
    { name: 'Pricing', path: '/#pricing', icon: '💰', isAnchor: true },
    { name: 'About', path: '/#about', icon: 'ℹ️', isAnchor: true },
    { name: 'Contact', path: '/#contact', icon: '📞', isAnchor: true },
  ];

  // HR menu items when logged in
  const hrMenuItems = isHRLoggedIn ? [
    { name: 'Dashboard', path: '/hr/dashboard', icon: '📊' },
    { name: 'Employees', path: '/hr/employees', icon: '👥', requiresHR: true },
    { name: 'Leaves', path: '/hr/leaves', icon: '📅' },
    { name: 'Attendance', path: '/hr/attendance', icon: '⏰' },
    { name: 'Payroll', path: '/hr/payroll', icon: '💰' },
    { name: 'Support', path: '/hr/support', icon: '💬' },
  ] : [];

  // Supabase auth menu items
  const supabaseMenuItems = isAuthenticated ? [
    { name: 'Hierarchy', path: '/hierarchy', icon: '🏢' },
  ] : [];

  // Combine menu items based on auth status
  const menuItems = isHRLoggedIn ? hrMenuItems : [...publicMenuItems, ...supabaseMenuItems];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            onClick={() => {
              // Scroll to top when clicking logo
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <div className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent font-display">
              GrandHR
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {menuItems.map((item) => {
              if (item.requiresAuth && !isAuthenticated) return null;
              if (item.requiresHR && !isHRAdmin) return null;
              
              if (item.isAnchor) {
                return (
                  <a
                    key={item.path}
                    href={item.path}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      location.hash === item.path.replace('/', '#')
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
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
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
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
            ) : isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">{user?.email}</span>
                <button
                  onClick={handleSignOut}
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
                  to="/hr/register"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
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
                if (item.requiresAuth && !isAuthenticated) return null;
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
                        ? 'bg-primary-100 text-primary-700'
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
                ) : isAuthenticated ? (
                  <>
                    <div className="px-4 py-2 text-sm text-gray-600">{user?.email}</div>
                    <button
                      onClick={handleSignOut}
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
                      to="/hr/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors mt-2"
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

