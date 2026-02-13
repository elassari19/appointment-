import { DataSource } from 'typeorm';
import { User } from './entities/User';
import { Session } from './entities/Session';
import { Appointment } from './entities/Appointment';
import { Availability } from './entities/Availability';
import { Payment } from './entities/Payment';
import { AuditLog } from './entities/AuditLog';
import { BlockedSlot } from './entities/BlockedSlot';
import { DoctorProfile } from './entities/DoctorProfile';
import { Review } from './entities/Review';
import { Conversation, Message } from './entities/Chat';
import { Notification } from './entities/Notification';
import { NotificationPreference } from './entities/NotificationPreference';
import { Report } from './entities/Report';
import { IdempotencyKey } from './entities/IdempotencyKey';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'appoinpment',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Session, Appointment, Availability, Payment, AuditLog, BlockedSlot, DoctorProfile, Review, Conversation, Message, Notification, NotificationPreference, Report, IdempotencyKey],
  migrations: [__dirname + '/migrations/*{.js,.ts}'],
  subscribers: [],
  extra: {
    max: 20,
    min: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
});