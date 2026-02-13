import { AppDataSource } from './database';
import { User, UserRole } from './entities/User';
import { Appointment, AppointmentStatus } from './entities/Appointment';
import { Review, ReviewStatus } from './entities/Review';
import { Payment, PaymentStatus, PaymentMethod } from './entities/Payment';
import bcrypt from 'bcryptjs';

async function seedData() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected. Seeding data...\n');

    const userRepository = AppDataSource.getRepository(User);
    const appointmentRepository = AppDataSource.getRepository(Appointment);
    const reviewRepository = AppDataSource.getRepository(Review);
    const paymentRepository = AppDataSource.getRepository(Payment);

    // Get existing doctors
    const doctors = await userRepository.find({ where: { role: UserRole.DOCTOR } });
    console.log(`Found ${doctors.length} doctors`);

    // Seed Admin Users
    console.log('\n📋 Seeding admin users...');
    const adminData = [
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@nutrison.com',
        password: await bcrypt.hash('admin123', 10),
        role: UserRole.ADMIN,
        bio: 'System Administrator',
        phone: '+966500000001',
      },
    ];

    for (const data of adminData) {
      const existing = await userRepository.findOne({ where: { email: data.email } });
      if (!existing) {
        const admin = userRepository.create({ ...data, isActive: true, isVerified: true });
        await userRepository.save(admin);
        console.log(`  ✓ Created admin: ${data.email}`);
      } else {
        console.log(`  ⏭ Admin ${data.email} already exists`);
      }
    }

    // Seed Patient Users
    console.log('\n👥 Seeding patients...');
    const patientData = [
      { firstName: 'Khalid', lastName: 'Al-Farsi', email: 'khalid.alfarsi@email.com', phone: '+966501111111' },
      { firstName: 'Noura', lastName: 'Al-Saud', email: 'noura.alsaud@email.com', phone: '+966502222222' },
      { firstName: 'Omar', lastName: 'Al-Qahtani', email: 'omar.qahtani@email.com', phone: '+966503333333' },
      { firstName: 'Aisha', lastName: 'Al-Zahrani', email: 'aisha.zahrani@email.com', phone: '+966504444444' },
      { firstName: 'Youssef', lastName: 'Al-Ghamdi', email: 'youssef.ghamdi@email.com', phone: '+966505555555' },
      { firstName: 'Hana', lastName: 'Al-Shehri', email: 'hana.shehri@email.com', phone: '+966506666666' },
      { firstName: 'Faisal', lastName: 'Al-Balawi', email: 'faisal.balawi@email.com', phone: '+966507777777' },
      { firstName: 'Mariam', lastName: 'Al-Hassan', email: 'mariam.hassan@email.com', phone: '+966508888888' },
    ];

    const patients: User[] = [];
    for (const data of patientData) {
      const existing = await userRepository.findOne({ where: { email: data.email } });
      if (!existing) {
        const patient = userRepository.create({
          ...data,
          password: await bcrypt.hash('password123', 10),
          role: UserRole.PATIENT,
          isActive: true,
          isVerified: true,
          bio: 'Patient looking for nutritional guidance',
        });
        const saved = await userRepository.save(patient);
        patients.push(saved);
        console.log(`  ✓ Created patient: ${data.firstName} ${data.lastName}`);
      } else {
        patients.push(existing);
        console.log(`  ⏭ Patient ${data.email} already exists`);
      }
    }

    // Seed Appointments
    console.log('\n📅 Seeding appointments...');
    const statuses = [AppointmentStatus.COMPLETED, AppointmentStatus.CONFIRMED, AppointmentStatus.SCHEDULED];
    const now = new Date();
    
    for (let i = 0; i < 20; i++) {
      const doctor = doctors[i % doctors.length];
      const patient = patients[i % patients.length];
      const status = statuses[i % statuses.length];
      
      const startTime = new Date(now);
      startTime.setDate(startTime.getDate() - (i * 2));
      startTime.setHours(9 + (i % 8), 0, 0, 0);
      
      const existing = await appointmentRepository.findOne({
        where: {
          doctor: { id: doctor.id },
          patient: { id: patient.id },
          startTime: startTime,
        },
      });

      if (!existing) {
        const appointment = appointmentRepository.create({
          doctor: doctor,
          patient: patient,
          startTime: startTime,
          duration: 60,
          status: status,
          notes: i % 3 === 0 ? 'Follow-up appointment for weight management' : 'Initial consultation',
          isRecurring: false,
          meetingPhase: status === AppointmentStatus.COMPLETED ? 'post_session' : 'pre_session',
        });
        
        const saved = await appointmentRepository.save(appointment);
        console.log(`  ✓ Created appointment: ${doctor.firstName} with ${patient.firstName} (${status})`);

        // Create payment for completed appointments
        if (status === AppointmentStatus.COMPLETED) {
          const payment = paymentRepository.create({
            appointment: saved,
            amount: 150 + (i * 10),
            currency: 'SAR',
            status: PaymentStatus.COMPLETED,
            method: PaymentMethod.CREDIT_CARD,
            transactionId: `TXN-${Date.now()}-${i}`,
          });
          await paymentRepository.save(payment);
          console.log(`    ✓ Created payment: ${payment.amount} SAR`);
        }
      }
    }

    // Seed Reviews
    console.log('\n⭐ Seeding reviews...');
    const appointments = await appointmentRepository.find({
      where: { status: AppointmentStatus.COMPLETED },
      relations: ['doctor', 'patient'],
    });

    const reviewComments = [
      'Excellent doctor! Very knowledgeable and caring.',
      'Great experience, highly recommended.',
      'Very professional and helpful.',
      'Good advice and follow-up care.',
      'Amazing service and great results!',
    ];

    for (let i = 0; i < Math.min(appointments.length, 15); i++) {
      const appointment = appointments[i];
      const existing = await reviewRepository.findOne({
        where: {
          doctor: { id: appointment.doctor.id },
          patient: { id: appointment.patient.id },
        },
      });

      if (!existing) {
        const review = reviewRepository.create({
          doctor: appointment.doctor,
          patient: appointment.patient,
          appointment: appointment,
          rating: 4 + Math.floor(Math.random() * 2),
          comment: reviewComments[i % reviewComments.length],
          bedsideManner: 4 + Math.floor(Math.random() * 2),
          waitTime: 4 + Math.floor(Math.random() * 2),
          communication: 4 + Math.floor(Math.random() * 2),
          thoroughness: 4 + Math.floor(Math.random() * 2),
          isVerified: true,
          status: ReviewStatus.APPROVED,
          helpfulCount: Math.floor(Math.random() * 50),
          isAnonymous: i % 3 === 0,
        });
        
        await reviewRepository.save(review);
        console.log(`  ✓ Created review: ${review.rating} stars by ${appointment.patient.firstName}`);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ Database seeding completed successfully!');
    console.log('='.repeat(50));
    console.log('\n📊 Summary:');
    console.log(`  • Doctors: ${doctors.length}`);
    console.log(`  • Patients: ${patients.length}`);
    console.log(`  • Appointments: ${await appointmentRepository.count()}`);
    console.log(`  • Reviews: ${await reviewRepository.count()}`);
    console.log(`  • Payments: ${await paymentRepository.count()}`);
    console.log('\n🔑 Test Accounts:');
    console.log('  Admin:    admin@nutrison.com / admin123');
    console.log('  Patient:  khalid.alfarsi@email.com / password123');
    console.log('  Doctor:   sarah.mutairi@nutrison.com / password123');

    await AppDataSource.destroy();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedData();
