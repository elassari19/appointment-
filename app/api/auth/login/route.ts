import { NextRequest } from 'next/server';
import { AuthService, LoginCredentials } from '@/lib/services/auth.service';
import { DatabaseService } from '@/lib/services/database.service';
import { z } from 'zod';

const authService = new AuthService();

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    await DatabaseService.initialize();

    const body = await request.json();
    
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return Response.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password }: LoginCredentials = validationResult.data;

    const result = await authService.login({ email, password });

    if (!result) {
      return Response.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

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
    console.error('Login error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
