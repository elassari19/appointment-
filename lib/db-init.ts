import { DatabaseService } from './services/database.service';

/**
 * Initialize the database connection when the module is loaded
 * This ensures that the database connection is established before
 * any other modules try to use TypeORM entities
 */

async function initializeDatabase() {
  try {
    await DatabaseService.initialize();
    console.log('Database initialization completed successfully.');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1); // Exit the process if database initialization fails
  }
}

// Initialize the database when this module is imported
initializeDatabase();

export { AppDataSource } from './database';