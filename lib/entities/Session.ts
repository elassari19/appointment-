import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', unique: true }) // Session token
  token!: string;

  @Column({ type: 'uuid' }) // Reference to user ID
  userId!: string;

  @Column({ type: 'timestamp', nullable: true }) // Expiration time
  expiresAt?: Date;

  @Column({ type: 'inet', nullable: true }) // IP address of the user
  ipAddress?: string;

  @Column({ type: 'text', nullable: true }) // User agent string
  userAgent?: string;

  @Column({ type: 'boolean', default: true }) // Whether the session is active
  isActive!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  // Relationships
  @ManyToOne('User', 'sessions', {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: any;
}