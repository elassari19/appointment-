import { AppDataSource } from './database';
import { AddCalendarEventId1700000000000 } from './migrations/1700000000000-AddCalendarEventId';

async function runMigration() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected. Running migration...');

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    const migration = new AddCalendarEventId1700000000000();
    await migration.up(queryRunner);

    console.log('Migration completed successfully!');
    await queryRunner.release();
    await AppDataSource.destroy();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
