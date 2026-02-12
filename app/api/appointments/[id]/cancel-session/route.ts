import { NextRequest, NextResponse } from 'next/server';
import { AppDataSource } from '@/lib/database';
import { Appointment, AppointmentStatus } from '@/lib/entities/Appointment';
import { User } from '@/lib/entities/User';
import { MeetingPhase } from '@/lib/services/google-calendar.service';
import { AuditService } from '@/lib/services/audit.service';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const cancellationReason = body.reason || 'Session cancelled by user';

    const appointment = await AppDataSource.getRepository(Appointment).findOne({
      where: { id: params.id, status: AppointmentStatus.CONFIRMED },
      relations: ['patient', 'doctor'],
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found or not confirmed' }, { status: 404 });
    }

    await AppDataSource.getRepository(Appointment).update(params.id, {
      status: AppointmentStatus.CANCELLED,
      cancelledAt: new Date(),
      cancellationReason,
      meetingPhase: MeetingPhase.POST_SESSION,
      meetingEndedAt: new Date(),
      wasCancelledFromSession: true,
    });

    const updatedAppointment = await AppDataSource.getRepository(Appointment).findOne({
      where: { id: params.id },
    });

    const auditService = new AuditService();
    await auditService.log({
      userId: appointment.doctor.id,
      action: 'session_cancelled',
      entityType: 'Appointment',
      entityId: params.id,
      details: {
        appointmentId: params.id,
        reason: cancellationReason,
        startTime: appointment.startTime,
        cancelledAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Session cancelled successfully',
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error('Cancel session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
