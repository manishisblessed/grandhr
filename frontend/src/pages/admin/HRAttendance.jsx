import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  CalendarClock,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Filter,
  X,
  Pencil,
  Plane,
  Sun,
  AlertTriangle,
  Activity,
  Users,
  TrendingUp,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

import { attendanceApi } from '../../api/attendance';
import { employeesApi } from '../../api/employees';
import { getInitials, cn } from '../../lib/utils';

const STATUS_META = {
  PRESENT: { label: 'Present', color: 'from-emerald-500 to-teal-500', badge: 'success', icon: CheckCircle2 },
  ABSENT: { label: 'Absent', color: 'from-rose-500 to-pink-500', badge: 'destructive', icon: XCircle },
  HALF_DAY: { label: 'Half day', color: 'from-amber-500 to-orange-500', badge: 'warning', icon: Clock },
  HOLIDAY: { label: 'Holiday', color: 'from-violet-500 to-purple-500', badge: 'secondary', icon: Sun },
  WEEKEND: { label: 'Weekend', color: 'from-slate-500 to-zinc-500', badge: 'outline', icon: Sun },
  LATE: { label: 'Late', color: 'from-amber-500 to-orange-500', badge: 'warning', icon: AlertTriangle },
  EARLY_DEPARTURE: { label: 'Left early', color: 'from-amber-500 to-orange-500', badge: 'warning', icon: AlertTriangle },
  ON_LEAVE: { label: 'On leave', color: 'from-sky-500 to-blue-500', badge: 'info', icon: Plane },
  REGULARIZED: { label: 'Regularized', color: 'from-emerald-500 to-teal-500', badge: 'success', icon: CheckCircle2 },
};

const STATUS_OPTIONS = [
  'PRESENT',
  'ABSENT',
  'HALF_DAY',
  'LATE',
  'EARLY_DEPARTURE',
  'ON_LEAVE',
  'HOLIDAY',
  'WEEKEND',
];

const todayIso = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
};

function shiftDate(dateStr, deltaDays) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + deltaDays);
  return d.toISOString().slice(0, 10);
}

function formatDayLabel(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function formatTime(d) {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export default function HRAttendance() {
  const qc = useQueryClient();
  const [date, setDate] = useState(todayIso());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [marking, setMarking] = useState(null);

  const { data: empData, isLoading: empLoading } = useQuery({
    queryKey: ['hr-attendance-employees'],
    queryFn: () => employeesApi.list({ limit: 200 }),
  });

  const { data: attData, isLoading: attLoading } = useQuery({
    queryKey: ['hr-attendance-by-date', date],
    queryFn: () => attendanceApi.byDate(date),
  });

  const employees = empData?.employees || [];
  const attendances = attData?.attendances || [];

  // Build a unified roster: every active employee + their attendance for the day (or "Absent")
  const roster = useMemo(() => {
    const byEmpId = new Map(attendances.map((a) => [a.employee?.id || a.employeeId, a]));
    const isWeekend = (() => {
      const dow = new Date(date).getDay();
      return dow === 0 || dow === 6;
    })();

    return employees
      .filter((e) => e.isActive !== false)
      .map((e) => {
        const att = byEmpId.get(e.id);
        const status = att?.status || (isWeekend ? 'WEEKEND' : 'ABSENT');
        return {
          employee: e,
          attendance: att || null,
          status,
        };
      });
  }, [employees, attendances, date]);

  const filtered = useMemo(() => {
    let list = roster;
    if (statusFilter !== 'all') {
      list = list.filter((r) => r.status === statusFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((r) => {
        const name = `${r.employee.firstName} ${r.employee.lastName}`.toLowerCase();
        const empId = (r.employee.employeeId || '').toLowerCase();
        return name.includes(q) || empId.includes(q);
      });
    }
    return list;
  }, [roster, statusFilter, search]);

  const counts = useMemo(() => {
    const base = { all: roster.length };
    roster.forEach((r) => {
      base[r.status] = (base[r.status] || 0) + 1;
    });
    return base;
  }, [roster]);

  const presentRate = roster.length
    ? Math.round(((counts.PRESENT || 0) + (counts.LATE || 0) + (counts.REGULARIZED || 0)) / roster.length * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="font-display text-3xl font-bold flex items-center gap-2">
            <CalendarClock className="size-7 text-primary" />
            Attendance
          </h1>
          <p className="text-muted-foreground mt-1">
            Daily roster — see who's in, mark or correct attendance, all from one screen.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border bg-card p-1.5">
          <Button variant="ghost" size="icon" className="size-9" onClick={() => setDate((d) => shiftDate(d, -1))}>
            <ChevronLeft className="size-4" />
          </Button>
          <div className="px-2 text-center min-w-[180px]">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Showing</p>
            <p className="font-semibold text-sm">{formatDayLabel(date)}</p>
          </div>
          <Button variant="ghost" size="icon" className="size-9" onClick={() => setDate((d) => shiftDate(d, 1))}>
            <ChevronRight className="size-4" />
          </Button>
          <div className="h-6 w-px bg-border mx-1" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-transparent border-0 text-sm focus:outline-none cursor-pointer"
            max={todayIso()}
          />
          {date !== todayIso() && (
            <Button variant="ghost" size="sm" onClick={() => setDate(todayIso())}>
              Today
            </Button>
          )}
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Present" value={counts.PRESENT || 0} icon={CheckCircle2} accent="from-emerald-500 to-teal-500" />
        <KpiCard label="Absent" value={counts.ABSENT || 0} icon={XCircle} accent="from-rose-500 to-pink-500" highlight={(counts.ABSENT || 0) > 0} />
        <KpiCard label="On leave" value={counts.ON_LEAVE || 0} icon={Plane} accent="from-sky-500 to-blue-500" />
        <KpiCard label="Attendance %" value={`${presentRate}%`} icon={TrendingUp} accent="from-violet-500 to-purple-500" />
      </div>

      {/* Roster */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-4">
          <div>
            <CardTitle>Roster</CardTitle>
            <CardDescription>
              {roster.length} active employee{roster.length === 1 ? '' : 's'} · Click a row to mark or edit attendance
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative flex-1 sm:flex-none sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search employee…"
                className="pl-10"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted"
                >
                  <X className="size-3.5 text-muted-foreground" />
                </button>
              )}
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <Filter className="size-4 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>{STATUS_META[s]?.label || s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {empLoading || attLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyRoster hasFilter={search || statusFilter !== 'all'} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <AnimatePresence initial={false}>
                {filtered.map(({ employee, attendance, status }) => (
                  <RosterCard
                    key={employee.id}
                    employee={employee}
                    attendance={attendance}
                    status={status}
                    onClick={() => setMarking({ employee, attendance, status })}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mark attendance dialog */}
      <Dialog open={!!marking} onOpenChange={(o) => !o && setMarking(null)}>
        <DialogContent className="max-w-md">
          {marking && (
            <MarkAttendanceForm
              employee={marking.employee}
              attendance={marking.attendance}
              defaultStatus={marking.status}
              date={date}
              onClose={() => setMarking(null)}
              onSaved={() => {
                setMarking(null);
                qc.invalidateQueries({ queryKey: ['hr-attendance-by-date', date] });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------------- atoms ---------------- */

function KpiCard({ label, value, icon: Icon, accent, highlight }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      <Card className={cn('overflow-hidden', highlight && 'ring-2 ring-rose-500/30')}>
        <CardContent className="p-4 relative">
          <div className={cn('absolute -top-8 -right-8 size-24 rounded-full bg-gradient-to-br opacity-10 blur-2xl', accent)} />
          <div className="flex items-center justify-between relative">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
              <p className="font-display text-3xl font-bold mt-1">{value}</p>
            </div>
            <div className={cn('size-10 rounded-lg bg-gradient-to-br grid place-items-center text-white', accent)}>
              <Icon className="size-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function RosterCard({ employee, attendance, status, onClick }) {
  const meta = STATUS_META[status] || STATUS_META.ABSENT;
  const StatusIcon = meta.icon;
  return (
    <motion.button
      layout
      type="button"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      whileHover={{ scale: 1.005 }}
      onClick={onClick}
      className="group relative flex items-center gap-3 p-3 rounded-lg border bg-card text-left hover:shadow-md hover:border-primary/40 transition-all overflow-hidden"
    >
      <div className={cn('absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b', meta.color)} />
      <Avatar className="size-10 shrink-0 ml-1">
        <AvatarFallback>{getInitials(`${employee.firstName} ${employee.lastName}`)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium truncate">{employee.firstName} {employee.lastName}</p>
          <Badge variant={meta.badge} className="text-[10px] gap-1">
            <StatusIcon className="size-3" />
            {meta.label}
          </Badge>
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
          <span className="font-mono">{employee.employeeId}</span>
          {attendance?.clockIn && (
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" />
              {formatTime(attendance.clockIn)}
              {attendance.clockOut && ` → ${formatTime(attendance.clockOut)}`}
            </span>
          )}
          {attendance?.totalHours != null && (
            <span className="inline-flex items-center gap-1">
              <Activity className="size-3" />
              {Number(attendance.totalHours).toFixed(1)}h
            </span>
          )}
        </div>
      </div>
      <Pencil className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </motion.button>
  );
}

function EmptyRoster({ hasFilter }) {
  return (
    <div className="text-center py-16">
      <div className="size-14 mx-auto rounded-2xl bg-muted grid place-items-center mb-4 text-muted-foreground">
        <Users className="size-7" />
      </div>
      <h4 className="font-display text-lg font-semibold">
        {hasFilter ? 'No matches for these filters' : 'No active employees yet'}
      </h4>
      <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
        {hasFilter
          ? 'Try clearing the search or status filter.'
          : 'Add employees from the People page to start tracking attendance.'}
      </p>
    </div>
  );
}

function MarkAttendanceForm({ employee, attendance, defaultStatus, date, onClose, onSaved }) {
  const [status, setStatus] = useState(attendance?.status || defaultStatus || 'PRESENT');
  const [clockIn, setClockIn] = useState(
    attendance?.clockIn ? new Date(attendance.clockIn).toISOString().slice(11, 16) : '09:30',
  );
  const [clockOut, setClockOut] = useState(
    attendance?.clockOut ? new Date(attendance.clockOut).toISOString().slice(11, 16) : '18:30',
  );
  const [notes, setNotes] = useState(attendance?.notes || '');

  const mut = useMutation({
    mutationFn: (payload) => attendanceApi.mark(payload),
    onSuccess: () => {
      toast.success('Attendance saved');
      onSaved?.();
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to save'),
  });

  const submit = (e) => {
    e.preventDefault();
    const buildDate = (timeStr) => {
      if (!timeStr) return undefined;
      return new Date(`${date}T${timeStr}:00`).toISOString();
    };
    const payload = {
      employeeId: employee.id,
      date,
      status,
      notes: notes || undefined,
    };
    if (status === 'PRESENT' || status === 'HALF_DAY' || status === 'LATE' || status === 'EARLY_DEPARTURE') {
      payload.clockIn = buildDate(clockIn);
      payload.clockOut = buildDate(clockOut);
    }
    mut.mutate(payload);
  };

  const statusMeta = STATUS_META[status] || STATUS_META.PRESENT;

  return (
    <form onSubmit={submit} className="space-y-4">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-3">
          <Avatar className="size-10">
            <AvatarFallback>{getInitials(`${employee.firstName} ${employee.lastName}`)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-base">{employee.firstName} {employee.lastName}</p>
            <p className="text-xs font-normal text-muted-foreground">
              {employee.employeeId} · {formatDayLabel(date)}
            </p>
          </div>
        </DialogTitle>
        <DialogDescription>
          Update attendance for this day. Changes are recorded with your name as the approver.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-2">
        <Label>Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => {
              const m = STATUS_META[s];
              const Icon = m.icon;
              return (
                <SelectItem key={s} value={s}>
                  <span className="inline-flex items-center gap-2">
                    <span className={cn('size-2 rounded-full bg-gradient-to-br', m.color)} />
                    <Icon className="size-3.5" />
                    {m.label}
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <AnimatePresence initial={false}>
        {(status === 'PRESENT' || status === 'HALF_DAY' || status === 'LATE' || status === 'EARLY_DEPARTURE') && (
          <motion.div
            key="times"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-2 gap-3 overflow-hidden"
          >
            <div className="space-y-1.5">
              <Label>Clock in</Label>
              <Input type="time" value={clockIn} onChange={(e) => setClockIn(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Clock out</Label>
              <Input type="time" value={clockOut} onChange={(e) => setClockOut(e.target.value)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-1.5">
        <Label>Notes (optional)</Label>
        <Textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Reason for change, regularization context, etc."
        />
      </div>

      <div className={cn('rounded-lg border bg-gradient-to-br p-3 text-sm flex items-center gap-2 text-white', statusMeta.color)}>
        <statusMeta.icon className="size-4" />
        Will be saved as <span className="font-semibold ml-1">{statusMeta.label}</span>
      </div>

      <DialogFooter>
        <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="gradient" loading={mut.isPending}>
          <CheckCircle2 className="size-4" />
          Save attendance
        </Button>
      </DialogFooter>
    </form>
  );
}
