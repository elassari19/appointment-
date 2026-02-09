import { NextRequest } from 'next/server';
import { AuthService, RegisterUserData } from '@/lib/services/auth.service';
import { DatabaseService } from '@/lib/services/database.service';
import { UserRole } from '@/lib/entities/User';

const authService = new AuthService();

export async function POST(request: NextRequest) {
  try {
    // Initialize database connection
    await DatabaseService.initialize();

    const body = await request.json();
    const { firstName, lastName, email, password, role }: RegisterUserData = body;

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return Response.json(
        { error: 'First name, last name, email and password are required' },
        { status: 400 }
      );
    }

    // Validate role if provided
    if (role && !Object.values(UserRole).includes(role)) {
      return Response.json(
        { error: 'Invalid role specified' },
        { status: 400 }
      );
    }

    // Attempt to register
    const result = await authService.register({
      firstName,
      lastName,
      email,
      password,
      role: role || UserRole.PATIENT,
    });

    // Return user and session data
    return Response.json({
      user: {
        id: result.user.id,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        email: result.user.email,
        role: result.user.role,
      },
      session: {
        id: result.session.id,
        token: result.session.token,
        expiresAt: result.session.expiresAt,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}