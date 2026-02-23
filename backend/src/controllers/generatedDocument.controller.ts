import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { DocumentStorageService } from '../services/documentStorage.service';
import { sendDocumentEmail } from '../utils/email.util';
import { z } from 'zod';

const saveDocumentSchema = z.object({
  employeeId: z.string().optional(),
  documentType: z.string(),
  title: z.string().min(1),
  content: z.string(),
  pdfData: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

/**
 * Save a generated document
 */
export const saveDocument = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const companyId = req.companyId;
    const data = saveDocumentSchema.parse(req.body);

    const document = await DocumentStorageService.saveDocument({
      userId,
      employeeId: data.employeeId,
      companyId: companyId || undefined,
      documentType: data.documentType,
      title: data.title,
      content: data.content,
      pdfData: data.pdfData,
      metadata: data.metadata,
    });

    res.status(201).json({
      message: 'Document saved successfully',
      document,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors,
      });
    }
    res.status(500).json({
      message: error.message || 'Failed to save document',
    });
  }
};

/**
 * Get user's documents
 */
export const getMyDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { documentType, employeeId, page, limit } = req.query;

    const result = await DocumentStorageService.getUserDocuments(userId, {
      documentType: documentType as string,
      employeeId: employeeId as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      message: error.message || 'Failed to fetch documents',
    });
  }
};

/**
 * Get a specific document
 */
export const getDocument = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const document = await DocumentStorageService.getDocument(id, userId);

    res.json({ document });
  } catch (error: any) {
    res.status(404).json({
      message: error.message || 'Document not found',
    });
  }
};

/**
 * Delete a document
 */
export const deleteDocument = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    await DocumentStorageService.deleteDocument(id, userId);

    res.json({ message: 'Document deleted successfully' });
  } catch (error: any) {
    res.status(404).json({
      message: error.message || 'Failed to delete document',
    });
  }
};

/**
 * Get document statistics
 */
export const getDocumentStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const companyId = req.companyId;

    const stats = await DocumentStorageService.getDocumentStats(userId, companyId || undefined);

    res.json({ stats });
  } catch (error: any) {
    res.status(500).json({
      message: error.message || 'Failed to fetch document stats',
    });
  }
};

const sendDocumentToEmailSchema = z.object({
  toEmail: z.string().email('Valid recipient email required'),
  subject: z.string().min(1, 'Subject required'),
  htmlContent: z.string().min(1, 'Email content required'),
  pdfBase64: z.string().optional(),
  attachmentFilename: z.string().optional(),
});

/**
 * Send a document (e.g. offer letter) to a candidate's email from noreply@grandhr.in
 */
export const sendDocumentToEmail = async (req: AuthRequest, res: Response) => {
  try {
    const data = sendDocumentToEmailSchema.parse(req.body);

    const result = await sendDocumentEmail(
      data.toEmail,
      data.subject,
      data.htmlContent,
      data.pdfBase64,
      data.attachmentFilename || 'offer-letter.pdf'
    );

    if (!result.success) {
      return res.status(500).json({
        message: result.error || 'Failed to send email',
      });
    }

    res.json({
      message: 'Email sent successfully to ' + data.toEmail,
      success: true,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors,
      });
    }
    res.status(500).json({
      message: error.message || 'Failed to send email',
    });
  }
};

