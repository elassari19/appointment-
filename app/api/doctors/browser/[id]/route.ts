import { NextRequest, NextResponse } from 'next/server';
import { AppDataSource } from '@/lib/database';
import { ReviewStatus } from '@/lib/entities/Review';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const month = parseInt(searchParams.get('month') || new Date().getMonth().toString());
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

    const doctor = await AppDataSource.query(
      'SELECT * FROM "Users" WHERE id = $1 AND role = $2 AND "isActive" = true',
      [id, 'doctor']
    );

    if (doctor.length === 0) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    const profile = await AppDataSource.query(
      'SELECT * FROM "DoctorProfiles" WHERE "userId" = $1',
      [id]
    );

    const doctorProfile = profile[0] || {};

    const appointmentCount = await AppDataSource.query(
      'SELECT COUNT(*) as count FROM "Appointments" WHERE "doctorId" = $1 AND status = $2',
      [id, 'completed']
    );

    const reviews = await AppDataSource.query(
      `SELECT r.*, u."firstName", u."lastName" 
       FROM "Reviews" r 
       LEFT JOIN "Users" u ON u.id = r."patientId"
       WHERE r."doctorId" = $1 AND r.status = $2 
       ORDER BY r."createdAt" DESC 
       LIMIT 50`,
      [id, ReviewStatus.APPROVED]
    );

    const ratingSummary = {
      averageRating: reviews.length > 0
        ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
        : 4.8,
      totalReviews: reviews.length || Math.floor((appointmentCount[0]?.count || 0) * 0.8),
      ratingDistribution: {
        5: reviews.filter((r: any) => r.rating === 5).length,
        4: reviews.filter((r: any) => r.rating === 4).length,
        3: reviews.filter((r: any) => r.rating === 3).length,
        2: reviews.filter((r: any) => r.rating === 2).length,
        1: reviews.filter((r: any) => r.rating === 1).length,
      },
    };

    const formattedReviews = reviews.slice(0, 10).map((review: any) => {
      const firstName = review.firstName || 'Anonymous';
      const lastName = review.lastName ? review.lastName[0] + '.' : '';
      return {
        id: review.id,
        name: `${firstName} ${lastName}`,
        initials: `${firstName[0]}${review.lastName ? review.lastName[0] : 'A'}`,
        date: getRelativeTime(new Date(review.createdAt)),
        rating: review.rating,
        text: review.comment || '',
        isVerified: review.isVerified || false,
      };
    });

    const subSpecialties = doctorProfile.subSpecialties 
      ? (typeof doctorProfile.subSpecialties === 'string' 
          ? doctorProfile.subSpecialties.split(',') 
          : doctorProfile.subSpecialties)
      : [];

    const insuranceAccepted = doctorProfile.insuranceAccepted 
      ? (typeof doctorProfile.insuranceAccepted === 'string'
          ? doctorProfile.insuranceAccepted.split(',')
          : doctorProfile.insuranceAccepted)
      : ['BlueCross', 'Aetna', 'Medicare', 'Cigna'];

    const education = doctorProfile.education || [
      { institution: 'Medical School', degree: 'MD', fieldOfStudy: 'Medicine', year: 2010 },
      { institution: 'Residency Hospital', degree: 'Internal Medicine', fieldOfStudy: 'Internal Medicine', year: 2013 },
    ];

    const languages = doctorProfile.languages || [
      { name: 'English', level: 'Native', isPrimary: true }
    ];

    const today = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayDayOfWeek = dayNames[today.getDay()];
    
    const todayAvailability = await AppDataSource.query(
      `SELECT * FROM "Availabilities" 
       WHERE "doctorId" = $1 AND "isAvailable" = true AND "dayOfWeek" = $2`,
      [id, todayDayOfWeek]
    );

    const isAvailableToday = todayAvailability.length > 0;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const calendarDays = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push({ day: null, date: null, slots: [] });
    }
    
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dayIndex = date.getDay();
      const dayName = dayNames[dayIndex];
      
      const dayAvailability = await AppDataSource.query(
        `SELECT * FROM "Availabilities" 
         WHERE "doctorId" = $1 AND "isAvailable" = true AND "dayOfWeek" = $2`,
        [id, dayName]
      );
      
      let slots: string[] = [];
      if (dayAvailability.length > 0) {
        slots = generateTimeSlots(dayAvailability);
      }
      
      calendarDays.push({
        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayIndex],
        date: d,
        slots,
        isPast: date < new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        isToday: date.toDateString() === today.toDateString(),
      });
    }

    const clinicHours = doctorProfile.clinicHours || [
      { day: 'Monday', openTime: '08:00', closeTime: '18:00', isClosed: false },
      { day: 'Tuesday', openTime: '08:00', closeTime: '18:00', isClosed: false },
      { day: 'Wednesday', openTime: '08:00', closeTime: '18:00', isClosed: false },
      { day: 'Thursday', openTime: '08:00', closeTime: '18:00', isClosed: false },
      { day: 'Friday', openTime: '08:00', closeTime: '18:00', isClosed: false },
      { day: 'Saturday', openTime: '09:00', closeTime: '13:00', isClosed: false },
      { day: 'Sunday', openTime: '', closeTime: '', isClosed: true },
    ];

    return NextResponse.json({
      id: doctor[0].id,
      name: `Dr. ${doctor[0].firstName} ${doctor[0].lastName}, MD`,
      firstName: doctor[0].firstName,
      lastName: doctor[0].lastName,
      title: doctorProfile.specialty ? `${doctorProfile.specialty} Specialist` : 'Senior Specialist',
      hospital: doctorProfile.clinicName || 'Medical Center',
      languages: languages.map((l: any) => l.name),
      rating: parseFloat(ratingSummary.averageRating.toFixed(1)),
      patients: `${(doctorProfile.totalPatients || appointmentCount[0]?.count || 0).toLocaleString()}+`,
      experience: doctorProfile.yearsOfExperience || 1,
      verified: doctor[0].isVerified || doctorProfile.licenseInfo?.isVerified || false,
      available: isAvailableToday,
      fee: doctorProfile.consultationFee || 150,
      image: doctor[0].profilePicture || null,
      
      specializations: subSpecialties,
      education: education.map((e: any) => ({
        school: e.institution || e.school,
        degree: e.degree,
      })),
      
      about: {
        summary: doctorProfile.professionalSummary || 'Experienced medical professional dedicated to providing quality healthcare.',
        detailed: doctorProfile.professionalSummary || 'Dr. is committed to delivering exceptional patient care with a focus on preventive medicine and personalized treatment plans.',
      },
      
      reviews: {
        list: formattedReviews,
        total: ratingSummary.totalReviews,
        summary: {
          averageRating: parseFloat(ratingSummary.averageRating.toFixed(1)),
          distribution: ratingSummary.ratingDistribution,
        },
      },
      
      calendar: {
        month,
        year,
        days: calendarDays,
      },
      
      clinic: {
        name: doctorProfile.clinicName || 'Medical Center',
        address: doctorProfile.clinicAddress || '725 5th Ave, Manhattan, New York, NY 10022',
        phone: doctorProfile.clinicPhone || null,
        hours: clinicHours,
        mapImage: null,
      },
      
      insurance: insuranceAccepted,
      telemedicineEnabled: doctorProfile.telemedicineEnabled ?? true,
    });
  } catch (error) {
    console.error('Error fetching doctor profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

function generateTimeSlots(availabilities: any[]): string[] {
  const slots: string[] = [];
  
  for (const avail of availabilities) {
    const start = parseTime(avail.startTime);
    const end = parseTime(avail.endTime);
    
    let current = start;
    while (current < end) {
      slots.push(formatTime(current));
      current = addMinutes(current, 30);
    }
  }
  
  return slots;
}

function parseTime(timeStr: string): number {
  const [time, period] = timeStr.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  let hour = hours;
  if (period?.toLowerCase() === 'pm' && hour !== 12) hour += 12;
  if (period?.toLowerCase() === 'am' && hour === 12) hour = 0;
  return hour * 60 + minutes;
}

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
  return `${hour}:${mins.toString().padStart(2, '0')} ${period}`;
}

function addMinutes(minutes: number, add: number): number {
  return minutes + add;
}
