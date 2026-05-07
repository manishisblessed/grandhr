import React from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  BellOff,
  CheckCircle2,
  Download,
  Loader2,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  WifiOff,
} from 'lucide-react';

import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';
import { usePushNotifications } from '../../hooks/usePushNotifications';

const FEATURES = [
  { icon: Bell, label: 'Push notifications', text: 'Leave decisions, payslips and announcements pinged straight to your home screen.' },
  { icon: WifiOff, label: 'Offline punch', text: 'Punch in even with patchy connectivity — it queues and syncs the moment you reconnect.' },
  { icon: Smartphone, label: 'Home-screen app', text: 'No App Store needed — install from the browser, run in fullscreen, feels native.' },
  { icon: ShieldCheck, label: 'Secure by default', text: 'End-to-end TLS, role-based permissions, encrypted at rest. Same trust as the desktop app.' },
];

export default function MobileAppPage() {
  const install = useInstallPrompt();
  const push = usePushNotifications();

  return (
    <div className="space-y-8">
      <Header />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InstallCard install={install} />
        <PushCard push={push} />
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-6 md:p-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="size-4 text-primary" />
            <h2 className="font-semibold">What you get</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FEATURES.map((f) => (
              <div key={f.label} className="flex items-start gap-3 rounded-xl border bg-card/60 p-4">
                <div className="size-10 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 grid place-items-center text-primary shrink-0">
                  <f.icon className="size-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm">{f.label}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Header() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/10 via-card to-accent/10 p-6 md:p-8"
    >
      <div className="relative z-10 max-w-2xl">
        <Badge variant="gradient" className="mb-3">
          <Smartphone className="size-3" />
          GrandHR mobile
        </Badge>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
          Take GrandHR{' '}
          <span className="text-gradient-primary">to your pocket</span>
        </h1>
        <p className="mt-2 text-sm md:text-base text-muted-foreground">
          Install GrandHR like a native app, get instant push notifications, and punch in even when
          you're offline. Works on Android, iOS, Windows, and macOS without any app store.
        </p>
      </div>
      <div className="absolute -right-12 -bottom-12 size-56 rounded-full bg-gradient-to-br from-primary to-accent opacity-15 blur-2xl" />
    </motion.div>
  );
}

function InstallCard({ install }) {
  const { available, installed, iosInstallHint, install: doInstall } = install;
  return (
    <Card className="overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-violet-500" />
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="size-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 grid place-items-center text-white shrink-0">
            <Download className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold">Install the app</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {installed
                ? "You're already running the installed version. Nice!"
                : available
                  ? 'Tap install — GrandHR will get its own home-screen icon and full-screen window.'
                  : iosInstallHint
                    ? 'On iPhone: open the Share menu, scroll down and tap "Add to Home Screen".'
                    : 'Your browser will offer to install when ready, usually after a few visits.'}
            </p>
          </div>
        </div>

        {installed ? (
          <Status label="Installed" tone="success" icon={CheckCircle2} />
        ) : available ? (
          <Button onClick={doInstall} variant="gradient" className="gap-2 w-full md:w-auto">
            <Download className="size-4" />
            Install GrandHR
          </Button>
        ) : iosInstallHint ? (
          <ol className="text-sm text-muted-foreground space-y-1.5 pl-5 list-decimal">
            <li>Open this page in <strong>Safari</strong>.</li>
            <li>Tap the <strong>Share</strong> button at the bottom of the screen.</li>
            <li>Scroll and tap <strong>Add to Home Screen</strong>.</li>
            <li>Confirm with <strong>Add</strong>.</li>
          </ol>
        ) : (
          <Status label="Browser hasn't offered install yet — keep visiting!" tone="muted" icon={Smartphone} />
        )}
      </CardContent>
    </Card>
  );
}

function PushCard({ push }) {
  const { supported, permission, subscribed, busy, subscribe, unsubscribe, sendTest } = push;

  return (
    <Card className="overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-green-600" />
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="size-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 grid place-items-center text-white shrink-0">
            <Bell className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold">Push notifications</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {!supported
                ? 'This browser does not support push notifications. Try Chrome, Edge or a recent Safari.'
                : permission === 'denied'
                  ? 'Notifications are blocked. Enable them from your browser site settings, then come back.'
                  : subscribed
                    ? "You'll get a push the moment important things happen — leaves, payslips, announcements."
                    : 'Turn on notifications and we\'ll ping you for leave decisions, payslips and announcements.'}
            </p>
          </div>
        </div>

        {!supported ? (
          <Status label="Not supported on this device" tone="muted" icon={BellOff} />
        ) : subscribed ? (
          <div className="flex flex-wrap gap-2">
            <Button onClick={sendTest} variant="outline" disabled={busy} className="gap-2">
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              Send a test push
            </Button>
            <Button onClick={unsubscribe} variant="ghost" disabled={busy} className="gap-2 text-rose-500 hover:text-rose-500">
              <BellOff className="size-4" />
              Turn off
            </Button>
          </div>
        ) : (
          <Button onClick={subscribe} variant="gradient" disabled={busy} className="gap-2 w-full md:w-auto">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Bell className="size-4" />}
            Enable notifications
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function Status({ label, tone = 'success', icon: Icon }) {
  const cls = {
    success: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    muted: 'bg-muted text-muted-foreground border-border',
    warning: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  }[tone];
  return (
    <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium border ${cls}`}>
      {Icon ? <Icon className="size-3.5" /> : null}
      {label}
    </div>
  );
}
