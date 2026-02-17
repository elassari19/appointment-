const { DataSource } = require('typeorm');
const bcrypt = require('bcryptjs');

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: false,
  synchronize: false,
  logging: false,
});

async function seedDoctors() {
  try {
    await dataSource.initialize();
    console.log('Database connected. Seeding doctors...');

    const doctorData = [
      {
        firstName: 'Sarah',
        lastName: 'Al-Mutairi',
        email: 'sarah.mutairi@nutrison.com',
        password: await bcrypt.hash('password123', 10),
        role: 'doctor',
        bio: 'Certified Dietitian with 10+ years of experience in nutritional counseling and weight management.',
        specialty: 'Weight Management',
        phone: '+966501234567',
        profile: {
          specialty: 'Weight Management',
          subSpecialties: ['Nutrition Counseling', 'Meal Planning', 'Obesity Medicine'],
          licenseInfo: {
            licenseNumber: 'MD-123456',
            issuingAuthority: 'Saudi Commission for Health Specialties',
            issueDate: '2010-01-15',
            expiryDate: '2030-01-15',
            isVerified: true,
          },
          medicalSchool: 'King Saud University',
          residency: 'King Faisal Specialist Hospital',
          yearsOfExperience: 12,
          boardCertifications: ['Board Certified in Clinical Nutrition', 'Certified Diabetes Educator'],
          clinicName: 'Metropolitan Nutrition Center',
          clinicAddress: '725 5th Ave, Riyadh, Saudi Arabia',
          clinicPhone: '+966112345678',
          clinicHours: [
            { day: 'Monday', openTime: '09:00', closeTime: '18:00', isClosed: false },
            { day: 'Tuesday', openTime: '09:00', closeTime: '18:00', isClosed: false },
            { day: 'Wednesday', openTime: '09:00', closeTime: '18:00', isClosed: false },
            { day: 'Thursday', openTime: '09:00', closeTime: '18:00', isClosed: false },
            { day: 'Friday', openTime: '09:00', closeTime: '13:00', isClosed: false },
            { day: 'Saturday', openTime: '10:00', closeTime: '14:00', isClosed: false },
            { day: 'Sunday', openTime: '00:00', closeTime: '00:00', isClosed: true },
          ],
          consultationFee: 200,
          followUpFee: 150,
          telemedicineEnabled: true,
          insuranceAccepted: ['Tawuniya', 'Bupa', 'Cigna', 'Alrajhi'],
          acceptingNewPatients: true,
          professionalSummary: 'Dr. Sarah Al-Mutairi is a certified dietitian specializing in weight management and nutritional counseling.',
          education: [
            { institution: 'King Saud University', degree: 'MD', fieldOfStudy: 'Medicine', year: 2008, description: 'Bachelor of Medicine and Surgery' },
            { institution: 'King Saud University', degree: 'MSc', fieldOfStudy: 'Clinical Nutrition', year: 2012, description: 'Master of Science in Clinical Nutrition' },
          ],
          languages: [
            { name: 'Arabic', level: 'Native', isPrimary: true },
            { name: 'English', level: 'Professional', isPrimary: false },
          ],
          awards: [
            { title: 'Best Dietitian Award', organization: 'Saudi Nutrition Association', year: 2023 },
          ],
          publications: [
            { title: 'Effective Weight Loss Strategies in Middle Eastern Populations', journal: 'Journal of Clinical Nutrition', year: 2022 },
          ],
          professionalMemberships: ['Saudi Commission for Health Specialties', 'Academy of Nutrition and Dietetics'],
          totalPatients: 2500,
          totalAppointments: 8500,
          completedAppointments: 8200,
          averageResponseTimeHours: 1.5,
          isFeatured: true,
        },
      },
      {
        firstName: 'Ahmed',
        lastName: 'Al-Harbi',
        email: 'ahmed.harbi@nutrison.com',
        password: await bcrypt.hash('password123', 10),
        role: 'doctor',
        bio: 'Specializing in sports nutrition and meal planning for athletes.',
        specialty: 'Sports Nutrition',
        phone: '+966507654321',
        profile: {
          specialty: 'Sports Nutrition',
          subSpecialties: ['Athletic Performance', 'Recovery Nutrition', 'Body Composition'],
          licenseInfo: {
            licenseNumber: 'MD-234567',
            issuingAuthority: 'Saudi Commission for Health Specialties',
            issueDate: '2012-06-20',
            expiryDate: '2032-06-20',
            isVerified: true,
          },
          medicalSchool: 'Prince Sattam bin Abdulaziz University',
          residency: 'National Guard Health Affairs',
          yearsOfExperience: 10,
          boardCertifications: ['Certified Sports Nutritionist', 'Performance Nutrition Specialist'],
          clinicName: 'Sports Performance Center',
          clinicAddress: '123 Athletic Way, Jeddah, Saudi Arabia',
          clinicPhone: '+966122345678',
          consultationFee: 250,
          followUpFee: 180,
          telemedicineEnabled: true,
          insuranceAccepted: ['Tawuniya', 'Almadar'],
          acceptingNewPatients: true,
          professionalSummary: 'Dr. Ahmed Al-Harbi is a sports nutrition specialist dedicated to helping athletes optimize their performance.',
          education: [
            { institution: 'Prince Sattam bin Abdulaziz University', degree: 'MD', fieldOfStudy: 'Medicine', year: 2010 },
            { institution: 'Loughborough University', degree: 'PhD', fieldOfStudy: 'Sports Nutrition', year: 2015 },
          ],
          languages: [
            { name: 'Arabic', level: 'Native', isPrimary: true },
            { name: 'English', level: 'Professional', isPrimary: false },
          ],
          awards: [
            { title: 'Excellence in Sports Nutrition', organization: 'International Society of Sports Nutrition', year: 2022 },
          ],
          publications: [],
          professionalMemberships: ['International Society of Sports Nutrition', 'American College of Sports Medicine'],
          totalPatients: 1800,
          totalAppointments: 6200,
          completedAppointments: 6000,
          averageResponseTimeHours: 2,
          isFeatured: true,
        },
      },
      {
        firstName: 'Fatima',
        lastName: 'Al-Otaibi',
        email: 'fatima.otaibi@nutrison.com',
        password: await bcrypt.hash('password123', 10),
        role: 'doctor',
        bio: 'Expert in diabetic nutrition and chronic disease management.',
        specialty: 'Diabetes Management',
        phone: '+966509876543',
        profile: {
          specialty: 'Diabetes Management',
          subSpecialties: ['Type 1 Diabetes', 'Type 2 Diabetes', 'Gestational Diabetes'],
          licenseInfo: {
            licenseNumber: 'MD-345678',
            issuingAuthority: 'Saudi Commission for Health Specialties',
            issueDate: '2011-03-10',
            expiryDate: '2031-03-10',
            isVerified: true,
          },
          medicalSchool: 'King Abdulaziz University',
          residency: 'King Khalid University Hospital',
          yearsOfExperience: 11,
          boardCertifications: ['Certified Diabetes Educator', 'Board Certified in Advanced Diabetes Management'],
          clinicName: 'Diabetes Care Center',
          clinicAddress: '456 Health District, Dammam, Saudi Arabia',
          clinicPhone: '+966132345678',
          consultationFee: 180,
          followUpFee: 130,
          telemedicineEnabled: true,
          insuranceAccepted: ['Tawuniya', 'Bupa', 'Cigna', 'MedGulf'],
          acceptingNewPatients: true,
          professionalSummary: 'Dr. Fatima Al-Otaibi is a diabetes nutrition specialist with extensive experience.',
          education: [
            { institution: 'King Abdulaziz University', degree: 'MD', fieldOfStudy: 'Medicine', year: 2009 },
            { institution: 'Harvard Medical School', degree: 'Fellowship', fieldOfStudy: 'Diabetes Management', year: 2014 },
          ],
          languages: [
            { name: 'Arabic', level: 'Native', isPrimary: true },
            { name: 'English', level: 'Professional', isPrimary: false },
          ],
          awards: [
            { title: 'Diabetes Care Excellence Award', organization: 'American Diabetes Association', year: 2023 },
          ],
          publications: [
            { title: 'Glycemic Control Through Diet in Saudi Arabian Patients', journal: 'Diabetes Care', year: 2021 },
          ],
          professionalMemberships: ['American Diabetes Association', 'Saudi Diabetes Association'],
          totalPatients: 3200,
          totalAppointments: 9800,
          completedAppointments: 9500,
          averageResponseTimeHours: 1,
          isFeatured: true,
        },
      },
      {
        firstName: 'Mohammed',
        lastName: 'Al-Dossary',
        email: 'mohammed.dossary@nutrison.com',
        password: await bcrypt.hash('password123', 10),
        role: 'doctor',
        bio: 'Focus on pediatric nutrition and family meal planning.',
        specialty: 'Pediatric Nutrition',
        phone: '+966551234567',
        profile: {
          specialty: 'Pediatric Nutrition',
          subSpecialties: ['Infant Nutrition', 'Adolescent Nutrition', 'Family Meal Planning'],
          licenseInfo: {
            licenseNumber: 'MD-456789',
            issuingAuthority: 'Saudi Commission for Health Specialties',
            issueDate: '2014-09-01',
            expiryDate: '2034-09-01',
            isVerified: true,
          },
          medicalSchool: 'Umm Al-Qura University',
          residency: 'King Abdullah Specialized Children Hospital',
          yearsOfExperience: 8,
          boardCertifications: ['Board Certified Pediatric Nutrition Specialist', 'Certified Lactation Consultant'],
          clinicName: 'Children Wellness Clinic',
          clinicAddress: '789 Pediatric Lane, Mecca, Saudi Arabia',
          clinicPhone: '+966142345678',
          consultationFee: 170,
          followUpFee: 120,
          telemedicineEnabled: true,
          insuranceAccepted: ['Tawuniya', 'Bupa', 'Almadar'],
          acceptingNewPatients: true,
          professionalSummary: 'Dr. Mohammed Al-Dossary is a pediatric nutrition expert dedicated to helping children and families.',
          education: [
            { institution: 'Umm Al-Qura University', degree: 'MD', fieldOfStudy: 'Medicine', year: 2012 },
            { institution: "Boston Children's Hospital", degree: 'Fellowship', fieldOfStudy: 'Pediatric Nutrition', year: 2017 },
          ],
          languages: [
            { name: 'Arabic', level: 'Native', isPrimary: true },
            { name: 'English', level: 'Professional', isPrimary: false },
          ],
          awards: [
            { title: 'Pediatric Nutrition Innovation Award', organization: 'Saudi Pediatric Society', year: 2022 },
          ],
          publications: [],
          professionalMemberships: ['Saudi Pediatric Society', 'Pediatric Nutrition Association'],
          totalPatients: 1500,
          totalAppointments: 4500,
          completedAppointments: 4300,
          averageResponseTimeHours: 1.2,
          isFeatured: false,
        },
      },
      {
        firstName: 'Layla',
        lastName: 'Al-Rashid',
        email: 'layla.rashid@nutrison.com',
        password: await bcrypt.hash('password123', 10),
        role: 'doctor',
        bio: 'Specialized in gut health, food allergies, and intuitive eating.',
        specialty: 'Gut Health',
        phone: '+966558765432',
        profile: {
          specialty: 'Gut Health',
          subSpecialties: ['Food Allergies', 'Intuitive Eating', 'Gut-Brain Axis'],
          licenseInfo: {
            licenseNumber: 'MD-567890',
            issuingAuthority: 'Saudi Commission for Health Specialties',
            issueDate: '2015-02-15',
            expiryDate: '2035-02-15',
            isVerified: true,
          },
          medicalSchool: 'Imam Muhammad ibn Saud Islamic University',
          residency: 'King Fahad Medical City',
          yearsOfExperience: 7,
          boardCertifications: ['Certified Gut Health Specialist', 'Certified Intuitive Eating Counselor'],
          clinicName: 'Gut Health Institute',
          clinicAddress: '321 Digestive Wellness Blvd, Medina, Saudi Arabia',
          clinicPhone: '+966152345678',
          consultationFee: 220,
          followUpFee: 160,
          telemedicineEnabled: true,
          insuranceAccepted: ['Tawuniya', 'Cigna', 'MedGulf', 'SALAMA'],
          acceptingNewPatients: true,
          professionalSummary: 'Dr. Layla Al-Rashid is a gut health specialist with a holistic approach to digestive wellness.',
          education: [
            { institution: 'Imam Muhammad ibn Saud Islamic University', degree: 'MD', fieldOfStudy: 'Medicine', year: 2013 },
            { institution: 'Monash University', degree: 'MSc', fieldOfStudy: 'Gut Microbiome Science', year: 2018 },
          ],
          languages: [
            { name: 'Arabic', level: 'Native', isPrimary: true },
            { name: 'English', level: 'Professional', isPrimary: false },
          ],
          awards: [
            { title: 'Gut Health Research Excellence', organization: 'International Gut Microbiome Society', year: 2023 },
          ],
          publications: [
            { title: 'The Role of Diet in Gut Microbiome Diversity', journal: 'Nutrients', year: 2022 },
          ],
          professionalMemberships: ['International Gut Microbiome Society', 'Academy of Nutrition and Dietetics'],
          totalPatients: 2100,
          totalAppointments: 5800,
          completedAppointments: 5600,
          averageResponseTimeHours: 1.8,
          isFeatured: true,
        },
      },
    ];

    for (const data of doctorData) {
      const existingUser = await dataSource.query(
        'SELECT id FROM users WHERE email = $1',
        [data.email]
      );

      if (existingUser.length > 0) {
        console.log(`Doctor ${data.email} already exists, skipping...`);
        continue;
      }

      const userResult = await dataSource.query(
        `INSERT INTO users (first_name, last_name, email, password, role, bio, specialty, phone, is_active, is_verified, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, true, now(), now())
         RETURNING id`,
        [data.firstName, data.lastName, data.email, data.password, data.role, data.bio, data.specialty, data.phone]
      );

      const userId = userResult[0].id;
      console.log(`Created doctor: ${data.firstName} ${data.lastName}`);

      await dataSource.query(
        `INSERT INTO doctor_profiles (userId, specialty, sub_specialties, license_number, license_issuing_authority, license_issue_date, license_expiry_date, license_is_verified,
         medical_school, residency, years_of_experience, board_certifications, clinic_name, clinic_address, clinic_phone, clinic_hours, consultation_fee, follow_up_fee,
         telemedicine_enabled, insurance_accepted, accepting_new_patients, professional_summary, education, languages, awards, publications, professional_memberships,
         total_patients, total_appointments, completed_appointments, average_response_time_hours, is_featured, is_published, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, now(), now())`,
        [
          userId,
          data.profile.specialty,
          data.profile.subSpecialties.join(','),
          data.profile.licenseInfo.licenseNumber,
          data.profile.licenseInfo.issuingAuthority,
          data.profile.licenseInfo.issueDate,
          data.profile.licenseInfo.expiryDate,
          data.profile.licenseInfo.isVerified,
          data.profile.medicalSchool,
          data.profile.residency,
          data.profile.yearsOfExperience,
          data.profile.boardCertifications.join(','),
          data.profile.clinicName,
          data.profile.clinicAddress,
          data.profile.clinicPhone,
          JSON.stringify(data.profile.clinicHours),
          data.profile.consultationFee,
          data.profile.followUpFee,
          data.profile.telemedicineEnabled,
          data.profile.insuranceAccepted.join(','),
          data.profile.acceptingNewPatients,
          data.profile.professionalSummary,
          JSON.stringify(data.profile.education),
          JSON.stringify(data.profile.languages),
          JSON.stringify(data.profile.awards),
          JSON.stringify(data.profile.publications),
          data.profile.professionalMemberships.join(','),
          data.profile.totalPatients,
          data.profile.totalAppointments,
          data.profile.completedAppointments,
          data.profile.averageResponseTimeHours,
          data.profile.isFeatured,
          data.profile.isPublished,
        ]
      );
      console.log(`  - Created doctor profile`);
    }

    console.log('\nDoctors seeded successfully!');
    console.log('\nTest accounts:');
    console.log('  - sarah.mutairi@nutrison.com / password123');
    console.log('  - ahmed.harbi@nutrison.com / password123');
    console.log('  - fatima.otaibi@nutrison.com / password123');
    console.log('  - mohammed.dossary@nutrison.com / password123');
    console.log('  - layla.rashid@nutrison.com / password123');

    await dataSource.destroy();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedDoctors();
