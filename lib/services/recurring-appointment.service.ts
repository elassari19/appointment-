import { AppDataSource } from '@/lib/database';
import { User } from '@/lib/entities/User';
import { Appointment, AppointmentStatus, RecurrenceFrequency } from '@/lib/entities/Appointment';
import crypto from 'crypto';

export interface RecurringAppointmentData {
  patientId: string;
  dietitianId: string;
  startTime: Date;
  duration: number;
  notes?: string;
  recurrenceFrequency: RecurrenceFrequency;
  recurrenceCount?: number;
  recurrenceEndDate?: Date;
}

export interface RecurringInstance {
  appointment: Appointment;
  isModified: boolean;
  originalAppointmentId?: string;
}

export class RecurringAppointmentService {
  private get appointmentRepository() {
    return AppDataSource.getRepository(Appointment);
  }

  private get userRepository() {
    return AppDataSource.getRepository(User);
  }

  async createRecurringSeries(data: RecurringAppointmentData): Promise<Appointment[]> {
    const patient = await this.userRepository.findOne({
      where: { id: data.patientId, isActive: true },
    });

    if (!patient) {
      throw new Error('Patient not found');
    }

    const dietitian = await this.userRepository.findOne({
      where: { id: data.dietitianId, role: 'dietitian' as any, isActive: true },
    });

    if (!dietitian) {
      throw new Error('Dietitian not found');
    }

    const seriesId = crypto.randomUUID();
    const appointments: Appointment[] = [];
    let currentDate = new Date(data.startTime);
    let count = 0;
    const maxIterations = data.recurrenceCount || 52;

    while (count < maxIterations) {
      const endTime = new Date(currentDate);
      endTime.setMinutes(endTime.getMinutes() + data.duration);

      const appointment = new Appointment();
      appointment.patient = patient;
      appointment.dietitian = dietitian;
      appointment.startTime = new Date(currentDate);
      appointment.duration = data.duration;
      appointment.status = AppointmentStatus.SCHEDULED;
      appointment.notes = data.notes;
      appointment.isRecurring = true;
      appointment.recurrenceFrequency = data.recurrenceFrequency;
      appointment.recurringSeriesId = seriesId;
      appointment.recurrencePosition = count + 1;

      if (data.recurrenceEndDate && currentDate > data.recurrenceEndDate) {
        break;
      }

      appointments.push(await this.appointmentRepository.save(appointment));
      count++;

      currentDate = this.getNextRecurrenceDate(currentDate, data.recurrenceFrequency);
    }

    return appointments;
  }

  private getNextRecurrenceDate(date: Date, frequency: RecurrenceFrequency): Date {
    const nextDate = new Date(date);

    switch (frequency) {
      case RecurrenceFrequency.DAILY:
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case RecurrenceFrequency.WEEKLY:
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case RecurrenceFrequency.BIWEEKLY:
        nextDate.setDate(nextDate.getDate() + 14);
        break;
      case RecurrenceFrequency.MONTHLY:
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
    }

    return nextDate;
  }

  async getRecurringSeries(seriesId: string): Promise<Appointment[]> {
    return await this.appointmentRepository.find({
      where: { recurringSeriesId: seriesId },
      order: { startTime: 'ASC' },
    });
  }

  async cancelRecurringSeries(
    seriesId: string,
    reason?: string,
    cancelFromInstance?: number
  ): Promise<Appointment[]> {
    const appointments = await this.getRecurringSeries(seriesId);
    const updatedAppointments: Appointment[] = [];

    for (const apt of appointments) {
      if (cancelFromInstance && apt.recurrencePosition! < cancelFromInstance) {
        continue;
      }

      apt.status = AppointmentStatus.CANCELLED;
      apt.cancelledAt = new Date();
      apt.cancellationReason = reason;

      updatedAppointments.push(await this.appointmentRepository.save(apt));
    }

    return updatedAppointments;
  }

  async updateRecurringAppointment(
    appointmentId: string,
    updates: Partial<Appointment>,
    updateAllFollowing: boolean = false
  ): Promise<Appointment | null> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
    });

    if (!appointment) {
      return null;
    }

    if (!appointment.isRecurring || !appointment.recurringSeriesId) {
      return await this.appointmentRepository.save({ ...appointment, ...updates });
    }

    const updatedAppointment = await this.appointmentRepository.save({
      ...appointment,
      ...updates,
      isRecurring: false,
      recurringSeriesId: undefined,
    });

    if (updateAllFollowing) {
      const followingAppointments = await this.appointmentRepository
        .createQueryBuilder('appointment')
        .where('appointment.recurring_series_id = :seriesId', {
          seriesId: appointment.recurringSeriesId,
        })
        .andWhere('appointment.start_time > :startTime', {
          startTime: appointment.startTime,
        })
        .andWhere('appointment.id != :id', { id: appointmentId })
        .orderBy('appointment.start_time', 'ASC')
        .getMany();

      for (const apt of followingAppointments) {
        if (updates.startTime) {
          const timeDiff = updates.startTime.getTime() - appointment.startTime.getTime();
          apt.startTime = new Date(apt.startTime.getTime() + timeDiff);
        }
        if (updates.duration) {
          apt.duration = updates.duration;
        }
        if (updates.notes !== undefined) {
          apt.notes = updates.notes;
        }

        await this.appointmentRepository.save(apt);
      }
    }

    return updatedAppointment;
  }

  async getUpcomingRecurringAppointments(userId: string): Promise<Appointment[]> {
    return await this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .leftJoinAndSelect('appointment.dietitian', 'dietitian')
      .where('(appointment.patient_id = :userId OR appointment.dietitian_id = :userId)', {
        userId,
      })
      .andWhere('appointment.is_recurring = :isRecurring', { isRecurring: true })
      .andWhere('appointment.status IN (:...statuses)', {
        statuses: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED],
      })
      .andWhere('appointment.start_time >= :now', { now: new Date() })
      .orderBy('appointment.start_time', 'ASC')
      .getMany();
  }

  async getRecurringPatternSummary(seriesId: string): Promise<{
    frequency: RecurrenceFrequency;
    totalCount: number;
    completedCount: number;
    cancelledCount: number;
    upcomingCount: number;
    firstAppointment: Date;
    lastAppointment: Date;
  } | null> {
    const appointments = await this.getRecurringSeries(seriesId);

    if (appointments.length === 0) {
      return null;
    }

    const sorted = [...appointments].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    return {
      frequency: appointments[0].recurrenceFrequency!,
      totalCount: appointments.length,
      completedCount: appointments.filter((a) => a.status === AppointmentStatus.COMPLETED).length,
      cancelledCount: appointments.filter((a) => a.status === AppointmentStatus.CANCELLED).length,
      upcomingCount: appointments.filter(
        (a) =>
          a.status === AppointmentStatus.SCHEDULED ||
          a.status === AppointmentStatus.CONFIRMED
      ).length,
      firstAppointment: sorted[0].startTime,
      lastAppointment: sorted[sorted.length - 1].startTime,
    };
  }
}
