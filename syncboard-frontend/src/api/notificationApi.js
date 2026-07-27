import httpClient from './httpClient';

export const notificationApi = {
  /**
   * GET /api/notifications
   * Returns latest 20 notifications for the authenticated user
   */
  getNotifications: () =>
    httpClient.get('/notifications').then(r => r.data),

  /**
   * GET /api/notifications/unread-count
   */
  getUnreadCount: () =>
    httpClient.get('/notifications/unread-count').then(r => r.data.count),

  /**
   * PATCH /api/notifications/{id}/read
   */
  markAsRead: (id) =>
    httpClient.patch(`/notifications/${id}/read`),

  /**
   * POST /api/notifications/read-all
   */
  markAllAsRead: () =>
    httpClient.post('/notifications/read-all'),
};
