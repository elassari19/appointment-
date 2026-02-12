import { NextRequest, NextResponse } from 'next/server';
import { MfaService } from '@/lib/services/mfa.service';
import { AuthService } from '@/lib/services/auth.service';
import { z } from 'zod';

const mfaService = new MfaService();
const authService = new AuthService();

const enableSchema = z.object({
  secret: z.string().min(32, 'Invalid secret'),
  recoveryCodes: z.array(z.string()).min(1, 'At least one recovery code required'),
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
    const validationResult = enableSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { secret, recoveryCodes } = validationResult.data;

    const user = await authService.getUserBySessionToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const encryptedSecret = mfaService.encryptSecret(secret);
    const codesString = recoveryCodes.join(',');

    await authService.updateUser(user.id, {
      mfaSecret: encryptedSecret,
      recoveryCodes: codesString,
      isMfaEnabled: true,
    });

    return NextResponse.json({
      success: true,
      message: 'MFA enabled successfully',
    });
  } catch (error) {
    console.error('MFA enable error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
