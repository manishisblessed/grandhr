import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  BarChart3,
  CalendarDays,
  Download,
  Loader2,
  Plane,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { reportsApi, downloadReportCsv } from '../../api/reports';
import { cn } from '../../lib/utils';

const PALETTE = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#0ea5e9', '#ec4899', '#14b8a6'];

const formatINR = (n) => {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  if (Math.abs(n) >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (Math.abs(n) >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
};

const formatNumber = (n) => (n === null || n === undefined ? '—' : Number(n).toLocaleString('en-IN'));

const MONTHS = [
  { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
  { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
  { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
  { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' },
];

export default function HRReports() {
  const [tab, setTab] = useState('headcount');

  return (
    <div className="space-y-8">
      <Header />
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full md:w-auto">
          <TabsTrigger value="headcount" className="gap-1.5">
            <Users className="size-3.5" />
            Headcount
          </TabsTrigger>
          <TabsTrigger value="attendance" className="gap-1.5">
            <CalendarDays className="size-3.5" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="leaves" className="gap-1.5">
            <Plane className="size-3.5" />
            Leaves
          </TabsTrigger>
          <TabsTrigger value="payroll" className="gap-1.5">
            <Wallet className="size-3.5" />
            Payroll
          </TabsTrigger>
        </TabsList>
        <TabsContent value="headcount" className="mt-6">
          <HeadcountTab />
        </TabsContent>
        <TabsContent value="attendance" className="mt-6">
          <AttendanceTab />
        </TabsContent>
        <TabsContent value="leaves" className="mt-6">
          <LeavesTab />
        </TabsContent>
        <TabsContent value="payroll" className="mt-6">
          <PayrollTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Header() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/10 via-card to-accent/10 p-6 md:p-8"
    >
      <div className="relative z-10 max-w-2xl">
        <Badge variant="gradient" className="mb-3">
          <BarChart3 className="size-3" />
          Reports & Analytics
        </Badge>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
          Know your workforce.{' '}
          <span className="text-gradient-primary">In a glance.</span>
        </h1>
        <p className="mt-2 text-sm md:text-base text-muted-foreground">
          Headcount trends, attendance, leaves, payroll cost — every chart you need plus one-click CSV export to share with leadership or import into your accounting software.
        </p>
      </div>
      <div className="absolute -right-12 -bottom-12 size-56 rounded-full bg-gradient-to-br from-primary to-accent opacity-15 blur-2xl" />
    </motion.div>
  );
}

// --- shared ---
function KpiCard({ icon: Icon, label, value, hint, accent = 'primary' }) {
  const ring = {
    primary: 'from-indigo-500 to-violet-500',
    success: 'from-emerald-500 to-green-600',
    warning: 'from-amber-500 to-orange-500',
    danger: 'from-rose-500 to-red-600',
  }[accent];
  return (
    <Card className="overflow-hidden">
      <div className={cn('h-1.5 bg-gradient-to-r', ring)} />
      <CardContent className="p-5">
        <div className="flex items-center gap-3">
          <div className={cn('size-10 rounded-xl grid place-items-center bg-gradient-to-br text-white', ring)}>
            <Icon className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="font-display text-2xl font-bold leading-tight truncate">{value}</p>
            {hint ? <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{hint}</p> : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ExportButton({ path, params, label = 'Export CSV' }) {
  const [busy, setBusy] = useState(false);
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          const fname = await downloadReportCsv(path, params);
          toast.success(`Downloaded ${fname}`);
        } catch (err) {
          toast.error(err?.message || 'Could not download CSV');
        } finally {
          setBusy(false);
        }
      }}
      className="gap-2"
    >
      {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
      {label}
    </Button>
  );
}

function ChartCard({ title, action, children, className }) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-sm md:text-base">{title}</h3>
          {action}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

const tooltipStyle = {
  contentStyle: {
    background: 'hsl(var(--popover))',
    border: '1px solid hsl(var(--border))',
    borderRadius: 10,
    fontSize: 12,
    color: 'hsl(var(--popover-foreground))',
  },
  labelStyle: { color: 'hsl(var(--foreground))', fontWeight: 600 },
};

// --- HEADCOUNT ---
function HeadcountTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['reports', 'headcount'],
    queryFn: () => reportsApi.headcount(),
  });

  if (isLoading) return <SkeletonGrid />;

  const totals = data?.totals || {};
  const trend = data?.trend || [];
  const dept = data?.departmentBreakdown || [];
  const status = data?.statusBreakdown || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Users} label="Total" value={formatNumber(totals.total)} accent="primary" />
        <KpiCard icon={TrendingUp} label="Active" value={formatNumber(totals.active)} accent="success" />
        <KpiCard icon={Users} label="Joiners (this month)" value={formatNumber(totals.thisMonthJoiners)} accent="primary" />
        <KpiCard icon={Users} label="Exits (this month)" value={formatNumber(totals.thisMonthExits)} accent="warning" />
      </div>

      <ChartCard
        title="Active headcount trend (last 12 months)"
        action={<ExportButton path="/reports/headcount" />}
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="hcGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
              <RTooltip {...tooltipStyle} />
              <Area
                type="monotone"
                dataKey="active"
                stroke="#6366f1"
                strokeWidth={2.5}
                fill="url(#hcGradient)"
                name="Active"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Headcount by department">
          {dept.length === 0 ? (
            <Empty hint="Assign departments to your employees to see this breakdown." />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dept} layout="vertical" margin={{ left: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} width={100} />
                  <RTooltip {...tooltipStyle} />
                  <Bar dataKey="count" radius={[6, 6, 6, 6]}>
                    {dept.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Joiners vs exits">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
                <RTooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="joined" fill="#10b981" name="Joiners" radius={[4, 4, 0, 0]} />
                <Bar dataKey="exited" fill="#ef4444" name="Exits" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Employment status">
        {status.length === 0 ? (
          <Empty />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {status.map((s, i) => (
              <div key={s.status} className="rounded-xl border bg-card/60 p-4 text-center">
                <div className="size-2 rounded-full mx-auto mb-2" style={{ background: PALETTE[i % PALETTE.length] }} />
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{s.status.replace(/_/g, ' ')}</p>
                <p className="font-display text-xl font-bold mt-1">{formatNumber(s.count)}</p>
              </div>
            ))}
          </div>
        )}
      </ChartCard>
    </div>
  );
}

// --- ATTENDANCE ---
function AttendanceTab() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const yearOptions = useMemo(() => {
    const out = [];
    for (let y = today.getFullYear(); y >= today.getFullYear() - 4; y--) out.push(y);
    return out;
  }, [today]);

  const { data, isLoading } = useQuery({
    queryKey: ['reports', 'attendance', month, year],
    queryFn: () => reportsApi.attendance({ month, year }),
  });

  if (isLoading) return <SkeletonGrid />;

  const totals = data?.totals || {};
  const rows = data?.rows || [];
  const daily = data?.daily || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Select value={String(month)} onValueChange={(v) => setMonth(parseInt(v))}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              {MONTHS.map((m) => (
                <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={String(year)} onValueChange={(v) => setYear(parseInt(v))}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              {yearOptions.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <ExportButton path="/reports/attendance" params={{ month, year }} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Users} label="Active employees" value={formatNumber(totals.employees)} accent="primary" />
        <KpiCard icon={CalendarDays} label="Working days" value={formatNumber(totals.workingDays)} accent="primary" />
        <KpiCard icon={TrendingUp} label="Avg attendance" value={`${totals.avgAttendancePct ?? 0}%`} accent="success" />
        <KpiCard icon={CalendarDays} label="Total late" value={formatNumber(totals.totalLateInstances)} accent="warning" />
      </div>

      <ChartCard title={`Daily presence — ${data?.label || ''}`}>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tickFormatter={(d) => d.slice(8)} stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
              <RTooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="present" stroke="#10b981" strokeWidth={2} dot={false} name="Present" />
              <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} dot={false} name="Absent" />
              <Line type="monotone" dataKey="onLeave" stroke="#f59e0b" strokeWidth={2} dot={false} name="On leave" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="Per-employee attendance">
        {rows.length === 0 ? (
          <Empty hint="No attendance recorded for this month yet." />
        ) : (
          <div className="overflow-x-auto -mx-2 px-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-2 pr-3">Employee</th>
                  <th className="py-2 pr-3">Department</th>
                  <th className="py-2 pr-3 text-right">Present</th>
                  <th className="py-2 pr-3 text-right">Absent</th>
                  <th className="py-2 pr-3 text-right">On leave</th>
                  <th className="py-2 pr-3 text-right">Late</th>
                  <th className="py-2 pr-3 text-right">Hours</th>
                  <th className="py-2 pl-3 text-right">Attendance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {rows.slice(0, 50).map((r) => (
                  <tr key={r.employeeId} className="hover:bg-muted/30">
                    <td className="py-2 pr-3">
                      <p className="font-medium">{r.name}</p>
                      <p className="text-[11px] text-muted-foreground">{r.employeeId}</p>
                    </td>
                    <td className="py-2 pr-3 text-muted-foreground">{r.department}</td>
                    <td className="py-2 pr-3 text-right">{formatNumber(r.present)}</td>
                    <td className="py-2 pr-3 text-right">{formatNumber(r.absent)}</td>
                    <td className="py-2 pr-3 text-right">{formatNumber(r.onLeave)}</td>
                    <td className="py-2 pr-3 text-right">{formatNumber(r.late)}</td>
                    <td className="py-2 pr-3 text-right">{formatNumber(r.hours)}</td>
                    <td className="py-2 pl-3 text-right">
                      <span
                        className={cn(
                          'inline-block rounded-full px-2 py-0.5 text-xs font-semibold',
                          r.attendancePct >= 90
                            ? 'bg-emerald-500/15 text-emerald-600'
                            : r.attendancePct >= 75
                              ? 'bg-amber-500/15 text-amber-600'
                              : 'bg-rose-500/15 text-rose-600',
                        )}
                      >
                        {r.attendancePct}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 50 ? (
              <p className="text-xs text-muted-foreground mt-3">
                Showing first 50 of {rows.length} employees · download the CSV for the full list.
              </p>
            ) : null}
          </div>
        )}
      </ChartCard>
    </div>
  );
}

// --- LEAVES ---
function LeavesTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['reports', 'leaves'],
    queryFn: () => reportsApi.leaves(),
  });

  if (isLoading) return <SkeletonGrid />;

  const totals = data?.totals || {};
  const byType = data?.byType || [];
  const monthly = data?.monthly || [];
  const top = data?.topConsumers || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <ExportButton path="/reports/leaves" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Plane} label="Total requests" value={formatNumber(totals.requests)} accent="primary" />
        <KpiCard icon={TrendingUp} label="Approved" value={formatNumber(totals.approved)} accent="success" />
        <KpiCard icon={Plane} label="Pending" value={formatNumber(totals.pending)} accent="warning" />
        <KpiCard icon={CalendarDays} label="Total days off" value={formatNumber(totals.totalDays)} accent="primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Leave days by type">
          {byType.length === 0 ? (
            <Empty />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byType}
                    dataKey="days"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={50}
                    paddingAngle={2}
                  >
                    {byType.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Pie>
                  <RTooltip {...tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Leave days · last 12 months">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <RTooltip {...tooltipStyle} />
                <Bar dataKey="days" name="Days off" radius={[4, 4, 0, 0]}>
                  {monthly.map((_, i) => (
                    <Cell key={i} fill="#8b5cf6" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Top leave consumers (last 12 months)">
        {top.length === 0 ? (
          <Empty />
        ) : (
          <div className="space-y-2">
            {top.map((c, i) => {
              const max = Math.max(...top.map((x) => x.days), 1);
              const pct = Math.max(4, (c.days / max) * 100);
              return (
                <div key={c.employeeId} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="size-6 rounded-full bg-gradient-to-br from-primary to-accent text-white text-[11px] font-bold grid place-items-center shrink-0">
                        {i + 1}
                      </span>
                      <p className="font-medium truncate">{c.name}</p>
                      <span className="text-xs text-muted-foreground hidden md:inline">· {c.department}</span>
                    </div>
                    <p className="text-sm font-semibold whitespace-nowrap">
                      {c.days} days <span className="text-muted-foreground font-normal">· {c.requests} req</span>
                    </p>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ChartCard>
    </div>
  );
}

// --- PAYROLL ---
function PayrollTab() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const yearOptions = useMemo(() => {
    const out = [];
    for (let y = today.getFullYear(); y >= today.getFullYear() - 4; y--) out.push(y);
    return out;
  }, [today]);

  const { data, isLoading } = useQuery({
    queryKey: ['reports', 'payroll', month, year],
    queryFn: () => reportsApi.payroll({ month, year }),
  });

  if (isLoading) return <SkeletonGrid />;

  const totals = data?.totals || {};
  const trend = data?.trend || [];
  const byDept = data?.byDepartment || [];
  const status = data?.statusBreakdown || [];
  const rows = data?.rows || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Select value={String(month)} onValueChange={(v) => setMonth(parseInt(v))}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              {MONTHS.map((m) => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={String(year)} onValueChange={(v) => setYear(parseInt(v))}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              {yearOptions.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <ExportButton path="/reports/payroll" params={{ month, year }} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Users} label="Employees paid" value={formatNumber(totals.employees)} accent="primary" />
        <KpiCard icon={Wallet} label="Gross payout" value={formatINR(totals.gross)} accent="primary" />
        <KpiCard icon={Wallet} label="Net payout" value={formatINR(totals.net)} accent="success" />
        <KpiCard icon={Wallet} label="Avg net pay" value={formatINR(totals.avgNet)} accent="primary" />
      </div>

      <ChartCard title="Net payroll cost · last 12 months">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="payrollGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => formatINR(v)} width={70} />
              <RTooltip {...tooltipStyle} formatter={(v) => formatINR(v)} />
              <Area type="monotone" dataKey="net" stroke="#10b981" strokeWidth={2.5} fill="url(#payrollGradient)" name="Net" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Cost by department">
          {byDept.length === 0 ? (
            <Empty hint="Generate this month's payroll to see costs by department." />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byDept} layout="vertical" margin={{ left: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => formatINR(v)} />
                  <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} width={100} />
                  <RTooltip {...tooltipStyle} formatter={(v) => formatINR(v)} />
                  <Bar dataKey="net" name="Net" radius={[0, 6, 6, 0]}>
                    {byDept.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Status mix">
          {status.length === 0 ? (
            <Empty />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={status}
                    dataKey="count"
                    nameKey="status"
                    outerRadius={90}
                    innerRadius={50}
                    paddingAngle={2}
                  >
                    {status.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                  </Pie>
                  <RTooltip {...tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>

      <ChartCard title={`Payroll detail — ${data?.label || ''}`}>
        {rows.length === 0 ? (
          <Empty hint="Generate payroll for this month from the Payroll page to populate this report." />
        ) : (
          <div className="overflow-x-auto -mx-2 px-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-2 pr-3">Employee</th>
                  <th className="py-2 pr-3">Department</th>
                  <th className="py-2 pr-3 text-right">Base</th>
                  <th className="py-2 pr-3 text-right">Allowances</th>
                  <th className="py-2 pr-3 text-right">Deductions</th>
                  <th className="py-2 pr-3 text-right">Tax</th>
                  <th className="py-2 pr-3 text-right">Net</th>
                  <th className="py-2 pl-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {rows.slice(0, 50).map((r) => (
                  <tr key={r.employeeId + r.name} className="hover:bg-muted/30">
                    <td className="py-2 pr-3">
                      <p className="font-medium">{r.name}</p>
                      <p className="text-[11px] text-muted-foreground">{r.employeeId}</p>
                    </td>
                    <td className="py-2 pr-3 text-muted-foreground">{r.department}</td>
                    <td className="py-2 pr-3 text-right">{formatINR(r.baseSalary)}</td>
                    <td className="py-2 pr-3 text-right">{formatINR(r.allowances)}</td>
                    <td className="py-2 pr-3 text-right">{formatINR(r.deductions)}</td>
                    <td className="py-2 pr-3 text-right">{formatINR(r.tax)}</td>
                    <td className="py-2 pr-3 text-right font-semibold">{formatINR(r.netSalary)}</td>
                    <td className="py-2 pl-3 text-right">
                      <span
                        className={cn(
                          'inline-block rounded-full px-2 py-0.5 text-xs font-semibold',
                          r.status === 'PAID'
                            ? 'bg-emerald-500/15 text-emerald-600'
                            : r.status === 'PENDING'
                              ? 'bg-amber-500/15 text-amber-600'
                              : 'bg-rose-500/15 text-rose-600',
                        )}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 50 ? (
              <p className="text-xs text-muted-foreground mt-3">
                Showing first 50 of {rows.length} records · download the CSV for the full payroll.
              </p>
            ) : null}
          </div>
        )}
      </ChartCard>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-72 rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </div>
  );
}

function Empty({ hint = 'Not enough data yet.' }) {
  return (
    <div className="rounded-xl border border-dashed bg-muted/20 p-8 text-center text-sm text-muted-foreground">
      {hint}
    </div>
  );
}
