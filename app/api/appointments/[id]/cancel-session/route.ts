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
    const body = await request.json();
    const cancellationReason = body.reason || 'Session cancelled by user';

    const appointment = await AppDataSource.getRepository(Appointment).findOne({
      where: { id, status: AppointmentStatus.CONFIRMED },
      relations: ['patient', 'doctor'],
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found or not confirmed' }, { status: 404 });
    }

    await AppDataSource.getRepository(Appointment).update(id, {
      status: AppointmentStatus.CANCELLED,
      cancelledAt: new Date(),
      cancellationReason,
      meetingPhase: MeetingPhase.POST_SESSION,
      meetingEndedAt: new Date(),
      wasCancelledFromSession: true,
    });

    const updatedAppointment = await AppDataSource.getRepository(Appointment).findOne({
      where: { id },
    });

    const auditService = new AuditService();
    await auditService.log({
      userId: appointment.doctor.id,
      action: AuditAction.SESSION_CANCELLED,
      resourceType: 'Appointment',
      resourceId: id,
      description: `Session cancelled: ${cancellationReason}`,
      oldValues: { status: appointment.status },
      newValues: { status: AppointmentStatus.CANCELLED, cancelledAt: new Date() },
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
