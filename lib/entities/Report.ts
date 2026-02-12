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

@Entity('reports')
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

  @Column({ nullable: true })
  reportedContentId?: string;

  @Column({ nullable: true, type: 'text' })
  reportedContent?: string;

  @Column({ nullable: true })
  reportedUserId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reportedUserId' })
  reportedUser?: User;

  @Column()
  reporterId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reporterId' })
  reporter!: User;

  @Column({ nullable: true })
  moderatorId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'moderatorId' })
  moderator?: User;

  @Column({ nullable: true, type: 'text' })
  moderationNotes?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ nullable: true })
  resolvedAt?: Date;
}
