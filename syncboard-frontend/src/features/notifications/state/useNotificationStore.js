import { create } from 'zustand';
import { notificationApi } from '../../../api/notificationApi';
import { wsService } from '../../../api/websocketService';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const data = await notificationApi.getNotifications();
      const unread = data.filter(n => !n.isRead).length;
      set({ notifications: data, unreadCount: unread, isLoading: false });
    } catch (err) {
      console.error('[Notifications] Failed to fetch:', err);
      set({ isLoading: false });
    }
  },

  markAsRead: async (id) => {
    try {
      await notificationApi.markAsRead(id);
      set((state) => ({
        notifications: state.notifications.map(n =>
          n.id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (err) {
      console.error('[Notifications] Failed to mark as read:', err);
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationApi.markAllAsRead();
      set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch (err) {
      console.error('[Notifications] Failed to mark all as read:', err);
    }
  },

  /**
   * Subscribe to the personal notification queue via STOMP.
   * Must be called AFTER wsService.connect() has completed.
   * Safe to call multiple times — wsService deduplicates subscriptions by topic.
   */
  initNotificationSync: () => {
    wsService.subscribe('/user/queue/notifications', (notification) => {
      set((state) => ({
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      }));
    });
  },
}));
