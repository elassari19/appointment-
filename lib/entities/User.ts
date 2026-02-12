import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Session } from './Session';

export enum UserRole {
  PATIENT = 'patient',
  DIETITIAN = 'dietitian',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  firstName!: string;

  @Column({ type: 'varchar', length: 100 })
  lastName!: string;

  @Column({ type: 'varchar', unique: true }) // email must be unique
  email!: string;

  @Column({ type: 'varchar', select: false }) // Don't select password by default
  password!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.PATIENT,
  })
  role!: UserRole;

  @Column({ type: 'varchar', nullable: true })
  phone?: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth?: Date;

  @Column({ type: 'text', nullable: true })
  profilePicture?: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'boolean', default: false })
  isVerified!: boolean;

  @Column({ type: 'varchar', nullable: true })
  verificationToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  verificationTokenExpiresAt?: Date;

  @Column({ type: 'varchar', nullable: true })
  resetPasswordToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpiresAt?: Date;

  @Column({ type: 'boolean', default: false })
  isMfaEnabled!: boolean;

  @Column({ type: 'text', nullable: true, select: false })
  mfaSecret?: string;

  @Column({ type: 'varchar', nullable: true })
  recoveryCodes?: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  // Relationships
  @OneToMany('Appointment', 'patient', {
    cascade: true,
  })
  patientAppointments!: any[];

  @OneToMany('Appointment', 'dietitian', {
    cascade: true,
  })
  dietitianAppointments!: any[];

  @OneToMany('Availability', 'dietitian', {
    cascade: true,
  })
  availabilities!: any[];

  @OneToMany(() => Session, 'user', {
    cascade: true,
  })
  sessions!: Session[];
}