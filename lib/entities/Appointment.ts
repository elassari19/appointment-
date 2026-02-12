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

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export enum RecurrenceFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
}

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'timestamp' })
  startTime!: Date;

  @Column({ type: 'integer' })
  duration!: number;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.SCHEDULED,
  })
  status!: AppointmentStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'text', nullable: true })
  meetingLink?: string;

  @Column({ name: 'calendar_event_id', type: 'text', nullable: true })
  calendarEventId?: string;

  @Column({ type: 'timestamp', nullable: true })
  confirmedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt?: Date;

  @Column({ type: 'text', nullable: true })
  cancellationReason?: string;

  @Column({ type: 'boolean', default: false })
  isRecurring!: boolean;

  @Column({
    type: 'enum',
    enum: RecurrenceFrequency,
    nullable: true,
  })
  recurrenceFrequency?: RecurrenceFrequency;

  @Column({ type: 'integer', nullable: true })
  recurrenceCount?: number;

  @Column({ type: 'timestamp', nullable: true })
  recurrenceEndDate?: Date;

  @Column({ type: 'uuid', nullable: true })
  recurringSeriesId?: string;

  @Column({ type: 'integer', default: 1 })
  recurrencePosition!: number;

  @Column({
    type: 'enum',
    enum: ['pre_session', 'active_session', 'post_session'],
    default: 'pre_session',
  })
  meetingPhase!: 'pre_session' | 'active_session' | 'post_session';

  @Column({ type: 'timestamp', nullable: true })
  meetingStartedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  meetingEndedAt?: Date;

  @Column({ type: 'text', nullable: true })
  sessionNotes?: string;

  @Column({ type: 'boolean', default: false })
  wasCancelledFromSession!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  // Relationships
  @ManyToOne('User', 'patientAppointments', {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'patient_id' })
  patient!: any;

  @ManyToOne('User', 'doctorAppointments', {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'doctor_id' })
  doctor!: any;

  @ManyToOne('Availability', 'appointments', {
    eager: false,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'availability_id' })
  availability!: any;

  @OneToMany('Payment', 'appointment', {
    cascade: true,
  })
  payments!: any[];
}