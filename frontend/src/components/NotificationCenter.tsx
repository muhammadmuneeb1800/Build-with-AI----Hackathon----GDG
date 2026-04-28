// src/components/NotificationCenter.tsx

import React from 'react';
import type { Notification } from '../types/types';

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkRead: (notificationId: string) => void;
  onDelete: (notificationId: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkRead,
  onDelete,
}) => {
  const getIcon = (type: string) => {
    const icons: Record<string, string> = { success: '✓', error: '✕', warning: '⚠', info: 'ⓘ' };
    return icons[type] || '•';
  };

  const getColorClass = (type: string) => {
    const colors: Record<string, string> = {
      success: 'bg-green-100 border-green-500 text-green-900',
      error: 'bg-red-100 border-red-500 text-red-900',
      warning: 'bg-yellow-100 border-yellow-500 text-yellow-900',
      info: 'bg-blue-100 border-blue-500 text-blue-900',
    };
    return colors[type] || 'bg-gray-100 border-gray-500 text-gray-900';
  };

  return (
    <div className="space-y-2">
      {notifications.length === 0 ? (
        <div className="text-center text-gray-500 py-4">No notifications yet</div>
      ) : (
        notifications.map((n) => (
          <div key={n.id} className={`border-l-4 p-4 rounded ${getColorClass(n.type)} ${n.is_read ? 'opacity-75' : ''}`}>
            <div className="flex justify-between">
              <div className="flex space-x-3">
                <span className="font-bold">{getIcon(n.type)}</span>
                <div>
                  <h3 className="font-semibold text-sm">{n.title}</h3>
                  <p className="text-sm">{n.message}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                {!n.is_read && <button onClick={() => onMarkRead(n.id)} className="text-xs hover:underline">Mark Read</button>}
                <button onClick={() => onDelete(n.id)} className="text-xs hover:underline">Delete</button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};