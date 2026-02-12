import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddCalendarEventId1700000000000 implements MigrationInterface {
  name = 'AddCalendarEventId1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('appointments', new TableColumn({
      name: 'calendar_event_id',
      type: 'text',
      isNullable: true,
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('appointments', 'calendar_event_id');
  }
}
