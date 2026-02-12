import { DataSource } from 'typeorm';
import { User } from './entities/User';
import { Session } from './entities/Session';
import { Appointment } from './entities/Appointment';
import { Availability } from './entities/Availability';
import { Payment } from './entities/Payment';
import { AuditLog } from './entities/AuditLog';
import { BlockedSlot } from './entities/BlockedSlot';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'nutrison_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Session, Appointment, Availability, Payment, AuditLog, BlockedSlot],
  migrations: [__dirname + '/migrations/*{.js,.ts}'],
  subscribers: [],
  extra: {
    max: 20,
    min: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
});