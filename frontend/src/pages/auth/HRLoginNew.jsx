import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, Mail, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

import { AuthShell } from '../../components/shared/AuthShell';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useAuth, getHomePathForRole } from '../../contexts/AuthContext';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export default function HRLoginNew() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const from = location.state?.from?.pathname;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async ({ email, password }) => {
    const { data, error } = await signIn(email.trim().toLowerCase(), password);
    if (error) {
      toast.error(error);
      return;
    }
    const u = data?.user;
    toast.success(`Welcome back, ${u?.employee?.firstName || u?.email || 'there'}!`);
    navigate(from || getHomePathForRole(u?.role), { replace: true });
  };

  return (
    <AuthShell
      title={
        <>
          Welcome back to{' '}
          <span className="text-gradient-primary">GrandHR</span>
        </>
      }
      subtitle="Sign in to manage your workforce, send documents, and run payroll — all in one place."
    >
      <div className="space-y-8">
        <div className="space-y-2">
          <h2 className="font-display text-3xl font-bold">Sign in</h2>
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/hr/company-onboarding" className="text-primary hover:underline font-semibold">
              Register your company
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                placeholder="you@company.com"
                className="pl-10 h-12"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link to="/forgot-password" className="text-xs text-primary hover:underline font-medium">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                className="pl-10 pr-10 h-12"
                {...register('password')}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 size-7 grid place-items-center rounded-md text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <motion.div whileTap={{ scale: 0.98 }} className="relative">
            <Button
              type="submit"
              variant="gradient"
              size="lg"
              loading={isSubmitting}
              className="w-full h-12 group"
            >
              Sign in
              <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </motion.div>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Are you an employee?</span>
          </div>
        </div>

        <Link
          to="/login"
          className="flex items-center justify-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
        >
          Sign in to the employee portal
          <ArrowRight className="size-3.5" />
        </Link>

        <p className="text-center text-xs text-muted-foreground">
          By signing in you agree to our{' '}
          <Link to="/terms-of-service" className="underline hover:text-foreground">Terms</Link>{' '}
          and{' '}
          <Link to="/privacy-policy" className="underline hover:text-foreground">Privacy Policy</Link>.
        </p>
      </div>
    </AuthShell>
  );
}
