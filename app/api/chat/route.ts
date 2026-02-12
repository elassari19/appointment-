import { NextRequest, NextResponse } from 'next/server';
import { chatService } from '@/lib/services/chat.service';
import { AuthService } from '@/lib/services/auth.service';

const authService = new AuthService();

async function getUserFromRequest(request: NextRequest): Promise<{ userId: string; role: string } | null> {
  const token = request.cookies.get('session_token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return null;
  }

  const user = await authService.getUserBySessionToken(token);
  if (!user) {
    return null;
  }

  return { userId: user.id, role: user.role };
}

export async function GET(request: NextRequest) {
  try {
    const userResult = await getUserFromRequest(request);
    if (!userResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (conversationId) {
      const { messages, total } = await chatService.getConversationMessages(
        conversationId,
        page,
        limit
      );
      const decryptedMessages = chatService.decryptMessagesForClient(messages);
      return NextResponse.json({ messages: decryptedMessages, total });
    }

    const conversations = await chatService.getUserConversations(userResult.userId);
    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userResult = await getUserFromRequest(request);
    if (!userResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { conversationId, patientId, dietitianId, content, type } = body;

    if (patientId && dietitianId) {
      const conversation = await chatService.createConversation(patientId, dietitianId);
      return NextResponse.json({ conversation });
    }

    if (conversationId && content) {
      const message = await chatService.sendMessage(
        conversationId,
        userResult.userId,
        content,
        type || 'text'
      );
      const decryptedMessage = chatService.decryptMessageForClient(message);
      return NextResponse.json({ message: decryptedMessage });
    }

    return NextResponse.json(
      { error: 'Invalid request: provide conversationId+content or patientId+dietitianId' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userResult = await getUserFromRequest(request);
    if (!userResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { conversationId, messageId, action } = body;

    if (action === 'read' && conversationId) {
      await chatService.markConversationAsRead(conversationId, userResult.userId);
      return NextResponse.json({ success: true });
    }

    if (messageId) {
      const message = await chatService.markMessageAsRead(messageId);
      return NextResponse.json({ message });
    }

    return NextResponse.json(
      { error: 'Invalid request: provide conversationId or messageId' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json(
      { error: 'Failed to update message' },
      { status: 500 }
    );
  }
}
