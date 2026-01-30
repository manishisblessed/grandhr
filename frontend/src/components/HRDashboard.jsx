import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import Layout from './Layout';

const HRDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hrUser = JSON.parse(localStorage.getItem('hr_user') || 'null');

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
      const isEmployer = hrUser?.role === 'ADMIN' || hrUser?.role === 'HR' || hrUser?.role === 'MANAGER';
      const endpoint = isEmployer 
        ? '/dashboard/admin' 
        : '/dashboard/employee';
      const response = await api.get(endpoint);
      
      // Transform backend response to match frontend expectations
      if (isEmployer) {
        // Admin dashboard returns: { stats: { totalEmployees, pendingLeaves, todayAttendance, monthlyPayrolls }, ... }
        const data = response.data;
        setDashboardData({
          totalEmployees: data.stats?.totalEmployees || 0,
          pendingLeaves: data.stats?.pendingLeaves || 0,
          todayAttendance: data.stats?.todayAttendance || 0,
          pendingPayrolls: data.stats?.monthlyPayrolls || 0,
        });
      } else {
        // Employee dashboard returns: { stats: { pendingLeaves, approvedLeaves, totalWorkDays, totalHours }, ... }
        const data = response.data;
        setDashboardData({
          myLeaves: data.stats?.pendingLeaves || 0,
          myAttendance: data.stats?.totalWorkDays || 0,
          myPayrolls: data.recentPayrolls?.length || 0,
        });
      }
    } catch (err) {
      // If endpoint doesn't exist or unauthorized, try employee endpoint
      if (err.response?.status === 404 || err.response?.status === 403) {
        try {
          const response = await api.get('/dashboard/employee');
          const data = response.data;
          setDashboardData({
            myLeaves: data.stats?.pendingLeaves || 0,
            myAttendance: data.stats?.totalWorkDays || 0,
            myPayrolls: data.recentPayrolls?.length || 0,
          });
        } catch (err2) {
          setError(err2.response?.data?.message || 'Failed to load dashboard data. Make sure you are logged in and the backend is running.');
        }
      } else {
        const errorMsg = err.response?.data?.message || err.message || 'Failed to load dashboard data';
        setError(errorMsg);
        console.error('Dashboard error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Dashboard" description="HR Management Dashboard" icon="📊">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Dashboard" description="HR Management Dashboard" icon="📊">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <p className="text-red-600 mb-4 font-semibold">{error}</p>
            <div className="bg-gray-50 rounded-lg p-4 text-left text-sm text-gray-600 space-y-2">
              <p className="font-semibold">Troubleshooting steps:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Make sure backend API is running (check <code className="bg-gray-200 px-1 rounded">backend/</code> folder)</li>
                <li>Verify you are logged in to HR system</li>
                <li>Check <code className="bg-gray-200 px-1 rounded">VITE_API_URL</code> in frontend/.env</li>
                <li>Open browser console (F12) to see detailed errors</li>
                <li>Try refreshing the page</li>
              </ol>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const isEmployer = hrUser?.role === 'ADMIN' || hrUser?.role === 'HR' || hrUser?.role === 'MANAGER';
  const isEmployee = hrUser?.role === 'EMPLOYEE';

  return (
    <Layout 
      title="Dashboard" 
      description={isEmployer ? "HR Management Dashboard" : "Employee Dashboard"} 
      icon="📊"
    >
      <div className="space-y-6">
        {isEmployee && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">
              <strong>Welcome, Employee!</strong> View your leaves, attendance, and payroll information below.
            </p>
          </div>
        )}

        {dashboardData ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {isEmployer ? (
                <>
                  <div className="card">
                    <div className="text-3xl mb-2">👥</div>
                    <div className="text-3xl font-bold text-gray-800">{dashboardData.totalEmployees ?? 0}</div>
                    <div className="text-gray-600">Total Employees</div>
                  </div>
                  <div className="card">
                    <div className="text-3xl mb-2">📅</div>
                    <div className="text-3xl font-bold text-gray-800">{dashboardData.pendingLeaves ?? 0}</div>
                    <div className="text-gray-600">Pending Leaves</div>
                  </div>
                  <div className="card">
                    <div className="text-3xl mb-2">⏰</div>
                    <div className="text-3xl font-bold text-gray-800">{dashboardData.todayAttendance ?? 0}</div>
                    <div className="text-gray-600">Today's Attendance</div>
                  </div>
                  <div className="card">
                    <div className="text-3xl mb-2">💰</div>
                    <div className="text-3xl font-bold text-gray-800">{dashboardData.pendingPayrolls ?? 0}</div>
                    <div className="text-gray-600">Pending Payrolls</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="card">
                    <div className="text-3xl mb-2">📅</div>
                    <div className="text-3xl font-bold text-gray-800">{dashboardData.myLeaves ?? 0}</div>
                    <div className="text-gray-600">My Leaves</div>
                  </div>
                  <div className="card">
                    <div className="text-3xl mb-2">⏰</div>
                    <div className="text-3xl font-bold text-gray-800">{dashboardData.myAttendance ?? 0}</div>
                    <div className="text-gray-600">My Attendance</div>
                  </div>
                  <div className="card">
                    <div className="text-3xl mb-2">💰</div>
                    <div className="text-3xl font-bold text-gray-800">{dashboardData.myPayrolls ?? 0}</div>
                    <div className="text-gray-600">My Payrolls</div>
                  </div>
                  <div className="card">
                    <div className="text-3xl mb-2">👤</div>
                    <div className="text-3xl font-bold text-gray-800">1</div>
                    <div className="text-gray-600">My Profile</div>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="card text-center py-12">
            <p className="text-gray-600 mb-4">No dashboard data available</p>
            <p className="text-sm text-gray-500">
              This might be because:
              <br />• Backend API is not running
              <br />• No data exists yet in the database
              <br />• Check browser console for errors
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HRDashboard;

