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
import { Appointment } from './Appointment';

export enum DayOfWeek {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday',
}

@Entity('availabilities')
export class Availability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: DayOfWeek,
  })
  dayOfWeek: DayOfWeek;

  @Column({ type: 'time' }) // Format: HH:mm:ss
  startTime: string;

  @Column({ type: 'time' }) // Format: HH:mm:ss
  endTime: string;

  @Column({ type: 'boolean', default: true })
  isAvailable: boolean;

  @Column({ type: 'integer', nullable: true }) // Duration in minutes, if null use default
  defaultDuration?: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, 'availabilities', {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'dietitian_id' })
  dietitian: User;

  @OneToMany(() => Appointment, 'availability', {
    cascade: true,
  })
  appointments: Appointment[];
}