import { NextRequest } from 'next/server';
import { AuthService } from '@/lib/services/auth.service';
import { DatabaseService } from '@/lib/services/database.service';
import { z } from 'zod';

const authService = new AuthService();

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export async function POST(request: NextRequest) {
  try {
    await DatabaseService.initialize();

    const body = await request.json();
    
    const validationResult = forgotPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return Response.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    const resetToken = await authService.generatePasswordResetToken(email);

    if (resetToken) {
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
      console.log('Password reset URL:', resetUrl);
    }

    return Response.json({
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
