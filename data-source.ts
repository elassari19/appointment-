import { DataSource } from 'typeorm';
import { User } from './lib/entities/User';
import { Session } from './lib/entities/Session';
import { Appointment } from './lib/entities/Appointment';
import { Availability } from './lib/entities/Availability';
import { Payment } from './lib/entities/Payment';
import { AuditLog } from './lib/entities/AuditLog';
import { BlockedSlot } from './lib/entities/BlockedSlot';
import { DoctorProfile } from './lib/entities/DoctorProfile';
import { Review } from './lib/entities/Review';
import { Conversation, Message } from './lib/entities/Chat';
import { Notification } from './lib/entities/Notification';
import { NotificationPreference } from './lib/entities/NotificationPreference';
import { Report } from './lib/entities/Report';
import { IdempotencyKey } from './lib/entities/IdempotencyKey';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Session, Appointment, Availability, Payment, AuditLog, BlockedSlot, DoctorProfile, Review, Conversation, Message, Notification, NotificationPreference, Report, IdempotencyKey],
  migrations: [__dirname + '/lib/migrations/*{.js,.ts}'],
  subscribers: [],
  extra: {
    max: 20,
    min: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
});

export default AppDataSource;
