import { NextRequest } from 'next/server';
import { AuthService } from '@/lib/services/auth.service';
import { DatabaseService } from '@/lib/services/database.service';
import { z } from 'zod';

const authService = new AuthService();

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export async function POST(request: NextRequest) {
  try {
    await DatabaseService.initialize();

    const body = await request.json();
    
    const validationResult = resetPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return Response.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { token, password } = validationResult.data;

    const success = await authService.resetPassword(token, password);

    if (!success) {
      return Response.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    return Response.json({
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
