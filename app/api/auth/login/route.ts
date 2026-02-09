import { NextRequest } from 'next/server';
import { AuthService, LoginCredentials } from '@/lib/services/auth.service';
import { DatabaseService } from '@/lib/services/database.service';

const authService = new AuthService();

export async function POST(request: NextRequest) {
  try {
    // Initialize database connection
    await DatabaseService.initialize();

    const body = await request.json();
    const { email, password }: LoginCredentials = body;

    // Validate input
    if (!email || !password) {
      return Response.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Attempt to log in
    const result = await authService.login({ email, password });

    if (!result) {
      return Response.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

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
    console.error('Login error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}