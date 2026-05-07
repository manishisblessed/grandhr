import React, { useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  Wallet,
  Download,
  Eye,
  Calendar as CalendarIcon,
  Building2,
  Sparkles,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import {
  Dialog,
  DialogContent,
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
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, getInitials } from '../../lib/utils';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function EmployeeSalary() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [active, setActive] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['my-payrolls'],
    queryFn: payrollApi.myPayrolls,
  });

  const allPayrolls = data?.payrolls || [];
  const filtered = useMemo(
    () => allPayrolls.filter((p) => p.year === year).sort((a, b) => b.month - a.month),
    [allPayrolls, year]
  );

  const years = useMemo(() => {
    const set = new Set(allPayrolls.map((p) => p.year));
    set.add(new Date().getFullYear());
    return Array.from(set).sort((a, b) => b - a);
  }, [allPayrolls]);

  const ytd = useMemo(() => {
    let net = 0, gross = 0, deduct = 0;
    filtered.forEach((p) => {
      net += p.netSalary || 0;
      gross += (p.baseSalary || 0) + (p.allowances || 0);
      deduct += (p.deductions || 0) + (p.tax || 0);
    });
    return { net, gross, deduct };
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Salary slips</h1>
          <p className="text-muted-foreground mt-1">View, preview and download your monthly payslips.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* YTD */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <YtdCard label="YTD net pay" value={formatCurrency(ytd.net)} sub="After tax + deductions" icon={Wallet} color="from-emerald-500 to-teal-500" />
        <YtdCard label="YTD gross" value={formatCurrency(ytd.gross)} sub="Base + allowances" icon={TrendingUp} color="from-violet-500 to-indigo-500" />
        <YtdCard label="YTD deductions" value={formatCurrency(ytd.deduct)} sub="Tax + other" icon={TrendingDown} color="from-rose-500 to-pink-500" />
      </div>

      {/* Months grid */}
      <Card>
        <CardHeader>
          <CardTitle>{year} payslips</CardTitle>
          <CardDescription>One card per month — only generated months are clickable.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {MONTHS.map((m, i) => {
                const month = i + 1;
                const slip = filtered.find((p) => p.month === month);
                return (
                  <MonthCard key={m} month={month} year={year} slip={slip} onClick={() => slip && setActive(slip)} />
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-3xl p-0 sm:rounded-2xl overflow-hidden">
          {active && <PayslipDialog slip={active} onClose={() => setActive(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function YtdCard({ label, value, sub, icon: Icon, color }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="font-display text-2xl font-bold mt-1">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{sub}</p>
          </div>
          <div className={`size-10 rounded-lg bg-gradient-to-br ${color} grid place-items-center text-white shadow-md`}>
            <Icon className="size-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MonthCard({ month, year, slip, onClick }) {
  const isFuture =
    year > new Date().getFullYear() ||
    (year === new Date().getFullYear() && month > new Date().getMonth() + 1);

  return (
    <motion.button
      whileHover={slip ? { y: -3 } : {}}
      onClick={onClick}
      disabled={!slip}
      className={`relative w-full text-left rounded-xl border p-4 transition-colors ${
        slip ? 'bg-card hover:border-primary/50 cursor-pointer' : 'bg-muted/40 cursor-not-allowed opacity-70'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{MONTHS[month - 1]}</p>
          <p className="font-display font-bold">{year}</p>
        </div>
        {slip ? (
          <Badge variant="success">Paid</Badge>
        ) : isFuture ? (
          <Badge variant="outline">—</Badge>
        ) : (
          <Badge variant="outline">N/A</Badge>
        )}
      </div>
      {slip ? (
        <>
          <p className="font-display text-lg font-bold">{formatCurrency(slip.netSalary)}</p>
          <p className="text-[11px] text-muted-foreground">net pay</p>
        </>
      ) : (
        <p className="text-xs text-muted-foreground">No slip available</p>
      )}
    </motion.button>
  );
}

// ===== Payslip preview & PDF =====

function PayslipDialog({ slip, onClose }) {
  const { user } = useAuth();
  const ref = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const employee = user?.employee || {};
  const fullName = `${employee.firstName ?? ''} ${employee.lastName ?? ''}`.trim() || 'Employee';
  const company = 'GrandHR';

  const downloadPdf = async () => {
    if (!ref.current) return;
    try {
      setDownloading(true);
      const canvas = await html2canvas(ref.current, { scale: 2, backgroundColor: '#ffffff' });
      const img = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const ratio = pageW / canvas.width;
      pdf.addImage(img, 'PNG', 0, 16, pageW, canvas.height * ratio);
      pdf.save(`${MONTHS_LONG[slip.month - 1]}-${slip.year}-${employee.employeeId || 'payslip'}.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  const totalEarnings = (slip.baseSalary || 0) + (slip.allowances || 0);
  const totalDeductions = (slip.deductions || 0) + (slip.tax || 0);

  return (
    <div className="flex flex-col max-h-[90vh]">
      <DialogHeader className="px-6 pt-6">
        <DialogTitle className="flex items-center gap-2">
          <Wallet className="size-4 text-primary" />
          Payslip · {MONTHS_LONG[slip.month - 1]} {slip.year}
        </DialogTitle>
      </DialogHeader>

      <div className="overflow-y-auto px-6 py-4">
        <div ref={ref} className="bg-white text-slate-900 rounded-xl p-8 shadow-inner border">
          {/* Letterhead */}
          <div className="flex items-start justify-between border-b-2 border-slate-200 pb-5">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 grid place-items-center text-white">
                <Sparkles className="size-6" />
              </div>
              <div>
                <p className="font-display text-2xl font-bold">{company}</p>
                <p className="text-xs text-slate-500">www.grandhr.in</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-slate-500">Pay slip</p>
              <p className="font-display text-lg font-bold">{MONTHS_LONG[slip.month - 1]} {slip.year}</p>
            </div>
          </div>

          {/* Employee block */}
          <div className="grid grid-cols-2 gap-4 mt-5 text-sm">
            <PayRow label="Employee" value={fullName} />
            <PayRow label="Employee ID" value={employee.employeeId || '—'} />
            <PayRow label="Designation" value={employee.designation?.name || '—'} />
            <PayRow label="Department" value={employee.department?.name || '—'} />
            <PayRow label="Date of joining" value={employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString('en-IN') : '—'} />
            <PayRow label="Pay date" value={new Date(slip.updatedAt || slip.createdAt).toLocaleDateString('en-IN')} />
          </div>

          {/* Earnings + deductions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div>
              <h3 className="text-xs uppercase tracking-widest text-slate-500 font-semibold pb-2 border-b">Earnings</h3>
              <PayLine label="Base salary" amount={slip.baseSalary} />
              <PayLine label="Allowances" amount={slip.allowances} />
              <PayLine label="Total earnings" amount={totalEarnings} bold />
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-widest text-slate-500 font-semibold pb-2 border-b">Deductions</h3>
              <PayLine label="Tax (TDS)" amount={slip.tax} negative />
              <PayLine label="Other deductions" amount={slip.deductions} negative />
              <PayLine label="Total deductions" amount={totalDeductions} negative bold />
            </div>
          </div>

          {/* Net */}
          <div className="mt-6 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-emerald-700">Net pay</p>
              <p className="text-[10px] text-emerald-600/80">Payable to {fullName}</p>
            </div>
            <p className="font-display text-3xl font-bold text-emerald-700">{formatCurrency(slip.netSalary)}</p>
          </div>

          <p className="mt-6 text-[10px] text-slate-400 text-center">
            This is a system-generated payslip and does not require signature.
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2 px-6 py-4 border-t">
        <Button variant="outline" onClick={onClose}>Close</Button>
        <Button variant="gradient" onClick={downloadPdf} loading={downloading}>
          <Download className="size-4" />
          Download PDF
        </Button>
      </div>
    </div>
  );
}

function PayRow({ label, value }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-slate-500">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function PayLine({ label, amount, negative, bold }) {
  const cls = `flex items-center justify-between py-1.5 ${bold ? 'font-bold border-t mt-1 pt-2' : 'text-slate-700'}`;
  return (
    <div className={cls}>
      <span>{label}</span>
      <span className={negative ? 'text-rose-600' : 'text-slate-900'}>
        {negative ? '- ' : ''}{formatCurrency(amount || 0)}
      </span>
    </div>
  );
}
