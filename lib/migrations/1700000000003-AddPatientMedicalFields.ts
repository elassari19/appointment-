import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPatientMedicalFields1700000000003 implements MigrationInterface {
  name = 'AddPatientMedicalFields1700000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('Users', new TableColumn({
      name: 'weight',
      type: 'float',
      isNullable: true,
    }));

    await queryRunner.addColumn('Users', new TableColumn({
      name: 'height',
      type: 'float',
      isNullable: true,
    }));

    await queryRunner.addColumn('Users', new TableColumn({
      name: 'bloodType',
      type: 'varchar',
      length: '5',
      isNullable: true,
    }));

    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    
    const patients = await queryRunner.query(`
      SELECT id, "firstName" FROM "Users" WHERE role = 'patient'
    `);

    for (let i = 0; i < patients.length; i++) {
      const patient = patients[i];
      const weight = Math.floor(Math.random() * 40) + 45;
      const height = Math.floor(Math.random() * 30) + 150;
      const bloodType = bloodTypes[Math.floor(Math.random() * bloodTypes.length)];
      const daysAgo = Math.floor(Math.random() * 90);
      const lastVisit = new Date();
      lastVisit.setDate(lastVisit.getDate() - daysAgo);

      await queryRunner.query(`
        UPDATE "Users" 
        SET weight = $1, height = $2, "bloodType" = $3, "updatedAt" = $4
        WHERE id = $5
      `, [weight, height, bloodType, lastVisit, patient.id]);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('Users', 'bloodType');
    await queryRunner.dropColumn('Users', 'height');
    await queryRunner.dropColumn('Users', 'weight');
  }
}
