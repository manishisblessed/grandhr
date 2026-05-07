import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware';
import { getPublicVapidKey, sendPushToUser } from '../services/push.service';

const prisma = new PrismaClient();

/**
 * GET /api/push/public-key
 * Returns the VAPID public key the browser needs to subscribe.
 */
export const getPushPublicKey = async (_req: AuthRequest, res: Response) => {
  const key = getPublicVapidKey();
  if (!key) {
    return res.status(503).json({ message: 'Push notifications are not configured on this server.' });
  }
  res.json({ publicKey: key });
};

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
  userAgent: z.string().optional(),
});

/**
 * POST /api/push/subscribe
 * Persists the browser-issued PushSubscription so we can target this device
 * later. Idempotent — re-subscribing with the same endpoint just refreshes
 * keys + lastUsedAt.
 */
export const subscribePush = async (req: AuthRequest, res: Response) => {
  try {
    const data = subscribeSchema.parse(req.body);

    const sub = await prisma.pushSubscription.upsert({
      where: { endpoint: data.endpoint },
      update: {
        userId: req.userId!,
        p256dh: data.keys.p256dh,
        auth: data.keys.auth,
        userAgent: data.userAgent,
        lastUsedAt: new Date(),
      },
      create: {
        userId: req.userId!,
        endpoint: data.endpoint,
        p256dh: data.keys.p256dh,
        auth: data.keys.auth,
        userAgent: data.userAgent,
      },
    });

    res.status(201).json({ message: 'Subscribed to push notifications.', id: sub.id });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid subscription payload', errors: error.errors });
    }
    res.status(500).json({ message: error?.message || 'Failed to save subscription' });
  }
};

/**
 * POST /api/push/unsubscribe
 * Removes a single subscription by endpoint (the browser tells us which one).
 */
export const unsubscribePush = async (req: AuthRequest, res: Response) => {
  try {
    const endpoint: string | undefined = req.body?.endpoint;
    if (!endpoint) return res.status(400).json({ message: 'endpoint is required' });

    await prisma.pushSubscription.deleteMany({
      where: { endpoint, userId: req.userId! },
    });
    res.json({ message: 'Unsubscribed from push notifications.' });
  } catch (error: any) {
    res.status(500).json({ message: error?.message || 'Failed to unsubscribe' });
  }
};

/**
 * GET /api/push/status
 * Returns how many devices the current user has subscribed.
 */
export const getPushStatus = async (req: AuthRequest, res: Response) => {
  const count = await prisma.pushSubscription.count({ where: { userId: req.userId! } });
  res.json({ subscriptions: count, configured: !!getPublicVapidKey() });
};

/**
 * POST /api/push/test
 * Send a sample push to the current user (handy from the Notification settings UI).
 */
export const sendTestPush = async (req: AuthRequest, res: Response) => {
  const result = await sendPushToUser(req.userId!, {
    title: 'GrandHR notifications are live',
    body: 'You will now get a push for leave decisions, payslips and announcements.',
    url: '/employee/notifications',
    tag: 'grandhr-test',
  });
  if (result.sent === 0) {
    return res.status(400).json({
      message:
        'Could not reach any of your devices. Please subscribe again from this device, or check that notifications are allowed in your browser.',
    });
  }
  res.json({ message: `Test push sent to ${result.sent} device${result.sent === 1 ? '' : 's'}.`, ...result });
};
