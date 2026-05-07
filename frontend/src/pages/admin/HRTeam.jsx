import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Users,
  UserPlus,
  Search,
  MoreHorizontal,
  Mail,
  KeyRound,
  Trash2,
  Eye,
  Briefcase,
  Calendar as CalendarIcon,
  Building2,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Copy,
  ShieldCheck,
  Loader2,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';

import { employeesApi } from '../../api/employees';
import { formatDate, getInitials, cn } from '../../lib/utils';

const ROLES = [
  { value: 'EMPLOYEE', label: 'Employee' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'HR', label: 'HR' },
  { value: 'COMPANY_ADMIN', label: 'Company Admin' },
];

const ROLE_BADGE = {
  SUPER_ADMIN: 'gradient',
  COMPANY_ADMIN: 'gradient',
  HR: 'info',
  MANAGER: 'secondary',
  EMPLOYEE: 'outline',
};

export default function HRTeam() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [viewing, setViewing] = useState(null);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['hr-employees', { search, page }],
    queryFn: () => employeesApi.list({ search: search || undefined, page, limit: 20 }),
    keepPreviousData: true,
  });

  const employees = data?.employees || [];
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 };

  const filtered = useMemo(() => {
    if (roleFilter === 'all') return employees;
    return employees.filter((e) => (e.user?.role || 'EMPLOYEE') === roleFilter);
  }, [employees, roleFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = pagination.total || employees.length;
    const active = employees.filter((e) => e.isActive !== false).length;
    const newThisMonth = employees.filter((e) => {
      if (!e.createdAt) return false;
      const d = new Date(e.createdAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    const managers = employees.filter((e) => e.user?.role === 'MANAGER').length;
    return { total, active, newThisMonth, managers };
  }, [employees, pagination.total]);

  const resendMut = useMutation({
    mutationFn: (id) => employeesApi.resendCredentials(id),
    onSuccess: () => toast.success('Fresh credentials emailed to the employee'),
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to send credentials'),
  });

  const removeMut = useMutation({
    mutationFn: (id) => employeesApi.remove(id),
    onSuccess: () => {
      toast.success('Employee deactivated');
      qc.invalidateQueries({ queryKey: ['hr-employees'] });
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to deactivate'),
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
            <Users className="size-7 text-primary" />
            People
          </h1>
          <p className="text-muted-foreground mt-1">
            Onboard new teammates, manage roles, and re-send credentials in one place.
          </p>
        </div>
        <Button variant="gradient" size="lg" onClick={() => setWizardOpen(true)}>
          <UserPlus className="size-4" />
          Add employee
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total people" value={stats.total} icon={Users} accent="from-sky-500 to-blue-500" />
        <StatCard label="Active now" value={stats.active} icon={ShieldCheck} accent="from-emerald-500 to-teal-500" />
        <StatCard label="New this month" value={stats.newThisMonth} icon={Sparkles} accent="from-violet-500 to-purple-500" />
        <StatCard label="Managers" value={stats.managers} icon={Briefcase} accent="from-amber-500 to-orange-500" />
      </div>

      {/* Toolbar */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-4">
          <div>
            <CardTitle>Directory</CardTitle>
            <CardDescription>
              {pagination.total} employee{pagination.total === 1 ? '' : 's'} on the roster
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative flex-1 sm:flex-none sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search name, email, ID…"
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
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <Filter className="size-4 text-muted-foreground" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                {ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyTeam onAdd={() => setWizardOpen(true)} hasFilter={search.length > 0 || roleFilter !== 'all'} />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden lg:block overflow-x-auto -mx-2">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b">
                      <th className="px-3 py-2 font-medium">Person</th>
                      <th className="px-3 py-2 font-medium">Role</th>
                      <th className="px-3 py-2 font-medium">Employee ID</th>
                      <th className="px-3 py-2 font-medium">Joined</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                      <th className="px-3 py-2 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <AnimatePresence initial={false}>
                      {filtered.map((emp) => (
                        <EmployeeRow
                          key={emp.id}
                          employee={emp}
                          onView={() => setViewing(emp)}
                          onResend={() => resendMut.mutate(emp.id)}
                          onDeactivate={() => {
                            if (window.confirm(`Deactivate ${emp.firstName}? They won't be able to log in.`)) {
                              removeMut.mutate(emp.id);
                            }
                          }}
                          isResending={resendMut.isPending && resendMut.variables === emp.id}
                        />
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {/* Mobile / tablet card list */}
              <div className="lg:hidden space-y-2">
                <AnimatePresence initial={false}>
                  {filtered.map((emp) => (
                    <EmployeeMobileRow
                      key={emp.id}
                      employee={emp}
                      onView={() => setViewing(emp)}
                      onResend={() => resendMut.mutate(emp.id)}
                      onDeactivate={() => {
                        if (window.confirm(`Deactivate ${emp.firstName}?`)) removeMut.mutate(emp.id);
                      }}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-xs text-muted-foreground">
                    Page {pagination.page} of {pagination.pages}
                    {isFetching && <span className="ml-2 inline-flex items-center gap-1"><Loader2 className="size-3 animate-spin" /> updating…</span>}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      <ArrowLeft className="size-4" /> Prev
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page >= pagination.pages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next <ArrowRight className="size-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add wizard */}
      <Dialog open={wizardOpen} onOpenChange={setWizardOpen}>
        <DialogContent className="max-w-2xl">
          <AddEmployeeWizard
            onClose={() => setWizardOpen(false)}
            onSuccess={() => {
              setWizardOpen(false);
              qc.invalidateQueries({ queryKey: ['hr-employees'] });
            }}
          />
        </DialogContent>
      </Dialog>

      {/* View / quick-detail dialog */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-lg">
          {viewing && (
            <EmployeeDetailView
              employee={viewing}
              onResend={() => resendMut.mutate(viewing.id)}
              isResending={resendMut.isPending}
              onClose={() => setViewing(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------------- atoms ---------------- */

function StatCard({ label, value, icon: Icon, accent }) {
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

function EmployeeRow({ employee, onView, onResend, onDeactivate, isResending }) {
  const role = employee.user?.role || 'EMPLOYEE';
  return (
    <motion.tr
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="hover:bg-muted/40 transition-colors"
    >
      <td className="px-3 py-3">
        <button onClick={onView} className="flex items-center gap-3 text-left group">
          <Avatar className="size-9 shrink-0">
            <AvatarFallback>{getInitials(`${employee.firstName} ${employee.lastName}`)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-medium truncate group-hover:text-primary transition-colors">
              {employee.firstName} {employee.lastName}
            </p>
            <p className="text-xs text-muted-foreground truncate">{employee.user?.email || employee.email}</p>
          </div>
        </button>
      </td>
      <td className="px-3 py-3">
        <Badge variant={ROLE_BADGE[role] || 'outline'}>{role.replace('_', ' ')}</Badge>
      </td>
      <td className="px-3 py-3 text-muted-foreground font-mono text-xs">{employee.employeeId}</td>
      <td className="px-3 py-3 text-muted-foreground">{formatDate(employee.joiningDate || employee.createdAt)}</td>
      <td className="px-3 py-3">
        {employee.isActive !== false ? (
          <Badge variant="success"><CheckCircle2 className="size-3" /> Active</Badge>
        ) : (
          <Badge variant="destructive">Deactivated</Badge>
        )}
      </td>
      <td className="px-3 py-3 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onSelect={onView}>
              <Eye className="size-4" /> View profile
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onResend} disabled={isResending}>
              {isResending ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
              Re-send credentials
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={onDeactivate}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="size-4" /> Deactivate
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </motion.tr>
  );
}

function EmployeeMobileRow({ employee, onView, onResend, onDeactivate }) {
  const role = employee.user?.role || 'EMPLOYEE';
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-3 p-3 border rounded-lg bg-card"
    >
      <Avatar className="size-10 shrink-0">
        <AvatarFallback>{getInitials(`${employee.firstName} ${employee.lastName}`)}</AvatarFallback>
      </Avatar>
      <button onClick={onView} className="min-w-0 flex-1 text-left">
        <p className="font-medium truncate">{employee.firstName} {employee.lastName}</p>
        <p className="text-xs text-muted-foreground truncate">{employee.user?.email || employee.email}</p>
        <div className="mt-1 flex gap-1.5 flex-wrap">
          <Badge variant={ROLE_BADGE[role] || 'outline'} className="text-[10px]">{role.replace('_', ' ')}</Badge>
          <Badge variant="outline" className="text-[10px] font-mono">{employee.employeeId}</Badge>
        </div>
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8 shrink-0">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem onSelect={onView}><Eye className="size-4" /> View</DropdownMenuItem>
          <DropdownMenuItem onSelect={onResend}><KeyRound className="size-4" /> Re-send credentials</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={onDeactivate} className="text-destructive focus:text-destructive">
            <Trash2 className="size-4" /> Deactivate
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
}

function EmptyTeam({ onAdd, hasFilter }) {
  return (
    <div className="text-center py-16">
      <div className="size-14 mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent grid place-items-center mb-4 shadow-glow">
        <Users className="size-7 text-white" />
      </div>
      <h4 className="font-display text-lg font-semibold">
        {hasFilter ? 'No matches' : 'Build your team'}
      </h4>
      <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
        {hasFilter
          ? 'Try clearing filters or searching with a different term.'
          : 'Onboard your first employee in under a minute. We\'ll generate a temporary password and email them automatically.'}
      </p>
      {!hasFilter && (
        <Button variant="gradient" size="lg" className="mt-5" onClick={onAdd}>
          <UserPlus className="size-4" />
          Add your first employee
        </Button>
      )}
    </div>
  );
}

function EmployeeDetailView({ employee, onResend, isResending, onClose }) {
  const role = employee.user?.role || 'EMPLOYEE';
  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-3">
          <Avatar className="size-10">
            <AvatarFallback>{getInitials(`${employee.firstName} ${employee.lastName}`)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-base">{employee.firstName} {employee.lastName}</p>
            <p className="text-xs font-normal text-muted-foreground">{employee.user?.email || employee.email}</p>
          </div>
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-3 py-2">
        <DetailRow icon={ShieldCheck} label="Role" value={<Badge variant={ROLE_BADGE[role] || 'outline'}>{role.replace('_', ' ')}</Badge>} />
        <DetailRow icon={Briefcase} label="Employee ID" value={<span className="font-mono">{employee.employeeId}</span>} />
        {employee.phone && <DetailRow icon={Mail} label="Phone" value={employee.phone} />}
        <DetailRow icon={CalendarIcon} label="Joined" value={formatDate(employee.joiningDate || employee.createdAt)} />
        {employee.salary && <DetailRow icon={Sparkles} label="Salary" value={`₹${Number(employee.salary).toLocaleString('en-IN')}`} />}
        {employee.manager && (
          <DetailRow
            icon={Users}
            label="Reports to"
            value={`${employee.manager.firstName} ${employee.manager.lastName}`}
          />
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Close</Button>
        <Button
          variant="gradient"
          onClick={onResend}
          loading={isResending}
        >
          <KeyRound className="size-4" />
          Re-send credentials
        </Button>
      </DialogFooter>
    </>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4" />
        {label}
      </div>
      <div className="text-sm font-medium text-right">{value}</div>
    </div>
  );
}

/* ---------------- Wizard ---------------- */

const stepBasicsSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email('Valid email required'),
  role: z.enum(['EMPLOYEE', 'MANAGER', 'HR', 'COMPANY_ADMIN']),
  employeeId: z.string().optional(),
  phone: z.string().optional(),
});

const stepJobSchema = z.object({
  joiningDate: z.string().optional(),
  salary: z.union([z.string(), z.number()]).optional(),
  managerId: z.string().optional(),
  // free-form text for now (we don't yet have a department picker UI)
  designation: z.string().optional(),
  department: z.string().optional(),
});

const STEPS = [
  { id: 'basics', title: 'Basics', subtitle: 'Who are they?', icon: Users },
  { id: 'job', title: 'Job', subtitle: 'Where do they fit?', icon: Briefcase },
  { id: 'creds', title: 'Credentials', subtitle: 'Login & access', icon: KeyRound },
  { id: 'review', title: 'Review', subtitle: 'Send invite', icon: CheckCircle2 },
];

function generateLocalTempPassword() {
  const adj = ['Bright', 'Bold', 'Calm', 'Swift', 'Quiet', 'Brave', 'Wise', 'Kind', 'Sharp', 'Sunny'];
  const ani = ['Falcon', 'Otter', 'Tiger', 'Panda', 'Eagle', 'Lynx', 'Lion', 'Wolf', 'Hawk', 'Bear'];
  const a = adj[Math.floor(Math.random() * adj.length)];
  const b = ani[Math.floor(Math.random() * ani.length)];
  const n = String(Math.floor(1000 + Math.random() * 9000));
  return `${a}-${b}-${n}`;
}

function AddEmployeeWizard({ onClose, onSuccess }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'EMPLOYEE',
    employeeId: '',
    joiningDate: new Date().toISOString().slice(0, 10),
    salary: '',
    designation: '',
    department: '',
    managerId: '',
    // creds
    autoPassword: true,
    password: generateLocalTempPassword(),
  });

  const update = (patch) => setData((d) => ({ ...d, ...patch }));

  const createMut = useMutation({
    mutationFn: (payload) => employeesApi.create(payload),
    onSuccess: () => {
      toast.success('Employee created — welcome email on the way');
      onSuccess?.();
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to create employee'),
  });

  const submit = () => {
    const payload = {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.trim().toLowerCase(),
      role: data.role,
    };
    if (data.phone) payload.phone = data.phone;
    if (data.employeeId) payload.employeeId = data.employeeId;
    if (data.joiningDate) payload.dateOfBirth = undefined; // no DOB step yet — keep clear
    if (data.salary) payload.salary = Number(data.salary);
    if (data.managerId) payload.managerId = data.managerId;
    // Server uses its own temp password if we don't pass one; otherwise honour user-entered one.
    if (!data.autoPassword && data.password) payload.password = data.password;
    createMut.mutate(payload);
  };

  const goNext = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <UserPlus className="size-4 text-primary" />
          Onboard a new employee
        </DialogTitle>
        <DialogDescription>
          {STEPS[step].subtitle} — they'll receive a welcome email automatically.
        </DialogDescription>
      </DialogHeader>

      {/* Stepper */}
      <div className="flex items-center justify-between gap-1 px-1 py-2">
        {STEPS.map((s, i) => {
          const isActive = i === step;
          const isDone = i < step;
          const Icon = s.icon;
          return (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center gap-1 flex-1">
                <motion.div
                  animate={{
                    scale: isActive ? 1.05 : 1,
                  }}
                  className={cn(
                    'size-9 rounded-lg grid place-items-center transition-colors',
                    isActive && 'bg-gradient-to-br from-primary to-accent text-white shadow-glow',
                    isDone && 'bg-emerald-500 text-white',
                    !isActive && !isDone && 'bg-muted text-muted-foreground',
                  )}
                >
                  {isDone ? <CheckCircle2 className="size-5" /> : <Icon className="size-4" />}
                </motion.div>
                <p className={cn('text-[11px] font-medium', isActive ? 'text-foreground' : 'text-muted-foreground')}>
                  {s.title}
                </p>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn('flex-1 h-px transition-colors', i < step ? 'bg-emerald-500' : 'bg-border')} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step body */}
      <div className="min-h-[260px] py-2">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={STEPS[step].id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.18 }}
          >
            {step === 0 && <StepBasics data={data} update={update} onValid={goNext} />}
            {step === 1 && <StepJob data={data} update={update} />}
            {step === 2 && <StepCredentials data={data} update={update} />}
            {step === 3 && <StepReview data={data} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <DialogFooter className="gap-2 sm:gap-2">
        <Button variant="outline" onClick={step === 0 ? onClose : goBack} disabled={createMut.isPending}>
          {step === 0 ? 'Cancel' : (<><ArrowLeft className="size-4" /> Back</>)}
        </Button>
        {step < STEPS.length - 1 ? (
          <Button
            variant="gradient"
            onClick={() => {
              // gate forward on basics validation
              if (step === 0) {
                const result = stepBasicsSchema.safeParse(data);
                if (!result.success) {
                  toast.error(result.error.issues[0]?.message || 'Please fill in the required fields');
                  return;
                }
              }
              goNext();
            }}
          >
            Next <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button variant="gradient" onClick={submit} loading={createMut.isPending}>
            <Mail className="size-4" />
            Send invite
          </Button>
        )}
      </DialogFooter>
    </>
  );
}

function StepBasics({ data, update }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>First name *</Label>
          <Input
            value={data.firstName}
            onChange={(e) => update({ firstName: e.target.value })}
            placeholder="Aanya"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Last name *</Label>
          <Input
            value={data.lastName}
            onChange={(e) => update({ lastName: e.target.value })}
            placeholder="Sharma"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Work email *</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            type="email"
            className="pl-10"
            value={data.email}
            onChange={(e) => update({ email: e.target.value })}
            placeholder="aanya@grandhr.in"
          />
        </div>
        <p className="text-[11px] text-muted-foreground">Their welcome email will be delivered here.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Role *</Label>
          <Select value={data.role} onValueChange={(v) => update({ role: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {ROLES.map((r) => (
                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Phone</Label>
          <Input
            value={data.phone}
            onChange={(e) => update({ phone: e.target.value })}
            placeholder="+91 ..."
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Employee ID <span className="text-muted-foreground font-normal">(optional — auto-generated otherwise)</span></Label>
        <Input
          value={data.employeeId}
          onChange={(e) => update({ employeeId: e.target.value })}
          placeholder="EMP-1024"
        />
      </div>
    </div>
  );
}

function StepJob({ data, update }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Designation</Label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              className="pl-10"
              value={data.designation}
              onChange={(e) => update({ designation: e.target.value })}
              placeholder="Senior Engineer"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Department</Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              className="pl-10"
              value={data.department}
              onChange={(e) => update({ department: e.target.value })}
              placeholder="Engineering"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Joining date</Label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              type="date"
              className="pl-10"
              value={data.joiningDate}
              onChange={(e) => update({ joiningDate: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Annual salary (₹)</Label>
          <Input
            type="number"
            value={data.salary}
            onChange={(e) => update({ salary: e.target.value })}
            placeholder="900000"
          />
        </div>
      </div>

      <div className="rounded-lg border border-dashed bg-muted/30 p-3 text-xs text-muted-foreground">
        Need to assign a manager? You can set this from the directory after creating the employee.
      </div>
    </div>
  );
}

function StepCredentials({ data, update }) {
  const copy = () => {
    navigator.clipboard.writeText(data.password);
    toast.success('Password copied to clipboard');
  };
  const regen = () => update({ password: generateLocalTempPassword() });

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-gradient-to-br from-primary/5 via-accent/5 to-transparent p-4">
        <div className="flex items-start gap-3">
          <div className="size-9 rounded-lg bg-gradient-to-br from-primary to-accent grid place-items-center text-white shadow-glow shrink-0">
            <KeyRound className="size-4" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">Auto-generate a secure temporary password</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              We'll email it to {data.email || 'the employee'} and ask them to change it on first login. Recommended.
            </p>
          </div>
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={data.autoPassword}
              onChange={(e) => update({ autoPassword: e.target.checked })}
            />
            <div className="w-11 h-6 bg-muted peer-checked:bg-gradient-to-r peer-checked:from-primary peer-checked:to-accent rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition relative" />
          </label>
        </div>
      </div>

      <AnimatePresence initial={false} mode="wait">
        {data.autoPassword ? (
          <motion.div
            key="auto"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="rounded-lg border bg-card p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Preview password</p>
                <p className="font-mono text-lg font-semibold mt-1">{data.password}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={regen} type="button">
                  <RefreshCw className="size-4" />
                  Regenerate
                </Button>
                <Button variant="outline" size="sm" onClick={copy} type="button">
                  <Copy className="size-4" />
                  Copy
                </Button>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground mt-3">
              ℹ The server may issue an even stronger password if you leave this empty. We send a final copy
              of the password used in the welcome email.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="manual"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="space-y-1.5"
          >
            <Label>Set a custom password (min 6 chars)</Label>
            <Input
              type="text"
              value={data.password}
              onChange={(e) => update({ password: e.target.value })}
              placeholder="MyStrongPass1!"
            />
            <p className="text-[11px] text-muted-foreground">
              We'll email this password to {data.email || 'the employee'}.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StepReview({ data }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border overflow-hidden">
        <div className="px-4 py-3 bg-gradient-to-r from-primary/10 via-accent/10 to-transparent border-b flex items-center gap-3">
          <Avatar className="size-10">
            <AvatarFallback>{getInitials(`${data.firstName} ${data.lastName}`)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-semibold truncate">{data.firstName} {data.lastName || '—'}</p>
            <p className="text-xs text-muted-foreground truncate">{data.email}</p>
          </div>
          <Badge variant={ROLE_BADGE[data.role] || 'outline'} className="ml-auto">{data.role.replace('_', ' ')}</Badge>
        </div>
        <div className="divide-y">
          <ReviewLine label="Phone" value={data.phone || '—'} />
          <ReviewLine label="Employee ID" value={data.employeeId || 'auto-generated'} mono />
          <ReviewLine label="Designation" value={data.designation || '—'} />
          <ReviewLine label="Department" value={data.department || '—'} />
          <ReviewLine label="Joining" value={data.joiningDate ? formatDate(data.joiningDate) : '—'} />
          <ReviewLine label="Salary" value={data.salary ? `₹${Number(data.salary).toLocaleString('en-IN')}` : '—'} />
          <ReviewLine
            label="Password"
            value={data.autoPassword ? 'Server-generated, emailed' : data.password}
            mono={!data.autoPassword}
          />
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm">
        <Mail className="size-4 mt-0.5 text-emerald-500 shrink-0" />
        <div>
          <p className="font-semibold text-emerald-700 dark:text-emerald-300">A welcome email is on its way</p>
          <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80">
            Includes their login URL, employee ID, temporary password, and a "change password" prompt.
          </p>
        </div>
      </div>
    </div>
  );
}

function ReviewLine({ label, value, mono }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('font-medium text-right truncate max-w-[60%]', mono && 'font-mono text-xs')}>{value}</span>
    </div>
  );
}
