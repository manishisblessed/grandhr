import webpush from 'web-push';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

let configured = false;

const ensureConfigured = () => {
  if (configured) return true;
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:noreply@grandhr.in';
  if (!publicKey || !privateKey) {
    console.warn('[push] VAPID keys not configured — web push disabled.');
    return false;
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  return true;
};

export const getPublicVapidKey = (): string | null => process.env.VAPID_PUBLIC_KEY || null;

export type PushPayload = {
  title: string;
  body?: string;
  message?: string;
  url?: string;
  link?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  data?: Record<string, unknown>;
};

/**
 * Dispatch a push notification to every subscribed device for a given user.
 * Subscriptions that fail with a 404/410 are pruned automatically (the
 * browser has revoked them). All errors are logged but never thrown.
 */
export const sendPushToUser = async (userId: string, payload: PushPayload): Promise<{ sent: number; pruned: number }> => {
  if (!ensureConfigured()) return { sent: 0, pruned: 0 };

  const subscriptions = await prisma.pushSubscription.findMany({ where: { userId } });
  if (subscriptions.length === 0) return { sent: 0, pruned: 0 };

  const json = JSON.stringify(payload);
  let sent = 0;
  let pruned = 0;
  const expiredIds: string[] = [];

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          json,
          { TTL: 60 * 60 * 24 },
        );
        sent += 1;
      } catch (err: any) {
        const status = err?.statusCode;
        if (status === 404 || status === 410) {
          expiredIds.push(sub.id);
          pruned += 1;
        } else {
          console.warn('[push] send failed:', err?.message || err);
        }
      }
    }),
  );

  if (expiredIds.length > 0) {
    await prisma.pushSubscription.deleteMany({ where: { id: { in: expiredIds } } }).catch(() => {});
  }

  // Best-effort lastUsedAt bump so we know which subscriptions are alive.
  if (sent > 0) {
    await prisma.pushSubscription
      .updateMany({
        where: {
          userId,
          NOT: { id: { in: expiredIds.length ? expiredIds : ['__none__'] } },
        },
        data: { lastUsedAt: new Date() },
      })
      .catch(() => {});
  }

  return { sent, pruned };
};
