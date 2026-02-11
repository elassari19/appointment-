import { NextRequest, NextResponse } from 'next/server';
import { GoogleCalendarService } from '@/lib/services/google-calendar.service';
import { AuthService } from '@/lib/services/auth.service';
import { AppointmentService } from '@/lib/services/appointment.service';
import { DatabaseService } from '@/lib/services/database.service';
import { z } from 'zod';

const calendarService = new GoogleCalendarService();
const authService = new AuthService();
const appointmentService = new AppointmentService();

const syncSchema = z.object({
  appointmentId: z.string().uuid(),
  action: z.enum(['create', 'update', 'delete']),
});

async function getUserFromRequest(request: NextRequest): Promise<{ userId: string; email: string } | null> {
  const token = request.cookies.get('session_token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return null;
  }

  const user = await authService.getUserBySessionToken(token);
  if (!user) {
    return null;
  }

  return { userId: user.id, email: user.email };
}

export async function GET(request: NextRequest) {
  try {
    await DatabaseService.initialize();

    const userResult = await getUserFromRequest(request);
    if (!userResult) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/calendar/callback`;

    if (!clientId) {
      return NextResponse.json({ error: 'Google Calendar not configured' }, { status: 500 });
    }

    const authUrl = calendarService.getAuthorizationUrl(clientId, redirectUri);

    return NextResponse.json({ authUrl, isAuthenticated: calendarService.isAuthenticated() });
  } catch (error) {
    console.error('Get calendar auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await DatabaseService.initialize();

    const userResult = await getUserFromRequest(request);
    if (!userResult) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = syncSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { appointmentId, action } = validationResult.data;

    const appointment = await appointmentService.getAppointmentById(appointmentId);
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    if (!calendarService.isAuthenticated()) {
      return NextResponse.json({ error: 'Calendar not connected' }, { status: 400 });
    }

    let result;
    switch (action) {
      case 'create':
        result = await calendarService.createEvent(
          GoogleCalendarService.appointmentToCalendarEvent(
            appointment as any,
            appointment.patient as any,
            appointment.dietitian as any
          )
        );
        break;
      case 'update':
        if ((appointment as any).calendarEventId) {
          result = await calendarService.updateEvent(
            (appointment as any).calendarEventId,
            GoogleCalendarService.appointmentToCalendarEvent(
              appointment as any,
              appointment.patient as any,
              appointment.dietitian as any
            )
          );
        } else {
          result = await calendarService.createEvent(
            GoogleCalendarService.appointmentToCalendarEvent(
              appointment as any,
              appointment.patient as any,
              appointment.dietitian as any
            )
          );
        }
        break;
      case 'delete':
        if ((appointment as any).calendarEventId) {
          result = await calendarService.deleteEvent((appointment as any).calendarEventId);
        } else {
          result = { success: true };
        }
        break;
    }

    if (result?.success) {
      return NextResponse.json({ success: true, eventId: result.eventId });
    } else {
      return NextResponse.json(
        { error: result?.error || 'Failed to sync calendar event' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Calendar sync error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await DatabaseService.initialize();

    const userResult = await getUserFromRequest(request);
    if (!userResult) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    calendarService.setTokens({
      accessToken: '',
      refreshToken: '',
      expiresAt: new Date(),
    });

    return NextResponse.json({ message: 'Calendar disconnected successfully' });
  } catch (error) {
    console.error('Disconnect calendar error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
