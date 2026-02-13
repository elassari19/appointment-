import { AppDataSource } from './database';
import { ConvertToCamelCase1700000000002 } from './migrations/1700000000002-ConvertToCamelCase';

async function runMigration() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected. Running migration...');

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    const migration = new ConvertToCamelCase1700000000002();
    await migration.up(queryRunner);

    console.log('Migration completed successfully!');
    console.log('Note: New tables will be created automatically on next application start with synchronize enabled');
    await queryRunner.release();
    await AppDataSource.destroy();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
