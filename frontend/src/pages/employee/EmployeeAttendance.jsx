import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Clock,
  LogIn,
  LogOut,
  ChevronLeft,
  ChevronRight,
  CalendarCheck2,
  CalendarX2,
  CalendarClock,
  TimerReset,
  MapPin,
  WifiOff,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { attendanceApi } from '../../api/attendance';
import { cn, formatDateTime } from '../../lib/utils';
import { onSwMessage } from '../../lib/pwa';

const STATUS_COLORS = {
  PRESENT: 'bg-emerald-500',
  ABSENT: 'bg-rose-500',
  HALF_DAY: 'bg-amber-500',
  HOLIDAY: 'bg-sky-500',
  WEEKEND: 'bg-slate-300 dark:bg-slate-700',
  LATE: 'bg-amber-500',
  EARLY_DEPARTURE: 'bg-orange-500',
  ON_LEAVE: 'bg-violet-500',
  REGULARIZED: 'bg-cyan-500',
};

function startOfDay(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function fmtTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export default function EmployeeAttendance() {
  const qc = useQueryClient();
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const monthStart = useMemo(() => new Date(cursor.getFullYear(), cursor.getMonth(), 1), [cursor]);
  const monthEnd = useMemo(() => new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0), [cursor]);

  const { data, isLoading } = useQuery({
    queryKey: ['my-attendance', monthStart.toISOString().slice(0, 10), monthEnd.toISOString().slice(0, 10)],
    queryFn: () =>
      attendanceApi.myAttendance({
        startDate: monthStart.toISOString().slice(0, 10),
        endDate: monthEnd.toISOString().slice(0, 10),
        limit: 31,
      }),
  });
  const attendances = data?.attendances || [];

  const today = startOfDay(new Date());
  const todayRecord = useMemo(
    () => attendances.find((a) => isSameDay(new Date(a.date), today)),
    [attendances, today]
  );

  const [offlineQueued, setOfflineQueued] = useState(false);
  // The service worker tells us when it has flushed queued punches so we can
  // refresh the table to reflect the now-real attendance row.
  useEffect(() => {
    const off = onSwMessage((data) => {
      if (data?.type === 'queue-flushed' && data.count > 0) {
        toast.success(`${data.count} queued punch${data.count === 1 ? '' : 'es'} synced.`);
        setOfflineQueued(false);
        qc.invalidateQueries({ queryKey: ['my-attendance'] });
      }
    });
    return off;
  }, [qc]);

  const handleQueuedOrSuccess = (mode) => (response) => {
    // Service worker returns { offline: true, queued: true } when it caught
    // the request offline and put it in the IndexedDB queue.
    if (response?.queued || response?.offline) {
      setOfflineQueued(true);
      toast.message('You\u2019re offline — punch queued', {
        description: 'It\u2019ll sync automatically as soon as you reconnect.',
      });
      return;
    }
    toast.success(mode === 'in' ? 'Clocked in. Have a great day!' : 'Clocked out. See you tomorrow!');
    qc.invalidateQueries({ queryKey: ['my-attendance'] });
  };

  const clockInMut = useMutation({
    mutationFn: (payload) => attendanceApi.clockIn(payload),
    onSuccess: handleQueuedOrSuccess('in'),
    onError: (e) => toast.error(e?.response?.data?.message || e?.friendlyMessage || 'Failed to clock in'),
  });
  const clockOutMut = useMutation({
    mutationFn: (payload) => attendanceApi.clockOut(payload),
    onSuccess: handleQueuedOrSuccess('out'),
    onError: (e) => toast.error(e?.response?.data?.message || e?.friendlyMessage || 'Failed to clock out'),
  });

  const summary = useMemo(() => {
    let present = 0, absent = 0, leave = 0, hours = 0;
    attendances.forEach((a) => {
      if (a.status === 'PRESENT' || a.status === 'LATE' || a.status === 'HALF_DAY') present += 1;
      if (a.status === 'ABSENT') absent += 1;
      if (a.status === 'ON_LEAVE') leave += 1;
      if (typeof a.totalHours === 'number') hours += a.totalHours;
    });
    return { present, absent, leave, hours: Math.round(hours * 10) / 10 };
  }, [attendances]);

  const isClockedIn = todayRecord && todayRecord.clockIn && !todayRecord.clockOut;
  const isClockedOut = todayRecord && todayRecord.clockOut;

  const getLocation = () =>
    new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null),
        { timeout: 5000 }
      );
    });

  const onPunch = async () => {
    const loc = await getLocation();
    if (isClockedIn) clockOutMut.mutate({ location: loc });
    else clockInMut.mutate({ location: loc });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">My attendance</h1>
          <p className="text-muted-foreground mt-1">Punch in or out, and review the month.</p>
        </div>
      </div>

      {offlineQueued ? (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm"
        >
          <WifiOff className="size-4 text-amber-500 shrink-0" />
          <p className="flex-1 text-amber-700 dark:text-amber-300">
            <span className="font-semibold">Punch queued offline.</span>{' '}
            {`We'll sync it the moment you reconnect.`}
          </p>
        </motion.div>
      ) : null}

      {/* Today */}
      <Card className="overflow-hidden">
        <div className="relative bg-gradient-to-br from-primary/15 via-card to-accent/10">
          <div className="absolute inset-0 bg-grid opacity-20" />
          <CardContent className="relative z-10 p-6 md:p-8 grid md:grid-cols-[1fr_auto] gap-6 items-center">
            <div>
              <Badge variant="gradient" className="mb-2">
                <CalendarCheck2 className="size-3" />
                {today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </Badge>
              <h2 className="font-display text-2xl md:text-3xl font-bold">
                {isClockedOut ? 'You\u2019re done for the day' : isClockedIn ? 'You\u2019re clocked in' : 'Ready to start your day?'}
              </h2>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl">
                <Stat label="Clock in" value={fmtTime(todayRecord?.clockIn)} icon={LogIn} />
                <Stat label="Clock out" value={fmtTime(todayRecord?.clockOut)} icon={LogOut} />
                <Stat label="Hours" value={todayRecord?.totalHours ? `${todayRecord.totalHours.toFixed(1)}h` : '—'} icon={TimerReset} />
                <Stat label="Status" value={todayRecord?.status || 'NOT MARKED'} icon={CalendarClock} />
              </div>
            </div>
            <PunchButton
              isClockedIn={isClockedIn}
              isClockedOut={isClockedOut}
              loading={clockInMut.isPending || clockOutMut.isPending}
              onPunch={onPunch}
            />
          </CardContent>
        </div>
      </Card>

      {/* Monthly summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Present" value={summary.present} icon={CalendarCheck2} color="from-emerald-500 to-teal-500" />
        <KpiCard label="Absent" value={summary.absent} icon={CalendarX2} color="from-rose-500 to-red-500" />
        <KpiCard label="On leave" value={summary.leave} icon={CalendarClock} color="from-violet-500 to-indigo-500" />
        <KpiCard label="Total hours" value={`${summary.hours}h`} icon={TimerReset} color="from-amber-500 to-orange-500" />
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{cursor.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</CardTitle>
            <CardDescription>Click a day to see clock-in / clock-out details.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} aria-label="Previous month">
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} aria-label="Next month">
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-72 rounded-xl" />
          ) : (
            <CalendarGrid month={cursor} attendances={attendances} />
          )}
          <Legend />
        </CardContent>
      </Card>
    </div>
  );
}

function PunchButton({ isClockedIn, isClockedOut, loading, onPunch }) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.04 }}
      onClick={isClockedOut ? undefined : onPunch}
      disabled={isClockedOut || loading}
      className={cn(
        'relative size-44 rounded-full grid place-items-center text-white font-display font-bold shadow-2xl outline-none transition-all',
        isClockedOut
          ? 'bg-gradient-to-br from-emerald-500 to-teal-600 cursor-not-allowed'
          : isClockedIn
            ? 'bg-gradient-to-br from-rose-500 via-pink-500 to-orange-500 hover:shadow-glow-lg'
            : 'bg-gradient-to-br from-primary via-accent to-pink-500 hover:shadow-glow-lg'
      )}
    >
      {/* Pulsing ring */}
      {!isClockedOut && (
        <span
          className={cn(
            'absolute inset-0 rounded-full opacity-50 animate-ping',
            isClockedIn ? 'bg-rose-400/40' : 'bg-primary/40'
          )}
        />
      )}
      <div className="relative flex flex-col items-center gap-1">
        {isClockedOut ? (
          <CalendarCheck2 className="size-8" />
        ) : isClockedIn ? (
          <LogOut className="size-8" />
        ) : (
          <LogIn className="size-8" />
        )}
        <span className="text-xs uppercase tracking-widest opacity-90">
          {isClockedOut ? 'Clocked out' : isClockedIn ? 'Clock out' : 'Clock in'}
        </span>
        <span className="text-[10px] flex items-center gap-1 opacity-75">
          <MapPin className="size-3" /> with location
        </span>
      </div>
      {loading && (
        <span className="absolute inset-0 grid place-items-center bg-black/20 rounded-full">
          <span className="size-6 rounded-full border-2 border-white border-t-transparent animate-spin" />
        </span>
      )}
    </motion.button>
  );
}

function Stat({ label, value, icon: Icon }) {
  return (
    <div className="rounded-lg border bg-card/60 backdrop-blur p-3">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </div>
      <p className="mt-1 font-semibold text-sm truncate">{value}</p>
    </div>
  );
}

function KpiCard({ label, value, icon: Icon, color }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="font-display text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className={`size-10 rounded-lg bg-gradient-to-br ${color} grid place-items-center text-white shadow-md`}>
            <Icon className="size-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CalendarGrid({ month, attendances }) {
  const map = useMemo(() => {
    const m = new Map();
    attendances.forEach((a) => {
      const k = new Date(a.date).toISOString().slice(0, 10);
      m.set(k, a);
    });
    return m;
  }, [attendances]);

  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startWeekday = firstDay.getDay();
  const today = startOfDay(new Date());

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push({ blank: true, key: `b-${i}` });
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(month.getFullYear(), month.getMonth(), d);
    const k = date.toISOString().slice(0, 10);
    const rec = map.get(k);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const isToday = isSameDay(date, today);
    const isFuture = date > today;
    let status = rec?.status;
    if (!status && isWeekend) status = 'WEEKEND';
    cells.push({ key: k, day: d, date, status, rec, isToday, isFuture });
  }

  return (
    <div className="select-none">
      <div className="grid grid-cols-7 gap-1 text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="text-center py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((c) => {
          if (c.blank) return <div key={c.key} />;
          const dotClass = c.status ? STATUS_COLORS[c.status] : 'bg-muted';
          return (
            <motion.div
              key={c.key}
              whileHover={{ scale: c.isFuture ? 1 : 1.04 }}
              className={cn(
                'aspect-square rounded-lg border bg-card relative p-1.5 flex flex-col items-start justify-between',
                c.isToday && 'ring-2 ring-primary/60',
                c.isFuture && 'opacity-50'
              )}
              title={c.status ? `${c.date.toDateString()} · ${c.status}` : c.date.toDateString()}
            >
              <span className={cn('text-xs font-semibold', c.isToday && 'text-primary')}>{c.day}</span>
              {c.status ? (
                <span className={cn('size-2 rounded-full', dotClass)} />
              ) : null}
              {c.rec?.totalHours ? (
                <span className="absolute bottom-0.5 right-1 text-[9px] text-muted-foreground">
                  {c.rec.totalHours.toFixed(1)}h
                </span>
              ) : null}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function Legend() {
  const items = [
    { key: 'PRESENT', label: 'Present' },
    { key: 'LATE', label: 'Late' },
    { key: 'HALF_DAY', label: 'Half day' },
    { key: 'ABSENT', label: 'Absent' },
    { key: 'ON_LEAVE', label: 'On leave' },
    { key: 'WEEKEND', label: 'Weekend' },
    { key: 'HOLIDAY', label: 'Holiday' },
  ];
  return (
    <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t">
      {items.map((it) => (
        <div key={it.key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className={cn('size-2.5 rounded-full', STATUS_COLORS[it.key])} />
          {it.label}
        </div>
      ))}
    </div>
  );
}
