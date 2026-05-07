import React, { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Briefcase,
  CalendarCheck2,
  Save,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';

import { authApi } from '../../api/auth';
import { useAuth } from '../../contexts/AuthContext';
import { getInitials, formatDate } from '../../lib/utils';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional().or(z.literal('')),
  alternatePhone: z.string().optional().or(z.literal('')),
  dateOfBirth: z.string().optional().or(z.literal('')),
  gender: z.string().optional().or(z.literal('')),
  maritalStatus: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  zipCode: z.string().optional().or(z.literal('')),
  country: z.string().optional().or(z.literal('')),
});

export default function EmployeeProfile() {
  const { user, refreshProfile } = useAuth();
  const employee = user?.employee || {};

  const fullName = `${employee.firstName ?? ''} ${employee.lastName ?? ''}`.trim() || user?.email || 'Profile';
  const initials = getInitials(fullName);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: employee.firstName || '',
      lastName: employee.lastName || '',
      phone: employee.phone || '',
      alternatePhone: employee.alternatePhone || '',
      dateOfBirth: employee.dateOfBirth ? new Date(employee.dateOfBirth).toISOString().slice(0, 10) : '',
      gender: employee.gender || '',
      maritalStatus: employee.maritalStatus || '',
      address: employee.address || '',
      city: employee.city || '',
      state: employee.state || '',
      zipCode: employee.zipCode || '',
      country: employee.country || '',
    },
  });

  // Sync when user is hydrated from /auth/profile
  useEffect(() => {
    reset({
      firstName: employee.firstName || '',
      lastName: employee.lastName || '',
      phone: employee.phone || '',
      alternatePhone: employee.alternatePhone || '',
      dateOfBirth: employee.dateOfBirth ? new Date(employee.dateOfBirth).toISOString().slice(0, 10) : '',
      gender: employee.gender || '',
      maritalStatus: employee.maritalStatus || '',
      address: employee.address || '',
      city: employee.city || '',
      state: employee.state || '',
      zipCode: employee.zipCode || '',
      country: employee.country || '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const updateMut = useMutation({
    mutationFn: (data) => authApi.updateProfile(data),
    onSuccess: async () => {
      toast.success('Profile updated');
      await refreshProfile();
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to update profile'),
  });

  const onSubmit = (values) => {
    const payload = { ...values };
    if (!payload.dateOfBirth) delete payload.dateOfBirth;
    Object.keys(payload).forEach((k) => payload[k] === '' && delete payload[k]);
    updateMut.mutate(payload);
  };

  return (
    <div className="space-y-6">
      {/* Hero card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-card to-accent/10 p-6 md:p-8"
      >
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
          <div className="relative">
            <Avatar className="size-24 ring-4 ring-background shadow-glow">
              <AvatarImage src={employee.avatarUrl} />
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <span className="absolute -bottom-1 -right-1 size-6 rounded-full bg-emerald-500 ring-2 ring-background grid place-items-center">
              <ShieldCheck className="size-3 text-white" />
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <Badge variant="gradient" className="mb-2">
              <Sparkles className="size-3" />
              {user?.role || 'EMPLOYEE'}
            </Badge>
            <h1 className="font-display text-3xl font-bold truncate">{fullName}</h1>
            <p className="text-muted-foreground mt-1">{employee.designation?.name || '—'} · {employee.department?.name || '—'}</p>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl">
              <Pill icon={Mail} label={user?.email} />
              <Pill icon={Building2} label={`Emp ID: ${employee.employeeId || '—'}`} />
              <Pill icon={CalendarCheck2} label={`Joined ${employee.joiningDate ? formatDate(employee.joiningDate) : '—'}`} />
            </div>
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="address">Address</TabsTrigger>
          <TabsTrigger value="employment">Employment</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Personal information</CardTitle>
                <CardDescription>Update your contact and personal details.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="First name" error={errors.firstName?.message}>
                  <Input {...register('firstName')} />
                </Field>
                <Field label="Last name" error={errors.lastName?.message}>
                  <Input {...register('lastName')} />
                </Field>
                <Field label="Phone">
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    <Input className="pl-10" placeholder="+91 …" {...register('phone')} />
                  </div>
                </Field>
                <Field label="Alternate phone">
                  <Input placeholder="Optional" {...register('alternatePhone')} />
                </Field>
                <Field label="Date of birth">
                  <Input type="date" {...register('dateOfBirth')} />
                </Field>
                <Field label="Gender">
                  <Input placeholder="Male / Female / Other" {...register('gender')} />
                </Field>
                <Field label="Marital status">
                  <Input placeholder="Single / Married / Other" {...register('maritalStatus')} />
                </Field>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="address">
            <Card>
              <CardHeader>
                <CardTitle>Address</CardTitle>
                <CardDescription>Where you're based — this appears on your letters.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Street address" className="md:col-span-2">
                  <Textarea rows={2} {...register('address')} />
                </Field>
                <Field label="City">
                  <Input {...register('city')} />
                </Field>
                <Field label="State / region">
                  <Input {...register('state')} />
                </Field>
                <Field label="Pincode">
                  <Input {...register('zipCode')} />
                </Field>
                <Field label="Country">
                  <Input {...register('country')} />
                </Field>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employment">
            <Card>
              <CardHeader>
                <CardTitle>Employment details</CardTitle>
                <CardDescription>Read-only — contact HR for changes.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Readonly icon={User} label="Employee ID" value={employee.employeeId || '—'} />
                <Readonly icon={Briefcase} label="Designation" value={employee.designation?.name || '—'} />
                <Readonly icon={Building2} label="Department" value={employee.department?.name || '—'} />
                <Readonly icon={CalendarCheck2} label="Joining date" value={employee.joiningDate ? formatDate(employee.joiningDate) : '—'} />
                <Readonly icon={ShieldCheck} label="Status" value={employee.employmentStatus || '—'} />
                <Readonly icon={Mail} label="Work email" value={user?.email || '—'} />
              </CardContent>
            </Card>
          </TabsContent>

          <div className="sticky bottom-4 flex justify-end">
            <Button type="submit" variant="gradient" size="lg" loading={isSubmitting || updateMut.isPending} disabled={!isDirty}>
              <Save className="size-4" />
              Save changes
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  );
}

function Field({ label, children, error, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function Readonly({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </div>
      <p className="font-medium mt-1">{value}</p>
    </div>
  );
}

function Pill({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground rounded-md bg-card/60 backdrop-blur border px-2.5 py-1.5">
      <Icon className="size-3.5 shrink-0" />
      <span className="truncate">{label}</span>
    </div>
  );
}
