import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import HRLayout from './HRLayout';

const EmployeeDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    leaveBalance: { used: 0, remaining: 0, total: 0 },
    attendance: { present: 0, absent: 0, late: 0 },
    pendingLeaves: 0,
  });
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();
  const navigate = useNavigate();
  
  const hrUser = JSON.parse(localStorage.getItem('hr_user') || 'null');

  useEffect(() => {
    if (!hrUser) {
      navigate('/hr/login');
      return;
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch employee profile
      const profileRes = await api.get('/auth/profile');
      setProfile(profileRes.data.user);

      // Fetch leave balance
      try {
        const leaveBalanceRes = await api.get('/leaves/balance');
        const balances = leaveBalanceRes.data.balances || {};
        let totalUsed = 0;
        let totalRemaining = 0;
        let total = 0;
        Object.values(balances).forEach((b) => {
          totalUsed += b.used || 0;
          totalRemaining += b.remaining || 0;
          total += b.total || 0;
        });
        setStats(prev => ({
          ...prev,
          leaveBalance: { used: totalUsed, remaining: totalRemaining, total }
        }));
      } catch (e) {
        console.log('Leave balance not available');
      }

      // Fetch recent leaves
      try {
        const leavesRes = await api.get('/leaves/my-leaves');
        setRecentLeaves((leavesRes.data.leaves || []).slice(0, 5));
        const pendingCount = (leavesRes.data.leaves || []).filter(l => l.status === 'PENDING').length;
        setStats(prev => ({ ...prev, pendingLeaves: pendingCount }));
      } catch (e) {
        console.log('Leaves not available');
      }

      // Fetch recent attendance
      try {
        const attendanceRes = await api.get('/attendance/my-attendance');
        const attendances = attendanceRes.data.attendances || [];
        setRecentAttendance(attendances.slice(0, 5));
        
        // Calculate attendance stats for current month
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthAttendance = attendances.filter(a => {
          const date = new Date(a.date);
          return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });
        
        const present = monthAttendance.filter(a => a.status === 'PRESENT').length;
        const absent = monthAttendance.filter(a => a.status === 'ABSENT').length;
        const late = monthAttendance.filter(a => a.isLate).length;
        
        setStats(prev => ({ ...prev, attendance: { present, absent, late } }));
      } catch (e) {
        console.log('Attendance not available');
      }

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      showError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      PRESENT: 'bg-green-100 text-green-800',
      ABSENT: 'bg-red-100 text-red-800',
      LATE: 'bg-orange-100 text-orange-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <HRLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600"></div>
        </div>
      </HRLayout>
    );
  }

  return (
    <HRLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-accent-600 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                Welcome back, {profile?.employee?.firstName || hrUser?.email}!
              </h2>
              <p className="text-white/80 mt-1">
                {profile?.employee?.designation || 'Employee'} • {profile?.employee?.department || 'Team Member'}
              </p>
              <p className="text-white/60 text-sm mt-2">
                Employee ID: {profile?.employee?.employeeId || 'N/A'}
              </p>
            </div>
            <div className="hidden sm:block text-6xl">👋</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Leave Balance</p>
                <p className="text-2xl font-bold text-gray-900">{stats.leaveBalance.remaining}</p>
                <p className="text-xs text-gray-400 mt-1">of {stats.leaveBalance.total} days</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Days Present</p>
                <p className="text-2xl font-bold text-green-600">{stats.attendance.present}</p>
                <p className="text-xs text-gray-400 mt-1">This month</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Late Arrivals</p>
                <p className="text-2xl font-bold text-orange-600">{stats.attendance.late}</p>
                <p className="text-xs text-gray-400 mt-1">This month</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⏰</span>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending Leaves</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingLeaves}</p>
                <p className="text-xs text-gray-400 mt-1">Awaiting approval</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link
              to="/hr/attendance"
              className="flex flex-col items-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-xl mb-2 group-hover:scale-110 transition-transform">
                ⏰
              </div>
              <span className="text-sm font-medium text-gray-700">Clock In/Out</span>
            </Link>

            <Link
              to="/hr/leaves"
              className="flex flex-col items-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl mb-2 group-hover:scale-110 transition-transform">
                📝
              </div>
              <span className="text-sm font-medium text-gray-700">Apply Leave</span>
            </Link>

            <Link
              to="/hr/payroll"
              className="flex flex-col items-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white text-xl mb-2 group-hover:scale-110 transition-transform">
                💰
              </div>
              <span className="text-sm font-medium text-gray-700">View Payslips</span>
            </Link>

            <Link
              to="/hr/support"
              className="flex flex-col items-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white text-xl mb-2 group-hover:scale-110 transition-transform">
                💬
              </div>
              <span className="text-sm font-medium text-gray-700">Get Help</span>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Leaves */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Recent Leave Requests</h3>
              <Link to="/hr/leaves" className="text-sm text-accent-600 hover:text-accent-700">
                View all →
              </Link>
            </div>
            {recentLeaves.length > 0 ? (
              <div className="space-y-3">
                {recentLeaves.map((leave) => (
                  <div key={leave.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{leave.type.replace('_', ' ')}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(leave.status)}`}>
                      {leave.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent leave requests</p>
            )}
          </div>

          {/* Recent Attendance */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Recent Attendance</h3>
              <Link to="/hr/attendance" className="text-sm text-accent-600 hover:text-accent-700">
                View all →
              </Link>
            </div>
            {recentAttendance.length > 0 ? (
              <div className="space-y-3">
                {recentAttendance.map((att) => (
                  <div key={att.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(att.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </p>
                      <p className="text-sm text-gray-500">
                        {att.clockIn ? new Date(att.clockIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '--:--'} - 
                        {att.clockOut ? new Date(att.clockOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(att.status)}`}>
                      {att.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent attendance records</p>
            )}
          </div>
        </div>

        {/* Profile Summary */}
        {profile?.employee && (
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">My Profile</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium text-gray-900">
                  {profile.employee.firstName} {profile.employee.lastName}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{profile.email}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">{profile.employee.phone || 'Not set'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Joining Date</p>
                <p className="font-medium text-gray-900">
                  {profile.employee.joiningDate 
                    ? new Date(profile.employee.joiningDate).toLocaleDateString('en-IN')
                    : 'Not set'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </HRLayout>
  );
};

export default EmployeeDashboard;
