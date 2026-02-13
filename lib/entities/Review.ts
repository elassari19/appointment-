import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Appointment } from './Appointment';

export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FLAGGED = 'flagged',
}

@Entity('Reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  doctorId!: string;

  @ManyToOne('User', { onDelete: 'CASCADE' })
  @JoinColumn()
  doctor!: any;

  @Column({ type: 'uuid' })
  patientId!: string;

  @ManyToOne('User', { onDelete: 'CASCADE' })
  @JoinColumn()
  patient!: any;

  @Column({ type: 'uuid', nullable: true })
  appointmentId?: string;

  @ManyToOne(() => Appointment, { onDelete: 'SET NULL' })
  @JoinColumn()
  appointment?: Appointment;

  @Column({ type: 'integer' })
  rating!: number;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @Column({ type: 'integer', nullable: true })
  bedsideManner?: number;

  @Column({ type: 'integer', nullable: true })
  waitTime?: number;

  @Column({ type: 'integer', nullable: true })
  communication?: number;

  @Column({ type: 'integer', nullable: true })
  thoroughness?: number;

  @Column({ type: 'boolean', default: false })
  isVerified!: boolean;

  @Column({
    type: 'enum',
    enum: ReviewStatus,
    default: ReviewStatus.PENDING,
  })
  status!: ReviewStatus;

  @Column({ type: 'text', nullable: true })
  response?: string;

  @Column({ type: 'timestamp', nullable: true })
  responseDate?: Date;

  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @Column({ type: 'integer', default: 0 })
  helpfulCount!: number;

  @Column({ type: 'boolean', default: false })
  isAnonymous!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title?: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
