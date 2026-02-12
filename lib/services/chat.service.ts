import { AppDataSource } from '@/lib/database';
import { Conversation, Message, MessageType } from '../entities/Chat';
import * as crypto from 'crypto';

const ENCRYPTION_KEY = process.env.CHAT_ENCRYPTION_KEY || 'your-32-byte-encryption-key-here!!';
const IV_LENGTH = 16;
const ALGORITHM = 'aes-256-cbc';

function encrypt(text: string): { encrypted: string; iv: string } {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return { encrypted, iv: iv.toString('hex') };
}

function decrypt(encrypted: string, ivHex: string): string {
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export class ChatService {
  private get conversationRepository() {
    return AppDataSource.getRepository(Conversation);
  }

  private get messageRepository() {
    return AppDataSource.getRepository(Message);
  }

  async createConversation(patientId: string, dietitianId: string): Promise<Conversation> {
    const existing = await this.conversationRepository.findOne({
      where: [
        { patientId, dietitianId },
        { patientId: dietitianId, dietitianId: patientId },
      ],
    });

    if (existing) {
      existing.isActive = true;
      return this.conversationRepository.save(existing);
    }

    const conversation = this.conversationRepository.create({
      patientId,
      dietitianId,
      lastMessageAt: new Date(),
    });

    return this.conversationRepository.save(conversation);
  }

  async getConversation(conversationId: string): Promise<Conversation | null> {
    return this.conversationRepository.findOne({ where: { id: conversationId } });
  }

  async getConversationByUsers(patientId: string, dietitianId: string): Promise<Conversation | null> {
    return this.conversationRepository.findOne({
      where: [
        { patientId, dietitianId },
        { patientId: dietitianId, dietitianId: patientId },
      ],
    });
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    return this.conversationRepository
      .createQueryBuilder('conversation')
      .where('conversation.patientId = :userId OR conversation.dietitianId = :userId', { userId })
      .andWhere('conversation.isActive = true')
      .orderBy('conversation.lastMessageAt', 'DESC')
      .getMany();
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    type: MessageType = MessageType.TEXT
  ): Promise<Message> {
    const { encrypted, iv } = encrypt(content);

    const message = this.messageRepository.create({
      conversationId,
      senderId,
      type,
      encryptedContent: encrypted,
      iv,
    });

    const savedMessage = await this.messageRepository.save(message);

    await this.conversationRepository.update(conversationId, {
      lastMessageAt: new Date(),
    });

    return savedMessage;
  }

  async getDecryptedMessage(messageId: string): Promise<Message | null> {
    const message = await this.messageRepository.findOne({ where: { id: messageId } });
    if (!message) return null;

    const decryptedContent = decrypt(message.encryptedContent, message.iv);
    return { ...message, encryptedContent: decryptedContent } as Message;
  }

  async getConversationMessages(
    conversationId: string,
    page = 1,
    limit = 50
  ): Promise<{ messages: Message[]; total: number }> {
    const [messages, total] = await this.messageRepository.findAndCount({
      where: { conversationId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { messages: messages.reverse(), total };
  }

  async markMessageAsRead(messageId: string): Promise<Message | null> {
    await this.messageRepository.update(messageId, {
      isRead: true,
      readAt: new Date(),
    });

    return this.messageRepository.findOne({ where: { id: messageId } });
  }

  async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
    await this.messageRepository
      .createQueryBuilder()
      .update(Message)
      .set({ isRead: true, readAt: new Date() })
      .where('conversationId = :conversationId', { conversationId })
      .andWhere('senderId != :userId', { userId })
      .andWhere('isRead = false')
      .execute();
  }

  async getUnreadCount(userId: string): Promise<number> {
    const conversations = await this.getUserConversations(userId);
    const conversationIds = conversations.map((c) => c.id);

    if (conversationIds.length === 0) return 0;

    return this.messageRepository
      .createQueryBuilder('message')
      .where('message.conversationId IN (:...conversationIds)', { conversationIds })
      .andWhere('message.senderId != :userId', { userId })
      .andWhere('message.isRead = false')
      .getCount();
  }

  async closeConversation(conversationId: string): Promise<Conversation | null> {
    await this.conversationRepository.update(conversationId, { isActive: false });
    return this.getConversation(conversationId);
  }

  async deleteMessage(messageId: string): Promise<boolean> {
    const result = await this.messageRepository.delete(messageId);
    return (result.affected || 0) > 0;
  }

  decryptMessageForClient(message: Message): Message {
    try {
      const decryptedContent = decrypt(message.encryptedContent, message.iv);
      return { ...message, encryptedContent: decryptedContent } as Message;
    } catch {
      return message;
    }
  }

  decryptMessagesForClient(messages: Message[]): Message[] {
    return messages.map((msg) => this.decryptMessageForClient(msg));
  }
}

export const chatService = new ChatService();
