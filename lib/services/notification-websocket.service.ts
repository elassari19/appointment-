import { chatWebSocketHandler } from './chat-websocket.service';
import { Notification } from '@/lib/entities/Notification';

export interface RealTimeNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

export class NotificationWebSocketService {
  sendRealTimeNotification(userId: string, notification: Notification): void {
    const realTimeNotification: RealTimeNotification = {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      read: notification.read,
      createdAt: notification.createdAt,
      metadata: notification.metadata,
    };

    chatWebSocketHandler.broadcastToUser(userId, 'notification', realTimeNotification);
  }

  broadcastToAdmins(notification: Notification): void {
    chatWebSocketHandler.broadcastToUser('admin', 'notification', {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      read: notification.read,
      createdAt: notification.createdAt,
      metadata: notification.metadata,
    });
  }
}

export const notificationWebSocketService = new NotificationWebSocketService();
