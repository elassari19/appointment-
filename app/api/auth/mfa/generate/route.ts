import { NextRequest, NextResponse } from 'next/server';
import { MfaService } from '@/lib/services/mfa.service';
import { AuthService } from '@/lib/services/auth.service';
import QRCode from 'qrcode';
import { z } from 'zod';

const mfaService = new MfaService();
const authService = new AuthService();

const enableSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token') ||
      request.headers.get('authorization')?.replace('Bearer ', '') ||
      request.headers.get('x-auth-token');

    if (token) {
      return NextResponse.json(
        { error: 'Use GET method to initialize MFA setup' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validationResult = enableSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    const result = await authService.login({ email, password });

    if (!result) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const user = result.user;

    if (user.isMfaEnabled) {
      return NextResponse.json({ error: 'MFA is already enabled' }, { status: 400 });
    }

    const secret = mfaService.generateSecret();
    const encodedSecret = mfaService.encryptSecret(secret);

    await authService.updateUser(user.id, {
      mfaSecret: encodedSecret,
    });

    const issuer = 'Nutrison Appointment';
    const accountName = email;
    const otpauthUrl = `otpauth://totp/${issuer}:${accountName}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;

    const qrCode = await QRCode.toDataURL(otpauthUrl);

    return NextResponse.json({
      success: true,
      secret: secret,
      qrCode: qrCode,
    });
  } catch (error) {
    console.error('MFA generate error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
