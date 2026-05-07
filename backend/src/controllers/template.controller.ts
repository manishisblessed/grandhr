import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import mammoth from 'mammoth';
import Handlebars from 'handlebars';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendDocumentEmail } from '../utils/email.util';
import { uploadFile } from '../services/cloudinary.service';

const prisma = new PrismaClient();

// ----- Helpers -----

const TAG_REGEX = /\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g;

function detectMergeTags(html: string): string[] {
  const tags = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = TAG_REGEX.exec(html))) tags.add(m[1]);
  return Array.from(tags);
}

async function getCompanyIdForUser(userId?: string): Promise<string | null> {
  if (!userId) return null;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user?.companyId ?? null;
}

async function buildEmployeeMergeData(employeeId: string) {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: { user: true, company: true, department: true, designation: true },
  });
  if (!employee) return null;
  return {
    employee: {
      id: employee.id,
      employeeId: employee.employeeId,
      firstName: employee.firstName,
      lastName: employee.lastName,
      fullName: `${employee.firstName} ${employee.lastName}`.trim(),
      email: employee.user?.email || employee.email,
      phone: employee.phone,
      address: employee.address,
      city: employee.city,
      state: employee.state,
      country: employee.country,
      designation: employee.designation?.name || '—',
      department: employee.department?.name || '—',
      salary: employee.salary,
      joiningDate: employee.joiningDate?.toISOString().slice(0, 10),
      employmentStatus: employee.employmentStatus,
    },
    company: {
      id: employee.company?.id,
      name: employee.company?.name || 'GrandHR',
      legalName: employee.company?.legalName,
      address: employee.company?.address,
      city: employee.company?.city,
      website: employee.company?.website,
      logo: employee.company?.logo,
    },
    date: {
      today: new Date().toISOString().slice(0, 10),
      year: String(new Date().getFullYear()),
    },
  };
}

function renderHandlebars(html: string, data: Record<string, any>): string {
  try {
    const tpl = Handlebars.compile(html, { noEscape: true });
    return tpl(data);
  } catch (e) {
    // Fallback: simple replace
    return html.replace(TAG_REGEX, (_, k: string) => {
      const path = k.split('.');
      let v: any = data;
      for (const seg of path) v = v?.[seg];
      return v == null ? '' : String(v);
    });
  }
}

// ----- Schemas -----

const createSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  description: z.string().optional(),
  htmlBody: z.string().min(1),
  thumbnail: z.string().optional(),
  emailSubject: z.string().optional(),
  emailIntro: z.string().optional(),
  isDefault: z.boolean().optional(),
});

const updateSchema = createSchema.partial();

const sendSchema = z.object({
  employeeIds: z.array(z.string()).min(1),
  emailSubject: z.string().optional(),
  emailMessage: z.string().optional(),
  attachAsPdf: z.boolean().optional(),
  extraData: z.record(z.any()).optional(),
});

const previewSchema = z.object({
  employeeId: z.string().optional(),
  data: z.record(z.any()).optional(),
});

// ----- Controllers -----

export const listTemplates = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = await getCompanyIdForUser(req.userId);
    const { type, source, q } = req.query as Record<string, string>;
    const where: any = { isActive: true };
    if (companyId) where.OR = [{ companyId }, { companyId: null }];
    if (type) where.type = type;
    if (source) where.source = source;
    if (q) where.name = { contains: q, mode: 'insensitive' };
    const templates = await prisma.documentTemplate.findMany({
      where,
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    res.json({ templates });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to list templates' });
  }
};

export const getTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const t = await prisma.documentTemplate.findUnique({ where: { id: req.params.id } });
    if (!t) return res.status(404).json({ message: 'Template not found' });
    res.json({ template: t });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch template' });
  }
};

export const createTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const data = createSchema.parse(req.body);
    const companyId = await getCompanyIdForUser(req.userId);
    const detected = detectMergeTags(data.htmlBody);
    const created = await prisma.documentTemplate.create({
      data: {
        ...data,
        companyId,
        source: 'CUSTOM',
        mergeTags: detected,
        createdBy: req.userId,
      },
    });
    res.status(201).json({ template: created });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: error.message || 'Failed to create template' });
  }
};

export const updateTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const data = updateSchema.parse(req.body);
    const patch: any = { ...data };
    if (data.htmlBody) patch.mergeTags = detectMergeTags(data.htmlBody);
    const updated = await prisma.documentTemplate.update({
      where: { id: req.params.id },
      data: patch,
    });
    res.json({ template: updated });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: error.message || 'Failed to update template' });
  }
};

export const deleteTemplate = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.documentTemplate.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to delete template' });
  }
};

/**
 * Upload .docx, .html, or .txt and convert to HTML for editing.
 * Multer puts the file on req.file (memoryStorage). Returns parsed html + detected tags.
 */
export const uploadTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    const name = file.originalname || 'Untitled template';
    const ext = name.split('.').pop()?.toLowerCase();
    let html = '';

    if (ext === 'docx') {
      const result = await mammoth.convertToHtml({ buffer: file.buffer });
      html = result.value || '';
    } else if (ext === 'html' || ext === 'htm') {
      html = file.buffer.toString('utf-8');
    } else if (ext === 'txt') {
      html = `<p>${file.buffer.toString('utf-8').replace(/\n/g, '</p><p>')}</p>`;
    } else {
      return res.status(400).json({
        message: 'Unsupported format. Upload .docx, .html, or .txt for now.',
      });
    }

    const mergeTags = detectMergeTags(html);
    res.json({
      name: name.replace(/\.[^.]+$/, ''),
      htmlBody: html,
      mergeTags,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to parse upload' });
  }
};

/**
 * Render a template against a real employee or arbitrary data. Returns the
 * rendered HTML so the frontend can preview before sending.
 */
export const previewTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const { employeeId, data } = previewSchema.parse(req.body);
    const t = await prisma.documentTemplate.findUnique({ where: { id: req.params.id } });
    if (!t) return res.status(404).json({ message: 'Template not found' });

    let mergeData = data || {};
    if (employeeId) {
      const built = await buildEmployeeMergeData(employeeId);
      if (built) mergeData = { ...built, ...(data || {}) };
    }
    const rendered = renderHandlebars(t.htmlBody, mergeData);
    res.json({ html: rendered, data: mergeData });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: error.message || 'Failed to render preview' });
  }
};

/**
 * Render the template for each selected employee, save a GeneratedDocument,
 * and email it. Returns per-recipient delivery report.
 */
export const sendTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const payload = sendSchema.parse(req.body);
    const t = await prisma.documentTemplate.findUnique({ where: { id: req.params.id } });
    if (!t) return res.status(404).json({ message: 'Template not found' });

    const companyId = await getCompanyIdForUser(req.userId);
    const userId = req.userId!;
    const subject = payload.emailSubject || t.emailSubject || `${t.name} from GrandHR`;
    const intro = payload.emailMessage || t.emailIntro || 'Please find your document attached below.';

    const results: Array<{ employeeId: string; ok: boolean; error?: string; documentId?: string }> = [];

    for (const employeeId of payload.employeeIds) {
      try {
        const built = await buildEmployeeMergeData(employeeId);
        if (!built) {
          results.push({ employeeId, ok: false, error: 'Employee not found' });
          continue;
        }
        const data = { ...built, ...(payload.extraData || {}) };
        const rendered = renderHandlebars(t.htmlBody, data);

        const html = `
          <!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#1f2937;background:#f8fafc;padding:24px;">
            <div style="max-width:760px;margin:0 auto;background:white;padding:48px;border-radius:12px;box-shadow:0 6px 24px rgba(0,0,0,0.06);">
              <p style="margin:0 0 24px;color:#475569;">${intro}</p>
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
              <div>${rendered}</div>
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0 16px;" />
              <p style="font-size:12px;color:#94a3b8;margin:0;">Sent via GrandHR · ${data.company?.name || ''}</p>
            </div>
          </body></html>
        `;

        const sendResult = await sendDocumentEmail(
          (built.employee as any).email || '',
          subject,
          html,
          undefined,
          `${t.name}.html`
        );

        const created = await prisma.generatedDocument.create({
          data: {
            employeeId,
            userId,
            companyId,
            documentType: t.type,
            title: `${t.name} – ${(built.employee as any).fullName}`,
            content: rendered,
            metadata: {
              templateId: t.id,
              sentTo: (built.employee as any).email,
              emailSent: sendResult.success,
              emailError: sendResult.success ? undefined : sendResult.error,
              mergeData: data,
            } as any,
          },
        });

        // Notify the employee in-app
        if ((built.employee as any).email) {
          const emp = await prisma.employee.findUnique({ where: { id: employeeId }, select: { userId: true } });
          if (emp?.userId) {
            await prisma.notification.create({
              data: {
                userId: emp.userId,
                title: `New document: ${t.name}`,
                message: 'A new document is available in your portal.',
                type: 'INFO',
                link: '/employee/documents',
              },
            }).catch(() => {});
          }
        }

        results.push({ employeeId, ok: sendResult.success, error: sendResult.success ? undefined : sendResult.error, documentId: created.id });
      } catch (err: any) {
        results.push({ employeeId, ok: false, error: err.message });
      }
    }

    res.json({
      success: results.every((r) => r.ok),
      sent: results.filter((r) => r.ok).length,
      failed: results.filter((r) => !r.ok).length,
      results,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: error.message || 'Failed to send template' });
  }
};
