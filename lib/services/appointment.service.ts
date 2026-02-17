import { AppDataSource } from '@/lib/database';
import { User, UserRole } from '@/lib/entities/User';
import { Appointment, AppointmentStatus } from '@/lib/entities/Appointment';
import { Availability, DayOfWeek } from '@/lib/entities/Availability';
import { GoogleMeetService } from './google-meet.service';

export interface CreateAppointmentData {
  patientId: string;
  doctorId: string;
  startTime: Date;
  duration: number;
  notes?: string;
}

export interface CreateAppointmentWithMeetData extends CreateAppointmentData {
  googleAccessToken: string;
  googleRefreshToken?: string;
}

export interface AppointmentResult {
  appointment: Appointment;
  meetingLink?: string;
  calendarEventId?: string;
}

export interface AppointmentFilters {
  patientId?: string;
  doctorId?: string;
  status?: AppointmentStatus;
  startDate?: Date;
  endDate?: Date;
}

export class AppointmentService {
  private get appointmentRepository() {
    return AppDataSource.getRepository(Appointment);
  }

  private get userRepository() {
    return AppDataSource.getRepository(User);
  }

  private get availabilityRepository() {
    return AppDataSource.getRepository(Availability);
  }

  async createAppointment(data: CreateAppointmentData): Promise<AppointmentResult> {
    const patient = await this.userRepository.findOne({
      where: { id: data.patientId, isActive: true },
    });

    if (!patient) {
      throw new Error('Patient not found');
    }

    const doctor = await this.userRepository.findOne({
      where: { id: data.doctorId, role: UserRole.DOCTOR, isActive: true },
    });

    if (!doctor) {
      throw new Error('Dietitian not found or not available');
    }

    const endTime = new Date(data.startTime);
    endTime.setMinutes(endTime.getMinutes() + data.duration);

    const conflicts = await this.checkAvailability(
      data.doctorId,
      data.startTime,
      endTime
    );

    if (conflicts) {
      throw new Error('The selected time slot is not available');
    }

    const appointment = new Appointment();
    appointment.patient = patient;
    appointment.doctor = doctor;
    appointment.startTime = data.startTime;
    appointment.duration = data.duration;
    appointment.status = AppointmentStatus.SCHEDULED;
    appointment.notes = data.notes;

    const savedAppointment = await this.appointmentRepository.save(appointment);

    return {
      appointment: savedAppointment,
    };
  }

  async createAppointmentWithMeet(data: CreateAppointmentWithMeetData): Promise<AppointmentResult> {
    const patient = await this.userRepository.findOne({
      where: { id: data.patientId, isActive: true },
    });

    if (!patient) {
      throw new Error('Patient not found');
    }

    const doctor = await this.userRepository.findOne({
      where: { id: data.doctorId, role: UserRole.DOCTOR, isActive: true },
    });

    if (!doctor) {
      throw new Error('Dietitian not found or not available');
    }

    const endTime = new Date(data.startTime);
    endTime.setMinutes(endTime.getMinutes() + data.duration);

    const conflicts = await this.checkAvailability(
      data.doctorId,
      data.startTime,
      endTime
    );

    if (conflicts) {
      throw new Error('The selected time slot is not available');
    }

    const appointment = new Appointment();
    appointment.patient = patient;
    appointment.doctor = doctor;
    appointment.startTime = data.startTime;
    appointment.duration = data.duration;
    appointment.status = AppointmentStatus.SCHEDULED;
    appointment.notes = data.notes;

    const savedAppointment = await this.appointmentRepository.save(appointment);

    let meetingLink: string | undefined;
    let calendarEventId: string | undefined;

    try {
      const meetService = new GoogleMeetService();

      const meetResult = await meetService.createMeetMeeting({
        appointment: savedAppointment,
        patient,
        dietitian: doctor,
        accessToken: data.googleAccessToken,
        refreshToken: data.googleRefreshToken,
      });

      if (meetResult.success && meetResult.meetingLink) {
        meetingLink = meetResult.meetingLink;
        calendarEventId = meetResult.eventId;

        savedAppointment.meetingLink = meetingLink;
        if (calendarEventId) {
          (savedAppointment as any).calendarEventId = calendarEventId;
        }

        await this.appointmentRepository.save(savedAppointment);
      } else {
        const meetingCode = Math.random().toString(36).substring(2, 12);
        const fallbackLink = `https://meet.jit.si/appointment-${meetingCode}`;
        savedAppointment.meetingLink = fallbackLink;
        await this.appointmentRepository.save(savedAppointment);
        meetingLink = fallbackLink;
      }
    } catch (error) {
      console.error('Failed to create Google Meet meeting:', error);
      try {
        const fallbackLink = `https://meet.google.com/${Math.random().toString(36).substring(2, 11)}`;
        savedAppointment.meetingLink = fallbackLink;
        await this.appointmentRepository.save(savedAppointment);
        meetingLink = fallbackLink;
      } catch (saveError) {
        console.error('Failed to save fallback meeting link:', saveError);
      }
    }

    return {
      appointment: savedAppointment,
      meetingLink,
      calendarEventId,
    };
  }

  async getAppointmentById(id: string): Promise<Appointment | null> {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return null;
    }

    return await this.appointmentRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor'],
    });
  }

  async getAppointments(filters: AppointmentFilters): Promise<Appointment[]> {
    const queryBuilder = this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .leftJoinAndSelect('appointment.doctor', 'doctor')
      .leftJoinAndSelect('doctor.doctorProfile', 'doctorProfile');

    if (filters.patientId) {
      queryBuilder.andWhere('appointment.patientId = :patientId', { patientId: filters.patientId });
    }

    if (filters.doctorId) {
      queryBuilder.andWhere('appointment.doctorId = :doctorId', { doctorId: filters.doctorId });
    }

    if (filters.status) {
      queryBuilder.andWhere('appointment.status = :status', { status: filters.status });
    }

    if (filters.startDate) {
      queryBuilder.andWhere('appointment.startTime >= :startDate', { startDate: filters.startDate });
    }

    if (filters.endDate) {
      queryBuilder.andWhere('appointment.startTime <= :endDate', { endDate: filters.endDate });
    }

    queryBuilder.orderBy('appointment.startTime', 'ASC');

    return await queryBuilder.getMany();
  }

  async updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<Appointment | null> {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return null;
    }

    const appointment = await this.appointmentRepository.findOne({
      where: { id },
    });

    if (!appointment) {
      return null;
    }

    appointment.status = status;

    if (status === AppointmentStatus.CONFIRMED) {
      appointment.confirmedAt = new Date();
    }

    if (status === AppointmentStatus.CANCELLED) {
      appointment.cancelledAt = new Date();
    }

    return await this.appointmentRepository.save(appointment);
  }

  async cancelAppointment(id: string, reason?: string): Promise<Appointment | null> {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return null;
    }

    const appointment = await this.appointmentRepository.findOne({
      where: { id },
    });

    if (!appointment) {
      return null;
    }

    appointment.status = AppointmentStatus.CANCELLED;
    appointment.cancelledAt = new Date();
    appointment.cancellationReason = reason;

    return await this.appointmentRepository.save(appointment);
  }

  async rescheduleAppointment(id: string, newStartTime: Date, newDuration?: number): Promise<Appointment | null> {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return null;
    }

    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['doctor'],
    });

    if (!appointment) {
      return null;
    }

    const newEndTime = new Date(newStartTime);
    newEndTime.setMinutes(newEndTime.getMinutes() + (newDuration || appointment.duration));

    const hasConflict = await this.checkAvailability(
      appointment.doctor.id,
      newStartTime,
      newEndTime
    );

    if (hasConflict) {
      throw new Error('The selected time slot is not available');
    }

    appointment.startTime = newStartTime;
    if (newDuration) {
      appointment.duration = newDuration;
    }

    return await this.appointmentRepository.save(appointment);
  }

  async checkAvailability(
    doctorId: string,
    startTime: Date,
    endTime: Date
  ): Promise<boolean> {
    const conflictingAppointment = await this.appointmentRepository.findOne({
      where: [
        {
          doctor: { id: doctorId },
          status: AppointmentStatus.SCHEDULED,
        },
        {
          doctor: { id: doctorId },
          status: AppointmentStatus.CONFIRMED,
        },
      ],
    });

    if (conflictingAppointment) {
      const existingEnd = new Date(conflictingAppointment.startTime);
      existingEnd.setMinutes(existingEnd.getMinutes() + conflictingAppointment.duration);

      if (
        (startTime >= conflictingAppointment.startTime && startTime < existingEnd) ||
        (endTime > conflictingAppointment.startTime && endTime <= existingEnd) ||
        (startTime <= conflictingAppointment.startTime && endTime >= existingEnd)
      ) {
        return true;
      }
    }

    return false;
  }

  async getAvailableSlots(
    doctorId: string,
    date: Date,
    duration: number = 60
  ): Promise<{ start: Date; end: Date }[]> {
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as DayOfWeek;
    
    const availabilities = await this.availabilityRepository.find({
      where: {
        doctor: { id: doctorId },
        dayOfWeek,
        isAvailable: true,
      },
    });

    if (availabilities.length === 0) {
      return [];
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await this.appointmentRepository.find({
      where: {
        doctor: { id: doctorId },
        startTime: startOfDay,
      },
    });

    const availableSlots: { start: Date; end: Date }[] = [];

    for (const availability of availabilities) {
      const [availabilityStartHour, availabilityStartMin] = availability.startTime.split(':').map(Number);
      const [availabilityEndHour, availabilityEndMin] = availability.endTime.split(':').map(Number);

      const slotStart = new Date(date);
      slotStart.setHours(availabilityStartHour, availabilityStartMin, 0, 0);

      const slotEnd = new Date(date);
      slotEnd.setHours(availabilityEndHour, availabilityEndMin, 0, 0);

      while (slotStart < slotEnd) {
        const slotTimeEnd = new Date(slotStart);
        slotTimeEnd.setMinutes(slotTimeEnd.getMinutes() + duration);

        if (slotTimeEnd > slotEnd) {
          break;
        }

        const isBooked = existingAppointments.some((apt) => {
          const aptEnd = new Date(apt.startTime);
          aptEnd.setMinutes(aptEnd.getMinutes() + apt.duration);

          return (
            (slotStart >= apt.startTime && slotStart < aptEnd) ||
            (slotTimeEnd > apt.startTime && slotTimeEnd <= aptEnd)
          );
        });

        if (!isBooked && slotStart > new Date()) {
          availableSlots.push({
            start: new Date(slotStart),
            end: new Date(slotTimeEnd),
          });
        }

        slotStart.setMinutes(slotStart.getMinutes() + duration);
      }
    }

    return availableSlots;
  }

  async getDoctors(filters?: { specialty?: string; search?: string }): Promise<User[]> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.doctorProfile', 'doctorProfile')
      .where('user.role = :role', { role: UserRole.DOCTOR })
      .andWhere('user.isActive = :isActive', { isActive: true });

    if (filters?.search) {
      queryBuilder.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    if (filters?.specialty) {
      queryBuilder.andWhere('doctorProfile.specialty ILIKE :specialty', { specialty: `%${filters.specialty}%` });
    }

    return await queryBuilder.getMany();
  }

  async getAppointmentsByDoctorNameOrSpecialty(
    patientId: string,
    doctorName?: string,
    specialty?: string
  ): Promise<Appointment[]> {
    const queryBuilder = this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .leftJoinAndSelect('appointment.doctor', 'doctor')
      .leftJoin('doctor.doctorProfile', 'doctorProfile')
      .where('appointment.patientId = :patientId', { patientId });

    if (doctorName) {
      queryBuilder.andWhere(
        '(doctor.firstName ILIKE :doctorName OR doctor.lastName ILIKE :doctorName)',
        { doctorName: `%${doctorName}%` }
      );
    }

    if (specialty) {
      queryBuilder.andWhere('doctorProfile.specialty ILIKE :specialty', { specialty: `%${specialty}%` });
    }

    queryBuilder.orderBy('appointment.startTime', 'DESC');

    return await queryBuilder.getMany();
  }
}
