import { NextRequest, NextResponse } from 'next/server';
import { AppointmentService, CreateAppointmentWithMeetData } from '@/lib/services/appointment.service';
import { AuthService } from '@/lib/services/auth.service';
import { DatabaseService } from '@/lib/services/database.service';
import { NotificationService } from '@/lib/services/notification.service';
import { AppDataSource } from '@/lib/database';
import { Appointment } from '@/lib/entities/Appointment';
import { z } from 'zod';

const appointmentService = new AppointmentService();
const authService = new AuthService();
const notificationService = new NotificationService();

const bookVisitSchema = z.object({
  doctorId: z.string().uuid('Invalid doctor ID'),
  startTime: z.string().datetime('Invalid start time'),
  duration: z.number().min(15, 'Duration must be at least 15 minutes'),
  notes: z.string().optional(),
  createMeetLink: z.boolean().default(true),
  appointmentId: z.string().uuid().optional(),
  paymentCompleted: z.boolean().default(false),
});

async function getUserFromRequest(request: NextRequest): Promise<{ userId: string; email: string; googleTokens?: { accessToken: string; refreshToken?: string } } | null> {
  const token = request.cookies.get('session_token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return null;
  }

  const user = await authService.getUserBySessionToken(token);
  if (!user) {
    return null;
  }

  const googleAccessToken = (user as any).googleAccessToken;

  return {
    userId: user.id,
    email: user.email,
    googleTokens: googleAccessToken ? {
      accessToken: googleAccessToken,
      refreshToken: (user as any).googleRefreshToken,
    } : undefined,
  };
}

export async function POST(request: NextRequest) {
  try {
    await DatabaseService.initialize();

    const userResult = await getUserFromRequest(request);
    if (!userResult) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = bookVisitSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { doctorId, startTime, duration, notes, createMeetLink, appointmentId, paymentCompleted } = validationResult.data;

    if (appointmentId && paymentCompleted) {
      const appointmentRepo = AppDataSource.getRepository(Appointment);
      const existingAppointment = await appointmentRepo.findOne({
        where: { id: appointmentId },
        relations: ['doctor', 'patient']
      });

      if (!existingAppointment) {
        return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
      }

      if (existingAppointment.patient.id !== userResult.userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      existingAppointment.status = 'confirmed' as any;
      existingAppointment.confirmedAt = new Date();
      await appointmentRepo.save(existingAppointment);

      try {
        await notificationService.sendAppointmentConfirmation(existingAppointment);
      } catch (notificationError) {
        console.error('Failed to send notification:', notificationError);
      }

      return NextResponse.json({
        appointment: {
          id: existingAppointment.id,
          startTime: existingAppointment.startTime,
          duration: existingAppointment.duration,
          status: existingAppointment.status,
          meetingLink: existingAppointment.meetingLink,
          notes: existingAppointment.notes,
        },
        message: 'Appointment confirmed successfully',
      }, { status: 200 });
    }

    let result;

    if (createMeetLink && userResult.googleTokens) {
      const appointmentData: CreateAppointmentWithMeetData = {
        patientId: userResult.userId,
        doctorId,
        startTime: new Date(startTime),
        duration,
        notes,
        googleAccessToken: userResult.googleTokens.accessToken,
        googleRefreshToken: userResult.googleTokens.refreshToken,
      };

      result = await appointmentService.createAppointmentWithMeet(appointmentData);
    } else if (createMeetLink && !userResult.googleTokens) {
      return NextResponse.json(
        { error: 'Google account not connected. Please connect your Google account to create meeting links.' },
        { status: 400 }
      );
    } else {
      const appointmentResult = await appointmentService.createAppointment({
        patientId: userResult.userId,
        doctorId,
        startTime: new Date(startTime),
        duration,
        notes,
      });

      const meetingCode = Math.random().toString(36).substring(2, 12);
      const meetingLink = `https://meet.jit.si/appointment-${meetingCode}`;
      
      const appointmentRepo = AppDataSource.getRepository(Appointment);
      appointmentResult.appointment.meetingLink = meetingLink;
      await appointmentRepo.save(appointmentResult.appointment);

      result = {
        appointment: appointmentResult.appointment,
        meetingLink,
        calendarEventId: undefined,
      };
    }

    try {
      await notificationService.sendAppointmentConfirmation(result.appointment);
    } catch (notificationError) {
      console.error('Failed to send notification:', notificationError);
    }

    return NextResponse.json({
      appointment: {
        id: result.appointment.id,
        startTime: result.appointment.startTime,
        duration: result.appointment.duration,
        status: result.appointment.status,
        meetingLink: result.meetingLink,
        notes: result.appointment.notes,
      },
      message: 'Appointment booked successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Book visit error:', error);

    if (error instanceof Error && error.message.includes('not available')) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await DatabaseService.initialize();

    const userResult = await getUserFromRequest(request);
    if (!userResult) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const upcoming = searchParams.get('upcoming');

    const appointments = await appointmentService.getAppointments({
      patientId: userResult.userId,
    });

    const filteredAppointments = upcoming === 'true'
      ? appointments.filter(apt => new Date(apt.startTime) > new Date())
      : appointments;

    return NextResponse.json({
      appointments: filteredAppointments.map(apt => ({
        id: apt.id,
        startTime: apt.startTime,
        duration: apt.duration,
        status: apt.status,
        meetingLink: apt.meetingLink,
        notes: apt.notes,
        doctor: apt.doctor ? {
          id: apt.doctor.id,
          firstName: apt.doctor.firstName,
          lastName: apt.doctor.lastName,
          email: apt.doctor.email,
        } : null,
      })),
    });
  } catch (error) {
    console.error('Get visits error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
