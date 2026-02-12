import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { chatService } from '@/lib/services/chat.service';
import { sanitizeInput } from '@/lib/utils/security';

interface ChatUser {
  id: string;
  role: string;
  name: string;
}

const ACTIVE_USERS: Map<string, ChatUser> = new Map();
const USER_SOCKETS: Map<string, Set<string>> = new Map();
const CONVERSATION_USERS: Map<string, Set<string>> = new Map();

export class ChatWebSocketHandler {
  private io: SocketIOServer | null = null;
  private pingInterval: NodeJS.Timeout | null = null;

  initialize(server: HTTPServer): void {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    this.io.use((socket, next) => {
      try {
        const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication required'));
        }

        const userId = socket.handshake.auth?.userId;
        const userRole = socket.handshake.auth?.role || 'patient';
        const userName = socket.handshake.auth?.name || 'User';

        if (!userId) {
          return next(new Error('User ID required'));
        }

        const user: ChatUser = {
          id: userId,
          role: userRole,
          name: userName,
        };

        (socket as any).user = user;
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });

    this.io.on('connection', (socket: Socket) => {
      this.handleConnection(socket);
    });

    this.pingInterval = setInterval(() => {
      this.io?.emit('ping', { timestamp: Date.now() });
    }, 30000);

    console.log('Chat WebSocket handler initialized');
  }

  private handleConnection(socket: Socket): void {
    const user = (socket as any).user as ChatUser;

    ACTIVE_USERS.set(socket.id, user);
    
    if (!USER_SOCKETS.has(user.id)) {
      USER_SOCKETS.set(user.id, new Set());
    }
    USER_SOCKETS.get(user.id)!.add(socket.id);

    socket.on('join_conversation', (data: { conversationId: string }) => {
      this.handleJoinConversation(socket, data.conversationId);
    });

    socket.on('leave_conversation', (data: { conversationId: string }) => {
      this.handleLeaveConversation(socket, data.conversationId);
    });

    socket.on('send_message', async (data: {
      conversationId: string;
      content: string;
      type?: string;
    }) => {
      await this.handleSendMessage(socket, data);
    });

    socket.on('typing_start', (data: { conversationId: string }) => {
      this.handleTypingStart(socket, data.conversationId);
    });

    socket.on('typing_stop', (data: { conversationId: string }) => {
      this.handleTypingStop(socket, data.conversationId);
    });

    socket.on('mark_read', async (data: { conversationId: string; messageId: string }) => {
      await this.handleMarkRead(socket, data);
    });

    socket.on('disconnect', () => {
      this.handleDisconnect(socket);
    });

    socket.on('error', (error: Error) => {
      console.error('Socket error:', error);
    });

    socket.emit('connected', {
      socketId: socket.id,
      userId: user.id,
      timestamp: new Date().toISOString(),
    });
  }

  private async handleJoinConversation(socket: Socket, conversationId: string): Promise<void> {
    const user = (socket as any).user as ChatUser;

    socket.join(`conversation:${conversationId}`);

    if (!CONVERSATION_USERS.has(conversationId)) {
      CONVERSATION_USERS.set(conversationId, new Set());
    }
    CONVERSATION_USERS.get(conversationId)!.add(socket.id);

    try {
      const messages = await chatService.getConversationMessages(conversationId, 1, 50);

      socket.emit('conversation_joined', {
        conversationId,
        messages: messages.messages,
        total: messages.total,
        participants: this.getConversationParticipants(conversationId),
      });

      this.io?.to(`conversation:${conversationId}`).emit('user_joined', {
        conversationId,
        userId: user.id,
        userName: user.name,
        role: user.role,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      socket.emit('error', { message: 'Failed to join conversation' });
    }
  }

  private handleLeaveConversation(socket: Socket, conversationId: string): void {
    const user = (socket as any).user as ChatUser;

    socket.leave(`conversation:${conversationId}`);

    const users = CONVERSATION_USERS.get(conversationId);
    if (users) {
      users.delete(socket.id);
      if (users.size === 0) {
        CONVERSATION_USERS.delete(conversationId);
      }
    }

    this.io?.to(`conversation:${conversationId}`).emit('user_left', {
      conversationId,
      userId: user.id,
      userName: user.name,
      timestamp: new Date().toISOString(),
    });
  }

  private async handleSendMessage(socket: Socket, data: {
    conversationId: string;
    content: string;
    type?: string;
  }): Promise<void> {
    const user = (socket as any).user as ChatUser;

    try {
      const sanitizedContent = sanitizeInput(data.content) as string;

      if (!sanitizedContent.trim()) {
        socket.emit('error', { message: 'Message content cannot be empty' });
        return;
      }

      const message = await chatService.sendMessage(
        data.conversationId,
        user.id,
        sanitizedContent,
        (data.type as any) || 'text'
      );

      const decryptedMessage = chatService.decryptMessageForClient(message);

      this.io?.to(`conversation:${data.conversationId}`).emit('new_message', {
        message: decryptedMessage,
        conversationId: data.conversationId,
        timestamp: new Date().toISOString(),
      });

      socket.emit('message_sent', {
        messageId: message.id,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  private handleTypingStart(socket: Socket, conversationId: string): void {
    const user = (socket as any).user as ChatUser;

    socket.to(`conversation:${conversationId}`).emit('user_typing', {
      conversationId,
      userId: user.id,
      userName: user.name,
      isTyping: true,
    });
  }

  private handleTypingStop(socket: Socket, conversationId: string): void {
    const user = (socket as any).user as ChatUser;

    socket.to(`conversation:${conversationId}`).emit('user_typing', {
      conversationId,
      userId: user.id,
      userName: user.name,
      isTyping: false,
    });
  }

  private async handleMarkRead(socket: Socket, data: {
    conversationId: string;
    messageId: string;
  }): Promise<void> {
    const user = (socket as any).user as ChatUser;

    try {
      await chatService.markMessageAsRead(data.messageId);

      this.io?.to(`conversation:${data.conversationId}`).emit('message_read', {
        messageId: data.messageId,
        userId: user.id,
        readAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }

  private handleDisconnect(socket: Socket): void {
    const user = ACTIVE_USERS.get(socket.id);
    
    if (user) {
      const userSocketSet = USER_SOCKETS.get(user.id);
      if (userSocketSet) {
        userSocketSet.delete(socket.id);
        if (userSocketSet.size === 0) {
          USER_SOCKETS.delete(user.id);
        }
      }

      for (const [conversationId, sockets] of CONVERSATION_USERS.entries()) {
        if (sockets.has(socket.id)) {
          sockets.delete(socket.id);
          this.io?.to(`conversation:${conversationId}`).emit('user_left', {
            conversationId,
            userId: user.id,
            userName: user.name,
            timestamp: new Date().toISOString(),
          });
        }
      }
    }

    ACTIVE_USERS.delete(socket.id);
  }

  private getConversationParticipants(conversationId: string): string[] {
    const users: string[] = [];
    const sockets = CONVERSATION_USERS.get(conversationId);
    
    if (sockets) {
      for (const socketId of sockets) {
        const user = ACTIVE_USERS.get(socketId);
        if (user && !users.includes(user.id)) {
          users.push(user.id);
        }
      }
    }
    
    return users;
  }

  getActiveUsersCount(): number {
    return ACTIVE_USERS.size;
  }

  getConversationOnlineCount(conversationId: string): number {
    return CONVERSATION_USERS.get(conversationId)?.size || 0;
  }

  broadcastToUser(userId: string, event: string, data: unknown): void {
    const sockets = USER_SOCKETS.get(userId);
    if (sockets) {
      for (const socketId of sockets) {
        this.io?.to(socketId).emit(event, data);
      }
    }
  }

  shutdown(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    this.io?.disconnectSockets();
    ACTIVE_USERS.clear();
    USER_SOCKETS.clear();
    CONVERSATION_USERS.clear();
  }
}

export const chatWebSocketHandler = new ChatWebSocketHandler();
