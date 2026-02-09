import { DataSource } from 'typeorm';
import { AppDataSource } from './lib/database'; // Import your existing configuration

// Export the same configuration for migrations
export default AppDataSource;