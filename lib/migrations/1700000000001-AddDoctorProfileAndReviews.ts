import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from 'typeorm';

export class AddDoctorProfileAndReviews1700000000001 implements MigrationInterface {
  name = 'AddDoctorProfileAndReviews1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'doctor_profiles',
      columns: [
        {
          name: 'id',
          type: 'uuid',
          isPrimary: true,
          generationStrategy: 'uuid',
          default: 'uuid_generate_v4()',
        },
        {
          name: 'userId',
          type: 'uuid',
          isUnique: true,
          isNullable: false,
        },
        {
          name: 'specialty',
          type: 'varchar',
          length: '100',
          isNullable: true,
        },
        {
          name: 'sub_specialties',
          type: 'text',
          isNullable: true,
        },
        {
          name: 'license_number',
          type: 'varchar',
          length: '100',
          isNullable: true,
        },
        {
          name: 'license_issuing_authority',
          type: 'varchar',
          length: '200',
          isNullable: true,
        },
        {
          name: 'license_issue_date',
          type: 'timestamp',
          isNullable: true,
        },
        {
          name: 'license_expiry_date',
          type: 'timestamp',
          isNullable: true,
        },
        {
          name: 'license_is_verified',
          type: 'boolean',
          default: false,
        },
        {
          name: 'license_verification_date',
          type: 'timestamp',
          isNullable: true,
        },
        {
          name: 'medical_school',
          type: 'varchar',
          length: '200',
          isNullable: true,
        },
        {
          name: 'residency',
          type: 'varchar',
          length: '200',
          isNullable: true,
        },
        {
          name: 'fellowship',
          type: 'varchar',
          length: '200',
          isNullable: true,
        },
        {
          name: 'years_of_experience',
          type: 'integer',
          isNullable: true,
        },
        {
          name: 'board_certifications',
          type: 'text',
          isNullable: true,
        },
        {
          name: 'clinic_name',
          type: 'varchar',
          length: '200',
          isNullable: true,
        },
        {
          name: 'clinic_address',
          type: 'text',
          isNullable: true,
        },
        {
          name: 'clinic_phone',
          type: 'varchar',
          length: '20',
          isNullable: true,
        },
        {
          name: 'clinic_hours',
          type: 'jsonb',
          isNullable: true,
        },
        {
          name: 'consultation_fee',
          type: 'integer',
          isNullable: true,
        },
        {
          name: 'follow_up_fee',
          type: 'integer',
          isNullable: true,
        },
        {
          name: 'telemedicine_enabled',
          type: 'boolean',
          default: true,
        },
        {
          name: 'insurance_accepted',
          type: 'text',
          isNullable: true,
        },
        {
          name: 'accepting_new_patients',
          type: 'boolean',
          default: true,
        },
        {
          name: 'professional_summary',
          type: 'text',
          isNullable: true,
        },
        {
          name: 'education',
          type: 'jsonb',
          isNullable: true,
        },
        {
          name: 'languages',
          type: 'jsonb',
          isNullable: true,
        },
        {
          name: 'awards',
          type: 'jsonb',
          isNullable: true,
        },
        {
          name: 'publications',
          type: 'jsonb',
          isNullable: true,
        },
        {
          name: 'professional_memberships',
          type: 'text',
          isNullable: true,
        },
        {
          name: 'website_url',
          type: 'varchar',
          length: '500',
          isNullable: true,
        },
        {
          name: 'linkedin_url',
          type: 'varchar',
          length: '500',
          isNullable: true,
        },
        {
          name: 'twitter_url',
          type: 'varchar',
          length: '500',
          isNullable: true,
        },
        {
          name: 'instagram_url',
          type: 'varchar',
          length: '500',
          isNullable: true,
        },
        {
          name: 'total_patients',
          type: 'integer',
          isNullable: true,
        },
        {
          name: 'total_appointments',
          type: 'integer',
          isNullable: true,
        },
        {
          name: 'completed_appointments',
          type: 'integer',
          isNullable: true,
        },
        {
          name: 'average_response_time_hours',
          type: 'numeric',
          precision: 3,
          scale: 2,
          default: 0,
        },
        {
          name: 'is_featured',
          type: 'boolean',
          default: false,
        },
        {
          name: 'is_published',
          type: 'boolean',
          default: true,
        },
        {
          name: 'created_at',
          type: 'timestamp',
          default: 'now()',
        },
        {
          name: 'updated_at',
          type: 'timestamp',
          default: 'now()',
        },
      ],
    }));

    await queryRunner.createForeignKey('doctor_profiles', new TableForeignKey({
      columnNames: ['userId'],
      referencedTableName: 'users',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));

    await queryRunner.createTable(new Table({
      name: 'reviews',
      columns: [
        {
          name: 'id',
          type: 'uuid',
          isPrimary: true,
          generationStrategy: 'uuid',
          default: 'uuid_generate_v4()',
        },
        {
          name: 'doctorId',
          type: 'uuid',
          isNullable: false,
        },
        {
          name: 'patientId',
          type: 'uuid',
          isNullable: false,
        },
        {
          name: 'appointmentId',
          type: 'uuid',
          isNullable: true,
        },
        {
          name: 'rating',
          type: 'integer',
          isNullable: false,
        },
        {
          name: 'comment',
          type: 'text',
          isNullable: true,
        },
        {
          name: 'bedside_manner',
          type: 'integer',
          isNullable: true,
        },
        {
          name: 'wait_time',
          type: 'integer',
          isNullable: true,
        },
        {
          name: 'communication',
          type: 'integer',
          isNullable: true,
        },
        {
          name: 'thoroughness',
          type: 'integer',
          isNullable: true,
        },
        {
          name: 'is_verified',
          type: 'boolean',
          default: false,
        },
        {
          name: 'status',
          type: 'enum',
          enum: ['pending', 'approved', 'rejected', 'flagged'],
          default: 'pending',
        },
        {
          name: 'response',
          type: 'text',
          isNullable: true,
        },
        {
          name: 'response_date',
          type: 'timestamp',
          isNullable: true,
        },
        {
          name: 'tags',
          type: 'text',
          isNullable: true,
        },
        {
          name: 'helpful_count',
          type: 'integer',
          default: 0,
        },
        {
          name: 'is_anonymous',
          type: 'boolean',
          default: false,
        },
        {
          name: 'title',
          type: 'varchar',
          length: '255',
          isNullable: true,
        },
        {
          name: 'created_at',
          type: 'timestamp',
          default: 'now()',
        },
        {
          name: 'updated_at',
          type: 'timestamp',
          default: 'now()',
        },
      ],
    }));

    await queryRunner.createForeignKey('reviews', new TableForeignKey({
      columnNames: ['doctorId'],
      referencedTableName: 'users',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));

    await queryRunner.createForeignKey('reviews', new TableForeignKey({
      columnNames: ['patientId'],
      referencedTableName: 'users',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));

    await queryRunner.createForeignKey('reviews', new TableForeignKey({
      columnNames: ['appointmentId'],
      referencedTableName: 'appointments',
      referencedColumnNames: ['id'],
      onDelete: 'SET NULL',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('reviews');
    await queryRunner.dropTable('doctor_profiles');
  }
}
