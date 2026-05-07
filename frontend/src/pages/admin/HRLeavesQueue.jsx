import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Plane,
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
  Calendar as CalendarIcon,
  Users,
  Hourglass,
  TrendingUp,
  Search,
  AlertTriangle,
  MessageSquare,
  Inbox,
  Filter,
  X,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
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

import { leavesApi } from '../../api/leaves';
import { formatDate, getInitials, cn } from '../../lib/utils';

const LEAVE_LABELS = {
  CASUAL_LEAVE: 'Casual',
  SICK_LEAVE: 'Sick',
  EARNED_LEAVE: 'Earned',
  MATERNITY_LEAVE: 'Maternity',
  PATERNITY_LEAVE: 'Paternity',
  COMP_OFF: 'Comp-off',
  LOP: 'Loss of pay',
};

const LEAVE_COLOR = {
  CASUAL_LEAVE: 'from-sky-500 to-blue-500',
  SICK_LEAVE: 'from-rose-500 to-pink-500',
  EARNED_LEAVE: 'from-emerald-500 to-teal-500',
  MATERNITY_LEAVE: 'from-violet-500 to-purple-500',
  PATERNITY_LEAVE: 'from-indigo-500 to-violet-500',
  COMP_OFF: 'from-amber-500 to-orange-500',
  LOP: 'from-slate-500 to-zinc-500',
};

const STATUS_META = {
  PENDING: { label: 'Pending', icon: Clock, variant: 'warning' },
  APPROVED: { label: 'Approved', icon: CheckCircle2, variant: 'success' },
  REJECTED: { label: 'Rejected', icon: XCircle, variant: 'destructive' },
  CANCELLED: { label: 'Cancelled', icon: Ban, variant: 'outline' },
};

export default function HRLeavesQueue() {
  const qc = useQueryClient();
  const [tab, setTab] = useState('PENDING');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [rejectTarget, setRejectTarget] = useState(null);

  // Fetch a wide window of leaves; we'll filter client-side for snappy UX.
  const { data, isLoading } = useQuery({
    queryKey: ['hr-leaves'],
    queryFn: () => leavesApi.list({ limit: 100 }),
  });

  const leaves = data?.leaves || [];

  const counts = useMemo(() => {
    const c = { all: leaves.length, PENDING: 0, APPROVED: 0, REJECTED: 0, CANCELLED: 0 };
    leaves.forEach((l) => { c[l.status] = (c[l.status] || 0) + 1; });
    return c;
  }, [leaves]);

  // KPI strip
  const kpis = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());

    const pending = leaves.filter((l) => l.status === 'PENDING');
    const approvedThisMonth = leaves.filter(
      (l) => l.status === 'APPROVED' && new Date(l.approvedAt || l.updatedAt || l.createdAt) >= monthStart,
    );
    const onLeaveToday = leaves.filter((l) => {
      if (l.status !== 'APPROVED') return false;
      const s = new Date(l.startDate);
      const e = new Date(l.endDate);
      return s <= now && now <= new Date(e.getFullYear(), e.getMonth(), e.getDate(), 23, 59, 59);
    }).length;
    const totalDaysOOOThisWeek = leaves
      .filter((l) => l.status === 'APPROVED')
      .reduce((sum, l) => {
        const s = new Date(l.startDate);
        const e = new Date(l.endDate);
        const overlapStart = s > weekStart ? s : weekStart;
        const overlapEnd = e < now ? e : now;
        if (overlapEnd < overlapStart) return sum;
        return sum + Math.ceil((overlapEnd - overlapStart) / 86400000) + 1;
      }, 0);

    return {
      pending: pending.length,
      approvedThisMonth: approvedThisMonth.length,
      onLeaveToday,
      totalDaysOOOThisWeek,
    };
  }, [leaves]);

  const filtered = useMemo(() => {
    let list = tab === 'all' ? leaves : leaves.filter((l) => l.status === tab);
    if (typeFilter !== 'all') list = list.filter((l) => l.type === typeFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((l) => {
        const name = `${l.employee?.firstName || ''} ${l.employee?.lastName || ''}`.toLowerCase();
        const empId = (l.employee?.employeeId || '').toLowerCase();
        return name.includes(q) || empId.includes(q);
      });
    }
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [leaves, tab, typeFilter, search]);

  const approveMut = useMutation({
    mutationFn: (id) => leavesApi.approve(id),
    onSuccess: () => {
      toast.success('Leave approved — employee notified');
      qc.invalidateQueries({ queryKey: ['hr-leaves'] });
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to approve'),
  });

  const rejectMut = useMutation({
    mutationFn: ({ id, reason }) => leavesApi.reject(id, reason),
    onSuccess: () => {
      toast.success('Leave rejected — employee notified');
      qc.invalidateQueries({ queryKey: ['hr-leaves'] });
      setRejectTarget(null);
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to reject'),
  });

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
            <Plane className="size-7 text-primary" />
            Leave requests
          </h1>
          <p className="text-muted-foreground mt-1">
            Approve or reject pending requests — employees get notified instantly via email + in-app.
          </p>
        </div>
        {kpis.pending > 0 && (
          <Badge variant="warning" className="px-3 py-1.5 text-sm gap-2">
            <Hourglass className="size-4" />
            {kpis.pending} awaiting your action
          </Badge>
        )}
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Pending" value={kpis.pending} icon={Hourglass} accent="from-amber-500 to-orange-500" highlight={kpis.pending > 0} />
        <KpiCard label="On leave today" value={kpis.onLeaveToday} icon={Users} accent="from-sky-500 to-blue-500" />
        <KpiCard label="Approved this month" value={kpis.approvedThisMonth} icon={CheckCircle2} accent="from-emerald-500 to-teal-500" />
        <KpiCard label="Days OOO this week" value={kpis.totalDaysOOOThisWeek} icon={TrendingUp} accent="from-violet-500 to-purple-500" />
      </div>

      {/* Queue */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-4">
          <div>
            <CardTitle>Approval queue</CardTitle>
            <CardDescription>One-click decisions, with reasons captured for the record.</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative flex-1 sm:flex-none sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search employee…"
                className="pl-10"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted"
                  type="button"
                >
                  <X className="size-3.5 text-muted-foreground" />
                </button>
              )}
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <Filter className="size-4 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {Object.entries(LEAVE_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="overflow-x-auto no-scrollbar w-full justify-start">
              <TabsTrigger value="PENDING">
                Pending
                {counts.PENDING > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-[10px] font-bold rounded-full bg-amber-500 text-white">
                    {counts.PENDING}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="APPROVED">Approved ({counts.APPROVED})</TabsTrigger>
              <TabsTrigger value="REJECTED">Rejected ({counts.REJECTED})</TabsTrigger>
              <TabsTrigger value="CANCELLED">Cancelled ({counts.CANCELLED})</TabsTrigger>
              <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
            </TabsList>
            <TabsContent value={tab}>
              {isLoading ? (
                <div className="space-y-2 mt-3">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
                </div>
              ) : filtered.length === 0 ? (
                <EmptyQueue tab={tab} />
              ) : (
                <div className="space-y-2.5 mt-3">
                  <AnimatePresence initial={false}>
                    {filtered.map((leave) => (
                      <LeaveCard
                        key={leave.id}
                        leave={leave}
                        onApprove={() => approveMut.mutate(leave.id)}
                        onReject={() => setRejectTarget(leave)}
                        isBusy={
                          (approveMut.isPending && approveMut.variables === leave.id) ||
                          (rejectMut.isPending && rejectMut.variables?.id === leave.id)
                        }
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Reject dialog */}
      <Dialog open={!!rejectTarget} onOpenChange={(o) => !o && setRejectTarget(null)}>
        <DialogContent className="max-w-md">
          {rejectTarget && (
            <RejectForm
              leave={rejectTarget}
              onCancel={() => setRejectTarget(null)}
              onConfirm={(reason) => rejectMut.mutate({ id: rejectTarget.id, reason })}
              loading={rejectMut.isPending}
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
      <Card className={cn('overflow-hidden relative', highlight && 'ring-2 ring-amber-500/40')}>
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

function LeaveCard({ leave, onApprove, onReject, isBusy }) {
  const meta = STATUS_META[leave.status] || STATUS_META.PENDING;
  const StatusIcon = meta.icon;
  const employee = leave.employee || {};
  const name = `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
  const isPending = leave.status === 'PENDING';
  const typeColor = LEAVE_COLOR[leave.type] || 'from-slate-500 to-zinc-500';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, transition: { duration: 0.18 } }}
      whileHover={{ scale: 1.005 }}
      className={cn(
        'rounded-xl border p-4 transition-shadow hover:shadow-md',
        isPending && 'bg-gradient-to-r from-amber-500/5 via-transparent to-transparent border-amber-500/20',
      )}
    >
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Person */}
        <div className="flex items-center gap-3 lg:w-64 shrink-0">
          <Avatar className="size-10">
            <AvatarFallback>{getInitials(name || '?')}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate">{name || 'Employee'}</p>
            <p className="text-xs text-muted-foreground truncate">
              {employee.employeeId}
              {employee.designation?.name && ` · ${employee.designation.name}`}
            </p>
          </div>
        </div>

        {/* Type + dates */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r', typeColor)}>
              <Plane className="size-3" />
              {LEAVE_LABELS[leave.type] || leave.type}
            </span>
            <Badge variant={meta.variant}>
              <StatusIcon className="size-3" />
              {meta.label}
            </Badge>
            <span className="text-xs text-muted-foreground">
              applied {formatDate(leave.createdAt)}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2 text-sm">
            <CalendarIcon className="size-4 text-muted-foreground shrink-0" />
            <span className="font-medium">{formatDate(leave.startDate)} → {formatDate(leave.endDate)}</span>
            <span className="text-muted-foreground">
              · {leave.days} day{leave.days === 1 ? '' : 's'}
            </span>
          </div>
          {leave.reason && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2 flex items-start gap-1.5">
              <MessageSquare className="size-3.5 mt-0.5 shrink-0" />
              <span className="italic">"{leave.reason}"</span>
            </p>
          )}
          {leave.rejectedReason && (
            <p className="mt-2 text-sm text-destructive flex items-start gap-1.5">
              <AlertTriangle className="size-3.5 mt-0.5 shrink-0" />
              Rejected: {leave.rejectedReason}
            </p>
          )}
        </div>

        {/* Actions */}
        {isPending && (
          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onReject}
              disabled={isBusy}
              className="text-destructive hover:text-destructive"
            >
              <XCircle className="size-4" />
              Reject
            </Button>
            <Button
              variant="gradient"
              size="sm"
              onClick={onApprove}
              loading={isBusy}
            >
              <CheckCircle2 className="size-4" />
              Approve
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function EmptyQueue({ tab }) {
  const empty = {
    PENDING: {
      title: 'Inbox zero — nothing to action',
      message: 'When a new leave request comes in, you\'ll see it here first.',
      icon: CheckCircle2,
      tint: 'text-emerald-500',
    },
    APPROVED: { title: 'No approved leaves yet', message: 'Approved requests will appear here.', icon: Inbox },
    REJECTED: { title: 'No rejections', message: 'Rejected requests will appear here.', icon: Inbox },
    CANCELLED: { title: 'No cancellations', message: 'Cancelled requests will appear here.', icon: Inbox },
    all: { title: 'No leave requests yet', message: 'Once your team applies for time off, you\'ll see it here.', icon: Inbox },
  };
  const cfg = empty[tab] || empty.all;
  const Icon = cfg.icon;
  return (
    <div className="text-center py-16">
      <div className={cn('size-14 mx-auto rounded-2xl bg-muted grid place-items-center mb-4', cfg.tint)}>
        <Icon className="size-7" />
      </div>
      <h4 className="font-display text-lg font-semibold">{cfg.title}</h4>
      <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">{cfg.message}</p>
    </div>
  );
}

function RejectForm({ leave, onCancel, onConfirm, loading }) {
  const [reason, setReason] = useState('');
  const employee = leave.employee || {};
  const name = `${employee.firstName || ''} ${employee.lastName || ''}`.trim();

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <XCircle className="size-4 text-destructive" />
          Reject leave request
        </DialogTitle>
        <DialogDescription>
          {name} will receive an email with your reason. They can apply again with adjusted dates.
        </DialogDescription>
      </DialogHeader>

      <div className="rounded-lg border bg-muted/40 p-3 text-sm">
        <p className="font-medium">{LEAVE_LABELS[leave.type] || leave.type} · {leave.days} day{leave.days === 1 ? '' : 's'}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatDate(leave.startDate)} → {formatDate(leave.endDate)}
        </p>
      </div>

      <div className="space-y-1.5">
        <Label>Reason for rejection</Label>
        <Textarea
          rows={4}
          autoFocus
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Conflicts with critical sprint delivery on those dates."
        />
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button
          variant="destructive"
          onClick={() => onConfirm(reason.trim() || 'No reason provided')}
          loading={loading}
        >
          Confirm rejection
        </Button>
      </DialogFooter>
    </>
  );
}
