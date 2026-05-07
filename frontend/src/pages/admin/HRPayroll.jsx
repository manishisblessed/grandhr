import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Wallet,
  Sparkles,
  Search,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
  TrendingUp,
  Users,
  ArrowDownToLine,
  Eye,
  FileText,
  Loader2,
  CheckCircle2,
  Pencil,
  Lock,
  Banknote,
  Receipt,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
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

import { payrollApi } from '../../api/payroll';
import { formatCurrency, formatDate, getInitials, cn } from '../../lib/utils';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const STATUS_META = {
  PENDING: { label: 'Pending', variant: 'warning' },
  PROCESSED: { label: 'Processed', variant: 'info' },
  PAID: { label: 'Paid', variant: 'success' },
  LOCKED: { label: 'Locked', variant: 'secondary' },
  CANCELLED: { label: 'Cancelled', variant: 'destructive' },
};

const todayMonthYear = () => {
  const d = new Date();
  return { month: d.getMonth() + 1, year: d.getFullYear() };
};

export default function HRPayroll() {
  const qc = useQueryClient();
  const init = todayMonthYear();
  const [month, setMonth] = useState(init.month);
  const [year, setYear] = useState(init.year);
  const [search, setSearch] = useState('');
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['hr-payroll', month, year],
    queryFn: () => payrollApi.list({ month, year, limit: 200 }),
    keepPreviousData: true,
  });

  const payrolls = data?.payrolls || [];

  const filtered = useMemo(() => {
    if (!search) return payrolls;
    const q = search.toLowerCase();
    return payrolls.filter((p) => {
      const e = p.employee || {};
      const name = `${e.firstName || ''} ${e.lastName || ''}`.toLowerCase();
      const empId = (e.employeeId || '').toLowerCase();
      return name.includes(q) || empId.includes(q);
    });
  }, [payrolls, search]);

  const totals = useMemo(() => {
    const t = {
      employees: payrolls.length,
      gross: 0,
      net: 0,
      deductions: 0,
      paid: 0,
    };
    payrolls.forEach((p) => {
      t.gross += (p.baseSalary || 0) + (p.allowances || 0);
      t.net += p.netSalary || 0;
      t.deductions += (p.deductions || 0) + (p.tax || 0) + (p.pf || 0) + (p.tds || 0);
      if (p.status === 'PAID') t.paid += 1;
    });
    return t;
  }, [payrolls]);

  const generateMut = useMutation({
    mutationFn: () => payrollApi.generate({ month, year }),
    onSuccess: (resp) => {
      const n = resp?.payrolls?.length ?? 0;
      toast.success(n > 0 ? `Generated ${n} payroll${n === 1 ? '' : 's'}` : 'All employees already have payroll for this month');
      qc.invalidateQueries({ queryKey: ['hr-payroll', month, year] });
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to generate'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }) => payrollApi.update(id, payload),
    onSuccess: () => {
      toast.success('Payroll updated');
      qc.invalidateQueries({ queryKey: ['hr-payroll', month, year] });
      setEditing(null);
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to update'),
  });

  const monthLabel = `${MONTHS[month - 1]} ${year}`;

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
            <Wallet className="size-7 text-primary" />
            Payroll
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate, review, and lock the monthly payroll for your team.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <MonthYearPicker month={month} year={year} onMonth={setMonth} onYear={setYear} />
          <Button
            variant="gradient"
            size="lg"
            onClick={() => generateMut.mutate()}
            loading={generateMut.isPending}
          >
            <Sparkles className="size-4" />
            Generate {MONTHS[month - 1]} payroll
          </Button>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Employees" value={totals.employees} icon={Users} accent="from-sky-500 to-blue-500" />
        <KpiCard label="Gross payout" value={formatCurrency(totals.gross)} icon={Banknote} accent="from-violet-500 to-purple-500" big />
        <KpiCard label="Total deductions" value={formatCurrency(totals.deductions)} icon={Receipt} accent="from-amber-500 to-orange-500" big />
        <KpiCard label="Net payout" value={formatCurrency(totals.net)} icon={TrendingUp} accent="from-emerald-500 to-teal-500" big />
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-4">
          <div>
            <CardTitle>{monthLabel}</CardTitle>
            <CardDescription>
              {payrolls.length === 0
                ? 'No payroll records yet for this month — click Generate to create them.'
                : `${payrolls.length} payroll record${payrolls.length === 1 ? '' : 's'} · ${totals.paid} paid`}
            </CardDescription>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employee…"
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyPayroll
              hasFilter={search.length > 0}
              onGenerate={() => generateMut.mutate()}
              loading={generateMut.isPending}
              monthLabel={monthLabel}
            />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden lg:block overflow-x-auto -mx-2">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b">
                      <th className="px-3 py-2 font-medium">Employee</th>
                      <th className="px-3 py-2 font-medium text-right">Base</th>
                      <th className="px-3 py-2 font-medium text-right">Allowances</th>
                      <th className="px-3 py-2 font-medium text-right">Deductions</th>
                      <th className="px-3 py-2 font-medium text-right">Net</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                      <th className="px-3 py-2 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <AnimatePresence initial={false}>
                      {filtered.map((p) => (
                        <PayrollRow
                          key={p.id}
                          payroll={p}
                          onView={() => setViewing(p)}
                          onEdit={() => setEditing(p)}
                        />
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {/* Mobile / tablet card list */}
              <div className="lg:hidden space-y-2">
                <AnimatePresence initial={false}>
                  {filtered.map((p) => (
                    <PayrollMobileRow
                      key={p.id}
                      payroll={p}
                      onView={() => setViewing(p)}
                      onEdit={() => setEditing(p)}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {isFetching && (
                <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1">
                  <Loader2 className="size-3 animate-spin" /> updating…
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Payslip preview */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-2xl">
          {viewing && <PayslipPreview payroll={viewing} onClose={() => setViewing(null)} />}
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-md">
          {editing && (
            <EditPayrollForm
              payroll={editing}
              onCancel={() => setEditing(null)}
              onSubmit={(payload) => updateMut.mutate({ id: editing.id, payload })}
              loading={updateMut.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------------- atoms ---------------- */

function MonthYearPicker({ month, year, onMonth, onYear }) {
  const years = useMemo(() => {
    const now = new Date().getFullYear();
    return [now - 2, now - 1, now, now + 1];
  }, []);

  const goPrev = () => {
    if (month === 1) {
      onMonth(12);
      onYear(year - 1);
    } else {
      onMonth(month - 1);
    }
  };
  const goNext = () => {
    if (month === 12) {
      onMonth(1);
      onYear(year + 1);
    } else {
      onMonth(month + 1);
    }
  };

  return (
    <div className="flex items-center gap-1 rounded-xl border bg-card p-1.5">
      <Button variant="ghost" size="icon" className="size-9" onClick={goPrev}><ChevronLeft className="size-4" /></Button>
      <Select value={String(month)} onValueChange={(v) => onMonth(Number(v))}>
        <SelectTrigger className="h-9 border-0 bg-transparent shadow-none w-32"><SelectValue /></SelectTrigger>
        <SelectContent>
          {MONTHS.map((m, i) => (
            <SelectItem key={m} value={String(i + 1)}>{m}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={String(year)} onValueChange={(v) => onYear(Number(v))}>
        <SelectTrigger className="h-9 border-0 bg-transparent shadow-none w-24"><SelectValue /></SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={String(y)}>{y}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="ghost" size="icon" className="size-9" onClick={goNext}><ChevronRight className="size-4" /></Button>
    </div>
  );
}

function KpiCard({ label, value, icon: Icon, accent, big }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-4 relative">
          <div className={cn('absolute -top-8 -right-8 size-24 rounded-full bg-gradient-to-br opacity-10 blur-2xl', accent)} />
          <div className="flex items-center justify-between relative">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
              <p className={cn('font-display font-bold mt-1 truncate', big ? 'text-2xl' : 'text-3xl')}>{value}</p>
            </div>
            <div className={cn('size-10 rounded-lg bg-gradient-to-br grid place-items-center text-white shrink-0', accent)}>
              <Icon className="size-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function PayrollRow({ payroll, onView, onEdit }) {
  const e = payroll.employee || {};
  const status = STATUS_META[payroll.status] || STATUS_META.PENDING;
  const totalDeductions = (payroll.deductions || 0) + (payroll.tax || 0) + (payroll.pf || 0) + (payroll.tds || 0);
  return (
    <motion.tr
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="hover:bg-muted/40 transition-colors"
    >
      <td className="px-3 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="size-9 shrink-0">
            <AvatarFallback>{getInitials(`${e.firstName || ''} ${e.lastName || ''}`)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-medium truncate">{e.firstName} {e.lastName}</p>
            <p className="text-xs text-muted-foreground truncate font-mono">{e.employeeId}</p>
          </div>
        </div>
      </td>
      <td className="px-3 py-3 text-right tabular-nums">{formatCurrency(payroll.baseSalary)}</td>
      <td className="px-3 py-3 text-right tabular-nums text-emerald-600 dark:text-emerald-400">
        {payroll.allowances > 0 ? `+${formatCurrency(payroll.allowances)}` : '—'}
      </td>
      <td className="px-3 py-3 text-right tabular-nums text-rose-600 dark:text-rose-400">
        {totalDeductions > 0 ? `−${formatCurrency(totalDeductions)}` : '—'}
      </td>
      <td className="px-3 py-3 text-right tabular-nums font-semibold">{formatCurrency(payroll.netSalary)}</td>
      <td className="px-3 py-3">
        <Badge variant={status.variant}>
          {payroll.isLocked && <Lock className="size-3" />}
          {status.label}
        </Badge>
      </td>
      <td className="px-3 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={onView}>
            <Eye className="size-4" />
            <span className="hidden xl:inline">View</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={onEdit} disabled={payroll.isLocked}>
            <Pencil className="size-4" />
            <span className="hidden xl:inline">Edit</span>
          </Button>
        </div>
      </td>
    </motion.tr>
  );
}

function PayrollMobileRow({ payroll, onView, onEdit }) {
  const e = payroll.employee || {};
  const status = STATUS_META[payroll.status] || STATUS_META.PENDING;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="rounded-lg border bg-card p-3"
    >
      <div className="flex items-center gap-3">
        <Avatar className="size-10 shrink-0">
          <AvatarFallback>{getInitials(`${e.firstName || ''} ${e.lastName || ''}`)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="font-medium truncate">{e.firstName} {e.lastName}</p>
          <p className="text-xs text-muted-foreground truncate font-mono">{e.employeeId}</p>
        </div>
        <Badge variant={status.variant}>
          {payroll.isLocked && <Lock className="size-3" />}
          {status.label}
        </Badge>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Net pay</p>
          <p className="font-display text-xl font-bold">{formatCurrency(payroll.netSalary)}</p>
        </div>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" onClick={onView}><Eye className="size-4" /> View</Button>
          <Button variant="outline" size="sm" onClick={onEdit} disabled={payroll.isLocked}><Pencil className="size-4" /></Button>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyPayroll({ hasFilter, onGenerate, loading, monthLabel }) {
  if (hasFilter) {
    return (
      <div className="text-center py-16">
        <div className="size-14 mx-auto rounded-2xl bg-muted grid place-items-center mb-4 text-muted-foreground">
          <Search className="size-7" />
        </div>
        <h4 className="font-display text-lg font-semibold">No matches</h4>
        <p className="text-sm text-muted-foreground mt-1">Try a different search term.</p>
      </div>
    );
  }
  return (
    <div className="text-center py-16">
      <div className="size-14 mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent grid place-items-center mb-4 shadow-glow">
        <Sparkles className="size-7 text-white" />
      </div>
      <h4 className="font-display text-lg font-semibold">Run payroll for {monthLabel}</h4>
      <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
        We'll create a payroll record for every active employee using their salary, then you can review and lock.
      </p>
      <Button variant="gradient" size="lg" className="mt-5" onClick={onGenerate} loading={loading}>
        <Sparkles className="size-4" />
        Generate payroll
      </Button>
    </div>
  );
}

/* ---------------- Payslip preview ---------------- */

function PayslipPreview({ payroll, onClose }) {
  const e = payroll.employee || {};
  const totalEarnings = (payroll.baseSalary || 0) + (payroll.allowances || 0);
  const totalDeductions = (payroll.deductions || 0) + (payroll.tax || 0) + (payroll.pf || 0) + (payroll.esi || 0) + (payroll.pt || 0) + (payroll.tds || 0);
  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <FileText className="size-4 text-primary" />
          Payslip · {MONTHS[payroll.month - 1]} {payroll.year}
        </DialogTitle>
        <DialogDescription>
          Read-only preview. Employees see this exact slip in their portal.
        </DialogDescription>
      </DialogHeader>

      <div className="rounded-xl border overflow-hidden">
        {/* Header band */}
        <div className="px-5 py-4 bg-gradient-to-r from-primary/10 via-accent/10 to-transparent border-b flex items-center gap-3">
          <Avatar className="size-12">
            <AvatarFallback>{getInitials(`${e.firstName || ''} ${e.lastName || ''}`)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-semibold truncate">{e.firstName} {e.lastName}</p>
            <p className="text-xs text-muted-foreground truncate">{e.employeeId} · {e.designation?.name || 'Employee'}</p>
          </div>
          <Badge variant={STATUS_META[payroll.status]?.variant || 'outline'} className="ml-auto">
            {STATUS_META[payroll.status]?.label || payroll.status}
          </Badge>
        </div>

        {/* Earnings + Deductions */}
        <div className="grid md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-border">
          <div className="p-5 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <TrendingUp className="size-3.5" /> Earnings
            </h4>
            <PayslipLine label="Basic salary" value={payroll.baseSalary} />
            <PayslipLine label="Allowances" value={payroll.allowances} positive />
            <div className="pt-2 border-t flex justify-between font-semibold">
              <span>Total earnings</span>
              <span className="tabular-nums">{formatCurrency(totalEarnings)}</span>
            </div>
          </div>
          <div className="p-5 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <Receipt className="size-3.5" /> Deductions
            </h4>
            <PayslipLine label="Provident Fund (PF)" value={payroll.pf} negative />
            <PayslipLine label="ESI" value={payroll.esi} negative />
            <PayslipLine label="Professional tax (PT)" value={payroll.pt} negative />
            <PayslipLine label="TDS" value={payroll.tds} negative />
            <PayslipLine label="Income tax" value={payroll.tax} negative />
            <PayslipLine label="Other deductions" value={payroll.deductions} negative />
            <div className="pt-2 border-t flex justify-between font-semibold">
              <span>Total deductions</span>
              <span className="tabular-nums">{formatCurrency(totalDeductions)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-t flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Net pay</p>
            <p className="font-display text-3xl font-bold tabular-nums">{formatCurrency(payroll.netSalary)}</p>
          </div>
          {payroll.paidDate && (
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Paid on</p>
              <p className="font-medium">{formatDate(payroll.paidDate)}</p>
            </div>
          )}
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Close</Button>
        <Button variant="gradient" onClick={() => window.print()}>
          <ArrowDownToLine className="size-4" />
          Print
        </Button>
      </DialogFooter>
    </>
  );
}

function PayslipLine({ label, value, positive, negative }) {
  if (!value || value === 0) return null;
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          'tabular-nums font-medium',
          positive && 'text-emerald-600 dark:text-emerald-400',
          negative && 'text-rose-600 dark:text-rose-400',
        )}
      >
        {negative ? '−' : positive ? '+' : ''}{formatCurrency(Math.abs(value))}
      </span>
    </div>
  );
}

/* ---------------- Edit dialog ---------------- */

function EditPayrollForm({ payroll, onCancel, onSubmit, loading }) {
  const [form, setForm] = useState({
    baseSalary: payroll.baseSalary || 0,
    allowances: payroll.allowances || 0,
    deductions: payroll.deductions || 0,
    tax: payroll.tax || 0,
    status: payroll.status || 'PENDING',
    notes: payroll.notes || '',
  });

  const update = (k, v) => setForm((s) => ({ ...s, [k]: v }));
  const numberFields = ['baseSalary', 'allowances', 'deductions', 'tax'];
  const projectedNet = numberFields.reduce((acc, k) => {
    const v = Number(form[k]) || 0;
    return k === 'baseSalary' || k === 'allowances' ? acc + v : acc - v;
  }, 0);

  const submit = (e) => {
    e.preventDefault();
    onSubmit({
      baseSalary: Number(form.baseSalary) || 0,
      allowances: Number(form.allowances) || 0,
      deductions: Number(form.deductions) || 0,
      tax: Number(form.tax) || 0,
      status: form.status,
      notes: form.notes || null,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Pencil className="size-4 text-primary" />
          Edit payroll
        </DialogTitle>
        <DialogDescription>
          Update components and status. Net pay recalculates automatically.
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-2 gap-3">
        <NumberField label="Base salary" value={form.baseSalary} onChange={(v) => update('baseSalary', v)} />
        <NumberField label="Allowances" value={form.allowances} onChange={(v) => update('allowances', v)} accent="emerald" />
        <NumberField label="Deductions" value={form.deductions} onChange={(v) => update('deductions', v)} accent="rose" />
        <NumberField label="Tax" value={form.tax} onChange={(v) => update('tax', v)} accent="rose" />
      </div>

      <div className="space-y-1.5">
        <Label>Status</Label>
        <Select value={form.status} onValueChange={(v) => update('status', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.entries(STATUS_META).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Projected net pay</p>
          <p className="font-display text-2xl font-bold tabular-nums">{formatCurrency(projectedNet)}</p>
        </div>
        <CheckCircle2 className="size-6 text-emerald-500" />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="gradient" loading={loading}>
          <CheckCircle2 className="size-4" />
          Save changes
        </Button>
      </DialogFooter>
    </form>
  );
}

function NumberField({ label, value, onChange, accent }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="relative">
        <IndianRupee className={cn(
          'absolute left-3 top-1/2 -translate-y-1/2 size-4 pointer-events-none',
          accent === 'emerald' && 'text-emerald-500',
          accent === 'rose' && 'text-rose-500',
          !accent && 'text-muted-foreground',
        )} />
        <Input
          type="number"
          inputMode="numeric"
          className="pl-9 tabular-nums"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}
