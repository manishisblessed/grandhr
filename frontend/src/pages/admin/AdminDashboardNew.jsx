import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Users,
  CalendarCheck2,
  Plane,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  FileText,
  Bot,
  IdCard,
  Mail,
  Send,
  ArrowRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { dashboardApi } from '../../api/dashboard';
import { employeesApi } from '../../api/employees';
import { useAuth } from '../../contexts/AuthContext';
import { getInitials, formatDate } from '../../lib/utils';

const attendanceTrend = [
  { day: 'Mon', present: 92 },
  { day: 'Tue', present: 95 },
  { day: 'Wed', present: 88 },
  { day: 'Thu', present: 93 },
  { day: 'Fri', present: 90 },
  { day: 'Sat', present: 70 },
  { day: 'Sun', present: 12 },
];

const departmentSplit = [
  { name: 'Engineering', value: 42, color: '#8b5cf6' },
  { name: 'Sales', value: 26, color: '#6366f1' },
  { name: 'Operations', value: 18, color: '#06b6d4' },
  { name: 'HR & Admin', value: 14, color: '#f59e0b' },
];

const quickActions = [
  { label: 'Add employee', desc: 'Onboard a new team member', icon: Users, to: '/hr/employees', color: 'from-violet-500 to-indigo-500' },
  { label: 'Send a document', desc: 'Offer letter, payslip, more', icon: Send, to: '/hr/templates', color: 'from-pink-500 to-rose-500' },
  { label: 'Mark attendance', desc: 'Today / yesterday / bulk', icon: CalendarCheck2, to: '/hr/attendance', color: 'from-emerald-500 to-teal-500' },
  { label: 'Approve leaves', desc: 'Pending approvals queue', icon: Plane, to: '/hr/leaves', color: 'from-amber-500 to-orange-500' },
];

export default function AdminDashboardNew() {
  const { user } = useAuth();
  const firstName = user?.employee?.firstName || 'there';

  const { data: stats } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: dashboardApi.stats,
  });
  const { data: employeesData, isLoading: empLoading } = useQuery({
    queryKey: ['employees', 'list', { page: 1, limit: 6 }],
    queryFn: () => employeesApi.list({ page: 1, limit: 6 }),
  });

  const employees = employeesData?.employees || [];
  const totalEmployees = employeesData?.pagination?.total ?? stats?.totalEmployees ?? employees.length ?? 0;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-card to-accent/10 p-6 md:p-8"
      >
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <Badge variant="gradient" className="mb-3">
              <Sparkles className="size-3" />
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Badge>
            <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
              Hi {firstName}, welcome back
            </h1>
            <p className="mt-2 text-muted-foreground max-w-xl">
              Your team has{' '}
              <span className="font-semibold text-foreground">{totalEmployees} active employees</span>{' '}
              today. Here's what's happening across the company.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="gradient" size="lg">
              <Link to="/hr/templates">
                <Send className="size-4" />
                Send a document
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/hr/employees">
                <Users className="size-4" />
                Add employee
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={Users}
          label="Total employees"
          value={totalEmployees}
          delta="+12% this quarter"
          color="from-violet-500 to-indigo-500"
        />
        <KpiCard
          icon={CalendarCheck2}
          label="Present today"
          value={stats?.presentToday ?? Math.max(0, totalEmployees - 8)}
          delta="92% attendance"
          color="from-emerald-500 to-teal-500"
        />
        <KpiCard
          icon={Plane}
          label="Leave requests"
          value={stats?.pendingLeaves ?? 7}
          delta="3 awaiting approval"
          color="from-amber-500 to-orange-500"
        />
        <KpiCard
          icon={Wallet}
          label="Payroll this month"
          value={stats?.payrollProcessed ?? '₹14.2L'}
          delta="On track for 30th"
          color="from-pink-500 to-rose-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div>
              <CardTitle>Attendance this week</CardTitle>
              <CardDescription>Daily present % across the company</CardDescription>
            </div>
            <Badge variant="success">
              <TrendingUp className="size-3" />
              +4.2% vs last week
            </Badge>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceTrend} margin={{ left: -10, right: 10, top: 6, bottom: 0 }}>
                <defs>
                  <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area
                  type="monotone"
                  dataKey="present"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  fill="url(#attGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workforce mix</CardTitle>
            <CardDescription>By department</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentSplit}
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {departmentSplit.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {departmentSplit.map((d) => (
                <div key={d.name} className="flex items-center gap-2 text-xs">
                  <span className="size-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="ml-auto font-semibold">{d.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold">Quick actions</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((q, i) => (
            <motion.div
              key={q.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="relative"
            >
              <Link
                to={q.to}
                className="group relative block rounded-xl border bg-card p-5 hover:border-primary/50 transition-colors"
              >
                <div className={`size-10 rounded-lg bg-gradient-to-br ${q.color} grid place-items-center text-white shadow-md mb-4`}>
                  <q.icon className="size-5" />
                </div>
                <p className="font-semibold mb-1">{q.label}</p>
                <p className="text-xs text-muted-foreground">{q.desc}</p>
                <ArrowUpRight className="absolute top-4 right-4 size-4 text-muted-foreground group-hover:text-primary group-hover:rotate-12 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent employees */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recently added employees</CardTitle>
            <CardDescription>Your latest joiners — onboard them in seconds</CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/hr/employees">
              View all
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {empLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : employees.length === 0 ? (
            <EmptyEmployees />
          ) : (
            <div className="divide-y divide-border">
              {employees.map((e) => {
                const fullName = `${e.firstName ?? ''} ${e.lastName ?? ''}`.trim() || e.user?.email;
                return (
                  <div key={e.id} className="flex items-center gap-4 py-3">
                    <Avatar className="size-10">
                      <AvatarFallback>{getInitials(fullName)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{fullName}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {e.user?.email} · {e.employeeId}
                      </p>
                    </div>
                    <Badge variant="outline" className="hidden sm:inline-flex">
                      {e.designation || e.user?.role || 'EMPLOYEE'}
                    </Badge>
                    <p className="hidden md:block text-xs text-muted-foreground">
                      Joined {formatDate(e.joiningDate || e.createdAt)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, delta, color }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="mt-2 font-display text-3xl font-bold">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{delta}</p>
          </div>
          <div className={`size-10 rounded-lg bg-gradient-to-br ${color} grid place-items-center text-white shadow-md`}>
            <Icon className="size-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyEmployees() {
  return (
    <div className="text-center py-10">
      <div className="size-12 mx-auto rounded-xl bg-primary/10 grid place-items-center mb-3">
        <Users className="size-5 text-primary" />
      </div>
      <h4 className="font-semibold">No employees yet</h4>
      <p className="text-sm text-muted-foreground mt-1">
        Add your first team member to get started.
      </p>
      <Button asChild variant="gradient" size="sm" className="mt-4">
        <Link to="/hr/employees">Add employee</Link>
      </Button>
    </div>
  );
}
