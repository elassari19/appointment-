'use client';

import { useState, useEffect, useRef } from 'react';
import { useLocale } from '@/contexts/LocaleContext';

interface Message {
  id: string;
  senderId: string;
  content: string;
  type: string;
  createdAt: string;
  isRead: boolean;
}

interface Conversation {
  id: string;
  patientId: string;
  dietitianId: string;
  lastMessageAt: string;
  createdAt: string;
}

interface ChatProps {
  currentUserId: string;
  initialConversationId?: string;
}

export default function Chat({ currentUserId, initialConversationId }: ChatProps) {
  const { t } = useLocale();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(initialConversationId || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation);
    }
  }, [activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/chat');
      const data = await res.json();
      if (data.conversations) {
        setConversations(data.conversations);
        if (!activeConversation && data.conversations.length > 0) {
          setActiveConversation(data.conversations[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const res = await fetch(`/api/chat?conversationId=${conversationId}`);
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeConversation,
          content: newMessage,
          type: 'text',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          setMessages([...messages, data.message]);
          setNewMessage('');
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const markAsRead = async (conversationId: string) => {
    try {
      await fetch('/api/chat', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, action: 'read' }),
      });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[600px] border border-gray-200 rounded-lg overflow-hidden">
      <div className="w-1/3 border-r border-gray-200 bg-gray-50">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">{t('messages')}</h2>
        </div>
        <div className="overflow-y-auto h-[calc(100%-60px)]">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => {
                setActiveConversation(conv.id);
                markAsRead(conv.id);
              }}
              className={`w-full p-4 text-left hover:bg-gray-100 transition-colors ${
                activeConversation === conv.id ? 'bg-yellow-50' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-800">Conversation</span>
                <span className="text-xs text-gray-500">
                  {formatTime(conv.lastMessageAt)}
                </span>
              </div>
            </button>
          ))}
          {conversations.length === 0 && (
            <p className="p-4 text-gray-500 text-center">{t('noConversations')}</p>
          )}
        </div>
      </div>

      <div className="w-2/3 flex flex-col">
        {activeConversation ? (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      msg.senderId === currentUserId
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    <p>{msg.content}</p>
                    <p className={`text-xs mt-1 ${msg.senderId === currentUserId ? 'text-yellow-100' : 'text-gray-500'}`}>
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={t('typeMessage')}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <button
                  onClick={sendMessage}
                  className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  {t('send')}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">{t('selectConversation')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
