import { NextRequest, NextResponse } from 'next/server';
import { AppDataSource } from '@/lib/database';
import { UserRole } from '@/lib/entities/User';

export async function GET(req: NextRequest) {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search') || '';
    const specialties = searchParams.get('specialties')?.split(',').filter(Boolean) || [];
    // const availability = searchParams.get('availability') || '';
    const minFee = searchParams.get('minFee') ? parseInt(searchParams.get('minFee')!) : 0;
    const maxFee = searchParams.get('maxFee') ? parseInt(searchParams.get('maxFee')!) : 1000;
    // const sortBy = searchParams.get('sortBy') || 'rating';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    let whereConditions = ['u.role = $1', 'u."isActive" = true'];
    const params: any[] = [UserRole.DOCTOR];
    let paramIndex = 2;

    if (search) {
      whereConditions.push(`(u."firstName" ILIKE $${paramIndex} OR u."lastName" ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (specialties.length > 0) {
      const placeholders = specialties.map((_, idx) => `$${paramIndex + idx}`).join(', ');
      whereConditions.push(`dp.specialty IN (${placeholders})`);
      params.push(...specialties);
      paramIndex += specialties.length;
    }

    if (minFee > 0) {
      whereConditions.push(`dp."consultationFee" >= $${paramIndex}`);
      params.push(minFee);
      paramIndex++;
    }

    if (maxFee < 1000) {
      whereConditions.push(`dp."consultationFee" <= $${paramIndex}`);
      params.push(maxFee);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    const countQuery = `
      SELECT COUNT(*) as total 
      FROM "Users" u 
      LEFT JOIN "DoctorProfiles" dp ON dp."userId" = u.id 
      WHERE ${whereClause}
    `;

    const countResult = await AppDataSource.query(countQuery, params);
    const total = parseInt(countResult[0]?.total || '0');

    // let orderColumn = 'u."createdAt"';
    // let orderDirection = 'DESC';

    // switch (sortBy) {
    //   case 'experience':
    //     orderColumn = 'dp."yearsOfExperience"';
    //     break;
    //   case 'feeLowToHigh':
    //     orderColumn = 'dp."consultationFee"';
    //     orderDirection = 'ASC';
    //     break;
    //   case 'feeHighToLow':
    //     orderColumn = 'dp."consultationFee"';
    //     break;
    //   default:
    //     orderColumn = 'u."createdAt"';
    // }

    const offset = (page - 1) * limit;

    const doctorsQuery = `
      SELECT 
        u.id, u."firstName", u."lastName", u."profilePicture", u."createdAt",
        dp.specialty, dp."consultationFee", dp."yearsOfExperience", dp."totalPatients"
      FROM "Users" u
      LEFT JOIN "DoctorProfiles" dp ON dp."userId" = u.id
      WHERE ${whereClause}
      ORDER BY u."createdAt" DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const doctors = await AppDataSource.query(doctorsQuery, [...params, limit, offset]);

    const today = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = dayNames[today.getDay()];

    const formattedDoctors = await Promise.all(
      doctors.map(async (doctor: any) => {
        const todayAvail = await AppDataSource.query(
          `SELECT id FROM "Availabilities" 
           WHERE "doctorId" = $1 AND "isAvailable" = true AND "dayOfWeek" = $2 
           LIMIT 1`,
          [doctor.id, currentDay]
        );

        const reviews = await AppDataSource.query(
          `SELECT AVG(rating) as avg, COUNT(*) as count 
           FROM "Reviews" 
           WHERE "doctorId" = $1 AND status = 'approved'`,
          [doctor.id]
        );

        const ratingValue = reviews[0]?.avg ? parseFloat(reviews[0].avg) : 4.8;

        return {
          id: doctor.id,
          name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
          firstName: doctor.firstName,
          lastName: doctor.lastName,
          specialty: doctor.specialty || 'General Practice',
          rating: ratingValue,
          fee: doctor.consultationFee || 150,
          experience: doctor.yearsOfExperience || 1,
          patients: doctor.totalPatients ? `${doctor.totalPatients}+` : '0+',
          available: todayAvail.length > 0,
          availableDay: null,
          image: doctor.profilePicture || null,
          hasAvailability: todayAvail.length > 0,
        };
      })
    );

    return NextResponse.json({
      doctors: formattedDoctors,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Doctors list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
