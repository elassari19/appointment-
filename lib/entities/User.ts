import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Session } from './Session';
import { DoctorProfile } from './DoctorProfile';

export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  ADMIN = 'admin',
}

@Entity('Users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  firstName!: string;

  @Column({ type: 'varchar', length: 100 })
  lastName!: string;

  @Column({ type: 'varchar', unique: true })
  email!: string;

  @Column({ type: 'varchar', select: false })
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

  @Column({ type: 'text', nullable: true })
  googleAccessToken?: string;

  @Column({ type: 'text', nullable: true })
  googleRefreshToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  googleTokenExpiresAt?: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  // Relationships
  @OneToMany('Appointment', 'patient', {
    cascade: true,
  })
  patientAppointments!: any[];

  @OneToMany('Appointment', 'doctor', {
    cascade: true,
  })
  doctorAppointments!: any[];

  @OneToMany('Availability', 'doctor', {
    cascade: true,
  })
  availabilities!: any[];

  @OneToMany(() => Session, 'user', {
    cascade: true,
  })
  sessions!: Session[];

  @OneToOne(() => DoctorProfile, 'user')
  doctorProfile?: DoctorProfile;
}