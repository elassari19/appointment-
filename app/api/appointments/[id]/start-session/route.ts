import { NextRequest, NextResponse } from 'next/server';
import { AppDataSource } from '@/lib/database';
import { Appointment, AppointmentStatus } from '@/lib/entities/Appointment';
import { User } from '@/lib/entities/User';
import { MeetingPhase } from '@/lib/services/google-calendar.service';
import { AuditService, AuditAction } from '@/lib/services/audit.service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const appointment = await AppDataSource.getRepository(Appointment).findOne({
      where: { id, status: AppointmentStatus.CONFIRMED },
      relations: ['patient', 'doctor'],
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found or not confirmed' }, { status: 404 });
    }

    if (appointment.meetingPhase !== MeetingPhase.PRE_SESSION) {
      return NextResponse.json(
        { error: `Cannot start session in ${appointment.meetingPhase} phase` },
        { status: 400 }
      );
    }

    const now = new Date();
    const endTime = new Date(appointment.startTime);
    endTime.setMinutes(endTime.getMinutes() + appointment.duration);

    await AppDataSource.getRepository(Appointment).update(id, {
      meetingPhase: MeetingPhase.ACTIVE_SESSION,
      meetingStartedAt: now,
    });

    const updatedAppointment = await AppDataSource.getRepository(Appointment).findOne({
      where: { id },
    });

    const auditService = new AuditService();
    await auditService.log({
      userId: appointment.doctor.id,
      action: AuditAction.SESSION_STARTED,
      resourceType: 'Appointment',
      resourceId: id,
      description: `Session started for appointment with ${appointment.patient.email}`,
      oldValues: { meetingPhase: appointment.meetingPhase },
      newValues: { meetingPhase: MeetingPhase.ACTIVE_SESSION },
    });

    return NextResponse.json({
      success: true,
      message: 'Session started successfully',
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error('Start session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
