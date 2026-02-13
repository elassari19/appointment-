import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';

export enum ReportType {
  MESSAGE = 'message',
  USER = 'user',
  APPOINTMENT = 'appointment',
}

export enum ReportStatus {
  PENDING = 'pending',
  DISMISSED = 'dismissed',
  RESOLVED = 'resolved',
  DELETED = 'deleted',
}

export enum ReportReason {
  SPAM = 'spam',
  HARASSMENT = 'harassment',
  HATE_SPEECH = 'hate_speech',
  VIOLENCE = 'violence',
  INAPPROPRIATE = 'inappropriate',
  OTHER = 'other',
}

@Entity('Reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'enum',
    enum: ReportType,
  })
  type!: ReportType;

  @Column({
    type: 'enum',
    enum: ReportReason,
  })
  reason!: ReportReason;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.PENDING,
  })
  status!: ReportStatus;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'varchar', nullable: true })
  reportedContentId?: string;

  @Column({ type: 'text', nullable: true })
  reportedContent?: string;

  @Column({ type: 'varchar', nullable: true })
  reportedUserId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  reportedUser?: User;

  @Column({ type: 'varchar' })
  reporterId!: string;

  @ManyToOne(() => User)
  @JoinColumn()
  reporter!: User;

  @Column({ type: 'varchar', nullable: true })
  moderatorId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  moderator?: User;

  @Column({ nullable: true, type: 'text' })
  moderationNotes?: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt?: Date;
}
