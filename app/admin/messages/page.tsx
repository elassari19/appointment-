'use client';

import { useState } from 'react';

const conversations = [
  {
    id: 1,
    user: 'Dr. Sarah Mitchell',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face',
    lastMessage: "I've sent the cardiology report for...",
    time: '2m ago',
    unread: 0,
    type: 'doctor',
    online: true,
    preview: true,
  },
  {
    id: 2,
    user: 'Emma Thompson',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
    lastMessage: 'Thank you for the quick follow-up.',
    time: '1h ago',
    unread: 2,
    type: 'patient',
    online: false,
    preview: false,
  },
  {
    id: 3,
    user: 'Marcus Chen',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    lastMessage: 'Is it possible to reschedule for Tuesday?',
    time: '3h ago',
    unread: 0,
    type: 'patient',
    online: true,
    preview: false,
  },
  {
    id: 4,
    user: 'Dr. James Wilson',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face',
    lastMessage: 'The patient records are now accessible.',
    time: 'Yesterday',
    unread: 0,
    type: 'doctor',
    online: false,
    preview: false,
  },
];

const messages = [
  {
    id: 1,
    sender: 'Sarah Mitchell',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face',
    content: "Hi Admin, I've just updated the clinical notes for patient Emma Thompson. Could you please ensure they're linked to her upcoming appointment?",
    time: '09:12 AM',
    isMe: false,
    hasFile: false,
  },
  {
    id: 2,
    sender: 'Me',
    content: "Absolutely, Dr. Mitchell. I'll take care of that right away. Do you need me to notify the nursing team as well?",
    time: '09:15 AM',
    isMe: true,
    hasFile: false,
  },
  {
    id: 3,
    sender: 'Sarah Mitchell',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face',
    content: 'Yes, that would be great. Here is the file for reference.',
    time: '09:16 AM',
    isMe: false,
    hasFile: true,
    fileName: 'Emma_T_Notes_Feb.pdf',
    fileSize: '1.2 MB',
  },
];

const sharedMedia = [
  'https://images.unsplash.com/photo-1559757175-0b3155221a97?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1559757175-5700c7a6d7a6?w=100&h=100&fit=crop',
];

const documents = [
  { name: 'Lab_Results.doc', date: 'Feb 22, 2024', size: '450 KB', icon: 'description', color: 'blue' },
  { name: 'Patient_History.txt', date: 'Feb 20, 2024', size: '12 KB', icon: 'summarize', color: 'orange' },
];

const quickReplies = [
  'Appointement details sent',
  'I will check that',
  'Patient notified',
];

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState(conversations[0]);
  const [activeTab, setActiveTab] = useState<'all' | 'patients' | 'doctors'>('all');
  const [isTyping, setIsTyping] = useState(true);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-8 border-b border-border">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-96">
            <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">search</span>
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-full text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-card border border-border text-muted-foreground relative hover:bg-muted transition-colors">
            <span className="material-icons-round">notifications</span>
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-card"></span>
          </button>
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">A</div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Conversations List */}
        <div className="w-80 flex flex-col bg-card rounded-2xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg text-foreground">Messages</h2>
              <button className="p-1.5 bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground rounded-lg transition-all">
                <span className="material-icons-round text-sm">edit_note</span>
              </button>
            </div>
            <div className="flex gap-2 p-1 bg-muted rounded-lg">
              {(['all', 'patients', 'doctors'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-md transition-all ${
                    activeTab === tab
                      ? 'bg-card shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedChat(conv)}
                className={`group px-4 py-4 flex items-center gap-3 cursor-pointer transition-colors ${
                  selectedChat?.id === conv.id
                    ? 'bg-muted/50 border-r-4 border-primary'
                    : 'hover:bg-muted/30'
                }`}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                    <img src={conv.avatar} alt={conv.user} className="w-full h-full object-cover" />
                  </div>
                  <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-card rounded-full ${
                    conv.online ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'
                  }`}></span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <h3 className="font-bold text-sm truncate text-foreground">{conv.user}</h3>
                    <span className="text-[10px] text-slate-400">{conv.time}</span>
                  </div>
                  <p className={`text-xs truncate ${
                    conv.unread > 0 || conv.preview ? 'text-foreground font-medium' : 'text-muted-foreground'
                  }`}>
                    {conv.lastMessage}
                  </p>
                </div>
                {conv.unread > 0 && (
                  <span className="w-5 h-5 bg-primary text-[10px] font-bold text-primary-foreground rounded-full flex items-center justify-center">
                    {conv.unread}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-card rounded-2xl border border-border overflow-hidden ml-6">
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                  <img src={selectedChat?.avatar} alt={selectedChat?.user} className="w-full h-full object-cover" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 border-2 border-card rounded-full bg-green-500"></span>
              </div>
              <div>
                <h3 className="font-bold text-base leading-tight text-foreground">{selectedChat?.user}</h3>
                <p className="text-xs text-green-500 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Active Now
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted">
                <span className="material-icons-round">videocam</span>
              </button>
              <button className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted">
                <span className="material-icons-round">call</span>
              </button>
              <div className="w-px h-6 bg-border mx-1"></div>
              <button className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted">
                <span className="material-icons-round">more_vert</span>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex justify-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-3 py-1 rounded-full">
                Today, Feb 24
              </span>
            </div>

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-3 ${msg.isMe ? 'flex-row-reverse ml-auto' : ''} max-w-[80%]`}
              >
                {!msg.isMe && (
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-muted mb-1">
                    <img src={msg.avatar} alt={msg.sender} className="w-full h-full object-cover" />
                  </div>
                )}
                {msg.isMe && (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-xs text-primary mb-1">
                    A
                  </div>
                )}
                <div className={`space-y-1 ${msg.isMe ? 'items-end flex flex-col' : ''}`}>
                  <div className={`p-3 rounded-2xl ${
                    msg.isMe
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-muted text-foreground rounded-bl-none'
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                  {msg.hasFile && (
                    <div className={`bg-muted border border-border p-3 rounded-xl flex items-center gap-3 ${
                      msg.isMe ? 'ml-auto' : ''
                    }`}>
                      <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg flex items-center justify-center">
                        <span className="material-icons-round">picture_as_pdf</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate text-foreground">{msg.fileName}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">{msg.fileSize}</p>
                      </div>
                      <button className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
                        <span className="material-icons-round">download</span>
                      </button>
                    </div>
                  )}
                  <div className={`flex items-center gap-1 ${msg.isMe ? 'flex-row-reverse' : ''} ${msg.isMe ? '' : 'ml-1'}`}>
                    <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                    {msg.isMe && (
                      <span className="material-icons-round text-primary text-[14px]">done_all</span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="flex gap-1 bg-muted px-3 py-2 rounded-full">
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
                <span className="text-[10px] font-medium italic">Dr. Sarah Mitchell is typing...</span>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-card border-t border-border">
            <div className="flex flex-wrap gap-2 mb-3">
              {quickReplies.map((reply, index) => (
                <button
                  key={index}
                  className="text-[11px] font-semibold bg-muted text-muted-foreground px-3 py-1.5 rounded-full hover:bg-primary/20 hover:text-primary transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 bg-muted p-2 rounded-xl border border-border">
              <button className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-muted">
                <span className="material-icons-round">add_circle_outline</span>
              </button>
              <button className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-muted">
                <span className="material-icons-round">emoji_emotions</span>
              </button>
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 text-foreground placeholder:text-muted-foreground"
              />
              <button className="bg-primary text-primary-foreground p-2.5 rounded-lg flex items-center justify-center shadow-md hover:opacity-90 transition-all">
                <span className="material-icons-round">send</span>
              </button>
            </div>
          </div>
        </div>

        {/* Side Panel - Contact Details */}
        <div className="w-72 hidden xl:flex flex-col gap-6 overflow-y-auto ml-6">
          {/* Profile Card */}
          <div className="bg-card rounded-2xl border border-border p-5">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-primary/10 mb-4">
                <img src={selectedChat?.avatar} alt={selectedChat?.user} className="w-full h-full object-cover" />
              </div>
              <h3 className="font-bold text-lg text-foreground">{selectedChat?.user}</h3>
              <p className="text-sm text-muted-foreground font-medium mb-4">
                Cardiologist · St. Mary's Clinic
              </p>
              <div className="flex gap-4 w-full">
                <div className="flex-1 bg-muted p-3 rounded-xl text-center">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Patients</p>
                  <p className="font-bold text-foreground">156</p>
                </div>
                <div className="flex-1 bg-muted p-3 rounded-xl text-center">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Exp.</p>
                  <p className="font-bold text-foreground">12Y</p>
                </div>
              </div>
            </div>
          </div>

          {/* Shared Media */}
          <div className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-foreground">Shared Media</h3>
              <button className="text-xs font-bold text-primary">See All</button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {sharedMedia.map((src, index) => (
                <div key={index} className="w-full aspect-square rounded-lg overflow-hidden bg-muted">
                  <img src={src} alt={`Shared media ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
              <div className="w-full aspect-square rounded-lg bg-muted flex items-center justify-center">
                <span className="text-xs font-bold text-muted-foreground">+12</span>
              </div>
            </div>
          </div>

          {/* Recent Documents */}
          <div className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-foreground">Recent Documents</h3>
            </div>
            <div className="space-y-3">
              {documents.map((doc, index) => (
                <div key={index} className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer group">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    doc.color === 'blue' 
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-500' 
                      : 'bg-orange-50 dark:bg-orange-900/30 text-orange-500'
                  }`}>
                    <span className="material-icons-round text-sm">{doc.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate text-foreground">{doc.name}</p>
                    <p className="text-[10px] text-muted-foreground">{doc.date} · {doc.size}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Support Card */}
          <div className="bg-zinc-900 text-white p-5 rounded-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-bold text-sm mb-1">Need Support?</h3>
              <p className="text-xs text-slate-300 mb-4">Contact tech support for dashboard issues.</p>
              <button className="w-full py-2.5 bg-primary text-foreground font-bold text-xs rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all">
                Get Help Now
              </button>
            </div>
            <span className="material-icons-round absolute -bottom-4 -right-4 text-7xl text-white/10 rotate-12">help_outline</span>
          </div>
        </div>
      </div>
    </div>
  );
}
