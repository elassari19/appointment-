import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertToCamelCase1700000000002 implements MigrationInterface {
  name = 'ConvertToCamelCase1700000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop old tables with snake_case names
    await queryRunner.query(`DROP TABLE IF EXISTS "reviews" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "doctor_profiles" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "appointments" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "availabilities" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "blocked_slots" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "payments" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "sessions" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "conversations" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "messages" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "notifications" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "notification_preferences" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_logs" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "reports" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "idempotency_keys" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users" CASCADE`);

    console.log('✓ Dropped old tables');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // This migration cannot be reversed as it drops all tables
    console.log('Warning: This migration cannot be reversed');
  }
}
