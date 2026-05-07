import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendRenderedEmail } from '../utils/email.util';
import { EMAIL_TEMPLATES, findEmailTemplate } from '../utils/email-templates';

const prisma = new PrismaClient();

/**
 * GET /api/email-templates
 * Returns metadata about every transactional email GrandHR sends, so the
 * Email Studio page in the HR portal can render a catalogue + previews.
 */
export const listEmailTemplates = async (_req: AuthRequest, res: Response) => {
  res.json({
    templates: EMAIL_TEMPLATES.map((t) => ({
      key: t.key,
      name: t.name,
      description: t.description,
      trigger: t.trigger,
      accent: t.accent,
      sample: t.sample,
    })),
  });
};

/**
 * POST /api/email-templates/:key/preview
 * Renders a template with the provided sample data (or the registry default)
 * and returns the subject, branded HTML, and plain-text fallback.
 */
export const previewEmailTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const { key } = req.params;
    const template = findEmailTemplate(key);
    if (!template) {
      return res.status(404).json({ message: `Unknown email template: ${key}` });
    }
    const data = req.body && Object.keys(req.body).length > 0 ? { ...template.sample, ...req.body } : template.sample;
    const rendered = template.render(data);
    res.json({
      key,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      sample: data,
    });
  } catch (error: any) {
    res.status(500).json({ message: error?.message || 'Failed to preview email' });
  }
};

/**
 * POST /api/email-templates/:key/test
 * Sends a rendered preview of the template to the requesting HR user (or to
 * a specific email passed in the body).
 */
export const sendTestEmailTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const { key } = req.params;
    const template = findEmailTemplate(key);
    if (!template) {
      return res.status(404).json({ message: `Unknown email template: ${key}` });
    }

    let to: string | undefined = (req.body && req.body.to) as string | undefined;
    if (!to) {
      const user = await prisma.user.findUnique({ where: { id: req.userId! } });
      to = user?.email;
    }
    if (!to) {
      return res.status(400).json({ message: 'No recipient email provided' });
    }

    const data = req.body && req.body.data ? { ...template.sample, ...req.body.data } : template.sample;
    const rendered = template.render(data);

    const result = await sendRenderedEmail(to, {
      ...rendered,
      subject: `[Test] ${rendered.subject}`,
    });

    if (!result.success) {
      return res.status(500).json({
        message: 'Could not send test email',
        error: result.error,
      });
    }

    res.json({
      message: `Test email sent to ${to}`,
      messageId: result.messageId,
      to,
    });
  } catch (error: any) {
    res.status(500).json({ message: error?.message || 'Failed to send test email' });
  }
};
