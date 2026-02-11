import { NextRequest } from 'next/server';
import { AppointmentService } from '@/lib/services/appointment.service';
import { DatabaseService } from '@/lib/services/database.service';
import { AuthService } from '@/lib/services/auth.service';
import { z } from 'zod';

const appointmentService = new AppointmentService();
const authService = new AuthService();

const availabilitySchema = z.object({
  dietitianId: z.string().uuid('Invalid dietitian ID'),
  date: z.string(),
  duration: z.number().optional(),
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
    const dietitianId = searchParams.get('dietitianId');
    const date = searchParams.get('date');
    const duration = searchParams.get('duration');

    if (!dietitianId || !date) {
      return Response.json(
        { error: 'dietitianId and date are required' },
        { status: 400 }
      );
    }

    const validationResult = availabilitySchema.safeParse({
      dietitianId,
      date,
      duration: duration ? parseInt(duration) : undefined,
    });

    if (!validationResult.success) {
      return Response.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { dietitianId: id, date: dateStr, duration: dur } = validationResult.data;

    const availableSlots = await appointmentService.getAvailableSlots(
      id,
      new Date(dateStr),
      dur || 60
    );

    return Response.json({ slots: availableSlots });
  } catch (error) {
    console.error('Get availability error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
