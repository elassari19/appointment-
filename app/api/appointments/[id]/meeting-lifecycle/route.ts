import { NextRequest, NextResponse } from 'next/server';
import { AppDataSource } from '@/lib/database';
import { Appointment, AppointmentStatus } from '@/lib/entities/Appointment';
import { User } from '@/lib/entities/User';
import { GoogleCalendarService, MeetingPhase, MeetingLifecycleInfo } from '@/lib/services/google-calendar.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const appointment = await AppDataSource.getRepository(Appointment).findOne({
      where: { id },
      relations: ['patient', 'doctor'],
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
      appointmentId: id,
      phase: lifecycleInfo.phase,
      isOngoing: lifecycleInfo.isOngoing,
      status: appointment.status,
      meetingLink: appointment.meetingLink,
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

    if (appointment.doctor) {
      response.dietitian = {
        id: appointment.doctor.id,
        firstName: appointment.doctor.firstName,
        lastName: appointment.doctor.lastName,
        email: appointment.doctor.email,
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
