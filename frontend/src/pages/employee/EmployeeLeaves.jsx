import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Plane,
  Plus,
  Calendar as CalendarIcon,
  X,
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
  FileText,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Progress } from '../../components/ui/progress';
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';

import { leavesApi } from '../../api/leaves';
import { formatDate, cn } from '../../lib/utils';

const LEAVE_TYPES = [
  { value: 'CASUAL_LEAVE', label: 'Casual leave', color: 'from-sky-500 to-blue-500' },
  { value: 'SICK_LEAVE', label: 'Sick leave', color: 'from-rose-500 to-pink-500' },
  { value: 'EARNED_LEAVE', label: 'Earned leave', color: 'from-emerald-500 to-teal-500' },
  { value: 'MATERNITY_LEAVE', label: 'Maternity', color: 'from-violet-500 to-purple-500' },
  { value: 'PATERNITY_LEAVE', label: 'Paternity', color: 'from-indigo-500 to-violet-500' },
  { value: 'COMP_OFF', label: 'Comp-off', color: 'from-amber-500 to-orange-500' },
  { value: 'LOP', label: 'Loss of pay', color: 'from-slate-500 to-zinc-500' },
];
const LEAVE_LABELS = Object.fromEntries(LEAVE_TYPES.map((t) => [t.value, t.label]));

const STATUS_META = {
  PENDING: { label: 'Pending', icon: Clock, variant: 'warning' },
  APPROVED: { label: 'Approved', icon: CheckCircle2, variant: 'success' },
  REJECTED: { label: 'Rejected', icon: XCircle, variant: 'destructive' },
  CANCELLED: { label: 'Cancelled', icon: Ban, variant: 'outline' },
};

const applySchema = z
  .object({
    type: z.string().min(1, 'Leave type is required'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    reason: z.string().optional(),
  })
  .refine((d) => new Date(d.startDate) <= new Date(d.endDate), {
    message: 'End date must be on or after start date',
    path: ['endDate'],
  });

export default function EmployeeLeaves() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('all');

  const { data: balanceData, isLoading: balLoading } = useQuery({
    queryKey: ['my-leave-balance'],
    queryFn: leavesApi.myBalance,
  });
  const { data: leavesData, isLoading: leavesLoading } = useQuery({
    queryKey: ['my-leaves'],
    queryFn: leavesApi.myLeaves,
  });

  const balances = balanceData?.balances || {};
  const leaves = leavesData?.leaves || [];

  const cancelMut = useMutation({
    mutationFn: (id) => leavesApi.cancel(id),
    onSuccess: () => {
      toast.success('Leave cancelled');
      qc.invalidateQueries({ queryKey: ['my-leaves'] });
      qc.invalidateQueries({ queryKey: ['my-leave-balance'] });
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to cancel'),
  });

  const filtered = useMemo(() => {
    if (tab === 'all') return leaves;
    return leaves.filter((l) => l.status === tab);
  }, [leaves, tab]);

  const counts = useMemo(() => {
    const base = { all: leaves.length, PENDING: 0, APPROVED: 0, REJECTED: 0, CANCELLED: 0 };
    leaves.forEach((l) => { base[l.status] = (base[l.status] || 0) + 1; });
    return base;
  }, [leaves]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">My leaves</h1>
          <p className="text-muted-foreground mt-1">
            Apply for time off, track approvals and your remaining balance.
          </p>
        </div>
        <Button variant="gradient" size="lg" onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          Apply for leave
        </Button>
      </div>

      {/* Balances */}
      <div>
        <h2 className="font-display text-base font-semibold mb-3">Your balances · {balanceData?.year || new Date().getFullYear()}</h2>
        {balLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {LEAVE_TYPES.filter((t) => t.value !== 'LOP').map((t) => {
              const b = balances[t.value] || { total: 0, used: 0, remaining: 0 };
              const pct = b.total > 0 ? Math.min(100, (b.used / b.total) * 100) : 0;
              return (
                <Card key={t.value}>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">{t.label}</p>
                      <span className={`size-6 rounded-md bg-gradient-to-br ${t.color}`} />
                    </div>
                    <p className="font-display text-2xl font-bold">{b.remaining}<span className="text-sm font-normal text-muted-foreground"> / {b.total}</span></p>
                    <Progress value={pct} />
                    <p className="text-[11px] text-muted-foreground">{b.used} used</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Leaves list */}
      <Card>
        <CardHeader>
          <CardTitle>Leave requests</CardTitle>
          <CardDescription>Your full leave history with live status.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="overflow-x-auto no-scrollbar w-full justify-start">
              <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
              <TabsTrigger value="PENDING">Pending ({counts.PENDING})</TabsTrigger>
              <TabsTrigger value="APPROVED">Approved ({counts.APPROVED})</TabsTrigger>
              <TabsTrigger value="REJECTED">Rejected ({counts.REJECTED})</TabsTrigger>
              <TabsTrigger value="CANCELLED">Cancelled ({counts.CANCELLED})</TabsTrigger>
            </TabsList>
            <TabsContent value={tab}>
              {leavesLoading ? (
                <div className="space-y-2 mt-2">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
                </div>
              ) : filtered.length === 0 ? (
                <EmptyLeaves onApply={() => setOpen(true)} />
              ) : (
                <div className="divide-y">
                  {filtered.map((l) => (
                    <LeaveRow
                      key={l.id}
                      leave={l}
                      onCancel={() => {
                        if (window.confirm('Cancel this leave request?')) cancelMut.mutate(l.id);
                      }}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Apply dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <ApplyLeaveForm
            balances={balances}
            onClose={() => setOpen(false)}
            onSuccess={() => {
              setOpen(false);
              qc.invalidateQueries({ queryKey: ['my-leaves'] });
              qc.invalidateQueries({ queryKey: ['my-leave-balance'] });
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LeaveRow({ leave, onCancel }) {
  const meta = STATUS_META[leave.status] || STATUS_META.PENDING;
  const Icon = meta.icon;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative flex items-center gap-4 py-4"
    >
      <div className="size-10 rounded-lg bg-primary/10 grid place-items-center text-primary">
        <Plane className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium truncate">{LEAVE_LABELS[leave.type] || leave.type}</p>
          <Badge variant={meta.variant}>
            <Icon className="size-3" />
            {meta.label}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatDate(leave.startDate)} → {formatDate(leave.endDate)} · {leave.days} day{leave.days === 1 ? '' : 's'}
        </p>
        {leave.reason && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">"{leave.reason}"</p>
        )}
        {leave.rejectedReason && (
          <p className="text-xs text-destructive mt-1">Rejected: {leave.rejectedReason}</p>
        )}
      </div>
      {leave.status === 'PENDING' && (
        <Button variant="ghost" size="sm" onClick={onCancel} className="text-destructive hover:text-destructive">
          <X className="size-4" />
          Cancel
        </Button>
      )}
    </motion.div>
  );
}

function EmptyLeaves({ onApply }) {
  return (
    <div className="text-center py-12">
      <div className="size-12 mx-auto rounded-xl bg-primary/10 grid place-items-center mb-3">
        <FileText className="size-5 text-primary" />
      </div>
      <h4 className="font-semibold">No leave requests yet</h4>
      <p className="text-sm text-muted-foreground mt-1">When you need time off, apply here in seconds.</p>
      <Button variant="gradient" size="sm" className="mt-4" onClick={onApply}>
        <Plus className="size-4" />
        Apply for leave
      </Button>
    </div>
  );
}

function ApplyLeaveForm({ balances, onClose, onSuccess }) {
  const today = new Date().toISOString().slice(0, 10);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(applySchema),
    defaultValues: { type: 'CASUAL_LEAVE', startDate: today, endDate: today, reason: '' },
  });

  const start = watch('startDate');
  const end = watch('endDate');
  const days = useMemo(() => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    if (e < s) return 0;
    return Math.ceil((e - s) / 86400000) + 1;
  }, [start, end]);
  const type = watch('type');
  const remainingForType = balances[type]?.remaining ?? null;

  const applyMut = useMutation({
    mutationFn: (payload) => leavesApi.apply(payload),
    onSuccess: () => {
      toast.success('Leave application submitted');
      onSuccess?.();
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to apply'),
  });

  return (
    <form onSubmit={handleSubmit((d) => applyMut.mutate(d))} className="space-y-4">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Plane className="size-4 text-primary" />
          Apply for leave
        </DialogTitle>
        <DialogDescription>
          Your manager and HR will be notified instantly.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-2">
        <Label>Leave type</Label>
        <Select value={type} onValueChange={(v) => setValue('type', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {LEAVE_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {remainingForType !== null && (
          <p className="text-xs text-muted-foreground">
            {remainingForType} day{remainingForType === 1 ? '' : 's'} remaining
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Start date</Label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input type="date" min={today} className="pl-10" {...register('startDate')} />
          </div>
          {errors.startDate && <p className="text-xs text-destructive">{errors.startDate.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>End date</Label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input type="date" min={start || today} className="pl-10" {...register('endDate')} />
          </div>
          {errors.endDate && <p className="text-xs text-destructive">{errors.endDate.message}</p>}
        </div>
      </div>

      <div className="rounded-lg border bg-muted/40 p-3 flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">Total</span>
        <span className="font-display font-bold">
          {days} day{days === 1 ? '' : 's'}
        </span>
      </div>

      <div className="space-y-2">
        <Label>Reason (optional)</Label>
        <Textarea rows={3} placeholder="Add context for your manager…" {...register('reason')} />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="gradient" loading={applyMut.isPending} disabled={days === 0}>
          <CheckCircle2 className="size-4" />
          Submit request
        </Button>
      </DialogFooter>
    </form>
  );
}
