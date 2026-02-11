import { NextRequest } from 'next/server';
import { AvailabilityService } from '@/lib/services/availability.service';
import { DatabaseService } from '@/lib/services/database.service';
import { AuthService } from '@/lib/services/auth.service';
import { DayOfWeek } from '@/lib/entities/Availability';
import { z } from 'zod';

const availabilityService = new AvailabilityService();
const authService = new AuthService();

const bulkUpdateSchema = z.object({
  days: z.array(z.nativeEnum(DayOfWeek)),
  startTime: z.string(),
  endTime: z.string(),
  defaultDuration: z.number().optional(),
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

export async function POST(request: NextRequest) {
  try {
    await DatabaseService.initialize();

    const userResult = await getUserFromRequest(request);
    if (!userResult) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = bulkUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return Response.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { days, startTime, endTime, defaultDuration } = validationResult.data;

    const updated = await availabilityService.bulkUpdateAvailability(
      userResult.userId,
      days,
      startTime,
      endTime,
      defaultDuration || 60
    );

    return Response.json({
      message: `Updated availability for ${days.length} days`,
      slotsAdded: updated.length,
    });
  } catch (error) {
    console.error('Bulk update availability error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
