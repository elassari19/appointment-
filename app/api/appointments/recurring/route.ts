import { NextRequest } from 'next/server';
import {
  RecurringAppointmentService,
  RecurringAppointmentData,
} from '@/lib/services/recurring-appointment.service';
import { DatabaseService } from '@/lib/services/database.service';
import { AuthService } from '@/lib/services/auth.service';
import { RecurrenceFrequency } from '@/lib/entities/Appointment';
import { z } from 'zod';

const recurringService = new RecurringAppointmentService();
const authService = new AuthService();

const createRecurringSchema = z.object({
  doctorId: z.string().uuid('Invalid doctor ID'),
  startTime: z.string().datetime('Invalid start time'),
  duration: z.number().min(15, 'Duration must be at least 15 minutes'),
  notes: z.string().optional(),
  recurrenceFrequency: z.nativeEnum(RecurrenceFrequency),
  recurrenceCount: z.number().min(1).max(52).optional(),
  recurrenceEndDate: z.string().optional(),
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
    const validationResult = createRecurringSchema.safeParse(body);

    if (!validationResult.success) {
      return Response.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const data: RecurringAppointmentData = {
      patientId: userResult.userId,
      ...validationResult.data,
      startTime: new Date(validationResult.data.startTime),
      recurrenceEndDate: validationResult.data.recurrenceEndDate
        ? new Date(validationResult.data.recurrenceEndDate)
        : undefined,
    };

    const appointments = await recurringService.createRecurringSeries(data);

    return Response.json(
      {
        message: `Created ${appointments.length} recurring appointments`,
        appointments: appointments.map((apt) => ({
          id: apt.id,
          startTime: apt.startTime,
          duration: apt.duration,
          status: apt.status,
        })),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create recurring appointments error:', error);

    if (error instanceof Error && error.message.includes('not available')) {
      return Response.json({ error: error.message }, { status: 409 });
    }

    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await DatabaseService.initialize();

    const userResult = await getUserFromRequest(request);
    if (!userResult) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const appointments = await recurringService.getUpcomingRecurringAppointments(
      userResult.userId
    );

    return Response.json({ appointments });
  } catch (error) {
    console.error('Get recurring appointments error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
