import { NextRequest } from 'next/server';
import { AuthService } from '@/lib/services/auth.service';
import { DatabaseService } from '@/lib/services/database.service';
import { z } from 'zod';

const authService = new AuthService();

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

export async function POST(request: NextRequest) {
  try {
    await DatabaseService.initialize();

    const body = await request.json();
    
    const validationResult = verifyEmailSchema.safeParse(body);
    if (!validationResult.success) {
      return Response.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { token } = validationResult.data;

    const success = await authService.verifyEmail(token);

    if (!success) {
      return Response.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    return Response.json({
      message: 'Email has been verified successfully',
    });
  } catch (error) {
    console.error('Verify email error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
