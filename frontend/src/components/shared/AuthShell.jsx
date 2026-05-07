import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, Users, FileText } from 'lucide-react';
import { Background3D, MeshGradient } from './BackgroundFX';

const features = [
  { icon: Users, title: 'Manage your workforce', desc: 'Onboarding, hierarchy, attendance, leaves — one place.' },
  { icon: FileText, title: 'Templates & documents', desc: 'Send offer, appointment, salary slips with one click.' },
  { icon: ShieldCheck, title: 'Enterprise grade', desc: 'Role-based access, audit logs, encrypted at rest.' },
];

/**
 * AuthShell — split-screen auth layout used by HRLogin, EmployeeLogin, Register, etc.
 *
 * Props:
 *   title, subtitle  — optional copy shown on the left visual side
 *   children         — the form (rendered on the right pane)
 *   showFeatures     — show feature bullets on the visual side
 *   variant          — 'default' (3D + mesh) | 'minimal' (mesh only, lighter)
 */
export function AuthShell({ title, subtitle, children, showFeatures = true, variant = 'default' }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground">
      <MeshGradient />
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Visual side */}
        <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden border-r border-border/50">
          {variant === 'default' && <Background3D />}
          <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/0 to-background/40 -z-10" />

          <div className="relative z-10 flex items-center gap-3">
            <img 
              src="/logo.jpeg" 
              alt="GrandHR Logo" 
              className="size-10 rounded-xl object-cover shadow-glow"
            />
            <span className="text-xl font-display font-bold tracking-tight">GrandHR</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 max-w-lg"
          >
            <h1 className="font-display text-4xl xl:text-5xl font-bold leading-tight">
              {title || (
                <>
                  Run your HR like a{' '}
                  <span className="text-gradient-primary">global enterprise</span>
                </>
              )}
            </h1>
            {subtitle ? (
              <p className="mt-4 text-base xl:text-lg text-muted-foreground">{subtitle}</p>
            ) : (
              <p className="mt-4 text-base xl:text-lg text-muted-foreground">
                One platform for onboarding, attendance, payroll, documents, and the
                entire employee lifecycle.
              </p>
            )}

            {showFeatures && (
              <ul className="mt-10 space-y-5">
                {features.map((f, i) => (
                  <motion.li
                    key={f.title}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.1, duration: 0.4 }}
                    className="flex items-start gap-4"
                  >
                    <div className="size-10 shrink-0 rounded-lg bg-primary/10 border border-primary/20 grid place-items-center text-primary">
                      <f.icon className="size-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{f.title}</p>
                      <p className="text-sm text-muted-foreground">{f.desc}</p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}
          </motion.div>

          <p className="relative z-10 text-xs text-muted-foreground">
            © {new Date().getFullYear()} GrandHR · Built for modern teams
          </p>
        </div>

        {/* Form side */}
        <div className="relative flex items-center justify-center p-6 sm:p-12">
          {/* Mobile logo */}
          <Link to="/" className="absolute top-6 left-6 lg:hidden flex items-center gap-2">
            <img 
              src="/logo.jpeg" 
              alt="GrandHR Logo" 
              className="size-9 rounded-xl object-cover"
            />
            <span className="font-display font-bold">GrandHR</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
