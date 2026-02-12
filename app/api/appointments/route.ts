import { NextRequest } from 'next/server';
import { AppointmentService, AppointmentFilters } from '@/lib/services/appointment.service';
import { DatabaseService } from '@/lib/services/database.service';
import { AuthService } from '@/lib/services/auth.service';
import { AppointmentStatus } from '@/lib/entities/Appointment';
import { z } from 'zod';

const appointmentService = new AppointmentService();
const authService = new AuthService();

const createAppointmentSchema = z.object({
  doctorId: z.string().uuid('Invalid doctor ID'),
  startTime: z.string().datetime('Invalid start time'),
  duration: z.number().min(15, 'Duration must be at least 15 minutes'),
  notes: z.string().optional(),
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
    const status = searchParams.get('status') as AppointmentStatus | null;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const filters: AppointmentFilters = {};

    if (status) {
      filters.status = status;
    }
    if (startDate) {
      filters.startDate = new Date(startDate);
    }
    if (endDate) {
      filters.endDate = new Date(endDate);
    }

    const appointments = await appointmentService.getAppointments({
      ...filters,
      patientId: userResult.userId,
    });

    return Response.json({ appointments });
  } catch (error) {
    console.error('Get appointments error:', error);
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
    const validationResult = createAppointmentSchema.safeParse(body);

    if (!validationResult.success) {
      return Response.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { doctorId, startTime, duration, notes } = validationResult.data;

    const appointment = await appointmentService.createAppointment({
      patientId: userResult.userId,
      doctorId,
      startTime: new Date(startTime),
      duration,
      notes,
    });

    return Response.json({ appointment }, { status: 201 });
  } catch (error) {
    console.error('Create appointment error:', error);
    
    if (error instanceof Error && error.message.includes('not available')) {
      return Response.json({ error: error.message }, { status: 409 });
    }
    
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
