'use client';

import { useState } from 'react';

const conversations = [
  {
    id: 1,
    user: 'Sarah Jenkins',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    lastMessage: 'Thank you for the appointment confirmation!',
    time: '5 min ago',
    unread: 2,
    type: 'patient',
  },
  {
    id: 2,
    user: 'Dr. James Wilson',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face',
    lastMessage: 'Can you review the lab results for patient #2931?',
    time: '1 hour ago',
    unread: 0,
    type: 'doctor',
  },
  {
    id: 3,
    user: 'Michael Roberts',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    lastMessage: 'I need to reschedule my appointment for next week.',
    time: '2 hours ago',
    unread: 1,
    type: 'patient',
  },
];

const messages = [
  {
    id: 1,
    sender: 'Sarah Jenkins',
    content: 'Hi, I wanted to confirm my appointment for tomorrow at 10 AM.',
    time: '10:30 AM',
    isMe: false,
  },
  {
    id: 2,
    sender: 'Me',
    content: 'Hello Sarah! Yes, your appointment is confirmed with Dr. Mitchell.',
    time: '10:32 AM',
    isMe: true,
  },
  {
    id: 3,
    sender: 'Sarah Jenkins',
    content: 'Perfect, thank you for the confirmation!',
    time: '10:33 AM',
    isMe: false,
  },
];

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState(conversations[0]);

  return (
    <div className="p-4 md:p-8 h-[calc(100vh-4rem)]">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground dark:text-white">
            Messages & Support
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage patient and doctor communications.
          </p>
        </div>
      </header>

      {/* Chat Layout */}
      <div className="card-stitch flex h-[calc(100%-6rem)] overflow-hidden">
        {/* Conversations List */}
        <div className="w-80 border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                search
              </span>
              <input
                type="text"
                placeholder="Search messages..."
                className="pl-10 pr-4 py-2 w-full bg-muted dark:bg-muted/20 border-border rounded-xl text-sm border"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedChat(conv)}
                className={`w-full p-4 flex items-start gap-3 hover:bg-muted/30 transition-colors text-left ${
                  selectedChat?.id === conv.id ? 'bg-muted/50' : ''
                }`}
              >
                <img src={conv.avatar} alt={conv.user} className="w-10 h-10 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-foreground text-sm truncate">{conv.user}</p>
                    <span className="text-xs text-muted-foreground">{conv.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                </div>
                {conv.unread > 0 && (
                  <span className="w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                    {conv.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={selectedChat?.avatar} alt={selectedChat?.user} className="w-10 h-10 rounded-full object-cover" />
              <div>
                <p className="font-bold text-foreground">{selectedChat?.user}</p>
                <p className="text-xs text-emerald-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                <span className="material-icons-round">phone</span>
              </button>
              <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                <span className="material-icons-round">videocam</span>
              </button>
              <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                <span className="material-icons-round">more_vert</span>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                    msg.isMe
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted dark:bg-muted/20 text-foreground rounded-bl-md'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <span className={`text-xs mt-1 block ${msg.isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2">
              <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                <span className="material-icons-round">attach_file</span>
              </button>
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 bg-muted dark:bg-muted/20 border-border rounded-xl text-sm border"
              />
              <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                <span className="material-icons-round">emoji_emotions</span>
              </button>
              <button className="p-2 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity">
                <span className="material-icons-round">send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
