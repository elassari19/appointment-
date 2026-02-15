import { NextRequest } from 'next/server';
import { AppointmentService, AppointmentFilters } from '@/lib/services/appointment.service';
import { DatabaseService } from '@/lib/services/database.service';
import { AuthService } from '@/lib/services/auth.service';
import { AppointmentStatus } from '@/lib/entities/Appointment';
import { getServerUser, UserRole } from '@/lib/middleware/role-protection';

const appointmentService = new AppointmentService();
const authService = new AuthService();

export async function GET(request: NextRequest) {
  try {
    await DatabaseService.initialize();

    const user = await getServerUser();
    if (!user || !['admin', 'doctor'].includes(user.role)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const filters: AppointmentFilters = {};

    let appointments = await appointmentService.getAppointments(filters);

    const formattedAppointments = appointments.map(apt => ({
      id: apt.id,
      startTime: apt.startTime,
      duration: apt.duration,
      status: apt.status,
      notes: apt.notes,
      meetingLink: apt.meetingLink,
      cancellationReason: apt.cancellationReason,
      createdAt: apt.createdAt,
      patient: apt.patient ? {
        id: apt.patient.id,
        firstName: apt.patient.firstName,
        lastName: apt.patient.lastName,
        email: apt.patient.email,
        phone: apt.patient.phone,
        profilePicture: apt.patient.profilePicture,
      } : null,
      doctor: apt.doctor ? {
        id: apt.doctor.id,
        firstName: apt.doctor.firstName,
        lastName: apt.doctor.lastName,
        email: apt.doctor.email,
        phone: apt.doctor.phone,
        profilePicture: apt.doctor.profilePicture,
      } : null,
    }));

    const stats = {
      total: appointments.length,
      confirmed: appointments.filter(a => a.status === AppointmentStatus.CONFIRMED).length,
      pending: appointments.filter(a => a.status === AppointmentStatus.SCHEDULED).length,
      cancelled: appointments.filter(a => a.status === AppointmentStatus.CANCELLED).length,
      completed: appointments.filter(a => a.status === AppointmentStatus.COMPLETED).length,
    };

    return Response.json({ 
      appointments: formattedAppointments,
      stats 
    });
  } catch (error) {
    console.error('Get admin appointments error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
