import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

/**
 * Get all notifications for the current user
 */
export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { limit = '50', offset = '0' } = req.query;

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    res.json({
      notifications,
      unreadCount,
      total: notifications.length,
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch notifications' });
  }
};

/**
 * Mark a single notification as read
 */
export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const notification = await prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });

    if (notification.count === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read' });
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: error.message || 'Failed to mark notification as read' });
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (error: any) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: error.message || 'Failed to mark all notifications as read' });
  }
};

/**
 * Delete a single notification
 */
export const deleteNotification = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const notification = await prisma.notification.deleteMany({
      where: { id, userId },
    });

    if (notification.count === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted' });
  } catch (error: any) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: error.message || 'Failed to delete notification' });
  }
};

/**
 * Clear all notifications for user
 */
export const clearAllNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    await prisma.notification.deleteMany({
      where: { userId },
    });

    res.json({ message: 'All notifications cleared' });
  } catch (error: any) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({ message: error.message || 'Failed to clear notifications' });
  }
};

/**
 * Create a notification (internal use or admin)
 */
export const createNotification = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, title, message, type = 'INFO', link } = req.body;

    if (!userId || !title || !message) {
      return res.status(400).json({ message: 'userId, title, and message are required' });
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        link,
      },
    });

    res.status(201).json({
      message: 'Notification created',
      notification,
    });
  } catch (error: any) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: error.message || 'Failed to create notification' });
  }
};

/**
 * Helper function to create notifications (used by other services).
 *
 * Side-effect: also fires a Web Push notification to every device the user
 * has subscribed (best-effort; never throws). This way an in-app event becomes
 * a phone notification automatically.
 */
export const createNotificationHelper = async (
  userId: string,
  title: string,
  message: string,
  type: string = 'INFO',
  link?: string
) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        link,
      },
    });

    // Fire-and-forget push. Avoid await so a slow push provider never blocks
    // the in-app notification (which is the source of truth).
    void (async () => {
      try {
        const { sendPushToUser } = await import('../services/push.service');
        await sendPushToUser(userId, {
          title,
          body: message,
          url: link,
          tag: `notif-${notification.id}`,
          data: { type, notificationId: notification.id },
        });
      } catch (err) {
        console.warn('[notification] push dispatch failed:', err);
      }
    })();

    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
};
