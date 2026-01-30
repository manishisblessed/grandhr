import { useState, useEffect } from 'react';

const ModernDashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    pendingLeaves: 0,
    todayAttendance: 0,
  });

  useEffect(() => {
    // Fetch stats from API
    // For now, using mock data
    setStats({
      totalEmployees: 156,
      activeEmployees: 148,
      pendingLeaves: 12,
      todayAttendance: 142,
    });
  }, []);

  const statCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      change: '+5.2%',
      icon: '👥',
      gradient: 'from-blue-500 to-cyan-500',
      bgPattern: 'bg-blue-100',
    },
    {
      title: 'Active Employees',
      value: stats.activeEmployees,
      change: '+2.1%',
      icon: '✅',
      gradient: 'from-green-500 to-emerald-500',
      bgPattern: 'bg-green-100',
    },
    {
      title: 'Pending Leaves',
      value: stats.pendingLeaves,
      change: '-3.4%',
      icon: '📅',
      gradient: 'from-orange-500 to-amber-500',
      bgPattern: 'bg-orange-100',
    },
    {
      title: 'Today Attendance',
      value: stats.todayAttendance,
      change: '+1.8%',
      icon: '⏰',
      gradient: 'from-purple-500 to-pink-500',
      bgPattern: 'bg-purple-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="glass-card p-8 rounded-2xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-2 border-purple-200/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">
              Welcome back! 👋
            </h1>
            <p className="text-gray-600 text-lg">
              Here's what's happening with your HR operations today
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 opacity-20 animate-float"></div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-grid">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="stat-card animate-fade-in-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-2xl shadow-lg`}>
                {stat.icon}
              </div>
              <span className={`badge-modern ${stat.change.startsWith('+') ? 'badge-success' : 'badge-warning'}`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</h3>
            <p className="text-sm text-gray-600">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="glass-card p-6">
          <h2 className="section-title text-2xl mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="btn-gradient-primary py-4 flex flex-col items-center gap-2">
              <span className="text-2xl">➕</span>
              <span>Add Employee</span>
            </button>
            <button className="btn-gradient-secondary py-4 flex flex-col items-center gap-2">
              <span className="text-2xl">📝</span>
              <span>Process Payroll</span>
            </button>
            <button className="btn-gradient-success py-4 flex flex-col items-center gap-2">
              <span className="text-2xl">📊</span>
              <span>Generate Report</span>
            </button>
            <button className="glass-card p-4 flex flex-col items-center gap-2 hover:scale-105 transition-transform">
              <span className="text-2xl">⚙️</span>
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-6">
          <h2 className="section-title text-2xl mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[
              { action: 'New employee added', user: 'John Doe', time: '2 mins ago', icon: '👤' },
              { action: 'Leave request approved', user: 'Jane Smith', time: '15 mins ago', icon: '✅' },
              { action: 'Payroll processed', user: 'System', time: '1 hour ago', icon: '💰' },
              { action: 'Attendance marked', user: 'Mike Johnson', time: '2 hours ago', icon: '⏰' },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-lg">
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.user} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="section-title text-2xl mb-4">Attendance Overview</h2>
          <div className="h-64 flex items-center justify-center text-gray-400">
            📊 Chart Placeholder
          </div>
        </div>
        <div className="glass-card p-6">
          <h2 className="section-title text-2xl mb-4">Department Distribution</h2>
          <div className="h-64 flex items-center justify-center text-gray-400">
            📈 Chart Placeholder
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernDashboard;

