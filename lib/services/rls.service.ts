import { User, UserRole } from '@/lib/entities/User';
import { Appointment } from '@/lib/entities/Appointment';
import { Availability } from '@/lib/entities/Availability';
import { Payment } from '@/lib/entities/Payment';
import { AppDataSource } from '@/lib/database';

export enum ResourceType {
  USER = 'user',
  APPOINTMENT = 'appointment',
  AVAILABILITY = 'availability',
  PAYMENT = 'payment',
  AUDIT_LOG = 'audit_log',
  SYSTEM = 'system',
}

export interface RLSContext {
  user: User;
  resourceType: ResourceType;
  resourceId?: string;
  resourceOwnerId?: string;
}

export class RLSService {
  private appointmentRepository = AppDataSource.getRepository(Appointment);
  private availabilityRepository = AppDataSource.getRepository(Availability);
  private paymentRepository = AppDataSource.getRepository(Payment);

  canAccess(context: RLSContext): boolean {
    const { user, resourceType, resourceOwnerId } = context;

    if (user.role === UserRole.ADMIN) {
      return true;
    }

    switch (resourceType) {
      case ResourceType.USER:
        return this.canAccessUser(user, resourceOwnerId);
      case ResourceType.APPOINTMENT:
        return this.canAccessAppointment(context);
      case ResourceType.AVAILABILITY:
        return this.canAccessAvailability(context);
      case ResourceType.PAYMENT:
        return this.canAccessPayment(context);
      case ResourceType.AUDIT_LOG:
      case ResourceType.SYSTEM:
        return false;
      default:
        return false;
    }
  }

  private canAccessUser(user: User, resourceOwnerId?: string): boolean {
    if (!resourceOwnerId) {
      return true;
    }
    return user.id === resourceOwnerId || user.role === UserRole.ADMIN;
  }

  private canAccessAppointment(context: RLSContext): boolean {
    const { user } = context;

    if (user.role === UserRole.ADMIN || user.role === UserRole.DOCTOR) {
      return true;
    }

    if (user.role === UserRole.PATIENT) {
      return context.resourceOwnerId === user.id;
    }

    return false;
  }

  private canAccessAvailability(context: RLSContext): boolean {
    const { user, resourceOwnerId } = context;

    if (user.role === UserRole.ADMIN) {
      return true;
    }

    if (user.role === UserRole.DOCTOR) {
      return !resourceOwnerId || resourceOwnerId === user.id;
    }

    return false;
  }

  private canAccessPayment(context: RLSContext): boolean {
    const { user, resourceOwnerId } = context;

    if (user.role === UserRole.ADMIN) {
      return true;
    }

    return context.resourceOwnerId === user.id;
  }

  async canAccessAppointmentById(user: User, appointmentId: string): Promise<boolean> {
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
      relations: ['patient', 'doctor'],
    });

    if (!appointment) {
      return false;
    }

    if (user.role === UserRole.DOCTOR) {
      return appointment.doctor?.id === user.id;
    }

    if (user.role === UserRole.PATIENT) {
      return appointment.patient?.id === user.id;
    }

    return false;
  }

  async canAccessAvailabilityById(user: User, availabilityId: string): Promise<boolean> {
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    const availability = await this.availabilityRepository.findOne({
      where: { id: availabilityId },
      relations: ['dietitian'],
    });

    if (!availability) {
      return false;
    }

    if (user.role === UserRole.DOCTOR) {
      return availability.doctor?.id === user.id;
    }

    return false;
  }

  async canAccessPaymentById(user: User, paymentId: string): Promise<boolean> {
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['appointment', 'appointment.patient', 'appointment.doctor'],
    });

    if (!payment || !payment.appointment) {
      return false;
    }

    if (user.role === UserRole.DOCTOR) {
      return payment.appointment.doctor?.id === user.id;
    }

    if (user.role === UserRole.PATIENT) {
      return payment.appointment.patient?.id === user.id;
    }

    return false;
  }

  async canAccessUserById(user: User, targetUserId: string): Promise<boolean> {
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    return user.id === targetUserId;
  }

  canModifyUser(user: User, targetUserId: string): boolean {
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    return user.id === targetUserId;
  }

  canModifyAppointment(user: User, appointment: Appointment): boolean {
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    if (user.role === UserRole.DOCTOR) {
      return appointment.doctor?.id === user.id;
    }

    if (user.role === UserRole.PATIENT) {
      return appointment.patient?.id === user.id;
    }

    return false;
  }

  canModifyAvailability(user: User, availability: Availability): boolean {
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    if (user.role === UserRole.DOCTOR) {
      return availability.doctor?.id === user.id;
    }

    return false;
  }

  canModifyPayment(user: User, payment: Payment): boolean {
    return user.role === UserRole.ADMIN;
  }

  filterAccessibleAppointments(user: User, appointments: Appointment[]): Appointment[] {
    if (user.role === UserRole.ADMIN || user.role === UserRole.DOCTOR) {
      return appointments;
    }

    return appointments.filter((apt) => apt.patient?.id === user.id);
  }

  filterAccessibleAvailabilities(user: User, availabilities: Availability[]): Availability[] {
    if (user.role === UserRole.ADMIN) {
      return availabilities;
    }

    if (user.role === UserRole.DOCTOR) {
      return availabilities.filter((avail) => avail.doctor?.id === user.id);
    }

    return [];
  }

  filterAccessiblePayments(user: User, payments: Payment[]): Payment[] {
    if (user.role === UserRole.ADMIN) {
      return payments;
    }

    return payments.filter((pay) => {
      if (user.role === UserRole.DOCTOR) {
        return pay.appointment?.doctor?.id === user.id;
      }
      if (user.role === UserRole.PATIENT) {
        return pay.appointment?.patient?.id === user.id;
      }
      return false;
    });
  }
}

export const rlsService = new RLSService();
