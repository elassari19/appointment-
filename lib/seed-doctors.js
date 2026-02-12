const { DataSource } = require('typeorm');
const { User, UserRole } = require('./entities/User');
const { Availability, DayOfWeek } = require('./entities/Availability');
const bcrypt = require('bcryptjs');

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'appoinpment',
  synchronize: false,
  logging: true,
  entities: [User, Availability],
});

async function seedDoctors() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected. Seeding doctors...');

    const doctorData = [
      {
        firstName: 'Sarah',
        lastName: 'Al-Mutairi',
        email: 'sarah.mutairi@nutrison.com',
        password: await bcrypt.hash('password123', 10),
        role: UserRole.DOCTOR,
        bio: 'Certified Dietitian with 10+ years of experience in nutritional counseling and weight management.',
        specialty: 'Weight Management',
        phone: '+966501234567',
      },
      {
        firstName: 'Ahmed',
        lastName: 'Al-Harbi',
        email: 'ahmed.harbi@nutrison.com',
        password: await bcrypt.hash('password123', 10),
        role: UserRole.DOCTOR,
        bio: 'Specializing in sports nutrition and meal planning for athletes.',
        specialty: 'Sports Nutrition',
        phone: '+966507654321',
      },
      {
        firstName: 'Fatima',
        lastName: 'Al-Otaibi',
        email: 'fatima.otaibi@nutrison.com',
        password: await bcrypt.hash('password123', 10),
        role: UserRole.DOCTOR,
        bio: 'Expert in diabetic nutrition and chronic disease management.',
        specialty: 'Diabetes Management',
        phone: '+966509876543',
      },
      {
        firstName: 'Mohammed',
        lastName: 'Al-Dossary',
        email: 'mohammed.dossary@nutrison.com',
        password: await bcrypt.hash('password123', 10),
        role: UserRole.DOCTOR,
        bio: 'Focus on pediatric nutrition and family meal planning.',
        specialty: 'Pediatric Nutrition',
        phone: '+966551234567',
      },
      {
        firstName: 'Layla',
        lastName: 'Al-Rashid',
        email: 'layla.rashid@nutrison.com',
        password: await bcrypt.hash('password123', 10),
        role: UserRole.DOCTOR,
        bio: 'Specialized in gut health, food allergies, and intuitive eating.',
        specialty: 'Gut Health',
        phone: '+966558765432',
      },
    ];

    const userRepository = AppDataSource.getRepository(User);
    const availabilityRepository = AppDataSource.getRepository(Availability);

    for (const data of doctorData) {
      const existingUser = await userRepository.findOne({
        where: { email: data.email },
      });

      if (existingUser) {
        console.log(`Doctor ${data.email} already exists, skipping...`);
        continue;
      }

      const doctor = userRepository.create({
        ...data,
        isActive: true,
        isVerified: true,
      });

      const savedDoctor = await userRepository.save(doctor);
      console.log(`Created doctor: ${data.firstName} ${data.lastName}`);

      const days = [
        DayOfWeek.MONDAY,
        DayOfWeek.TUESDAY,
        DayOfWeek.WEDNESDAY,
        DayOfWeek.THURSDAY,
        DayOfWeek.FRIDAY,
      ];
      const timeSlots = [
        { start: '09:00', end: '12:00' },
        { start: '14:00', end: '17:00' },
      ];

      for (const day of days) {
        for (const slot of timeSlots) {
          const availability = availabilityRepository.create({
            doctor: savedDoctor,
            dayOfWeek: day,
            startTime: slot.start,
            endTime: slot.end,
            isAvailable: true,
          });

          await availabilityRepository.save(availability);
        }
      }

      console.log(`  - Added availability for ${days.length} days`);
    }

    console.log('\nDoctors seeded successfully!');
    console.log('\nTest accounts:');
    console.log('  - sarah.mutairi@nutrison.com / password123');
    console.log('  - ahmed.harbi@nutrison.com / password123');
    console.log('  - fatima.otaibi@nutrison.com / password123');
    console.log('  - mohammed.dossary@nutrison.com / password123');
    console.log('  - layla.rashid@nutrison.com / password123');

    await AppDataSource.destroy();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedDoctors();
