import { NextRequest, NextResponse } from 'next/server';
import { AppDataSource } from '@/lib/database';
import { Appointment, AppointmentStatus } from '@/lib/entities/Appointment';
import { User } from '@/lib/entities/User';
import { GoogleCalendarService, MeetingPhase, MeetingLifecycleInfo } from '@/lib/services/google-calendar.service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appointment = await AppDataSource.getRepository(Appointment).findOne({
      where: { id: params.id },
      relations: ['patient', 'dietitian'],
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const lifecycleInfo: MeetingLifecycleInfo = GoogleCalendarService.getMeetingPhaseInfo(
      appointment.startTime,
      appointment.meetingEndedAt,
      appointment.cancelledAt
    );

    const response: any = {
      appointmentId: params.id,
      phase: lifecycleInfo.phase,
      isOngoing: lifecycleInfo.isOngoing,
      status: appointment.status,
    };

    if (lifecycleInfo.startedAt) {
      response.startedAt = lifecycleInfo.startedAt;
    }

    if (lifecycleInfo.endedAt) {
      response.endedAt = lifecycleInfo.endedAt;
    }

    if (appointment.patient) {
      response.patient = {
        id: appointment.patient.id,
        firstName: appointment.patient.firstName,
        lastName: appointment.patient.lastName,
        email: appointment.patient.email,
      };
    }

    if (appointment.dietitian) {
      response.dietitian = {
        id: appointment.dietitian.id,
        firstName: appointment.dietitian.firstName,
        lastName: appointment.dietitian.lastName,
        email: appointment.dietitian.email,
      };
    }

    if (appointment.startTime) {
      response.startTime = appointment.startTime;
    }

    if (appointment.duration) {
      response.duration = appointment.duration;
      const endTime = new Date(appointment.startTime);
      endTime.setMinutes(endTime.getMinutes() + appointment.duration);
      response.expectedEndTime = endTime;
    }

    if (appointment.cancelledAt) {
      response.cancelledAt = appointment.cancelledAt;
      response.cancelledReason = appointment.cancellationReason;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Get meeting lifecycle error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
