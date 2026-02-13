import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

export interface EducationEntry {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  year: number;
  description?: string;
}

export interface LanguageEntry {
  name: string;
  level: 'Basic' | 'Conversational' | 'Professional' | 'Native';
  isPrimary: boolean;
}

export interface AwardEntry {
  title: string;
  organization: string;
  year: number;
  description?: string;
}

export interface PublicationEntry {
  title: string;
  journal: string;
  year: number;
  url?: string;
  description?: string;
}

export interface ClinicHoursEntry {
  day: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface LicenseInfo {
  licenseNumber: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  isVerified: boolean;
  verificationDate?: string;
}

@Entity('DoctorProfiles')
export class DoctorProfile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', unique: true })
  userId!: string;

  @OneToOne('User', { onDelete: 'CASCADE' })
  @JoinColumn()
  user!: any;

  @Column({ type: 'varchar', length: 100, nullable: true })
  specialty?: string;

  @Column({ type: 'simple-array', nullable: true })
  subSpecialties?: string[];

  @Column({ type: 'jsonb', nullable: true })
  licenseInfo?: LicenseInfo;

  @Column({ type: 'varchar', length: 200, nullable: true })
  medicalSchool?: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  residency?: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  fellowship?: string;

  @Column({ type: 'integer', nullable: true })
  yearsOfExperience?: number;

  @Column({ type: 'simple-array', nullable: true })
  boardCertifications?: string[];

  @Column({ type: 'varchar', length: 200, nullable: true })
  clinicName?: string;

  @Column({ type: 'text', nullable: true })
  clinicAddress?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  clinicPhone?: string;

  @Column({ type: 'jsonb', nullable: true })
  clinicHours?: ClinicHoursEntry[];

  @Column({ type: 'integer', nullable: true })
  consultationFee?: number;

  @Column({ type: 'integer', nullable: true })
  followUpFee?: number;

  @Column({ type: 'boolean', default: true })
  telemedicineEnabled!: boolean;

  @Column({ type: 'simple-array', nullable: true })
  insuranceAccepted?: string[];

  @Column({ type: 'boolean', default: true })
  acceptingNewPatients!: boolean;

  @Column({ type: 'text', nullable: true })
  professionalSummary?: string;

  @Column({ type: 'jsonb', nullable: true })
  education?: EducationEntry[];

  @Column({ type: 'jsonb', nullable: true })
  languages?: LanguageEntry[];

  @Column({ type: 'jsonb', nullable: true })
  awards?: AwardEntry[];

  @Column({ type: 'jsonb', nullable: true })
  publications?: PublicationEntry[];

  @Column({ type: 'simple-array', nullable: true })
  professionalMemberships?: string[];

  @Column({ type: 'varchar', length: 500, nullable: true })
  websiteUrl?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  linkedInUrl?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  twitterUrl?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  instagramUrl?: string;

  @Column({ type: 'integer', nullable: true })
  totalPatients?: number;

  @Column({ type: 'integer', nullable: true })
  totalAppointments?: number;

  @Column({ type: 'integer', nullable: true })
  completedAppointments?: number;

  @Column({ type: 'numeric', precision: 3, scale: 2, default: 0 })
  averageResponseTimeHours!: number;

  @Column({ type: 'boolean', default: false })
  isFeatured!: boolean;

  @Column({ type: 'boolean', default: true })
  isPublished!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
