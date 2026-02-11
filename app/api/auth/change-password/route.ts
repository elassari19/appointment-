import { NextRequest } from 'next/server';
import { AuthService } from '@/lib/services/auth.service';
import { DatabaseService } from '@/lib/services/database.service';
import { z } from 'zod';

const authService = new AuthService();

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

async function getUserFromRequest(request: NextRequest): Promise<{ userId: string } | null> {
  const token = request.cookies.get('session_token')?.value || 
                 request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return null;
  }

  const user = await authService.getUserBySessionToken(token);

  if (!user) {
    return null;
  }

  return { userId: user.id };
}

export async function POST(request: NextRequest) {
  try {
    await DatabaseService.initialize();

    const userResult = await getUserFromRequest(request);

    if (!userResult) {
      return Response.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    const validationResult = changePasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return Response.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validationResult.data;

    const success = await authService.changePassword(userResult.userId, currentPassword, newPassword);

    if (!success) {
      return Response.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    return Response.json({
      message: 'Password has been changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
