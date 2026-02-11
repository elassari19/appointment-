import { AppDataSource } from '@/lib/database';
import { User, UserRole } from '@/lib/entities/User';
import { Appointment, AppointmentStatus } from '@/lib/entities/Appointment';
import { Availability, DayOfWeek } from '@/lib/entities/Availability';

export interface CreateAppointmentData {
  patientId: string;
  dietitianId: string;
  startTime: Date;
  duration: number;
  notes?: string;
}

export interface AppointmentFilters {
  patientId?: string;
  dietitianId?: string;
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

  async createAppointment(data: CreateAppointmentData): Promise<Appointment> {
    const patient = await this.userRepository.findOne({
      where: { id: data.patientId, isActive: true },
    });

    if (!patient) {
      throw new Error('Patient not found');
    }

    const dietitian = await this.userRepository.findOne({
      where: { id: data.dietitianId, role: UserRole.DIETITIAN, isActive: true },
    });

    if (!dietitian) {
      throw new Error('Dietitian not found or not available');
    }

    const endTime = new Date(data.startTime);
    endTime.setMinutes(endTime.getMinutes() + data.duration);

    const conflicts = await this.checkAvailability(
      data.dietitianId,
      data.startTime,
      endTime
    );

    if (conflicts) {
      throw new Error('The selected time slot is not available');
    }

    const appointment = new Appointment();
    appointment.patient = patient;
    appointment.dietitian = dietitian;
    appointment.startTime = data.startTime;
    appointment.duration = data.duration;
    appointment.status = AppointmentStatus.SCHEDULED;
    appointment.notes = data.notes;

    return await this.appointmentRepository.save(appointment);
  }

  async getAppointmentById(id: string): Promise<Appointment | null> {
    return await this.appointmentRepository.findOne({
      where: { id },
      relations: ['patient', 'dietitian'],
    });
  }

  async getAppointments(filters: AppointmentFilters): Promise<Appointment[]> {
    const queryBuilder = this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .leftJoinAndSelect('appointment.dietitian', 'dietitian');

    if (filters.patientId) {
      queryBuilder.andWhere('appointment.patient_id = :patientId', { patientId: filters.patientId });
    }

    if (filters.dietitianId) {
      queryBuilder.andWhere('appointment.dietitian_id = :dietitianId', { dietitianId: filters.dietitianId });
    }

    if (filters.status) {
      queryBuilder.andWhere('appointment.status = :status', { status: filters.status });
    }

    if (filters.startDate) {
      queryBuilder.andWhere('appointment.start_time >= :startDate', { startDate: filters.startDate });
    }

    if (filters.endDate) {
      queryBuilder.andWhere('appointment.start_time <= :endDate', { endDate: filters.endDate });
    }

    queryBuilder.orderBy('appointment.start_time', 'ASC');

    return await queryBuilder.getMany();
  }

  async updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<Appointment | null> {
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

  async checkAvailability(
    dietitianId: string,
    startTime: Date,
    endTime: Date
  ): Promise<boolean> {
    const conflictingAppointment = await this.appointmentRepository.findOne({
      where: [
        {
          dietitian: { id: dietitianId },
          status: AppointmentStatus.SCHEDULED,
        },
        {
          dietitian: { id: dietitianId },
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
    dietitianId: string,
    date: Date,
    duration: number = 60
  ): Promise<{ start: Date; end: Date }[]> {
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as DayOfWeek;
    
    const availabilities = await this.availabilityRepository.find({
      where: {
        dietitian: { id: dietitianId },
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
        dietitian: { id: dietitianId },
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

  async getDietitians(filters?: { specialty?: string; search?: string }): Promise<User[]> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .where('user.role = :role', { role: UserRole.DIETITIAN })
      .andWhere('user.is_active = :isActive', { isActive: true });

    if (filters?.search) {
      queryBuilder.andWhere(
        '(user.first_name ILIKE :search OR user.last_name ILIKE :search OR user.email ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    return await queryBuilder.getMany();
  }
}
