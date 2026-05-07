import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { toast } from 'sonner';
import {
  Sparkles,
  Upload,
  FileText,
  Plus,
  Trash2,
  Send,
  Eye,
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Quote,
  Undo2,
  Redo2,
  Search,
  X,
  CheckCircle2,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';

import { templatesApi } from '../../api/templates';
import { employeesApi } from '../../api/employees';
import { getInitials, cn } from '../../lib/utils';

const TEMPLATE_TYPES = [
  { value: 'OFFER_LETTER', label: 'Offer Letter' },
  { value: 'APPOINTMENT_LETTER', label: 'Appointment Letter' },
  { value: 'WARNING_LETTER', label: 'Warning Letter' },
  { value: 'TERMINATION_LETTER', label: 'Termination Letter' },
  { value: 'RELIEVING_LETTER', label: 'Relieving Letter' },
  { value: 'EXPERIENCE_LETTER', label: 'Experience Letter' },
  { value: 'INCREMENT_LETTER', label: 'Increment Letter' },
  { value: 'SALARY_SLIP', label: 'Salary Slip' },
  { value: 'ID_CARD', label: 'ID Card' },
  { value: 'ANNOUNCEMENT', label: 'Announcement' },
  { value: 'CUSTOM', label: 'Custom' },
];

const QUICK_TAGS = [
  '{{employee.fullName}}',
  '{{employee.firstName}}',
  '{{employee.employeeId}}',
  '{{employee.email}}',
  '{{employee.designation}}',
  '{{employee.department}}',
  '{{employee.salary}}',
  '{{employee.joiningDate}}',
  '{{company.name}}',
  '{{company.address}}',
  '{{date.today}}',
];

const STARTER_HTML = `
<h1>Offer of Employment</h1>
<p><strong>Date:</strong> {{date.today}}</p>
<p>Dear {{employee.fullName}},</p>
<p>We are pleased to offer you the position of <strong>{{employee.designation}}</strong> at <strong>{{company.name}}</strong>, with an annual CTC of <strong>{{employee.salary}}</strong>.</p>
<p>Your tentative joining date is <strong>{{employee.joiningDate}}</strong>.</p>
<p>We look forward to a long and successful association.</p>
<br/>
<p>Warm regards,<br/>HR Team<br/>{{company.name}}</p>
`;

export default function TemplateStudio() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [editing, setEditing] = useState(null); // { id?, name, type, htmlBody, ... }
  const [sendingTpl, setSendingTpl] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['templates', { filter, search }],
    queryFn: () =>
      templatesApi.list({
        type: filter !== 'all' ? filter : undefined,
        q: search || undefined,
      }),
  });
  const templates = data?.templates || [];

  const removeMut = useMutation({
    mutationFn: (id) => templatesApi.remove(id),
    onSuccess: () => {
      toast.success('Template removed');
      qc.invalidateQueries({ queryKey: ['templates'] });
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to remove'),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Badge variant="gradient" className="mb-2">
            <Sparkles className="size-3" />
            Template Studio
          </Badge>
          <h1 className="font-display text-3xl font-bold">Documents, on autopilot.</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            Upload your existing letters or pick a built-in template. Drag merge tags, preview with
            real employee data, and send by email — all in one place.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditing({ name: '', type: 'CUSTOM', htmlBody: STARTER_HTML, isUpload: false })}>
            <Plus className="size-4" />
            Blank template
          </Button>
          <UploadButton onParsed={(payload) => setEditing({ ...payload, type: 'CUSTOM' })} />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search templates…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList className="overflow-x-auto no-scrollbar">
            <TabsTrigger value="all">All</TabsTrigger>
            {TEMPLATE_TYPES.slice(0, 6).map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label.split(' ')[0]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Library */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <EmptyLibrary onCreate={() => setEditing({ name: '', type: 'CUSTOM', htmlBody: STARTER_HTML })} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              onEdit={() => setEditing(t)}
              onSend={() => setSendingTpl(t)}
              onDelete={() => {
                if (window.confirm('Remove this template?')) removeMut.mutate(t.id);
              }}
            />
          ))}
        </div>
      )}

      {/* Editor dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0 sm:rounded-2xl">
          {editing && (
            <TemplateEditor
              initial={editing}
              onClose={() => setEditing(null)}
              onSaved={() => {
                qc.invalidateQueries({ queryKey: ['templates'] });
                setEditing(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Send dialog */}
      <Dialog open={!!sendingTpl} onOpenChange={(o) => !o && setSendingTpl(null)}>
        <DialogContent className="max-w-2xl">
          {sendingTpl && (
            <SendDialogBody template={sendingTpl} onClose={() => setSendingTpl(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ----- Card -----

function TemplateCard({ template, onEdit, onSend, onDelete }) {
  return (
    <motion.div whileHover={{ y: -3 }} className="group relative">
      <Card className="overflow-hidden h-full hover:border-primary/50 transition-colors">
        <div className="relative h-32 bg-gradient-to-br from-primary/15 via-accent/10 to-card overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant={template.source === 'BUILT_IN' ? 'secondary' : 'gradient'}>
              {template.source === 'BUILT_IN' ? 'Built-in' : 'Custom'}
            </Badge>
          </div>
          <FileText className="absolute right-4 bottom-4 size-12 text-primary/50" />
        </div>
        <CardContent className="p-4 space-y-3">
          <div>
            <p className="font-semibold truncate">{template.name}</p>
            <p className="text-xs text-muted-foreground">
              {TEMPLATE_TYPES.find((t) => t.value === template.type)?.label || template.type}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onEdit} className="flex-1">
              <Eye className="size-3.5" />
              Edit
            </Button>
            <Button variant="gradient" size="sm" onClick={onSend} className="flex-1">
              <Send className="size-3.5" />
              Send
            </Button>
            {template.source !== 'BUILT_IN' && (
              <Button variant="ghost" size="icon" onClick={onDelete} className="text-destructive">
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function EmptyLibrary({ onCreate }) {
  return (
    <Card className="border-dashed">
      <CardContent className="py-16 text-center">
        <div className="size-14 mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent grid place-items-center text-white mb-4 shadow-glow">
          <Sparkles className="size-6" />
        </div>
        <h3 className="font-display text-xl font-semibold">Your template library is empty</h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
          Create your first template — start from a blank canvas, or upload an existing
          .docx or HTML file. Use <code className="text-primary">{'{{employee.fullName}}'}</code> style merge tags.
        </p>
        <div className="mt-6 flex gap-2 justify-center">
          <Button variant="gradient" onClick={onCreate}>
            <Plus className="size-4" />
            Start blank
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ----- Upload button (dropzone) -----

function UploadButton({ onParsed }) {
  const upload = useMutation({
    mutationFn: (file) => templatesApi.upload(file),
    onSuccess: (data) => {
      toast.success(`Imported "${data.name}" — ${data.mergeTags?.length || 0} merge tags detected`);
      onParsed({ name: data.name, htmlBody: data.htmlBody });
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to parse upload'),
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/html': ['.html', '.htm'],
      'text/plain': ['.txt'],
    },
    onDrop: (files) => files[0] && upload.mutate(files[0]),
  });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      <Button variant="gradient" loading={upload.isPending}>
        <Upload className="size-4" />
        {isDragActive ? 'Drop to upload' : 'Upload template'}
      </Button>
    </div>
  );
}

// ----- Editor (Tiptap + merge tags) -----

function TemplateEditor({ initial, onClose, onSaved }) {
  const [name, setName] = useState(initial.name || '');
  const [type, setType] = useState(initial.type || 'CUSTOM');
  const [emailSubject, setEmailSubject] = useState(initial.emailSubject || '');
  const [emailIntro, setEmailIntro] = useState(initial.emailIntro || '');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({}),
      Placeholder.configure({ placeholder: 'Type your letter, or paste HTML…' }),
    ],
    content: initial.htmlBody || '<p></p>',
    editorProps: {
      attributes: {
        class:
          'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[300px] p-4',
      },
    },
  });

  const saveMut = useMutation({
    mutationFn: async () => {
      const payload = {
        name: name.trim(),
        type,
        htmlBody: editor.getHTML(),
        emailSubject: emailSubject || undefined,
        emailIntro: emailIntro || undefined,
      };
      if (initial.id) return templatesApi.update(initial.id, payload);
      return templatesApi.create(payload);
    },
    onSuccess: () => {
      toast.success('Template saved');
      onSaved?.();
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to save'),
  });

  const insertTag = (tag) => {
    if (!editor) return;
    editor.chain().focus().insertContent(tag).run();
  };

  return (
    <div className="flex flex-col max-h-[90vh]">
      <DialogHeader className="px-6 pt-6">
        <DialogTitle className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          {initial.id ? 'Edit template' : 'New template'}
        </DialogTitle>
        <DialogDescription>
          Use <code className="text-primary">{'{{path.to.field}}'}</code> for dynamic content.
        </DialogDescription>
      </DialogHeader>

      <div className="grid md:grid-cols-[1fr_240px] gap-4 p-6 pb-2 overflow-hidden">
        {/* Editor pane */}
        <div className="space-y-3 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Template name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Senior Engineer Offer Letter" />
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TEMPLATE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Default email subject</Label>
              <Input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} placeholder="e.g. Your offer from Acme" />
            </div>
            <div className="space-y-1.5">
              <Label>Default email intro</Label>
              <Input value={emailIntro} onChange={(e) => setEmailIntro(e.target.value)} placeholder="e.g. Pleased to share your offer." />
            </div>
          </div>

          <Toolbar editor={editor} />
          <div className="rounded-lg border bg-background overflow-hidden">
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* Merge tags pane */}
        <aside className="space-y-3 overflow-y-auto">
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Merge tags</Label>
            <p className="text-xs text-muted-foreground mb-2">Click to insert at cursor</p>
            <div className="flex flex-col gap-1.5">
              {QUICK_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => insertTag(tag)}
                  className="text-left rounded-md border border-border px-2.5 py-1.5 text-xs font-mono hover:bg-primary/10 hover:border-primary/40 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground mb-1">Tips</p>
            <ul className="space-y-1 list-disc pl-4">
              <li>Use <code>{'{{date.today}}'}</code> for the send date.</li>
              <li>Bold/italic, lists and headings render in email.</li>
              <li>Preview with a real employee before sending.</li>
            </ul>
          </div>
        </aside>
      </div>

      <DialogFooter className="border-t px-6 py-4 mt-auto">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button
          variant="gradient"
          loading={saveMut.isPending}
          onClick={() => {
            if (!name.trim()) return toast.error('Name is required');
            saveMut.mutate();
          }}
        >
          <CheckCircle2 className="size-4" />
          Save template
        </Button>
      </DialogFooter>
    </div>
  );
}

function Toolbar({ editor }) {
  if (!editor) return null;
  const btn = (active, on, icon, label) => (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); on(); }}
      title={label}
      className={cn(
        'size-8 grid place-items-center rounded-md text-muted-foreground hover:bg-muted',
        active && 'bg-primary/15 text-primary'
      )}
    >
      {icon}
    </button>
  );
  return (
    <div className="flex flex-wrap gap-1 rounded-lg border bg-card p-1">
      {btn(editor.isActive('bold'), () => editor.chain().focus().toggleBold().run(), <Bold className="size-4" />, 'Bold')}
      {btn(editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run(), <Italic className="size-4" />, 'Italic')}
      <span className="w-px bg-border mx-1" />
      {btn(editor.isActive('heading', { level: 1 }), () => editor.chain().focus().toggleHeading({ level: 1 }).run(), <Heading1 className="size-4" />, 'H1')}
      {btn(editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), <Heading2 className="size-4" />, 'H2')}
      <span className="w-px bg-border mx-1" />
      {btn(editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run(), <List className="size-4" />, 'Bullet list')}
      {btn(editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), <ListOrdered className="size-4" />, 'Numbered list')}
      {btn(editor.isActive('blockquote'), () => editor.chain().focus().toggleBlockquote().run(), <Quote className="size-4" />, 'Quote')}
      <span className="w-px bg-border mx-1" />
      {btn(false, () => editor.chain().focus().undo().run(), <Undo2 className="size-4" />, 'Undo')}
      {btn(false, () => editor.chain().focus().redo().run(), <Redo2 className="size-4" />, 'Redo')}
    </div>
  );
}

// ----- Send Dialog -----

function SendDialogBody({ template, onClose }) {
  const qc = useQueryClient();
  const [emailSubject, setEmailSubject] = useState(template.emailSubject || `${template.name} from GrandHR`);
  const [emailMessage, setEmailMessage] = useState(template.emailIntro || 'Hi, please find your document below.');
  const [selected, setSelected] = useState(new Set());
  const [search, setSearch] = useState('');
  const [previewHtml, setPreviewHtml] = useState(null);

  const { data: empData, isLoading } = useQuery({
    queryKey: ['employees', 'send-list', { search }],
    queryFn: () => employeesApi.list({ search, limit: 50 }),
  });
  const employees = empData?.employees || [];

  const previewMut = useMutation({
    mutationFn: (employeeId) => templatesApi.preview(template.id, { employeeId }),
    onSuccess: (data) => setPreviewHtml(data.html),
    onError: (e) => toast.error(e?.response?.data?.message || 'Preview failed'),
  });

  const sendMut = useMutation({
    mutationFn: () =>
      templatesApi.send(template.id, {
        employeeIds: Array.from(selected),
        emailSubject,
        emailMessage,
      }),
    onSuccess: (data) => {
      toast.success(`Sent to ${data.sent} ${data.sent === 1 ? 'employee' : 'employees'}${data.failed ? `, ${data.failed} failed` : ''}`);
      qc.invalidateQueries({ queryKey: ['notifications'] });
      onClose();
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Send failed'),
  });

  const toggle = (id) =>
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Send className="size-4 text-primary" />
          Send "{template.name}"
        </DialogTitle>
        <DialogDescription>
          Pick recipients, customize the email, and send. Each employee gets a personalised copy.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
        <div className="space-y-2">
          <Label>Email subject</Label>
          <Input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Email intro</Label>
          <Textarea rows={3} value={emailMessage} onChange={(e) => setEmailMessage(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Recipients ({selected.size} selected)</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employees…" className="pl-10" />
          </div>
          <div className="rounded-lg border max-h-64 overflow-y-auto divide-y">
            {isLoading ? (
              <div className="p-3 space-y-2">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 rounded" />)}
              </div>
            ) : employees.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground text-center">No employees found</p>
            ) : (
              employees.map((e) => {
                const fullName = `${e.firstName ?? ''} ${e.lastName ?? ''}`.trim();
                const isSel = selected.has(e.id);
                return (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => toggle(e.id)}
                    className={cn(
                      'w-full flex items-center gap-3 p-2.5 hover:bg-muted/40 text-left transition-colors',
                      isSel && 'bg-primary/10'
                    )}
                  >
                    <Checkbox checked={isSel} onCheckedChange={() => toggle(e.id)} />
                    <div className="size-8 rounded-full bg-gradient-to-br from-primary to-accent grid place-items-center text-white text-xs font-bold">
                      {getInitials(fullName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{fullName}</p>
                      <p className="text-xs text-muted-foreground truncate">{e.user?.email} · {e.employeeId}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={(ev) => { ev.stopPropagation(); previewMut.mutate(e.id); }}
                      title="Preview with this employee's data"
                    >
                      <Eye className="size-4" />
                    </Button>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <AnimatePresence>
          {previewHtml && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="relative rounded-lg border overflow-hidden"
            >
              <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/40">
                <p className="text-xs font-semibold uppercase tracking-wider">Preview</p>
                <button onClick={() => setPreviewHtml(null)} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
              </div>
              <div
                className="prose prose-sm dark:prose-invert max-w-none p-4 max-h-64 overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <DialogFooter className="pt-4">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button
          variant="gradient"
          loading={sendMut.isPending}
          disabled={selected.size === 0}
          onClick={() => sendMut.mutate()}
        >
          <Send className="size-4" />
          Send to {selected.size || 0}
        </Button>
      </DialogFooter>
    </>
  );
}
