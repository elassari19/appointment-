import { NextRequest } from 'next/server';
import { DatabaseService } from '@/lib/services/database.service';
import { getServerUser, UserRole } from '@/lib/middleware/role-protection';
import { AppDataSource } from '@/lib/database';
import { User, UserRole as UserRoleEnum } from '@/lib/entities/User';
import { Appointment, AppointmentStatus } from '@/lib/entities/Appointment';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await DatabaseService.initialize();

    const user = await getServerUser();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const patientId = id.includes('PT-') ? id.replace('PT-', '').slice(0, 36) : id;

    const patientQuery = `
      SELECT u.id, u."firstName", u."lastName", u.email, u.phone, u."dateOfBirth", 
             u."profilePicture", u."isActive", u."createdAt", u."updatedAt",
             u.weight, u.height, u."bloodType"
      FROM "Users" u
      WHERE u.id = $1 AND u.role = $2
    `;
    const patientResult = await AppDataSource.query(patientQuery, [patientId, UserRoleEnum.PATIENT]);

    if (patientResult.length === 0) {
      return Response.json({ error: 'Patient not found' }, { status: 404 });
    }

    const patient: any = patientResult[0];

    const appointmentsQuery = `
      SELECT a.id, a."startTime", a."duration", a.status, a.notes, a."meetingLink",
             d.id as "doctorId", d."firstName" as "doctorFirstName", d."lastName" as "doctorLastName",
             d.email as "doctorEmail", d."profilePicture" as "doctorProfilePicture"
      FROM "Appointments" a
      JOIN "Users" d ON a."doctorId" = d.id
      WHERE a."patientId" = $1
      ORDER BY a."startTime" DESC
    `;
    const appointmentsResult = await AppDataSource.query(appointmentsQuery, [patientId]);

    const now = new Date();
    
    const upcomingAppointments = appointmentsResult
      .filter((apt: any) => new Date(apt.startTime) >= now && apt.status !== AppointmentStatus.CANCELLED)
      .slice(0, 5)
      .map((apt: any, index: number) => ({
        id: apt.id,
        type: 'Appointment',
        title: `Appointment with Dr. ${apt.doctorFirstName} ${apt.doctorLastName}`,
        doctor: `Dr. ${apt.doctorFirstName} ${apt.doctorLastName}`,
        doctorAvatar: apt.doctorProfilePicture,
        status: apt.status,
        time: formatAppointmentTime(apt.startTime),
        isPrimary: index === 0,
      }));

    const historyAppointments = appointmentsResult
      .filter((apt: any) => new Date(apt.startTime) < now || apt.status === AppointmentStatus.COMPLETED || apt.status === AppointmentStatus.CANCELLED)
      .slice(0, 10)
      .map((apt: any) => ({
        id: apt.id,
        type: 'Appointment',
        title: `Appointment with Dr. ${apt.doctorFirstName} ${apt.doctorLastName}`,
        doctor: `Dr. ${apt.doctorFirstName} ${apt.doctorLastName}`,
        doctorAvatar: apt.doctorProfilePicture,
        status: apt.status,
        time: new Date(apt.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        isPrimary: false,
      }));

    function formatAppointmentTime(startTime: string): string {
      const aptDate = new Date(startTime);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      if (aptDate.toDateString() === today.toDateString()) {
        return `Today, ${aptDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
      } else if (aptDate.toDateString() === tomorrow.toDateString()) {
        return `Tomorrow, ${aptDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
      } else {
        return aptDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
      }
    }

    const age = patient.dateOfBirth 
      ? Math.floor((new Date().getTime() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : null;

    return Response.json({
      patient: {
        id: `PT-${patient.id.slice(0, 4).toUpperCase()}`,
        patientId: patient.id,
        name: `${patient.firstName} ${patient.lastName}`,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        phone: patient.phone || '',
        age,
        dateOfBirth: patient.dateOfBirth,
        gender: null,
        status: patient.isActive ? 'Active' : 'Inactive',
        lastVisit: patient.updatedAt ? new Date(patient.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null,
        createdAt: patient.createdAt,
        avatar: patient.profilePicture || null,
        weight: patient.weight ? `${patient.weight} kg` : null,
        height: patient.height ? `${patient.height} cm` : null,
        bloodType: patient.bloodType || null,
        upcomingAppointments,
        historyAppointments,
        notes: [],
      }
    });
  } catch (error) {
    console.error('Get patient details error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
