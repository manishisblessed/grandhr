import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const ModernLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/hr/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/hr/employees', label: 'Employees', icon: '👥' },
    { path: '/hr/attendance', label: 'Attendance', icon: '⏰' },
    { path: '/hr/leaves', label: 'Leaves', icon: '📅' },
    { path: '/hr/payroll', label: 'Payroll', icon: '💰' },
    { path: '/hr/recruitment', label: 'Recruitment', icon: '🎯' },
    { path: '/hr/performance', label: 'Performance', icon: '⭐' },
    { path: '/hr/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Top Navigation Bar */}
      <nav className="glass-card sticky top-0 z-50 border-b border-white/20">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-white/50 transition-colors"
              >
                <span className="text-2xl">☰</span>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  GH
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gradient">GrandHR</h1>
                  <p className="text-xs text-gray-500">Enterprise HRMS</p>
                </div>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-white/50 transition-colors">
                <span className="text-xl">🔔</span>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Menu */}
              <div className="flex items-center gap-3">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-semibold text-gray-700">John Doe</p>
                  <p className="text-xs text-gray-500">HR Manager</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-semibold shadow-lg">
                  JD
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-0'
          } lg:w-64 fixed lg:static h-[calc(100vh-80px)] transition-all duration-300 overflow-hidden sidebar z-40`}
        >
          <div className="p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link flex items-center gap-3 ${
                  isActive(item.path) ? 'nav-link-active' : ''
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="p-4 mt-8">
            <div className="glass-card p-4 rounded-xl">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/50 text-sm text-gray-700 transition-colors">
                  ➕ Add Employee
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/50 text-sm text-gray-700 transition-colors">
                  📝 Process Payroll
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/50 text-sm text-gray-700 transition-colors">
                  📊 Generate Report
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 main-content animate-fade-in-up">
          {children}
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-64 h-full sidebar"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile menu content same as sidebar */}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernLayout;

