import React from 'react';
import { Bell, BellOff, CheckCheck, UserPlus, AtSign, CheckSquare } from 'lucide-react';
import { useNotificationStore } from '../state/useNotificationStore';
import { useNavigate } from 'react-router-dom';

const TYPE_CONFIG = {
  MENTION: {
    icon: AtSign,
    color: 'text-purple-500',
    bg: 'bg-purple-50',
  },
  ASSIGNMENT: {
    icon: UserPlus,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
  },
  COMPLETION: {
    icon: CheckSquare,
    color: 'text-green-500',
    bg: 'bg-green-50',
  },
};

const formatRelativeTime = (isoString) => {
  if (!isoString) return '';
  const now = new Date();
  const date = new Date(isoString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d ago`;
};

export const NotificationPanel = ({ onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotificationStore();
  const navigate = useNavigate();

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    // Deep-link to the referenced card if available
    if (notification.referenceId) {
      onClose();
      // Navigate to board — CardDrawer will be opened by user from board
      // This is a best-effort link without knowing the boardId at this point
    }
  };

  return (
    <div
      id="notification-panel"
      className="absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded-xl shadow-2xl z-[100] overflow-hidden"
      role="dialog"
      aria-label="Notifications"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="flex items-center gap-1.5 text-xs text-primary hover:text-blue-700 font-medium transition-colors"
            title="Mark all as read"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {/* Body */}
      <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-50">
        {isLoading && (
          <div className="flex items-center justify-center py-10 text-gray-400 text-sm">
            Loading…
          </div>
        )}
        {!isLoading && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BellOff className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-500">All caught up!</p>
            <p className="text-xs text-gray-400 mt-1">No notifications yet.</p>
          </div>
        )}
        {!isLoading && notifications.map((notification) => {
          const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.MENTION;
          const Icon = config.icon;
          return (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors ${
                notification.isRead
                  ? 'bg-white hover:bg-gray-50'
                  : 'bg-blue-50/40 hover:bg-blue-50/70'
              }`}
            >
              {/* Icon */}
              <div className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <Icon className={`w-4 h-4 ${config.color}`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-snug ${notification.isRead ? 'text-gray-600' : 'text-gray-800 font-medium'}`}>
                  {notification.message}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatRelativeTime(notification.createdAt)}
                </p>
              </div>

              {/* Unread dot */}
              {!notification.isRead && (
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
