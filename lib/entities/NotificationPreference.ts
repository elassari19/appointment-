import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('NotificationPreferences')
export class NotificationPreference {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', unique: true })
  userId!: string;

  @Column({ type: 'boolean', default: true })
  emailEnabled!: boolean;

  @Column({ type: 'boolean', default: false })
  smsEnabled!: boolean;

  @Column({ type: 'boolean', default: true })
  appointmentReminders!: boolean;

  @Column({ type: 'integer', default: 24 })
  reminderHoursBefore!: number;

  @Column({ type: 'boolean', default: true })
  marketingEmails!: boolean;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
