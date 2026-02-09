import { AppDataSource } from '@/lib/database';

export class DatabaseService {
  static async initialize() {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
        console.log('Data Source has been initialized!');
      } else {
        console.log('Data Source already initialized!');
      }
    } catch (error) {
      console.error('Error during Data Source initialization:', error);
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