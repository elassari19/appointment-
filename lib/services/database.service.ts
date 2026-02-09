import { AppDataSource } from '@/lib/database';

export class DatabaseService {
  static async initialize() {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
        console.log('Data Source has been initialized!');
        
        // Test the connection
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.query('SELECT 1');
        await queryRunner.release();
        console.log('Database connection test successful!');
      } else {
        console.log('Data Source already initialized!');
      }
    } catch (error) {
      console.error('Error during Data Source initialization:', error);
      
      // More specific error handling for PostgreSQL
      if (error) {
        console.error('Failed to connect to PostgreSQL database. Please check:');
        console.error('- Database server is running');
        console.error('- Connection parameters (host, port, username, password)');
        console.error('- Database exists and is accessible');
        console.error('- Network connectivity to the database server');
        console.error('- Environment variables are properly set');
      }
      
      throw error;
    }
  }

  static async destroy() {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Data Source has been destroyed!');
    }
  }
}