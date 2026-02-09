import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './User';
import { Availability } from './Availability';
import { Payment } from './Payment';

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'integer' }) // Duration in minutes
  duration: number;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.SCHEDULED,
  })
  status: AppointmentStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'text', nullable: true })
  meetingLink?: string;

  @Column({ type: 'timestamp', nullable: true })
  confirmedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt?: Date;

  @Column({ type: 'text', nullable: true })
  cancellationReason?: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  // Relationships
  @ManyToOne('User', 'patientAppointments', {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'patient_id' })
  patient: User;

  @ManyToOne('User', 'dietitianAppointments', {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'dietitian_id' })
  dietitian: User;

  @ManyToOne('Availability', 'appointments', {
    eager: false,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'availability_id' })
  availability: Availability;

  @OneToMany(() => Payment, (payment) => payment.appointment, {
    cascade: true,
  })
  payments: Payment[];
}