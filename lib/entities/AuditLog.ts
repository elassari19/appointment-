import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum AuditAction {
  // Authentication
  LOGIN = 'login',
  LOGOUT = 'logout',
  LOGIN_FAILED = 'login_failed',
  PASSWORD_RESET = 'password_reset',
  MFA_ENABLED = 'mfa_enabled',
  MFA_DISABLED = 'mfa_disabled',

  // User Management
  USER_CREATED = 'user_created',
  USER_UPDATED = 'user_updated',
  USER_DELETED = 'user_deleted',
  USER_ROLE_CHANGED = 'user_role_changed',
  USER_VERIFIED = 'user_verified',
  USER_SUSPENDED = 'user_suspended',
  USER_ACTIVATED = 'user_activated',

  // Appointment Management
  APPOINTMENT_CREATED = 'appointment_created',
  APPOINTMENT_UPDATED = 'appointment_updated',
  APPOINTMENT_CANCELLED = 'appointment_cancelled',
  APPOINTMENT_COMPLETED = 'appointment_completed',
  APPOINTMENT_NO_SHOW = 'appointment_no_show',
  APPOINTMENT_RESCHEDULED = 'appointment_rescheduled',

  // Availability Management
  AVAILABILITY_CREATED = 'availability_created',
  AVAILABILITY_UPDATED = 'availability_updated',
  AVAILABILITY_DELETED = 'availability_deleted',

  // Payment Management
  PAYMENT_INITIATED = 'payment_initiated',
  PAYMENT_COMPLETED = 'payment_completed',
  PAYMENT_FAILED = 'payment_failed',
  PAYMENT_REFUNDED = 'payment_refunded',

  // Data Access
  VIEW_PATIENT_RECORD = 'view_patient_record',
  EXPORT_DATA = 'export_data',

  // Admin Actions
  ADMIN_OVERRIDE = 'admin_override',
  SYSTEM_CONFIG_CHANGED = 'system_config_changed',
}

export enum AuditSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

@Index(['userId', 'createdAt'])
@Index(['action', 'createdAt'])
@Index(['resourceType', 'resourceId'])
@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  userId?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  userEmail?: string;

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action!: AuditAction;

  @Column({ type: 'varchar', length: 100, nullable: true })
  resourceType?: string;

  @Column({ type: 'varchar', nullable: true })
  resourceId?: string;

  @Column({ type: 'jsonb', nullable: true })
  oldValues?: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  newValues?: Record<string, unknown>;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  userAgent?: string;

  @Column({
    type: 'enum',
    enum: AuditSeverity,
    default: AuditSeverity.INFO,
  })
  severity!: AuditSeverity;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'boolean', default: false })
  isSystemGenerated!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;
}
