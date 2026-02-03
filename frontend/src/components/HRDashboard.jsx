import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import HRLayout from './HRLayout';

const HRDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();
  
  const hrUser = JSON.parse(localStorage.getItem('hr_user') || 'null');
  const hrCompany = JSON.parse(localStorage.getItem('hr_company') || 'null');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (hrUser) {
      fetchDashboard();
    } else {
      setLoading(false);
      setError('Please login to HR system first');
    }
  }, []);

  const fetchDashboard = async () => {
    try {
      setError(null);
      const isAdmin = hrUser?.role === 'COMPANY_ADMIN' || hrUser?.role === 'ADMIN' || hrUser?.role === 'HR' || hrUser?.role === 'MANAGER';
      const endpoint = isAdmin ? '/dashboard/admin' : '/dashboard/employee';
      const response = await api.get(endpoint);
      setDashboardData(response.data);
    } catch (err) {
      if (err.response?.status === 404 || err.response?.status === 403) {
        try {
          const response = await api.get('/dashboard/employee');
          setDashboardData(response.data);
        } catch (err2) {
          setError(err2.response?.data?.message || 'Failed to load dashboard');
        }
      } else {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = hrUser?.role === 'COMPANY_ADMIN' || hrUser?.role === 'ADMIN' || hrUser?.role === 'HR' || hrUser?.role === 'MANAGER';
  const greeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
              <div className="w-16 h-16 border-4 border-indigo-200 border-b-indigo-600 rounded-full animate-spin absolute top-2 left-1/2 -translate-x-1/2"></div>
            </div>
            <p className="mt-6 text-gray-600 font-medium">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="glass-card p-8 max-w-md text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Unable to Load Dashboard</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-gradient-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};

  // Sample data for widgets (will be replaced with real data)
  const upcomingEvents = [
    { type: 'birthday', name: 'Sarah Johnson', date: 'Tomorrow', avatar: 'SJ' },
    { type: 'anniversary', name: 'Mike Chen', date: 'In 3 days', avatar: 'MC' },
    { type: 'birthday', name: 'Emily Davis', date: 'In 5 days', avatar: 'ED' },
  ];

  const recentActivities = [
    { action: 'Leave request submitted', user: 'John Smith', time: '10 min ago', type: 'leave' },
    { action: 'Attendance marked', user: 'System Auto', time: '30 min ago', type: 'attendance' },
    { action: 'New employee onboarded', user: 'HR Team', time: '2 hours ago', type: 'employee' },
    { action: 'Payroll processed', user: 'Finance', time: '5 hours ago', type: 'payroll' },
  ];

  const pendingApprovals = [
    { type: 'Leave Request', count: stats.pendingLeaves || 0, urgent: true },
    { type: 'Expense Claims', count: 0, urgent: false },
    { type: 'Timesheets', count: 0, urgent: false },
  ];

  const departmentData = [
    { name: 'Engineering', count: 45, color: 'bg-blue-500' },
    { name: 'Sales', count: 32, color: 'bg-green-500' },
    { name: 'Marketing', count: 18, color: 'bg-purple-500' },
    { name: 'HR', count: 8, color: 'bg-pink-500' },
    { name: 'Finance', count: 12, color: 'bg-yellow-500' },
  ];

  const totalDeptEmployees = departmentData.reduce((a, b) => a + b.count, 0);

  return (
    <HRLayout>
      <div className="space-y-6">
        
        {/* Header Section */}
        <div className="glass-card p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  {hrUser?.employee?.firstName?.[0] || hrUser?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
                    {greeting()}, {hrUser?.employee?.firstName || 'Admin'}!
                  </h1>
                  <p className="text-gray-500">{hrCompany?.name || 'Your Company'}</p>
                </div>
              </div>
              <p className="text-gray-600 mt-2">
                Here's what's happening with your organization today
              </p>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-800 tabular-nums">{formatTime(currentTime)}</p>
                <p className="text-gray-500">{formatDate(currentTime)}</p>
              </div>
              <div className="mt-3 flex gap-2">
                <span className="badge-success">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  System Online
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Total Employees */}
          <div className="glass-card p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Employees</p>
                <p className="text-4xl font-bold text-gray-800 mt-2">{stats.totalEmployees || 0}</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-green-500 text-sm font-semibold">+12%</span>
                  <span className="text-gray-400 text-sm">vs last month</span>
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>

          {/* Active Today */}
          <div className="glass-card p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Present Today</p>
                <p className="text-4xl font-bold text-gray-800 mt-2">{stats.todayAttendance || 0}</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-green-500 text-sm font-semibold">
                    {stats.totalEmployees ? Math.round((stats.todayAttendance || 0) / stats.totalEmployees * 100) : 0}%
                  </span>
                  <span className="text-gray-400 text-sm">attendance rate</span>
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" style={{ width: `${stats.totalEmployees ? (stats.todayAttendance || 0) / stats.totalEmployees * 100 : 0}%` }}></div>
            </div>
          </div>

          {/* Pending Leaves */}
          <div className="glass-card p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Pending Leaves</p>
                <p className="text-4xl font-bold text-gray-800 mt-2">{stats.pendingLeaves || 0}</p>
                <div className="flex items-center gap-1 mt-2">
                  {(stats.pendingLeaves || 0) > 0 ? (
                    <>
                      <span className="text-amber-500 text-sm font-semibold">Requires</span>
                      <span className="text-gray-400 text-sm">attention</span>
                    </>
                  ) : (
                    <span className="text-green-500 text-sm font-semibold">All caught up!</span>
                  )}
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full" style={{ width: '30%' }}></div>
            </div>
          </div>

          {/* Payroll Status */}
          <div className="glass-card p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Monthly Payroll</p>
                <p className="text-4xl font-bold text-gray-800 mt-2">{stats.monthlyPayrolls || 0}</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-purple-500 text-sm font-semibold">Processed</span>
                  <span className="text-gray-400 text-sm">this month</span>
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-400 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Quick Actions */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </span>
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link to="/hr/employees" className="group p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 text-center border border-blue-100 hover:border-blue-200 hover:shadow-lg">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">Add Employee</span>
                </Link>
                
                <Link to="/hr/leaves" className="group p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all duration-300 text-center border border-green-100 hover:border-green-200 hover:shadow-lg">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">Approve Leaves</span>
                </Link>
                
                <Link to="/hr/payroll" className="group p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all duration-300 text-center border border-purple-100 hover:border-purple-200 hover:shadow-lg">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">Run Payroll</span>
                </Link>
                
                <Link to="/hr/attendance" className="group p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 transition-all duration-300 text-center border border-amber-100 hover:border-amber-200 hover:shadow-lg">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">Attendance</span>
                </Link>
              </div>
            </div>

            {/* Attendance Overview Chart */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </span>
                  Weekly Attendance Overview
                </h2>
                <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option>This Week</option>
                  <option>Last Week</option>
                  <option>This Month</option>
                </select>
              </div>
              
              {/* Simple CSS Bar Chart */}
              <div className="flex items-end justify-between gap-2 h-48 px-4">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                  const heights = [85, 92, 88, 95, 78, 45, 30];
                  return (
                    <div key={day} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-gray-100 rounded-t-lg relative overflow-hidden" style={{ height: '160px' }}>
                        <div 
                          className="absolute bottom-0 w-full bg-gradient-to-t from-purple-600 to-indigo-400 rounded-t-lg transition-all duration-500"
                          style={{ height: `${heights[i]}%` }}
                        >
                          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-gray-700">
                            {heights[i]}%
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-gray-500">{day}</span>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-400"></div>
                  <span className="text-sm text-gray-600">Attendance Rate</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-800">Avg: 73%</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  Recent Activity
                </h2>
                <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">View All</button>
              </div>
              
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      activity.type === 'leave' ? 'bg-amber-100 text-amber-600' :
                      activity.type === 'attendance' ? 'bg-green-100 text-green-600' :
                      activity.type === 'employee' ? 'bg-blue-100 text-blue-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      {activity.type === 'leave' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                      {activity.type === 'attendance' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      {activity.type === 'employee' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                      )}
                      {activity.type === 'payroll' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{activity.action}</p>
                      <p className="text-sm text-gray-500">{activity.user}</p>
                    </div>
                    <span className="text-xs text-gray-400">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            
            {/* Pending Approvals */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                Pending Approvals
              </h2>
              
              <div className="space-y-3">
                {pendingApprovals.map((item, index) => (
                  <div key={index} className={`p-4 rounded-xl ${item.urgent && item.count > 0 ? 'bg-red-50 border border-red-100' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">{item.type}</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        item.urgent && item.count > 0 ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {item.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <Link to="/hr/leaves" className="mt-4 w-full btn-gradient-primary block text-center py-3">
                Review All
              </Link>
            </div>

            {/* Department Distribution */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </span>
                Department Distribution
              </h2>
              
              <div className="space-y-4">
                {departmentData.map((dept, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-600">{dept.name}</span>
                      <span className="text-sm font-bold text-gray-800">{dept.count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${dept.color} rounded-full transition-all duration-500`}
                        style={{ width: `${(dept.count / totalDeptEmployees) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
                  </svg>
                </span>
                Upcoming Events
              </h2>
              
              <div className="space-y-3">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-100">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold text-sm">
                      {event.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{event.name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        {event.type === 'birthday' ? '🎂' : '🎉'} {event.type === 'birthday' ? 'Birthday' : 'Work Anniversary'}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-pink-600 bg-pink-100 px-2 py-1 rounded-full">
                      {event.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* System Health */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </span>
                System Status
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                  <span className="text-sm font-medium text-gray-700">API Server</span>
                  <span className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Operational
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                  <span className="text-sm font-medium text-gray-700">Database</span>
                  <span className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Connected
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                  <span className="text-sm font-medium text-gray-700">Email Service</span>
                  <span className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Stats Bar */}
        <div className="glass-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-6">
              <span className="text-gray-500">
                <strong className="text-gray-800">{stats.activeEmployees || stats.totalEmployees || 0}</strong> Active Employees
              </span>
              <span className="text-gray-500">
                <strong className="text-gray-800">{departmentData.length}</strong> Departments
              </span>
              <span className="text-gray-500">
                <strong className="text-gray-800">3</strong> Locations
              </span>
            </div>
            <div className="text-gray-400">
              Last updated: {formatTime(currentTime)}
            </div>
          </div>
        </div>
      </div>
    </HRLayout>
  );
};

export default HRDashboard;
