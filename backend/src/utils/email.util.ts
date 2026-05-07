import nodemailer from 'nodemailer';
import {
  RenderedEmail,
  renderDocumentSentEmail,
  renderEmailShell,
  renderWelcomeEmail,
  WelcomeData,
} from './email-templates';

/**
 * Email Utility — every transactional email leaves through here.
 * Built on top of `email-templates/` for a single branded look.
 *
 * Made by Shah Works · www.shahworks.com
 */

/** All transactional/confirmation emails use this sender. Set EMAIL_FROM in .env to override. */
export const NOREPLY_FROM = process.env.EMAIL_FROM || 'noreply@grandhr.in';
const FROM_HEADER = `GrandHR <${NOREPLY_FROM}>`;

export type EmailSendResult =
  | { success: true; messageId: string }
  | { success: false; error: string };

const isSmtpConfigured = (): { ok: boolean; reason?: string } => {
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASSWORD;
  if (!user?.trim() || !pass?.trim()) {
    return {
      ok: false,
      reason:
        'Email service is not configured on the server. Set SMTP_USER and SMTP_PASS (or EMAIL_USER and EMAIL_PASSWORD) in the backend environment.',
    };
  }
  return { ok: true };
};

// Gmail App Passwords are often shown with spaces; strip them before passing
// to nodemailer to avoid auth surprises.
const createTransporter = () => {
  const rawPass = process.env.SMTP_PASS || process.env.EMAIL_PASSWORD || '';
  const cleanedPass = rawPass.replace(/\s+/g, '');
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_USER,
      pass: cleanedPass,
    },
  });
};

type CoreSendOptions = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: nodemailer.SendMailOptions['attachments'];
  replyTo?: string;
};

const coreSend = async ({ to, subject, html, text, attachments, replyTo }: CoreSendOptions): Promise<EmailSendResult> => {
  const cfg = isSmtpConfigured();
  if (!cfg.ok) {
    return { success: false, error: cfg.reason || 'Email not configured' };
  }
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: FROM_HEADER,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
      attachments: attachments && attachments.length ? attachments : undefined,
      replyTo,
    });
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('[email.util] Failed to send email:', error?.message || error);
    return { success: false, error: error?.message || 'Failed to send email' };
  }
};

/**
 * Send a fully-rendered email (subject + html + text). Recommended for callers
 * that have already produced a `RenderedEmail` from `email-templates`.
 */
export const sendRenderedEmail = async (
  to: string,
  rendered: RenderedEmail,
  opts?: { attachments?: nodemailer.SendMailOptions['attachments']; replyTo?: string },
): Promise<EmailSendResult> =>
  coreSend({
    to,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    attachments: opts?.attachments,
    replyTo: opts?.replyTo,
  });

/**
 * Generic email sender. If you pass plain HTML, it's wrapped in the branded
 * shell automatically so older callers still get consistent styling.
 *
 * - If `subject` and `html` look like a complete document (start with <!DOCTYPE
 *   or <html), they're sent as-is for back-compat.
 * - Otherwise, the HTML is treated as a single message body and rendered
 *   inside the shell with the subject as the heading.
 */
export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  text?: string,
): Promise<EmailSendResult> => {
  const trimmed = (html || '').trim().toLowerCase();
  const isFullDocument = trimmed.startsWith('<!doctype') || trimmed.startsWith('<html');
  if (isFullDocument) {
    return coreSend({ to, subject, html, text });
  }
  // Wrap a snippet in the branded shell so any legacy caller still looks
  // on-brand. Callers that already build a fully-styled doc skip this path.
  const wrapped = renderEmailShell({
    title: subject,
    intro: html,
    accent: 'primary',
  });
  return coreSend({ to, subject, html: wrapped.html, text: text || wrapped.text });
};

export const sendEmployeeWelcomeEmail = async (
  employeeEmail: string,
  employeeName: string,
  password: string,
  employeeId: string,
  companyName?: string,
): Promise<EmailSendResult> => {
  const data: WelcomeData = { employeeEmail, employeeName, password, employeeId, companyName };
  const rendered = renderWelcomeEmail(data);
  return sendRenderedEmail(employeeEmail, rendered);
};

/**
 * Send a document (e.g. offer letter) to an employee. The provided HTML body
 * is the document content itself; we wrap it in the branded shell. If the
 * caller passes a fully-styled HTML document, it is sent unchanged.
 */
export const sendDocumentEmail = async (
  to: string,
  subject: string,
  html: string,
  pdfBase64?: string,
  attachmentFilename: string = 'document.pdf',
): Promise<EmailSendResult> => {
  const cfg = isSmtpConfigured();
  if (!cfg.ok) return { success: false, error: cfg.reason! };

  const attachments: nodemailer.SendMailOptions['attachments'] = [];
  if (pdfBase64) {
    attachments.push({
      filename: attachmentFilename,
      content: Buffer.from(pdfBase64, 'base64'),
    });
  }

  const trimmed = (html || '').trim().toLowerCase();
  const isFullDocument = trimmed.startsWith('<!doctype') || trimmed.startsWith('<html');
  if (isFullDocument) {
    return coreSend({ to, subject, html, attachments });
  }

  const rendered = renderDocumentSentEmail({
    employeeName: 'there',
    documentName: subject,
    documentBody: html,
    hasAttachment: attachments.length > 0,
    attachmentLabel: attachments.length > 0 ? attachmentFilename : undefined,
  });
  return coreSend({
    to,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    attachments,
  });
};
