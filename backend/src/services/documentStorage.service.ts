import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface SaveDocumentParams {
  userId: string;
  employeeId?: string;
  companyId?: string;
  documentType: string; // OFFER_LETTER, APPOINTMENT_LETTER, SALARY_SLIP, etc.
  title: string;
  content: string; // HTML or text content
  pdfData?: string; // Base64 encoded PDF or file URL
  metadata?: Record<string, any>; // Document-specific data
}

/**
 * Document Storage Service
 * Saves all generated documents to database for record keeping
 */
export class DocumentStorageService {
  /**
   * Save a generated document to database
   */
  static async saveDocument(params: SaveDocumentParams) {
    try {
      const document = await prisma.generatedDocument.create({
        data: {
          userId: params.userId,
          employeeId: params.employeeId || null,
          companyId: params.companyId || null,
          documentType: params.documentType,
          title: params.title,
          content: params.content,
          pdfData: params.pdfData || null,
          metadata: params.metadata || {},
        },
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeId: true,
            },
          },
        },
      });

      return document;
    } catch (error: any) {
      console.error('Error saving document:', error);
      throw new Error(`Failed to save document: ${error.message}`);
    }
  }

  /**
   * Get all documents for a user
   */
  static async getUserDocuments(
    userId: string,
    options?: {
      documentType?: string;
      employeeId?: string;
      page?: number;
      limit?: number;
    }
  ) {
    try {
      const page = options?.page || 1;
      const limit = options?.limit || 20;
      const skip = (page - 1) * limit;

      const where: any = { userId };
      if (options?.documentType) where.documentType = options.documentType;
      if (options?.employeeId) where.employeeId = options.employeeId;

      const [documents, total] = await Promise.all([
        prisma.generatedDocument.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                employeeId: true,
              },
            },
          },
        }),
        prisma.generatedDocument.count({ where }),
      ]);

      return {
        documents,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      throw new Error(`Failed to fetch documents: ${error.message}`);
    }
  }

  /**
   * Get a specific document by ID
   */
  static async getDocument(documentId: string, userId: string) {
    try {
      const document = await prisma.generatedDocument.findFirst({
        where: {
          id: documentId,
          userId, // Ensure user can only access their own documents
        },
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeId: true,
            },
          },
        },
      });

      if (!document) {
        throw new Error('Document not found');
      }

      return document;
    } catch (error: any) {
      console.error('Error fetching document:', error);
      throw new Error(`Failed to fetch document: ${error.message}`);
    }
  }

  /**
   * Delete a document
   */
  static async deleteDocument(documentId: string, userId: string) {
    try {
      const document = await prisma.generatedDocument.findFirst({
        where: {
          id: documentId,
          userId,
        },
      });

      if (!document) {
        throw new Error('Document not found or access denied');
      }

      await prisma.generatedDocument.delete({
        where: { id: documentId },
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error deleting document:', error);
      throw new Error(`Failed to delete document: ${error.message}`);
    }
  }

  /**
   * Get document statistics for a user
   */
  static async getDocumentStats(userId: string, companyId?: string) {
    try {
      const where: any = { userId };
      if (companyId) where.companyId = companyId;

      const [total, byType] = await Promise.all([
        prisma.generatedDocument.count({ where }),
        prisma.generatedDocument.groupBy({
          by: ['documentType'],
          where,
          _count: true,
        }),
      ]);

      return {
        total,
        byType: byType.reduce((acc, item) => {
          acc[item.documentType] = item._count;
          return acc;
        }, {} as Record<string, number>),
      };
    } catch (error: any) {
      console.error('Error fetching document stats:', error);
      throw new Error(`Failed to fetch document stats: ${error.message}`);
    }
  }
}

