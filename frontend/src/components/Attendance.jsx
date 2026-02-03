import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import HRLayout from './HRLayout';

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { showSuccess, showError, showInfo } = useToast();

  const hrUser = JSON.parse(localStorage.getItem('hr_user') || 'null');

  useEffect(() => {
    fetchAttendance();
    fetchTodayAttendance();
    
    // Update current time every second
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await api.get('/attendance/my-attendance', {
        params: { limit: 30 },
      });
      setAttendance(response.data.attendances || []);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const response = await api.get('/attendance/my-attendance', {
        params: { limit: 1 },
      });
      if (response.data.attendances?.[0]) {
        const today = new Date();
        const recordDate = new Date(response.data.attendances[0].date);
        if (today.toDateString() === recordDate.toDateString()) {
          setTodayAttendance(response.data.attendances[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch today attendance:', error);
    }
  };

  const handleClockIn = async () => {
    try {
      setProcessing(true);
      await api.post('/attendance/clock-in');
      showSuccess('Clocked in successfully! Have a productive day! 🚀');
      fetchTodayAttendance();
      fetchAttendance();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to clock in');
    } finally {
      setProcessing(false);
    }
  };

  const handleClockOut = async () => {
    try {
      setProcessing(true);
      await api.post('/attendance/clock-out', { breakDuration: 0 });
      showSuccess('Clocked out successfully! See you tomorrow! 👋');
      fetchTodayAttendance();
      fetchAttendance();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to clock out');
    } finally {
      setProcessing(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const calculateHours = (clockIn, clockOut) => {
    if (!clockIn || !clockOut) return null;
    const diff = new Date(clockOut) - new Date(clockIn);
    const hours = diff / (1000 * 60 * 60);
    return hours.toFixed(2);
  };

  const getStatusBadge = (status, isLate) => {
    if (status === 'PRESENT' && isLate) {
      return 'bg-orange-100 text-orange-800';
    }
    const badges = {
      PRESENT: 'bg-green-100 text-green-800',
      ABSENT: 'bg-red-100 text-red-800',
      HALF_DAY: 'bg-yellow-100 text-yellow-800',
      LATE: 'bg-orange-100 text-orange-800',
      ON_LEAVE: 'bg-blue-100 text-blue-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  // Calculate stats for the month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyAttendance = attendance.filter(a => {
    const date = new Date(a.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });
  
  const presentDays = monthlyAttendance.filter(a => a.status === 'PRESENT').length;
  const lateDays = monthlyAttendance.filter(a => a.isLate).length;
  const totalHours = monthlyAttendance.reduce((sum, a) => {
    const hours = calculateHours(a.clockIn, a.clockOut);
    return sum + (hours ? parseFloat(hours) : 0);
  }, 0);

  return (
    <HRLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
            <p className="text-gray-500">Track your daily attendance</p>
          </div>
        </div>
        {/* Current Time Card */}
        <div className="bg-gradient-to-r from-accent-600 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-white/80 text-sm">Current Time</p>
              <p className="text-4xl md:text-5xl font-bold">
                {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
              <p className="text-white/70 mt-1">
                {currentTime.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            
            {/* Clock In/Out Button */}
            <div className="text-center">
              {todayAttendance ? (
                todayAttendance.clockOut ? (
                  <div className="bg-white/20 rounded-xl p-4">
                    <p className="text-white/80 text-sm mb-1">Today's Work Complete</p>
                    <p className="text-2xl font-bold">
                      {calculateHours(todayAttendance.clockIn, todayAttendance.clockOut)}h
                    </p>
                    <p className="text-white/70 text-sm">Total Hours</p>
                  </div>
                ) : (
                  <button
                    onClick={handleClockOut}
                    disabled={processing}
                    className="px-8 py-4 bg-white text-red-600 rounded-xl font-bold text-lg hover:bg-red-50 transition-all transform hover:scale-105 disabled:opacity-50 shadow-lg"
                  >
                    {processing ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      '🔴 Clock Out'
                    )}
                  </button>
                )
              ) : (
                <button
                  onClick={handleClockIn}
                  disabled={processing}
                  className="px-8 py-4 bg-white text-green-600 rounded-xl font-bold text-lg hover:bg-green-50 transition-all transform hover:scale-105 disabled:opacity-50 shadow-lg"
                >
                  {processing ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    '🟢 Clock In'
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Today's Status */}
          {todayAttendance && (
            <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-white/70 text-sm">Clock In</p>
                <p className="font-semibold">{formatTime(todayAttendance.clockIn)}</p>
              </div>
              <div className="text-center">
                <p className="text-white/70 text-sm">Clock Out</p>
                <p className="font-semibold">{todayAttendance.clockOut ? formatTime(todayAttendance.clockOut) : '--:--'}</p>
              </div>
              <div className="text-center">
                <p className="text-white/70 text-sm">Status</p>
                <p className="font-semibold">{todayAttendance.status}</p>
              </div>
              <div className="text-center">
                <p className="text-white/70 text-sm">Late</p>
                <p className="font-semibold">{todayAttendance.isLate ? 'Yes' : 'No'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Monthly Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Days Present</p>
                <p className="text-2xl font-bold text-green-600">{presentDays}</p>
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
                <p className="text-2xl font-bold text-orange-600">{lateDays}</p>
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
                <p className="text-gray-500 text-sm">Total Hours</p>
                <p className="text-2xl font-bold text-blue-600">{totalHours.toFixed(1)}h</p>
                <p className="text-xs text-gray-400 mt-1">This month</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance History */}
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Attendance History</h3>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading attendance...</p>
            </div>
          ) : attendance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Clock In</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Clock Out</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Hours</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {attendance.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="font-medium text-gray-900">{formatDate(record.date)}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatTime(record.clockIn)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {record.clockOut ? formatTime(record.clockOut) : '--:--'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="font-medium text-gray-900">
                          {calculateHours(record.clockIn, record.clockOut) 
                            ? `${calculateHours(record.clockIn, record.clockOut)}h`
                            : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(record.status, record.isLate)}`}>
                          {record.isLate ? 'LATE' : record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">📋</div>
              <p className="text-gray-500">No attendance records found</p>
              <p className="text-gray-400 text-sm mt-1">Start by clocking in today!</p>
            </div>
          )}
        </div>
      </div>
    </HRLayout>
  );
};

export default Attendance;
