import { NextRequest } from 'next/server';
import { AppointmentService } from '@/lib/services/appointment.service';
import { DatabaseService } from '@/lib/services/database.service';
import { AuthService } from '@/lib/services/auth.service';
import { AppointmentStatus } from '@/lib/entities/Appointment';
import { z } from 'zod';

const appointmentService = new AppointmentService();
const authService = new AuthService();

const updateStatusSchema = z.object({
  status: z.nativeEnum(AppointmentStatus),
  reason: z.string().optional(),
});

const rescheduleSchema = z.object({
  startTime: z.string().datetime('Invalid start time'),
  duration: z.number().min(15).optional(),
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await DatabaseService.initialize();

    const userResult = await getUserFromRequest(request);
    if (!userResult) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const appointment = await appointmentService.getAppointmentById(id);

    if (!appointment) {
      return Response.json({ error: 'Appointment not found' }, { status: 404 });
    }

    return Response.json({ appointment });
  } catch (error) {
    console.error('Get appointment error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await DatabaseService.initialize();

    const userResult = await getUserFromRequest(request);
    if (!userResult) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validationResult = updateStatusSchema.safeParse(body);

    if (!validationResult.success) {
      return Response.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { status, reason } = validationResult.data;

    let appointment;
    if (status === AppointmentStatus.CANCELLED) {
      appointment = await appointmentService.cancelAppointment(id, reason);
    } else {
      appointment = await appointmentService.updateAppointmentStatus(id, status);
    }

    if (!appointment) {
      return Response.json({ error: 'Appointment not found' }, { status: 404 });
    }

    return Response.json({ appointment });
  } catch (error) {
    console.error('Update appointment error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await DatabaseService.initialize();

    const userResult = await getUserFromRequest(request);
    if (!userResult) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const reason = searchParams.get('reason') || undefined;

    const appointment = await appointmentService.cancelAppointment(id, reason);

    if (!appointment) {
      return Response.json({ error: 'Appointment not found' }, { status: 404 });
    }

    return Response.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await DatabaseService.initialize();

    const userResult = await getUserFromRequest(request);
    if (!userResult) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validationResult = rescheduleSchema.safeParse(body);

    if (!validationResult.success) {
      return Response.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { startTime, duration } = validationResult.data;

    const appointment = await appointmentService.rescheduleAppointment(
      id,
      new Date(startTime),
      duration
    );

    if (!appointment) {
      return Response.json(
        { error: 'Appointment not found or time slot not available' },
        { status: 404 }
      );
    }

    return Response.json({ appointment });
  } catch (error) {
    console.error('Reschedule appointment error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return Response.json({ error: message }, { status: 400 });
  }
}
