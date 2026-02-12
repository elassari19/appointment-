import { NextRequest } from 'next/server';
import { AuthService, RegisterUserData } from '@/lib/services/auth.service';
import { DatabaseService } from '@/lib/services/database.service';
import { UserRole } from '@/lib/entities/User';
import { z } from 'zod';

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(/[A-Z]/, 'Password must contain at least one uppercase letter').regex(/[a-z]/, 'Password must contain at least one lowercase letter').regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.enum(['patient', 'doctor']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    await DatabaseService.initialize();

    const body = await request.json();
    
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return Response.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, password, role } = validationResult.data;

    const authService = new AuthService();
    const result = await authService.register({
      firstName,
      lastName,
      email,
      password,
      role: role ? (role === 'doctor' ? UserRole.DOCTOR : UserRole.PATIENT) : UserRole.PATIENT,
    });

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
