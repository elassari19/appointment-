import { NextRequest, NextResponse } from 'next/server';
import { AppDataSource } from '@/lib/database';
import { Appointment, AppointmentStatus } from '@/lib/entities/Appointment';
import { MeetingPhase } from '@/lib/services/google-calendar.service';
import { AuditService } from '@/lib/services/audit.service';
import { GoogleCalendarService } from '@/lib/services/google-calendar.service';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appointment = await AppDataSource.getRepository(Appointment).findOne({
      where: { id: params.id, status: AppointmentStatus.CONFIRMED },
      relations: ['patient', 'dietitian'],
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found or not confirmed' }, { status: 404 });
    }

    if (appointment.meetingPhase !== MeetingPhase.ACTIVE_SESSION) {
      return NextResponse.json(
        { error: `Cannot end session in ${appointment.meetingPhase} phase` },
        { status: 400 }
      );
    }

    const now = new Date();
    const endTime = new Date(appointment.startTime);
    endTime.setMinutes(endTime.getMinutes() + appointment.duration);

    await AppDataSource.getRepository(Appointment).update(params.id, {
      meetingPhase: MeetingPhase.POST_SESSION,
      meetingEndedAt: now,
      status: AppointmentStatus.COMPLETED,
    });

    const updatedAppointment = await AppDataSource.getRepository(Appointment).findOne({
      where: { id: params.id },
    });

    const auditService = new AuditService();
    await auditService.log({
      userId: appointment.dietitian.id,
      action: 'session_ended',
      entityType: 'Appointment',
      entityId: params.id,
      details: {
        appointmentId: params.id,
        startTime: appointment.startTime,
        endTime: now,
        sessionDuration: updatedAppointment?.meetingEndedAt
          ? GoogleCalendarService.calculateSessionDuration(
              appointment.startTime,
              updatedAppointment.meetingEndedAt
            )
          : 0,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Session ended successfully',
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error('End session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
