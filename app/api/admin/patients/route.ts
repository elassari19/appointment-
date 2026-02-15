import { NextRequest } from 'next/server';
import { DatabaseService } from '@/lib/services/database.service';
import { getServerUser, UserRole } from '@/lib/middleware/role-protection';
import { AppDataSource } from '@/lib/database';
import { User, UserRole as UserRoleEnum } from '@/lib/entities/User';
import { Appointment, AppointmentStatus } from '@/lib/entities/Appointment';

export async function GET(request: NextRequest) {
  try {
    await DatabaseService.initialize();

    const user = await getServerUser();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const offset = (page - 1) * limit;

    let whereClause = 'WHERE u.role = $1';
    const params: any[] = [UserRoleEnum.PATIENT];
    let paramIndex = 2;

    if (search) {
      whereClause += ` AND (u."firstName" ILIKE $${paramIndex} OR u."lastName" ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (status === 'active') {
      whereClause += ' AND u."isActive" = true';
    } else if (status === 'inactive') {
      whereClause += ' AND u."isActive" = false';
    }

    const countQuery = `
      SELECT COUNT(*) as total FROM "Users" u ${whereClause}
    `;
    const countResult = await AppDataSource.query(countQuery, params);
    const total = parseInt(countResult[0]?.total || '0');

    const patientsQuery = `
      SELECT u.id, u."firstName", u."lastName", u.email, u.phone, u."dateOfBirth", 
             u."profilePicture", u."isActive", u."createdAt", u."updatedAt",
             u.weight, u.height, u."bloodType"
      FROM "Users" u
      ${whereClause}
      ORDER BY u."createdAt" DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    const patientsResult = await AppDataSource.query(patientsQuery, [...params, limit, offset]);

    const patients = patientsResult.map((patient: any) => {
      const age = patient.dateOfBirth 
        ? Math.floor((new Date().getTime() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : null;
      
      return {
        id: `PT-${patient.id.slice(0, 4).toUpperCase()}`,
        patientId: patient.id,
        name: `${patient.firstName} ${patient.lastName}`,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        phone: patient.phone || '',
        age,
        dateOfBirth: patient.dateOfBirth,
        gender: null,
        status: patient.isActive ? 'Active' : 'Inactive',
        lastVisit: patient.updatedAt ? new Date(patient.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null,
        createdAt: patient.createdAt,
        avatar: patient.profilePicture || null,
        weight: patient.weight ? `${patient.weight} kg` : null,
        height: patient.height ? `${patient.height} cm` : null,
        bloodType: patient.bloodType || null,
        appointments: [],
        notes: [],
      };
    });

    return Response.json({
      patients,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get admin patients error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
