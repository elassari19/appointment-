import { NextRequest } from 'next/server';
import { AppointmentService, AppointmentFilters } from '@/lib/services/appointment.service';
import { DatabaseService } from '@/lib/services/database.service';
import { AuthService } from '@/lib/services/auth.service';
import { AppointmentStatus } from '@/lib/entities/Appointment';
import { User, UserRole } from '@/lib/entities/User';
import { AppDataSource } from '@/lib/database';
import { z } from 'zod';

const appointmentService = new AppointmentService();
const authService = new AuthService();

const createAppointmentSchema = z.object({
  doctorId: z.string().uuid('Invalid doctor ID'),
  startTime: z.string().datetime('Invalid start time'),
  duration: z.number().min(15, 'Duration must be at least 15 minutes'),
  notes: z.string().optional(),
});

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

  return { userId: user.id, role: String(user.role) };
}

async function isDoctor(userId: string): Promise<boolean> {
  const profile = await AppDataSource.query(
    'SELECT id FROM "DoctorProfiles" WHERE "userId" = $1',
    [userId]
  );
  return profile.length > 0;
}

export async function GET(request: NextRequest) {
  try {
    await DatabaseService.initialize();

    const userResult = await getUserFromRequest(request);
    if (!userResult) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as AppointmentStatus | null;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const filters: AppointmentFilters = {};

    if (status) {
      filters.status = status;
    }
    if (startDate) {
      filters.startDate = new Date(startDate);
    }
    if (endDate) {
      filters.endDate = new Date(endDate);
    }

    const userIsDoctor = await isDoctor(userResult.userId);

    if (userIsDoctor) {
      filters.doctorId = userResult.userId;
    } else {
      filters.patientId = userResult.userId;
    }

    const appointments = await appointmentService.getAppointments(filters);

    const formattedAppointments = appointments.map(apt => {
      const baseData = {
        id: apt.id,
        startTime: apt.startTime,
        duration: apt.duration,
        status: apt.status,
        notes: apt.notes,
        meetingLink: apt.meetingLink,
      };

      if (userIsDoctor) {
        return {
          ...baseData,
          patient: apt.patient ? {
            id: apt.patient.id,
            firstName: apt.patient.firstName,
            lastName: apt.patient.lastName,
            email: apt.patient.email,
            phone: apt.patient.phone,
            profilePicture: apt.patient.profilePicture,
          } : null,
        };
      }

      return {
        ...baseData,
        doctor: apt.doctor ? {
          id: apt.doctor.id,
          firstName: apt.doctor.firstName,
          lastName: apt.doctor.lastName,
          email: apt.doctor.email,
          phone: apt.doctor.phone,
          profilePicture: apt.doctor.profilePicture,
          bio: apt.doctor.bio,
          profile: apt.doctor.doctorProfile ? {
            specialty: apt.doctor.doctorProfile.specialty,
            subSpecialties: apt.doctor.doctorProfile.subSpecialties,
            yearsOfExperience: apt.doctor.doctorProfile.yearsOfExperience,
            medicalSchool: apt.doctor.doctorProfile.medicalSchool,
            residency: apt.doctor.doctorProfile.residency,
            fellowship: apt.doctor.doctorProfile.fellowship,
            boardCertifications: apt.doctor.doctorProfile.boardCertifications,
            clinicName: apt.doctor.doctorProfile.clinicName,
            clinicAddress: apt.doctor.doctorProfile.clinicAddress,
            clinicPhone: apt.doctor.doctorProfile.clinicPhone,
            consultationFee: apt.doctor.doctorProfile.consultationFee,
            telemedicineEnabled: apt.doctor.doctorProfile.telemedicineEnabled,
            acceptingNewPatients: apt.doctor.doctorProfile.acceptingNewPatients,
            professionalSummary: apt.doctor.doctorProfile.professionalSummary,
            education: apt.doctor.doctorProfile.education,
            languages: apt.doctor.doctorProfile.languages,
            awards: apt.doctor.doctorProfile.awards,
            professionalMemberships: apt.doctor.doctorProfile.professionalMemberships,
            websiteUrl: apt.doctor.doctorProfile.websiteUrl,
            linkedInUrl: apt.doctor.doctorProfile.linkedInUrl,
            twitterUrl: apt.doctor.doctorProfile.twitterUrl,
            instagramUrl: apt.doctor.doctorProfile.instagramUrl,
            totalPatients: apt.doctor.doctorProfile.totalPatients,
            totalAppointments: apt.doctor.doctorProfile.totalAppointments,
          } : null,
        } : null,
      };
    });

    return Response.json({ appointments: formattedAppointments });
  } catch (error) {
    console.error('Get appointments error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await DatabaseService.initialize();

    const userResult = await getUserFromRequest(request);
    if (!userResult) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = createAppointmentSchema.safeParse(body);

    if (!validationResult.success) {
      return Response.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { doctorId, startTime, duration, notes } = validationResult.data;

    const appointment = await appointmentService.createAppointment({
      patientId: userResult.userId,
      doctorId,
      startTime: new Date(startTime),
      duration,
      notes,
    });

    return Response.json({ appointment }, { status: 201 });
  } catch (error) {
    console.error('Create appointment error:', error);
    
    if (error instanceof Error && error.message.includes('not available')) {
      return Response.json({ error: error.message }, { status: 409 });
    }
    
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
