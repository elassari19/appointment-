import { NextRequest } from 'next/server';
import { AppDataSource } from '@/lib/database';
import { User, UserRole } from '@/lib/entities/User';

export async function GET(request: NextRequest) {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const role = searchParams.get('role');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || query.length < 2) {
      return Response.json({ users: [] });
    }

    let whereConditions = [
      `(u."firstName" ILIKE $1 OR u."lastName" ILIKE $1 OR u.email ILIKE $1)`
    ];
    const params: any[] = [`%${query}%`];

    if (role) {
      whereConditions.push(`u.role = $2`);
      params.push(role);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const usersQuery = `
      SELECT 
        u.id, u."firstName", u."lastName", u.email, u.phone, u.role, u."isActive", u."profilePicture", u."createdAt"
      FROM "Users" u
      ${whereClause}
      ORDER BY u."firstName" ASC, u."lastName" ASC
      LIMIT $${params.length + 1}
    `;

    const users = await AppDataSource.query(usersQuery, [...params, limit]);

    const results = users.map((user: any) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.profilePicture,
    }));

    return Response.json({ users: results });
  } catch (error) {
    console.error('Error searching users:', error);
    return Response.json({ error: 'Failed to search users' }, { status: 500 });
  }
}
