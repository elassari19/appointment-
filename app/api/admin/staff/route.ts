import { NextRequest } from 'next/server';
import { AppDataSource } from '@/lib/database';
import { User, UserRole } from '@/lib/entities/User';
import { DoctorProfile } from '@/lib/entities/DoctorProfile';

export async function GET(request: NextRequest) {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let whereConditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      whereConditions.push(`(u."firstName" ILIKE $${paramIndex} OR u."lastName" ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (role) {
      whereConditions.push(`u.role = $${paramIndex}`);
      params.push(role);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const countQuery = `
      SELECT COUNT(*) as total 
      FROM "Users" u 
      ${whereClause}
    `;

    const countResult = await AppDataSource.query(countQuery, params);
    const total = parseInt(countResult[0]?.total || '0');

    const offset = (page - 1) * limit;

    const usersQuery = `
      SELECT 
        u.id, u."firstName", u."lastName", u.email, u.phone, u.role, u."isActive", u."profilePicture", u."createdAt"
      FROM "Users" u
      ${whereClause}
      ORDER BY u."createdAt" DESC
      LIMIT $${paramIndex} OFFSET ${paramIndex + 1}
    `;

    const users = await AppDataSource.query(usersQuery, [...params, limit, offset]);

    const staffMembers = await Promise.all(
      users.map(async (user: any) => {
        const doctorProfile = user.role === UserRole.DOCTOR 
          ? await AppDataSource.query(
              'SELECT specialty FROM "DoctorProfiles" WHERE "userId" = $1',
              [user.id]
            )
          : null;

        let userStatus = user.isActive ? 'Active' : 'Inactive';
        
        return {
          id: `#ST-${user.id.slice(0, 6).toUpperCase()}`,
          userId: user.id,
          name: `${user.firstName} ${user.lastName}`,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone || '+1 (555) 000-0000',
          role: user.role === UserRole.ADMIN ? 'Admin' : user.role === UserRole.DOCTOR ? 'Doctor' : 'Staff',
          department: doctorProfile?.[0]?.specialty || 'General',
          status: userStatus,
          joinDate: new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          avatar: user.profilePicture || null,
        };
      })
    );

    return Response.json({
      staff: staffMembers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching staff:', error);
    return Response.json({ error: 'Failed to fetch staff' }, { status: 500 });
  }
}
