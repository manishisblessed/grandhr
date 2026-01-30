import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { z } from 'zod';

const prisma = new PrismaClient();

const createTicketSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(['TECHNICAL', 'BILLING', 'FEATURE_REQUEST', 'BUG', 'OTHER']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
});

const replyTicketSchema = z.object({
  message: z.string().min(1),
  isInternal: z.boolean().optional(),
});

// Get all support tickets
export const getTickets = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isAdmin = ['ADMIN', 'HR'].includes(user.role);
    
    const tickets = await prisma.supportTicket.findMany({
      where: {
        ...(isAdmin
          ? { companyId: user.companyId || undefined }
          : { userId }),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            employee: {
              select: {
                firstName: true,
                lastName: true,
                employeeId: true,
              },
            },
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                employee: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ tickets });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch tickets' });
  }
};

// Create support ticket
export const createTicket = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const data = createTicketSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        companyId: user.companyId || undefined,
        userId,
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority || 'MEDIUM',
      },
      include: {
        user: {
          select: {
            email: true,
            employee: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    // Notify admins
    const admins = await prisma.user.findMany({
      where: {
        role: { in: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR'] },
        companyId: user.companyId || undefined,
      },
    });

    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: 'New Support Ticket',
          message: `New ticket created: ${data.title}`,
          type: 'INFO',
          link: `/hr/support/${ticket.id}`,
        },
      });
    }

    res.status(201).json({ message: 'Ticket created successfully', ticket });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: error.message || 'Failed to create ticket' });
  }
};

// Get single ticket
export const getTicket = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            employee: {
              select: {
                firstName: true,
                lastName: true,
                employeeId: true,
              },
            },
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                employee: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check access
    const isAdmin = ['ADMIN', 'HR'].includes(user.role);
    if (!isAdmin && ticket.userId !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json({ ticket });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch ticket' });
  }
};

// Reply to ticket
export const replyTicket = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const data = replyTicketSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check access
    const isAdmin = ['ADMIN', 'HR'].includes(user.role);
    if (!isAdmin && ticket.userId !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const reply = await prisma.ticketReply.create({
      data: {
        ticketId: id,
        userId,
        message: data.message,
        isInternal: data.isInternal || false,
      },
      include: {
        user: {
          select: {
            email: true,
            employee: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    // Update ticket status if admin replied
    if (isAdmin && ticket.status === 'OPEN') {
      await prisma.supportTicket.update({
        where: { id },
        data: { status: 'IN_PROGRESS' },
      });
    }

    // Notify ticket creator (if not internal reply)
    if (!data.isInternal && ticket.userId !== userId) {
      await prisma.notification.create({
        data: {
          userId: ticket.userId,
          title: 'Ticket Reply',
          message: `Your ticket "${ticket.title}" has a new reply.`,
          type: 'INFO',
          link: `/hr/support/${id}`,
        },
      });
    }

    res.status(201).json({ message: 'Reply added successfully', reply });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: error.message || 'Failed to add reply' });
  }
};

// Update ticket status
export const updateTicketStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { status, resolution } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !['ADMIN', 'HR'].includes(user.role)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const updateData: any = { status };
    if (status === 'RESOLVED' && resolution) {
      updateData.resolution = resolution;
      updateData.resolvedAt = new Date();
    }

    const ticket = await prisma.supportTicket.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            email: true,
            employee: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    // Notify ticket creator
    if (status === 'RESOLVED') {
      await prisma.notification.create({
        data: {
          userId: ticket.userId,
          title: 'Ticket Resolved',
          message: `Your ticket "${ticket.title}" has been resolved.`,
          type: 'SUCCESS',
          link: `/hr/support/${id}`,
        },
      });
    }

    res.json({ message: 'Ticket updated', ticket });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update ticket' });
  }
};

