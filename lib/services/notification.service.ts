import { AppDataSource } from '@/lib/database';
import { User, UserRole } from '@/lib/entities/User';
import { Appointment } from '@/lib/entities/Appointment';
import { Notification, NotificationType } from '@/lib/entities/Notification';
import { NotificationPreference } from '@/lib/entities/NotificationPreference';
import { emailService } from './email.service';
import { notificationWebSocketService } from './notification-websocket.service';

export { NotificationType };

export interface NotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

export class NotificationService {
  private get notificationRepository() {
    return AppDataSource.getRepository(Notification);
  }

  private get preferenceRepository() {
    return AppDataSource.getRepository(NotificationPreference);
  }

  private get userRepository() {
    return AppDataSource.getRepository(User);
  }

  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    metadata?: Record<string, any>,
    sendRealTime: boolean = true
  ): Promise<Notification> {
    const notification = new Notification();
    notification.userId = userId;
    notification.type = type;
    notification.title = title;
    notification.message = message;
    notification.metadata = metadata;

    const savedNotification = await this.notificationRepository.save(notification);

    if (sendRealTime) {
      notificationWebSocketService.sendRealTimeNotification(userId, savedNotification);
    }

    return savedNotification;
  }

  async sendAppointmentConfirmation(appointment: Appointment): Promise<void> {
    const patient = appointment.patient as User;
    const doctor = appointment.doctor as User;

    await this.createNotification(
      patient.id,
      NotificationType.APPOINTMENT_CONFIRMATION,
      'Appointment Confirmed',
      `Your appointment with ${doctor.firstName} ${doctor.lastName} has been confirmed for ${this.formatDateTime(appointment.startTime)}.`,
      {
        appointmentId: appointment.id,
        startTime: appointment.startTime,
        doctorId: doctor.id,
      }
    );

    await this.createNotification(
      doctor.id,
      NotificationType.APPOINTMENT_CONFIRMATION,
      'New Appointment',
      `New appointment scheduled with ${patient.firstName} ${patient.lastName} on ${this.formatDateTime(appointment.startTime)}.`,
      {
        appointmentId: appointment.id,
        startTime: appointment.startTime,
        patientId: patient.id,
      }
    );

    await this.notifyAdminNewAppointment(appointment, patient, doctor);

    try {
      await emailService.sendAppointmentConfirmation({
        to: patient.email,
        patientName: `${patient.firstName} ${patient.lastName}`,
        doctorName: `${doctor.firstName} ${doctor.lastName}`,
        appointmentDate: appointment.startTime,
        duration: appointment.duration,
        meetingLink: appointment.meetingLink || undefined,
        notes: appointment.notes || undefined,
      });

      await emailService.sendDoctorAppointmentNotification({
        to: doctor.email,
        doctorName: `${doctor.firstName} ${doctor.lastName}`,
        patientName: `${patient.firstName} ${patient.lastName}`,
        appointmentDate: appointment.startTime,
        duration: appointment.duration,
        meetingLink: appointment.meetingLink || undefined,
        notes: appointment.notes || undefined,
        action: 'created',
      });
    } catch (emailError) {
      console.error('Failed to send appointment confirmation email:', emailError);
    }
  }

  async sendAppointmentReminder(appointment: Appointment, hoursBefore: number): Promise<void> {
    const patient = appointment.patient as User;
    const doctor = appointment.doctor as User;

    await this.createNotification(
      patient.id,
      NotificationType.APPOINTMENT_REMINDER,
      'Appointment Reminder',
      `Reminder: Your appointment with ${doctor.firstName} ${doctor.lastName} is in ${hoursBefore} hours.`,
      {
        appointmentId: appointment.id,
        startTime: appointment.startTime,
        hoursBefore,
      }
    );
  }

  async sendCancellationNotice(
    appointment: Appointment,
    reason?: string
  ): Promise<void> {
    const patient = appointment.patient as User;
    const doctor = appointment.doctor as User;

    const patientMessage = `Your appointment with ${doctor.firstName} ${doctor.lastName} on ${this.formatDateTime(appointment.startTime)} has been cancelled.${reason ? ` Reason: ${reason}` : ''}`;
    const doctorMessage = `Appointment with ${patient.firstName} ${patient.lastName} on ${this.formatDateTime(appointment.startTime)} has been cancelled.${reason ? ` Reason: ${reason}` : ''}`;

    await this.createNotification(
      patient.id,
      NotificationType.APPOINTMENT_CANCELLED,
      'Appointment Cancelled',
      patientMessage,
      {
        appointmentId: appointment.id,
        startTime: appointment.startTime,
        reason,
      }
    );

    await this.createNotification(
      doctor.id,
      NotificationType.APPOINTMENT_CANCELLED,
      'Appointment Cancelled',
      doctorMessage,
      {
        appointmentId: appointment.id,
        startTime: appointment.startTime,
        reason,
      }
    );

    await this.notifyAdminCancellation(appointment, patient, doctor, reason);

    try {
      await emailService.sendAppointmentCancellation({
        to: patient.email,
        patientName: `${patient.firstName} ${patient.lastName}`,
        doctorName: `${doctor.firstName} ${doctor.lastName}`,
        appointmentDate: appointment.startTime,
        reason,
      });

      await emailService.sendDoctorAppointmentNotification({
        to: doctor.email,
        doctorName: `${doctor.firstName} ${doctor.lastName}`,
        patientName: `${patient.firstName} ${patient.lastName}`,
        appointmentDate: appointment.startTime,
        duration: appointment.duration,
        action: 'cancelled',
        reason,
      });
    } catch (emailError) {
      console.error('Failed to send cancellation notification email:', emailError);
    }
  }

  async sendMeetingLink(appointment: Appointment): Promise<void> {
    const patient = appointment.patient as User;

    await this.createNotification(
      patient.id,
      NotificationType.MEETING_LINK_READY,
      'Meeting Link Ready',
      `Your meeting link is ready. Join here: ${appointment.meetingLink || 'Link will be available soon'}`,
      {
        appointmentId: appointment.id,
        startTime: appointment.startTime,
        meetingLink: appointment.meetingLink,
      }
    );
  }

  async getUserNotifications(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await this.notificationRepository.count({
      where: { userId, read: false },
    });
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.notificationRepository.update(notificationId, {
      read: true,
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, read: false },
      { read: true }
    );
  }

  async getPreferences(userId: string): Promise<NotificationPreference> {
    let prefs = await this.preferenceRepository.findOne({
      where: { userId },
    });

    if (!prefs) {
      prefs = new NotificationPreference();
      prefs.userId = userId;
      prefs = await this.preferenceRepository.save(prefs);
    }

    return prefs;
  }

  async updatePreferences(
    userId: string,
    updates: Partial<NotificationPreference>
  ): Promise<NotificationPreference> {
    let prefs = await this.preferenceRepository.findOne({
      where: { userId },
    });

    if (!prefs) {
      prefs = new NotificationPreference();
      prefs.userId = userId;
    }

    Object.assign(prefs, updates);
    return await this.preferenceRepository.save(prefs);
  }

  private formatDateTime(date: Date): string {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  async getAdminUserIds(): Promise<string[]> {
    const admins = await this.userRepository.find({
      where: { role: UserRole.ADMIN },
      select: ['id'],
    });
    return admins.map(admin => admin.id);
  }

  async notifyAdminNewAppointment(appointment: Appointment, patient: User, doctor: User): Promise<void> {
    const adminIds = await this.getAdminUserIds();

    for (const adminId of adminIds) {
      await this.createNotification(
        adminId,
        NotificationType.APPOINTMENT_CONFIRMATION,
        'New Appointment Booked',
        `Patient ${patient.firstName} ${patient.lastName} booked an appointment with Dr. ${doctor.firstName} ${doctor.lastName} on ${this.formatDateTime(appointment.startTime)}.`,
        {
          appointmentId: appointment.id,
          startTime: appointment.startTime,
          patientId: patient.id,
          doctorId: doctor.id,
        }
      );
    }
  }

  async notifyAdminCancellation(appointment: Appointment, patient: User, doctor: User, reason?: string): Promise<void> {
    const adminIds = await this.getAdminUserIds();

    const reasonText = reason ? ` Reason: ${reason}` : '';

    for (const adminId of adminIds) {
      await this.createNotification(
        adminId,
        NotificationType.APPOINTMENT_CANCELLED,
        'Appointment Cancelled',
        `Patient ${patient.firstName} ${patient.lastName} cancelled their appointment with Dr. ${doctor.firstName} ${doctor.lastName} on ${this.formatDateTime(appointment.startTime)}.${reasonText}`,
        {
          appointmentId: appointment.id,
          startTime: appointment.startTime,
          patientId: patient.id,
          doctorId: doctor.id,
          reason,
        }
      );
    }
  }

  async sendAppointmentRescheduled(
    appointment: Appointment,
    oldStartTime: Date,
    reason?: string
  ): Promise<void> {
    const patient = appointment.patient as User;
    const doctor = appointment.doctor as User;

    await this.createNotification(
      patient.id,
      NotificationType.APPOINTMENT_RESCHEDULED,
      'Appointment Rescheduled',
      `Your appointment with ${doctor.firstName} ${doctor.lastName} has been rescheduled to ${this.formatDateTime(appointment.startTime)}.`,
      {
        appointmentId: appointment.id,
        oldStartTime,
        newStartTime: appointment.startTime,
        doctorId: doctor.id,
        reason,
      }
    );

    await this.createNotification(
      doctor.id,
      NotificationType.APPOINTMENT_RESCHEDULED,
      'Appointment Rescheduled',
      `Your appointment with ${patient.firstName} ${patient.lastName} has been rescheduled to ${this.formatDateTime(appointment.startTime)}.`,
      {
        appointmentId: appointment.id,
        oldStartTime,
        newStartTime: appointment.startTime,
        patientId: patient.id,
        reason,
      }
    );

    await this.notifyAdminRescheduled(appointment, patient, doctor, oldStartTime);

    try {
      await emailService.sendAppointmentRescheduled({
        to: patient.email,
        patientName: `${patient.firstName} ${patient.lastName}`,
        doctorName: `${doctor.firstName} ${doctor.lastName}`,
        oldDate: oldStartTime,
        newDate: appointment.startTime,
        duration: appointment.duration,
        meetingLink: appointment.meetingLink || undefined,
        reason,
      });

      await emailService.sendDoctorAppointmentNotification({
        to: doctor.email,
        doctorName: `${doctor.firstName} ${doctor.lastName}`,
        patientName: `${patient.firstName} ${patient.lastName}`,
        appointmentDate: appointment.startTime,
        duration: appointment.duration,
        meetingLink: appointment.meetingLink || undefined,
        action: 'rescheduled',
        oldDate: oldStartTime,
      });
    } catch (emailError) {
      console.error('Failed to send reschedule notification email:', emailError);
    }
  }

  async notifyAdminRescheduled(
    appointment: Appointment,
    patient: User,
    doctor: User,
    oldStartTime: Date
  ): Promise<void> {
    const adminIds = await this.getAdminUserIds();

    for (const adminId of adminIds) {
      await this.createNotification(
        adminId,
        NotificationType.APPOINTMENT_RESCHEDULED,
        'Appointment Rescheduled',
        `Patient ${patient.firstName} ${patient.lastName} rescheduled their appointment with Dr. ${doctor.firstName} ${doctor.lastName} from ${this.formatDateTime(oldStartTime)} to ${this.formatDateTime(appointment.startTime)}.`,
        {
          appointmentId: appointment.id,
          oldStartTime,
          newStartTime: appointment.startTime,
          patientId: patient.id,
          doctorId: doctor.id,
        }
      );
    }
  }
}
