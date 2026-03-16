import { create } from 'zustand';
import { NotificationService } from '../services/notification.service';
import { Notification } from '../types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;

  fetch: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  remove: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetch: async () => {
    set({ isLoading: true });
    try {
      const res = await NotificationService.getAll();
      const notifications = res.data as Notification[];
      set({
        notifications,
        unreadCount: notifications.filter((n) => !n.isRead).length,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  markAsRead: async (id) => {
    try {
      await NotificationService.markAsRead(id);
      set((s) => ({
        notifications: s.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n,
        ),
        unreadCount: Math.max(0, s.unreadCount - 1),
      }));
    } catch {}
  },

  markAllAsRead: async () => {
    try {
      await NotificationService.markAllAsRead();
      set((s) => ({
        notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch {}
  },

  remove: async (id) => {
    try {
      await NotificationService.delete(id);
      set((s) => {
        const removed = s.notifications.find((n) => n.id === id);
        return {
          notifications: s.notifications.filter((n) => n.id !== id),
          unreadCount:
            removed && !removed.isRead
              ? Math.max(0, s.unreadCount - 1)
              : s.unreadCount,
        };
      });
    } catch {}
  },

  clearAll: async () => {
    try {
      await NotificationService.clearAll();
      set({ notifications: [], unreadCount: 0 });
    } catch {}
  },
}));
