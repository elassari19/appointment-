import { NextRequest } from 'next/server';
import { AuthService } from '@/lib/services/auth.service';
import { DatabaseService } from '@/lib/services/database.service';
import { z } from 'zod';

const authService = new AuthService();

const resendVerificationSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export async function POST(request: NextRequest) {
  try {
    await DatabaseService.initialize();

    const body = await request.json();
    
    const validationResult = resendVerificationSchema.safeParse(body);
    if (!validationResult.success) {
      return Response.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    const verificationToken = await authService.resendVerificationEmail(email);

    if (verificationToken) {
      const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
      console.log('Email verification URL:', verificationUrl);
    }

    return Response.json({
      message: 'If an account with that email exists and is not verified, a verification email has been sent.',
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
