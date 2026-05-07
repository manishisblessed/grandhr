import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Mail,
  Eye,
  Send,
  Loader2,
  Search,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';

import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { cn } from '../../lib/utils';
import { emailTemplatesApi } from '../../api/emailTemplates';
import { useAuth } from '../../contexts/AuthContext';

const ACCENT_STYLES = {
  primary: 'from-indigo-500 to-violet-500',
  success: 'from-emerald-500 to-green-600',
  warning: 'from-amber-500 to-orange-500',
  danger: 'from-rose-500 to-red-600',
  neutral: 'from-slate-700 to-slate-900',
};

const ACCENT_BADGE = {
  primary: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30',
  success: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  warning: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  danger: 'bg-rose-500/10 text-rose-600 border-rose-500/30',
  neutral: 'bg-slate-500/10 text-slate-500 border-slate-500/30',
};

export default function EmailStudio() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [activeKey, setActiveKey] = useState(null);
  const [testRecipient, setTestRecipient] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['email-templates'],
    queryFn: () => emailTemplatesApi.list(),
  });

  const templates = data?.templates || [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return templates;
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.key.toLowerCase().includes(q),
    );
  }, [templates, search]);

  const active = useMemo(
    () => templates.find((t) => t.key === activeKey) || null,
    [templates, activeKey],
  );

  useEffect(() => {
    if (active && !testRecipient) {
      setTestRecipient(user?.email || '');
    }
  }, [active, user?.email, testRecipient]);

  return (
    <div className="space-y-8">
      <Header onRefresh={refetch} />

      <Card className="border-border/60">
        <CardContent className="p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Transactional emails</h2>
              <p className="text-sm text-muted-foreground">
                Every automated message GrandHR sends, in one place. Click a card to preview it live or send a test.
              </p>
            </div>
            <div className="relative md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search templates"
                className="pl-9"
              />
            </div>
          </div>

          {isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              Could not load templates. Try refreshing.
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-44 rounded-2xl" />
                ))
              : filtered.map((t) => (
                  <TemplateCard
                    key={t.key}
                    template={t}
                    onPreview={() => {
                      setActiveKey(t.key);
                      setTestRecipient(user?.email || '');
                    }}
                  />
                ))}
            {!isLoading && filtered.length === 0 ? (
              <div className="md:col-span-2 lg:col-span-3 rounded-xl border border-dashed bg-card/50 p-10 text-center text-muted-foreground">
                No templates match "{search}".
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={!!active}
        onOpenChange={(open) => {
          if (!open) setActiveKey(null);
        }}
      >
        <DialogContent className="max-w-5xl">
          {active ? (
            <PreviewDialogBody
              template={active}
              testRecipient={testRecipient}
              setTestRecipient={setTestRecipient}
              onClose={() => setActiveKey(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Header({ onRefresh }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/10 via-card to-accent/10 p-6 md:p-8"
    >
      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div className="space-y-2 max-w-2xl">
          <Badge variant="gradient" className="mb-1">
            <Sparkles className="size-3" />
            Email Studio
          </Badge>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
            One brand,{' '}
            <span className="text-gradient-primary">every email</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Preview every transactional email GrandHR sends, send yourself a test, and verify the
            content before it goes out to your team.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => onRefresh && onRefresh()} className="gap-2">
            <RefreshCw className="size-4" />
            Refresh
          </Button>
        </div>
      </div>
      <div className="absolute -right-12 -bottom-12 size-56 rounded-full bg-gradient-to-br from-primary to-accent opacity-15 blur-2xl" />
    </motion.div>
  );
}

function TemplateCard({ template, onPreview }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -3 }}
    >
      <Card className="h-full overflow-hidden border-border/60 hover:border-primary/40 transition-colors">
        <div className={cn('h-2 bg-gradient-to-r', ACCENT_STYLES[template.accent] || ACCENT_STYLES.primary)} />
        <CardContent className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base leading-tight">{template.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{template.description}</p>
            </div>
            <span
              className={cn(
                'shrink-0 size-10 rounded-xl grid place-items-center border',
                ACCENT_BADGE[template.accent] || ACCENT_BADGE.primary,
              )}
            >
              <Mail className="size-4" />
            </span>
          </div>
          <div className="rounded-lg bg-muted/40 px-3 py-2 text-[11px] font-mono text-muted-foreground line-clamp-2">
            {template.trigger}
          </div>
          <Button onClick={onPreview} variant="outline" size="sm" className="w-full justify-between gap-2">
            <span className="flex items-center gap-2">
              <Eye className="size-4" />
              Preview & test
            </span>
            <ChevronRight className="size-4" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function PreviewDialogBody({ template, testRecipient, setTestRecipient, onClose }) {
  const iframeRef = useRef(null);
  const [tab, setTab] = useState('html');

  const previewQuery = useQuery({
    queryKey: ['email-template-preview', template.key],
    queryFn: () => emailTemplatesApi.preview(template.key, template.sample),
  });

  const sendTest = useMutation({
    mutationFn: () =>
      emailTemplatesApi.sendTest(template.key, {
        to: testRecipient,
        data: template.sample,
      }),
    onSuccess: (res) => {
      toast.success(res?.message || 'Test email sent');
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.friendlyMessage ||
          'Failed to send test email',
      );
    },
  });

  useEffect(() => {
    if (!iframeRef.current || !previewQuery.data?.html) return;
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(previewQuery.data.html);
    doc.close();
  }, [previewQuery.data?.html, tab]);

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'size-10 rounded-xl grid place-items-center border',
              ACCENT_BADGE[template.accent] || ACCENT_BADGE.primary,
            )}
          >
            <Mail className="size-4" />
          </span>
          <div className="flex-1 min-w-0">
            <DialogTitle className="text-lg">{template.name}</DialogTitle>
            <DialogDescription className="text-xs">{template.description}</DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5">
        {/* Side panel */}
        <div className="space-y-4 lg:border-r lg:border-border/60 lg:pr-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Subject</p>
            <p className="text-sm font-medium">{previewQuery.data?.subject || '…'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Trigger</p>
            <p className="text-xs font-mono text-muted-foreground break-all">{template.trigger}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Sample data</p>
            <pre className="text-[11px] bg-muted/50 rounded-lg p-3 max-h-44 overflow-auto whitespace-pre-wrap break-words">
              {JSON.stringify(template.sample, null, 2)}
            </pre>
          </div>
          <div className="space-y-2">
            <Label htmlFor="test-recipient" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
              Send a test to
            </Label>
            <Input
              id="test-recipient"
              type="email"
              value={testRecipient}
              onChange={(e) => setTestRecipient(e.target.value)}
              placeholder="you@company.com"
            />
            <Button
              onClick={() => sendTest.mutate()}
              disabled={sendTest.isPending || !testRecipient}
              className="w-full gap-2"
              variant="gradient"
            >
              {sendTest.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : sendTest.isSuccess ? (
                <CheckCircle2 className="size-4" />
              ) : (
                <Send className="size-4" />
              )}
              {sendTest.isPending ? 'Sending…' : 'Send test email'}
            </Button>
            <p className="text-[11px] text-muted-foreground flex items-start gap-1.5">
              <ShieldCheck className="size-3 shrink-0 mt-0.5" />
              Only this email and the subject prefix will be marked as a test — the body stays identical to production.
            </p>
          </div>
        </div>

        {/* Preview */}
        <div className="min-w-0">
          <div className="flex items-center justify-between mb-3 gap-2">
            <div className="inline-flex rounded-lg border bg-muted/30 p-1 text-xs font-medium">
              {[
                { id: 'html', label: 'Rendered' },
                { id: 'text', label: 'Plain text' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setTab(opt.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-md transition-colors',
                    tab === opt.id ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <AnimatePresence mode="wait">
            {previewQuery.isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-xl border bg-muted/30 grid place-items-center h-[480px]"
              >
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Loader2 className="size-4 animate-spin" />
                  Rendering preview…
                </div>
              </motion.div>
            ) : tab === 'html' ? (
              <motion.div
                key="html"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-xl border bg-white overflow-hidden"
              >
                <iframe
                  ref={iframeRef}
                  title={`Preview of ${template.name}`}
                  className="w-full h-[520px] bg-white"
                  sandbox=""
                />
              </motion.div>
            ) : (
              <motion.pre
                key="text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-xl border bg-card p-5 text-xs font-mono leading-relaxed h-[520px] overflow-auto whitespace-pre-wrap break-words"
              >
                {previewQuery.data?.text || ''}
              </motion.pre>
            )}
          </AnimatePresence>
        </div>
      </div>

      <DialogFooter>
        <Button variant="ghost" onClick={onClose} className="gap-2">
          <ArrowLeft className="size-4" />
          Back to list
        </Button>
      </DialogFooter>
    </>
  );
}
