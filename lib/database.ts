import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'nutrison_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  synchronize: false, // Set to false in production, use migrations instead
  logging: process.env.NODE_ENV === 'development',
  entities: [__dirname + '/entities/*{.js,.ts}'],
  migrations: [__dirname + '/migrations/*{.js,.ts}'],
  subscribers: [],
  extra: {
    // Connection pool settings
    max: 20, // Maximum number of connections in the pool
    min: 5,  // Minimum number of connections in the pool
    idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
  },
});