'use client';

import { useState, useEffect } from 'react';
import Chat from '@/components/Chat';

export default function MessagesPage() {
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const getUserId = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUserId(data.user?.id || '');
        }
      } catch (error) {
        console.error('Error getting user:', error);
      }
    };
    getUserId();
  }, []);

  if (!userId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Messages</h1>
      <Chat currentUserId={userId} />
    </div>
  );
}
