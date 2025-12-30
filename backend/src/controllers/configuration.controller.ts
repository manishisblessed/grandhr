import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { z } from 'zod';

const prisma = new PrismaClient();

const createConfigSchema = z.object({
  key: z.string().min(1),
  value: z.any(),
  category: z.string().min(1),
  description: z.string().optional(),
});

// Get all configurations
export const getConfigurations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { category } = req.query;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const configs = await prisma.configuration.findMany({
      where: {
        companyId: user.companyId || undefined,
        ...(category && { category: category as string }),
        isActive: true,
      },
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });

    res.json({ configurations: configs });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch configurations' });
  }
};

// Get single configuration
export const getConfiguration = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { key } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const config = user.companyId
      ? await prisma.configuration.findUnique({
          where: {
            companyId_key: {
              companyId: user.companyId,
              key,
            },
          },
        })
      : await prisma.configuration.findFirst({
          where: {
            companyId: null,
            key,
          },
        });

    if (!config) {
      return res.status(404).json({ message: 'Configuration not found' });
    }

    res.json({ configuration: config });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch configuration' });
  }
};

// Create or update configuration
export const upsertConfiguration = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const data = createConfigSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    if (!user || !['ADMIN', 'HR'].includes(user.role)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const whereClause = user.companyId
      ? {
          companyId_key: {
            companyId: user.companyId,
            key: data.key,
          },
        }
      : {
          companyId_key: {
            companyId: null as any,
            key: data.key,
          },
        };

    const config = await prisma.configuration.upsert({
      where: whereClause as any,
      update: {
        value: data.value,
        category: data.category,
        description: data.description,
      },
      create: {
        companyId: user.companyId || undefined,
        key: data.key,
        value: data.value,
        category: data.category,
        description: data.description,
      },
    });

    res.json({ message: 'Configuration saved', configuration: config });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: error.message || 'Failed to save configuration' });
  }
};

// Delete configuration
export const deleteConfiguration = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { key } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    if (!user || !['ADMIN', 'HR'].includes(user.role)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (user.companyId) {
      await prisma.configuration.delete({
        where: {
          companyId_key: {
            companyId: user.companyId,
            key,
          },
        },
      });
    } else {
      const config = await prisma.configuration.findFirst({
        where: {
          companyId: null,
          key,
        },
      });
      if (config) {
        await prisma.configuration.delete({
          where: { id: config.id },
        });
      }
    }

    res.json({ message: 'Configuration deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to delete configuration' });
  }
};

