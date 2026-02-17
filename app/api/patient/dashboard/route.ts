import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/services/database.service';
import { AuthService } from '@/lib/services/auth.service';
import { AppointmentService } from '@/lib/services/appointment.service';
import { AppointmentStatus } from '@/lib/entities/Appointment';

const authService = new AuthService();
const appointmentService = new AppointmentService();

async function getUserFromRequest(request: NextRequest): Promise<{ userId: string; role: string } | null> {
  const token = request.cookies.get('session_token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return null;
  }

  const user = await authService.getUserBySessionToken(token);
  if (!user) {
    return null;
  }

  return { userId: user.id, role: user.role };
}

export async function GET(request: NextRequest) {
  try {
    await DatabaseService.initialize();

    const userResult = await getUserFromRequest(request);
    if (!userResult) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const appointments = await appointmentService.getAppointments({
      patientId: userResult.userId,
    });

    const upcomingAppointments = appointments
      .filter(apt => 
        apt.status === AppointmentStatus.SCHEDULED || 
        apt.status === AppointmentStatus.CONFIRMED
      )
      .filter(apt => {
        const aptStart = new Date(apt.startTime);
        const aptEnd = new Date(aptStart.getTime() + apt.duration * 60000);
        return aptEnd > new Date();
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 5);

    const completedAppointments = appointments
      .filter(apt => apt.status === AppointmentStatus.COMPLETED)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    const nextAppointment = upcomingAppointments[0] || null;

    const stats = {
      upcomingCount: upcomingAppointments.length,
      completedCount: completedAppointments.length,
      cancelledCount: appointments.filter(apt => apt.status === AppointmentStatus.CANCELLED).length,
      totalReports: completedAppointments.length,
    };

    return NextResponse.json({
      nextAppointment: nextAppointment ? {
        id: nextAppointment.id,
        specialty: nextAppointment.doctor?.specialty || 'General',
        date: nextAppointment.startTime,
        formattedDate: new Date(nextAppointment.startTime).toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
        }),
        formattedTime: new Date(nextAppointment.startTime).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        }),
        doctorName: nextAppointment.doctor 
          ? `Dr. ${nextAppointment.doctor.firstName} ${nextAppointment.doctor.lastName}`
          : 'Doctor',
        doctorInitials: nextAppointment.doctor
          ? `${nextAppointment.doctor.firstName.charAt(0)}${nextAppointment.doctor.lastName.charAt(0)}`.toUpperCase()
          : 'DR',
        description: nextAppointment.notes || 'Appointment scheduled',
        type: 'Video Call',
        duration: `${nextAppointment.duration} Minutes`,
        meetingUrl: nextAppointment.meetingLink || null,
      } : null,
      upcomingAppointments: upcomingAppointments.map(apt => ({
        id: apt.id,
        date: apt.startTime,
        formattedDate: new Date(apt.startTime).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        formattedTime: new Date(apt.startTime).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        }),
        doctorName: apt.doctor 
          ? `Dr. ${apt.doctor.firstName} ${apt.doctor.lastName}`
          : 'Doctor',
        specialty: apt.doctor?.specialty || 'General',
        status: apt.status,
        type: apt.duration >= 60 ? 'In-Person' : 'Video Call',
      })),
      medicalHistory: completedAppointments.slice(0, 10).map(apt => ({
        id: apt.id,
        date: apt.startTime,
        formattedDate: new Date(apt.startTime).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        formattedTime: new Date(apt.startTime).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        }),
        doctor: apt.doctor 
          ? `Dr. ${apt.doctor.firstName} ${apt.doctor.lastName}`
          : 'Doctor',
        specialty: apt.doctor?.specialty || 'General Physician',
        type: apt.duration >= 60 ? 'In-Person' : 'Video Call',
        status: apt.status.charAt(0).toUpperCase() + apt.status.slice(1).toLowerCase(),
        hasReport: apt.status === AppointmentStatus.COMPLETED,
        hasLab: false,
        initials: apt.doctor
          ? `${apt.doctor.firstName.charAt(0)}${apt.doctor.lastName.charAt(0)}`.toUpperCase()
          : 'DR',
      })),
      stats,
    });
  } catch (error) {
    console.error('Patient dashboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
