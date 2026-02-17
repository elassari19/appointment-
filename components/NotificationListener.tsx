'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';
import { X } from 'lucide-react';

interface RealTimeNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

interface ToastNotification {
  id: string;
  title: string;
  message: string;
}

export function NotificationListener() {
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    const newSocket = io(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', {
      auth: {
        token: 'notification-token',
        userId: user.id,
        role: user.role,
        name: `${user.firstName} ${user.lastName}`,
      },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Notification listener connected');
    });

    newSocket.on('notification', (notification: RealTimeNotification) => {
      console.log('Received notification:', notification);
      
      const newToast: ToastNotification = {
        id: notification.id,
        title: notification.title,
        message: notification.message,
      };

      setToasts(prev => [...prev, newToast]);

      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== notification.id));
      }, 5000);
    });

    newSocket.on('disconnect', () => {
      console.log('Notification listener disconnected');
    });

    socketRef.current = newSocket;

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, user]);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-4 animate-in slide-in-from-right"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="font-semibold text-sm text-slate-900 dark:text-white">
                {toast.title}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
