/**
 * Registry of every transactional email GrandHR sends.
 *
 * Each template has typed input data + a renderer that produces a subject,
 * branded HTML body, and a plain-text fallback. They all funnel through the
 * shared `renderEmailShell` so we get a single visual identity everywhere.
 *
 * The registry is also exposed via `/api/email/templates` so HR can preview
 * (and send a test of) each email from the new "Email Studio" page.
 */

import {
  EmailSection,
  emailEscape,
  renderEmailShell,
} from './shell';

const FRONTEND = (process.env.FRONTEND_URL || 'https://grandhr.in').replace(/\/$/, '');

export type RenderedEmail = {
  subject: string;
  html: string;
  text: string;
};

// ----------------- Welcome / credentials -----------------

export type WelcomeData = {
  employeeName: string;
  employeeEmail: string;
  password: string;
  employeeId: string;
  companyName?: string;
};

export const renderWelcomeEmail = (data: WelcomeData): RenderedEmail => {
  const sections: EmailSection[] = [
    {
      type: 'kv',
      items: [
        { label: 'Login email', value: data.employeeEmail },
        { label: 'Temporary password', value: data.password },
        { label: 'Employee ID', value: data.employeeId },
      ],
    },
    {
      type: 'note',
      html: `For security, please change your password the first time you sign in. Your temporary password is shown only in this email.`,
    },
  ];
  const { html, text } = renderEmailShell({
    title: `Welcome to ${data.companyName || 'GrandHR'}, ${data.employeeName.split(' ')[0]}!`,
    badge: 'Account ready',
    greeting: `Hi ${data.employeeName},`,
    intro: `Your GrandHR account has been set up. Use the credentials below to sign in and explore your employee portal — ID card, payslips, leaves and more.`,
    sections,
    buttons: [
      { label: 'Sign in to GrandHR', url: `${FRONTEND}/login` },
      { label: 'Visit help center', url: `${FRONTEND}/help-center`, variant: 'secondary' },
    ],
    accent: 'primary',
    preheader: `Welcome aboard! Your GrandHR login is ${data.employeeEmail}.`,
  });
  return {
    subject: `Welcome to ${data.companyName || 'GrandHR'} — your account is ready`,
    html,
    text,
  };
};

// ----------------- Leave decision -----------------

export type LeaveDecisionData = {
  employeeName: string;
  approverName: string;
  status: 'APPROVED' | 'REJECTED';
  leaveTypeLabel: string;
  startDate: string | Date;
  endDate: string | Date;
  days: number;
  reason?: string;
};

const fmtDate = (d: string | Date) =>
  new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

export const renderLeaveDecisionEmail = (data: LeaveDecisionData): RenderedEmail => {
  const approved = data.status === 'APPROVED';
  const sections: EmailSection[] = [
    {
      type: 'kv',
      items: [
        { label: 'Leave type', value: data.leaveTypeLabel },
        { label: 'Duration', value: `${fmtDate(data.startDate)} – ${fmtDate(data.endDate)}` },
        { label: 'Days', value: `${data.days} day${data.days === 1 ? '' : 's'}` },
        { label: 'Decided by', value: data.approverName },
        { label: 'Status', value: approved ? 'Approved' : 'Rejected' },
      ],
    },
  ];
  if (!approved && data.reason) {
    sections.push({
      type: 'callout',
      tone: 'danger',
      html: `<strong>Reason from HR:</strong> ${emailEscape(data.reason)}`,
    });
  }
  if (approved) {
    sections.push({
      type: 'callout',
      tone: 'success',
      html: `Enjoy your time off! Your manager and HR have been notified. Need to make a change? You can cancel an upcoming leave from your portal.`,
    });
  } else {
    sections.push({
      type: 'paragraph',
      html: `If you have questions about this decision, please reach out to your HR department.`,
    });
  }

  const { html, text } = renderEmailShell({
    title: approved ? 'Your leave has been approved' : 'Your leave was not approved',
    badge: approved ? 'Approved' : 'Update from HR',
    greeting: `Hi ${data.employeeName},`,
    intro: approved
      ? `Good news — ${data.approverName} has approved your leave request.`
      : `Your leave request has been reviewed by ${data.approverName}.`,
    sections,
    buttons: [{ label: 'Open my leave history', url: `${FRONTEND}/employee/leaves` }],
    accent: approved ? 'success' : 'danger',
    preheader: approved ? `Your ${data.leaveTypeLabel} is approved.` : `Your ${data.leaveTypeLabel} was not approved.`,
  });
  return {
    subject: approved
      ? `Leave approved · ${fmtDate(data.startDate)} – ${fmtDate(data.endDate)}`
      : `Leave update · ${data.leaveTypeLabel}`,
    html,
    text,
  };
};

// ----------------- Payslip ready -----------------

export type PayslipReadyData = {
  employeeName: string;
  monthLabel: string;
  netSalary: number;
  baseSalary: number;
  allowances: number;
  deductions: number;
  tax: number;
  currency?: string;
};

const formatMoney = (n: number, currency = 'INR') => {
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);
  } catch {
    return `₹${Math.round(n).toLocaleString('en-IN')}`;
  }
};

export const renderPayslipReadyEmail = (data: PayslipReadyData): RenderedEmail => {
  const c = data.currency || 'INR';
  const sections: EmailSection[] = [
    {
      type: 'kv',
      items: [
        { label: 'Pay period', value: data.monthLabel },
        { label: 'Base salary', value: formatMoney(data.baseSalary, c) },
        { label: 'Allowances', value: formatMoney(data.allowances, c) },
        { label: 'Deductions', value: formatMoney(data.deductions, c) },
        { label: 'Tax', value: formatMoney(data.tax, c) },
      ],
    },
    {
      type: 'callout',
      tone: 'success',
      html: `<strong>Net pay this period:</strong> <span style="font-size:18px;font-weight:700;">${formatMoney(data.netSalary, c)}</span>`,
    },
    {
      type: 'paragraph',
      html: `Tap the button below to download a copy of your payslip as PDF, or visit the salary section in your portal anytime.`,
    },
  ];

  const { html, text } = renderEmailShell({
    title: `Your ${data.monthLabel} payslip is ready`,
    badge: 'Payslip available',
    greeting: `Hi ${data.employeeName},`,
    intro: `We've published your payslip for ${data.monthLabel}. Here's a quick summary:`,
    sections,
    buttons: [{ label: 'View & download payslip', url: `${FRONTEND}/employee/salary` }],
    accent: 'primary',
    preheader: `Your ${data.monthLabel} payslip is now available in your GrandHR portal.`,
  });
  return {
    subject: `Payslip ready — ${data.monthLabel}`,
    html,
    text,
  };
};

// ----------------- Document sent (offer/appointment/etc.) -----------------

export type DocumentSentData = {
  employeeName: string;
  documentName: string;
  documentBody?: string;
  hasAttachment?: boolean;
  attachmentLabel?: string;
};

export const renderDocumentSentEmail = (data: DocumentSentData): RenderedEmail => {
  const sections: EmailSection[] = [];
  if (data.documentBody) {
    sections.push({ type: 'paragraph', html: data.documentBody });
  } else {
    sections.push({
      type: 'paragraph',
      html: `Please find your document attached. A copy is also available in your GrandHR portal under <em>My Documents</em>.`,
    });
  }
  if (data.hasAttachment) {
    sections.push({
      type: 'callout',
      tone: 'primary',
      html: `<strong>Attachment:</strong> ${emailEscape(data.attachmentLabel || `${data.documentName}.pdf`)} is attached to this email.`,
    });
  }

  const { html, text } = renderEmailShell({
    title: data.documentName,
    badge: 'New document',
    greeting: `Hi ${data.employeeName},`,
    intro: `Your HR team has shared a new document with you.`,
    sections,
    buttons: [{ label: 'Open my documents', url: `${FRONTEND}/employee/documents` }],
    accent: 'primary',
    preheader: `${data.documentName} is now available in your GrandHR portal.`,
  });
  return {
    subject: data.documentName,
    html,
    text,
  };
};

// ----------------- Password reset -----------------

export type PasswordResetData = {
  userName: string;
  resetLink: string;
  expiryLabel?: string;
};

export const renderPasswordResetEmail = (data: PasswordResetData): RenderedEmail => {
  const { html, text } = renderEmailShell({
    title: 'Reset your GrandHR password',
    badge: 'Security',
    greeting: `Hi ${data.userName},`,
    intro: `We received a request to reset your GrandHR password. Click the button below to choose a new one.`,
    sections: [
      {
        type: 'note',
        html: `This link expires in <strong>${emailEscape(data.expiryLabel || '1 hour')}</strong>. If you didn't request a reset, you can safely ignore this email.`,
      },
      {
        type: 'paragraph',
        html: `If the button doesn't work, paste this link into your browser:<br><a href="${emailEscape(
          data.resetLink,
        )}" style="color:#6366f1;word-break:break-all;">${emailEscape(data.resetLink)}</a>`,
      },
    ],
    buttons: [{ label: 'Reset my password', url: data.resetLink }],
    accent: 'primary',
    preheader: 'A password reset was requested for your GrandHR account.',
  });
  return { subject: 'Reset your GrandHR password', html, text };
};

// ----------------- Password changed confirmation -----------------

export type PasswordChangedData = {
  userName: string;
  supportEmail?: string;
  supportPhone?: string;
};

export const renderPasswordChangedEmail = (data: PasswordChangedData): RenderedEmail => {
  const { html, text } = renderEmailShell({
    title: 'Your password was changed',
    badge: 'Security',
    greeting: `Hi ${data.userName},`,
    intro: `This is just a quick confirmation that your GrandHR password was changed successfully.`,
    sections: [
      {
        type: 'callout',
        tone: 'danger',
        html: `<strong>Didn't authorise this?</strong> Contact us immediately at <a href="mailto:${emailEscape(
          data.supportEmail || 'support@grandhr.in',
        )}" style="color:#dc2626;">${emailEscape(
          data.supportEmail || 'support@grandhr.in',
        )}</a>${data.supportPhone ? ` or call <strong>${emailEscape(data.supportPhone)}</strong>` : ''}.`,
      },
    ],
    buttons: [{ label: 'Sign in', url: `${FRONTEND}/login`, variant: 'secondary' }],
    accent: 'success',
    preheader: 'Your GrandHR password has been updated.',
  });
  return { subject: 'Your GrandHR password was changed', html, text };
};

// ----------------- Account details (forgot username) -----------------

export type AccountDetailsData = {
  userName: string;
  email: string;
  employeeId?: string;
  role: string;
};

export const renderAccountDetailsEmail = (data: AccountDetailsData): RenderedEmail => {
  const items = [{ label: 'Login email', value: data.email }];
  if (data.employeeId) items.push({ label: 'Employee ID', value: data.employeeId });
  items.push({ label: 'Account role', value: data.role.replace(/_/g, ' ') });

  const { html, text } = renderEmailShell({
    title: 'Your GrandHR account details',
    badge: 'Recovery',
    greeting: `Hi ${data.userName},`,
    intro: `Here are the details on file for your GrandHR account.`,
    sections: [{ type: 'kv', items }],
    buttons: [{ label: 'Go to sign-in', url: `${FRONTEND}/login` }],
    accent: 'neutral',
    preheader: 'Recovering your GrandHR username',
  });
  return { subject: 'Your GrandHR account details', html, text };
};

// ----------------- Generic in-app notification mirror -----------------

export type GenericNotificationData = {
  recipientName: string;
  title: string;
  message: string;
  ctaLabel?: string;
  ctaUrl?: string;
  tone?: 'primary' | 'success' | 'warning' | 'danger';
};

export const renderGenericNotificationEmail = (data: GenericNotificationData): RenderedEmail => {
  const { html, text } = renderEmailShell({
    title: data.title,
    badge: 'GrandHR',
    greeting: `Hi ${data.recipientName},`,
    intro: data.message,
    buttons: data.ctaUrl && data.ctaLabel ? [{ label: data.ctaLabel, url: data.ctaUrl }] : undefined,
    accent: data.tone || 'primary',
    preheader: data.message.slice(0, 120),
  });
  return { subject: data.title, html, text };
};

// ----------------- Registry (used by the Email Studio page) -----------------

export type EmailTemplateMeta = {
  key: string;
  name: string;
  description: string;
  trigger: string;
  accent: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
  render: (data: any) => RenderedEmail;
  sample: any;
};

export const EMAIL_TEMPLATES: EmailTemplateMeta[] = [
  {
    key: 'welcome',
    name: 'Welcome & credentials',
    description: 'Sent automatically when HR adds a new employee. Includes the temporary password and a link to sign in.',
    trigger: 'POST /api/employees · POST /api/employees/:id/resend-credentials',
    accent: 'primary',
    render: renderWelcomeEmail,
    sample: {
      employeeName: 'Aanya Sharma',
      employeeEmail: 'aanya@acme.co',
      password: 'Welc0me-Hr!42',
      employeeId: 'EMP-1042',
      companyName: 'Acme Corp',
    } as WelcomeData,
  },
  {
    key: 'leave-approved',
    name: 'Leave approved',
    description: 'Sent to the employee when HR approves their leave request.',
    trigger: 'PUT /api/leaves/:id/status (status = APPROVED)',
    accent: 'success',
    render: (d) => renderLeaveDecisionEmail({ ...d, status: 'APPROVED' } as LeaveDecisionData),
    sample: {
      employeeName: 'Rohan Mehta',
      approverName: 'Priya Verma · HR',
      leaveTypeLabel: 'Casual leave',
      startDate: new Date(Date.now() + 86400000 * 7).toISOString(),
      endDate: new Date(Date.now() + 86400000 * 9).toISOString(),
      days: 3,
    } as Omit<LeaveDecisionData, 'status'>,
  },
  {
    key: 'leave-rejected',
    name: 'Leave rejected',
    description: 'Sent when HR rejects a leave request, including the rejection reason.',
    trigger: 'PUT /api/leaves/:id/status (status = REJECTED)',
    accent: 'danger',
    render: (d) => renderLeaveDecisionEmail({ ...d, status: 'REJECTED' } as LeaveDecisionData),
    sample: {
      employeeName: 'Rohan Mehta',
      approverName: 'Priya Verma · HR',
      leaveTypeLabel: 'Casual leave',
      startDate: new Date(Date.now() + 86400000 * 7).toISOString(),
      endDate: new Date(Date.now() + 86400000 * 9).toISOString(),
      days: 3,
      reason: 'Critical project milestone in that week — please reschedule.',
    } as Omit<LeaveDecisionData, 'status'>,
  },
  {
    key: 'payslip-ready',
    name: 'Payslip ready',
    description: 'Sent to each employee when their monthly payslip is finalised (status set to PAID).',
    trigger: 'PUT /api/payroll/:id (status transitions to PAID)',
    accent: 'primary',
    render: renderPayslipReadyEmail,
    sample: {
      employeeName: 'Rohan Mehta',
      monthLabel: 'November 2025',
      baseSalary: 90000,
      allowances: 12500,
      deductions: 4500,
      tax: 9000,
      netSalary: 89000,
    } as PayslipReadyData,
  },
  {
    key: 'document-sent',
    name: 'Document sent',
    description: 'Sent when HR shares a document (offer letter, appointment letter, warning letter, etc.) with an employee.',
    trigger: 'POST /api/templates/:id/send · POST /api/generated-documents',
    accent: 'primary',
    render: renderDocumentSentEmail,
    sample: {
      employeeName: 'Aanya Sharma',
      documentName: 'Offer letter',
      hasAttachment: true,
      attachmentLabel: 'offer-letter.pdf',
    } as DocumentSentData,
  },
  {
    key: 'password-reset',
    name: 'Password reset link',
    description: 'Sent when a user requests a password reset from the sign-in screen.',
    trigger: 'POST /api/auth/forgot-password',
    accent: 'primary',
    render: renderPasswordResetEmail,
    sample: {
      userName: 'Aanya',
      resetLink: `${FRONTEND}/reset-password?token=preview-token`,
      expiryLabel: '1 hour',
    } as PasswordResetData,
  },
  {
    key: 'password-changed',
    name: 'Password changed',
    description: 'Confirmation email sent immediately after a successful password change.',
    trigger: 'POST /api/auth/reset-password',
    accent: 'success',
    render: renderPasswordChangedEmail,
    sample: {
      userName: 'Aanya',
      supportEmail: 'support@grandhr.in',
      supportPhone: '+91-9090702705',
    } as PasswordChangedData,
  },
  {
    key: 'account-details',
    name: 'Account details (forgot username)',
    description: 'Sent when a user requests their account details from the "Forgot username" flow.',
    trigger: 'POST /api/auth/forgot-username',
    accent: 'neutral',
    render: renderAccountDetailsEmail,
    sample: {
      userName: 'Aanya Sharma',
      email: 'aanya@acme.co',
      employeeId: 'EMP-1042',
      role: 'HR',
    } as AccountDetailsData,
  },
  {
    key: 'generic-notification',
    name: 'Generic notification',
    description: 'Used by automations and broadcast HR messages where there is no dedicated template.',
    trigger: 'Internal (notification mirror, broadcast)',
    accent: 'primary',
    render: renderGenericNotificationEmail,
    sample: {
      recipientName: 'Aanya Sharma',
      title: 'Public holiday: Republic Day',
      message: 'Friendly reminder that the office will be closed on January 26 for Republic Day. Have a great long weekend!',
      ctaLabel: 'Open dashboard',
      ctaUrl: `${FRONTEND}/employee/dashboard`,
    } as GenericNotificationData,
  },
];

export const findEmailTemplate = (key: string): EmailTemplateMeta | undefined =>
  EMAIL_TEMPLATES.find((t) => t.key === key);
