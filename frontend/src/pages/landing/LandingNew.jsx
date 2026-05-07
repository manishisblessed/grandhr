import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Users,
  CalendarCheck2,
  Plane,
  Wallet,
  FileText,
  Bot,
  ShieldCheck,
  IdCard,
  Bell,
  CheckCircle2,
  Zap,
  Lock,
  Server,
  Award,
  UserPlus,
  Send,
  PartyPopper,
  Quote,
  Star,
} from 'lucide-react';

import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
// Lazy-load the heavy 3D scene so three.js never blocks the landing page first paint.
const HeroScene3D = lazy(() => import('../../components/shared/HeroScene3D'));
import { MeshGradient } from '../../components/shared/BackgroundFX';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import Footer from '../../components/Footer';

// ----- Animated number ticker -----
function NumberTicker({ value, suffix = '', duration = 1.6 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - t, 3);
      setN(Math.round(value * eased));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value, duration]);
  return (
    <span ref={ref}>
      {n.toLocaleString('en-IN')}
      {suffix}
    </span>
  );
}

const adminFeatures = [
  { icon: Users, title: 'Onboarding & profiles', desc: 'Add employees in seconds and let GrandHR generate IDs, send credentials, and set up access.' },
  { icon: FileText, title: 'Template Studio', desc: 'Upload your letters or use ours. Drag merge tags, preview, and email — like Pabbly Connect for HR docs.', accent: true },
  { icon: CalendarCheck2, title: 'Attendance & shifts', desc: 'Calendar, bulk mark, geo-fence, late/early reports — your full attendance cockpit.' },
  { icon: Plane, title: 'Leave approvals', desc: 'Beautiful queue, comments, balances and policy enforcement.' },
  { icon: Wallet, title: 'Payroll & slips', desc: 'Generate slips from templates, lock the month, audit every change.' },
  { icon: Bot, title: 'Automations', desc: 'Birthday wishes, joining day reminders, monthly slip emails — on schedule.' },
];

const employeeFeatures = [
  { icon: IdCard, title: 'ID card on demand', desc: 'Beautiful 3D ID card you can download as PDF anytime.' },
  { icon: FileText, title: 'My documents', desc: 'Offer letters, payslips, certificates — all in one library.' },
  { icon: Plane, title: 'Apply for leave', desc: 'See balance, attach docs, track approvals in real time.' },
  { icon: CalendarCheck2, title: 'Punch in / out', desc: 'One-tap attendance with optional selfie + geo.' },
  { icon: Bell, title: 'Notifications', desc: 'Announcements, document updates, leave decisions instantly.' },
  { icon: ShieldCheck, title: 'Privacy first', desc: 'Your data is yours. Encrypted, role-aware, audited.' },
];

const steps = [
  {
    icon: UserPlus,
    title: 'Create your company',
    desc: 'Sign up, name your organisation, and invite your HR team in under a minute.',
  },
  {
    icon: Users,
    title: 'Onboard your people',
    desc: 'Add employees one by one or import a CSV. We email everyone their login automatically.',
  },
  {
    icon: Send,
    title: 'Run HR on autopilot',
    desc: 'Send letters, approve leaves, generate payroll. Everyone stays in sync via email + portal.',
  },
];

const trustItems = [
  { icon: ShieldCheck, label: 'Role-based access', desc: 'Granular permissions, audited.' },
  { icon: Lock, label: 'Encrypted at rest', desc: 'AES-256 storage on Neon Postgres.' },
  { icon: Server, label: '99.95% uptime', desc: 'Multi-region failover ready.' },
  { icon: Award, label: 'GDPR + SOC 2 ready', desc: 'Compliance hooks built-in.' },
];

export default function LandingNew() {
  const { isAuthenticated, homePath } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.4]);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-background text-foreground">
      {/* Top nav */}
      <nav className="fixed top-0 inset-x-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-background/60 backdrop-blur-xl px-4 py-2.5 shadow-lg">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src="/logo.jpeg" 
                alt="GrandHR Logo" 
                className="size-9 rounded-xl object-cover shadow-glow"
              />
              <span className="font-display font-bold tracking-tight">GrandHR</span>
            </Link>
            <div className="hidden md:flex items-center gap-6 text-sm">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#admin" className="text-muted-foreground hover:text-foreground transition-colors">For HR</a>
              <a href="#employee" className="text-muted-foreground hover:text-foreground transition-colors">For Employees</a>
              <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={toggleTheme} className="hidden md:inline-flex">
                {theme === 'dark' ? '☀️' : '🌙'}
              </Button>
              {isAuthenticated ? (
                <Button asChild variant="gradient" size="sm">
                  <Link to={homePath}>Open dashboard <ArrowRight className="size-3.5" /></Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/login">Employee</Link>
                  </Button>
                  <Button asChild variant="gradient" size="sm">
                    <Link to="/hr/login">HR Login</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section ref={heroRef} className="relative min-h-[100svh] flex items-center pt-32 pb-20 overflow-hidden">
        <MeshGradient />
        <Suspense fallback={null}>
          <HeroScene3D />
        </Suspense>

        <div className="absolute inset-0 pointer-events-none" />
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <Badge variant="gradient" className="mb-6">
              <Sparkles className="size-3" />
              The all-in-one HR platform for modern teams
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]"
          >
            Run HR like a{' '}
            <span className="text-gradient-primary">global enterprise</span>
            <br />
            <span className="text-foreground/90">without the ops cost.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground"
          >
            Onboarding, attendance, payroll, document workflows and an employee portal — all
            connected through a beautifully designed system your HR and employees will actually
            love using.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <Button asChild variant="gradient" size="xl" className="group">
              <Link to={isAuthenticated ? homePath : '/hr/login'}>
                {isAuthenticated ? 'Go to dashboard' : 'Start with HR Login'}
                <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </Button>
            <Button asChild variant="glass" size="xl">
              <Link to="/hr/company-onboarding">
                Register your company
              </Link>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
          >
            <Stat label="Companies" value={120} />
            <Stat label="Employees managed" value={42000} suffix="+" />
            <Stat label="Documents sent" value={185000} suffix="+" />
            <Stat label="Avg. setup time" value={7} suffix=" min" />
          </motion.div>
        </motion.div>
      </section>

      {/* TEMPLATE STUDIO TEASER */}
      <section className="relative section">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FeatureBanner />
        </div>
      </section>

      {/* HR features */}
      <section id="features" className="relative section">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            id="admin"
            eyebrow="For HR & Admins"
            title={<>Everything HR needs, <span className="text-gradient-primary">in one cockpit</span></>}
            sub="A workforce of 10 or 10,000 — same beautiful tools, no engineering required."
          />
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {adminFeatures.map((f, i) => (
              <FeatureCard key={f.title} feature={f} delay={i * 0.05} />
            ))}
          </div>
        </div>
      </section>

      {/* Employee features */}
      <section id="employee" className="relative section">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="For Employees"
            title={<>Their <span className="text-gradient-primary">workplace</span>, in their pocket</>}
            sub="Punch in, view documents, apply for leave, get the pay slip — without ever asking HR."
          />
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {employeeFeatures.map((f, i) => (
              <FeatureCard key={f.title} feature={f} delay={i * 0.05} />
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative section">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="How it works"
            title={<>From signup to first payslip in <span className="text-gradient-primary">one afternoon</span></>}
            sub="Three short steps. No engineering team. No 60-page implementation guide."
          />
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* connecting line */}
            <div className="hidden md:block absolute top-7 left-[16%] right-[16%] h-px bg-gradient-to-r from-primary/0 via-primary/40 to-accent/0" />
            {steps.map((s, i) => (
              <StepCard key={s.title} step={s} index={i + 1} />
            ))}
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="relative section-tight">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl border bg-card/60 backdrop-blur-md p-6 md:p-8"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {trustItems.map((t) => (
                <div key={t.label} className="flex items-start gap-3">
                  <div className="size-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 grid place-items-center text-primary shrink-0">
                    <t.icon className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{t.label}</p>
                    <p className="text-xs text-muted-foreground">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="relative section">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.figure
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="relative rounded-3xl border bg-gradient-to-br from-card via-card to-primary/5 p-8 md:p-12 text-center overflow-hidden"
          >
            <Quote className="absolute top-6 left-6 size-10 text-primary/20" />
            <Quote className="absolute bottom-6 right-6 size-10 text-primary/20 rotate-180" />
            <div className="flex justify-center gap-1 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <blockquote className="font-display text-xl md:text-2xl leading-relaxed">
              "We replaced three different tools — our HR letter generator, attendance system, and payroll
              spreadsheet — with GrandHR in a single Friday afternoon. Our team's first reaction was
              <span className="text-gradient-primary"> 'finally, software that doesn't feel from 2009'.</span>"
            </blockquote>
            <figcaption className="mt-6 inline-flex items-center gap-3">
              <div className="size-10 rounded-full bg-gradient-to-br from-primary to-accent grid place-items-center text-white font-bold">
                AS
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">Aanya Sharma</p>
                <p className="text-xs text-muted-foreground">Head of People · 240-employee SaaS company</p>
              </div>
            </figcaption>
          </motion.figure>
        </div>
      </section>

      {/* CTA */}
      <section className="relative section">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7 }}
            className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/15 via-card to-accent/15 p-10 md:p-14 text-center"
          >
            <div className="absolute inset-0 bg-grid opacity-20" />
            <div className="relative z-10">
              <Badge variant="gradient" className="mb-4">
                <Zap className="size-3" />
                7-minute setup
              </Badge>
              <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
                Ready to give your team a{' '}
                <span className="text-gradient-primary">workplace they love?</span>
              </h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                Onboard in minutes. Migrate from your old HRMS at any time.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button asChild variant="gradient" size="xl">
                  <Link to="/hr/company-onboarding">
                    Get started — it's free
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="xl">
                  <Link to="/contact">Talk to sales</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Stat({ label, value, suffix }) {
  return (
    <div className="text-center">
      <p className="font-display text-3xl md:text-4xl font-bold text-gradient-primary">
        <NumberTicker value={value} suffix={suffix} />
      </p>
      <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

function SectionHeading({ id, eyebrow, title, sub }) {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6 }}
      className="relative text-center max-w-3xl mx-auto"
    >
      <Badge variant="secondary" className="mb-3">{eyebrow}</Badge>
      <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
        {title}
      </h2>
      {sub ? <p className="mt-4 text-muted-foreground text-base sm:text-lg">{sub}</p> : null}
    </motion.div>
  );
}

function FeatureCard({ feature, delay = 0 }) {
  const { icon: Icon, title, desc, accent } = feature;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      className="group relative"
    >
      <div className={`relative h-full rounded-2xl border bg-card p-6 transition-all hover:border-primary/40 ${accent ? 'gradient-border' : ''}`}>
        <div className={`size-11 rounded-xl ${accent ? 'bg-gradient-to-br from-primary to-accent text-white shadow-glow' : 'bg-primary/10 text-primary'} grid place-items-center mb-4`}>
          <Icon className="size-5" />
        </div>
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{desc}</p>
        {accent ? (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary to-accent text-white text-[10px] font-bold px-2 py-0.5">
            NEW
          </span>
        ) : null}
      </div>
    </motion.div>
  );
}

function StepCard({ step, index }) {
  const Icon = step.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-2xl border bg-card p-6 hover:border-primary/40 transition-colors"
    >
      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          <div className="size-14 rounded-2xl bg-gradient-to-br from-primary to-accent grid place-items-center text-white shadow-glow">
            <Icon className="size-6" />
          </div>
          <span className="absolute -top-2 -right-2 size-6 rounded-full bg-background border-2 border-primary text-primary grid place-items-center font-bold text-xs">
            {index}
          </span>
        </div>
        <div className="min-w-0">
          <h3 className="font-display text-lg font-semibold">{step.title}</h3>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
        </div>
      </div>
    </motion.div>
  );
}

function FeatureBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.7 }}
      className="relative overflow-hidden rounded-3xl border bg-card"
    >
      <div className="absolute inset-0 bg-mesh opacity-60" />
      <div className="relative z-10 grid lg:grid-cols-2 gap-10 p-8 md:p-12 items-center">
        <div>
          <Badge variant="gradient" className="mb-4">
            <Sparkles className="size-3" />
            Template Studio
          </Badge>
          <h3 className="font-display text-3xl md:text-4xl font-bold tracking-tight leading-tight">
            HR documents,{' '}
            <span className="text-gradient-primary">on autopilot.</span>
          </h3>
          <p className="mt-4 text-muted-foreground">
            Upload your existing offer letter, salary slip or warning letter. We detect{' '}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">{'{{merge.tags}}'}</code>,
            give you a beautiful editor, and send personalised copies to selected employees by email
            — with a copy in their portal.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              'Upload .docx and HTML — we parse them for you',
              'Drag merge tags from a sidebar',
              'Preview against real employee data',
              'Send to one or many — track delivery',
            ].map((s) => (
              <li key={s} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex gap-3">
            <Button asChild variant="gradient" size="lg">
              <Link to="/hr/templates">
                Try Template Studio
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="relative">
          <motion.div
            whileHover={{ rotateY: -6, rotateX: 4, scale: 1.02 }}
            style={{ transformPerspective: 1200 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="relative rounded-2xl border bg-background shadow-2xl overflow-hidden"
          >
            <div className="bg-muted/50 px-3 py-2 flex items-center gap-1.5 border-b">
              <span className="size-2.5 rounded-full bg-rose-400" />
              <span className="size-2.5 rounded-full bg-amber-400" />
              <span className="size-2.5 rounded-full bg-emerald-400" />
              <span className="ml-3 text-[10px] uppercase tracking-wider text-muted-foreground">/hr/templates</span>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <p className="font-display font-bold text-lg">Standard Offer Letter</p>
              <div className="rounded-lg border bg-background p-4 text-foreground/90 leading-relaxed">
                <p><strong>Date:</strong> <span className="bg-primary/15 text-primary rounded px-1.5 font-mono text-xs">{'{{date.today}}'}</span></p>
                <p className="mt-2">Dear <span className="bg-primary/15 text-primary rounded px-1.5 font-mono text-xs">{'{{employee.fullName}}'}</span>,</p>
                <p className="mt-2 text-muted-foreground">We are pleased to offer you the position of <span className="bg-primary/15 text-primary rounded px-1.5 font-mono text-xs">{'{{employee.designation}}'}</span> at <span className="bg-primary/15 text-primary rounded px-1.5 font-mono text-xs">{'{{company.name}}'}</span>…</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {['{{employee.fullName}}', '{{employee.salary}}', '{{date.today}}'].map((tag) => (
                  <span key={tag} className="text-[11px] font-mono rounded-md border px-1.5 py-1">{tag}</span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
