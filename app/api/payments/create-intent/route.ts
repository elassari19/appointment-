import { NextRequest, NextResponse } from 'next/server';
import { stripePaymentService } from '@/lib/services/stripe.service';
import { AuthService } from '@/lib/services/auth.service';
import { DatabaseService } from '@/lib/services/database.service';
import { AppDataSource } from '@/lib/database';
import { DoctorProfile } from '@/lib/entities/DoctorProfile';
import { User } from '@/lib/entities/User';
import { Appointment, AppointmentStatus } from '@/lib/entities/Appointment';
import { z } from 'zod';

const authService = new AuthService();

const createIntentSchema = z.object({
  doctorId: z.string().uuid('Invalid doctor ID'),
  startTime: z.string().datetime('Invalid start time'),
  duration: z.number().min(15).default(60),
  notes: z.string().optional(),
  createMeetLink: z.boolean().default(true),
});

async function getUserFromRequest(request: NextRequest): Promise<{ userId: string; email: string } | null> {
  const token = request.cookies.get('session_token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return null;
  }

  const user = await authService.getUserBySessionToken(token);
  if (!user) {
    return null;
  }

  return {
    userId: user.id,
    email: user.email,
  };
}

export async function POST(request: NextRequest) {
  try {
    await DatabaseService.initialize();

    const userResult = await getUserFromRequest(request);
    if (!userResult) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = createIntentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { doctorId, startTime, duration, notes, createMeetLink } = validationResult.data;

    const doctorProfileRepo = AppDataSource.getRepository(DoctorProfile);
    const doctorProfile = await doctorProfileRepo.findOne({
      where: { userId: doctorId },
    });

    if (!doctorProfile) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    const consultationFee = doctorProfile.consultationFee || 0;

    if (consultationFee <= 0) {
      return NextResponse.json({ error: 'Consultation fee not set for this doctor' }, { status: 400 });
    }

    const userRepo = AppDataSource.getRepository(User);
    const doctor = await userRepo.findOne({
      where: { id: doctorId },
    });

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor user not found' }, { status: 404 });
    }

    const appointmentRepo = AppDataSource.getRepository(Appointment);
    const appointment = appointmentRepo.create({
      patient: { id: userResult.userId } as User,
      doctor: { id: doctorId } as User,
      startTime: new Date(startTime),
      duration,
      status: AppointmentStatus.SCHEDULED,
      notes,
    });
    await appointmentRepo.save(appointment);

    const result = await stripePaymentService.createPaymentIntent({
      amount: consultationFee,
      appointmentId: appointment.id,
      patientId: userResult.userId,
      doctorId,
      doctorName: `${doctor.firstName} ${doctor.lastName}`,
      patientEmail: userResult.email,
      description: `Consultation with Dr. ${doctor.firstName} ${doctor.lastName}`,
    });

    return NextResponse.json({
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntentId,
      appointmentId: appointment.id,
      amount: consultationFee,
      currency: 'SAR',
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
