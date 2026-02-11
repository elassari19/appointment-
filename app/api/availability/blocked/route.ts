import { NextRequest } from 'next/server';
import { AvailabilityService, BlockedSlotData } from '@/lib/services/availability.service';
import { DatabaseService } from '@/lib/services/database.service';
import { AuthService } from '@/lib/services/auth.service';
import { z } from 'zod';

const availabilityService = new AvailabilityService();
const authService = new AuthService();

const blockedSlotSchema = z.object({
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  reason: z.string().optional(),
});

async function getUserFromRequest(request: NextRequest): Promise<{ userId: string } | null> {
  const token = request.cookies.get('session_token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return null;
  }

  const user = await authService.getUserBySessionToken(token);
  if (!user) {
    return null;
  }

  return { userId: user.id };
}

export async function GET(request: NextRequest) {
  try {
    await DatabaseService.initialize();

    const userResult = await getUserFromRequest(request);
    if (!userResult) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const blockedSlots = await availabilityService.getBlockedSlots(
      userResult.userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );

    return Response.json({ blockedSlots });
  } catch (error) {
    console.error('Get blocked slots error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await DatabaseService.initialize();

    const userResult = await getUserFromRequest(request);
    if (!userResult) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = blockedSlotSchema.safeParse(body);

    if (!validationResult.success) {
      return Response.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const data: BlockedSlotData = {
      date: new Date(validationResult.data.date),
      startTime: validationResult.data.startTime,
      endTime: validationResult.data.endTime,
      reason: validationResult.data.reason,
    };

    const blockedSlot = await availabilityService.addBlockedSlot(userResult.userId, data);

    return Response.json(
      { message: 'Blocked slot added successfully', blockedSlot },
      { status: 201 }
    );
  } catch (error) {
    console.error('Add blocked slot error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
