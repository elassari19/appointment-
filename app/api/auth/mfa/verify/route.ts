import { NextRequest, NextResponse } from 'next/server';
import { MfaService } from '@/lib/services/mfa.service';
import { AuthService } from '@/lib/services/auth.service';
import { z } from 'zod';

const mfaService = new MfaService();
const authService = new AuthService();

const verifySchema = z.object({
  code: z.string().length(6, 'Invalid code format'),
});

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token') ||
      request.headers.get('authorization')?.replace('Bearer ', '') ||
      request.headers.get('x-auth-token');

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = verifySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { code } = validationResult.data;

    const user = await authService.getUserBySessionToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (!user.mfaSecret) {
      return NextResponse.json({ error: 'MFA is not configured' }, { status: 400 });
    }

    const secret = mfaService.decryptSecret(user.mfaSecret);
    const isValid = mfaService.verifyCode(secret, code);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'MFA verified successfully',
    });
  } catch (error) {
    console.error('MFA verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
