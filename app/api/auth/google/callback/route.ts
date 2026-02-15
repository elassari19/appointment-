import { NextRequest, NextResponse } from 'next/server';
import { GoogleCalendarService } from '@/lib/services/google-calendar.service';
import { DatabaseService } from '@/lib/services/database.service';
import { AppDataSource } from '@/lib/database';
import { User } from '@/lib/entities/User';

const googleCalendarService = new GoogleCalendarService();

export async function GET(request: NextRequest) {
  try {
    await DatabaseService.initialize();

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const userId = searchParams.get('state');

    if (error) {
      return NextResponse.redirect(new URL(`/patient/profile?google_error=${error}`, request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/patient/profile?google_error=no_code', request.url));
    }

    if (!userId) {
      return NextResponse.redirect(new URL('/patient/profile?google_error=no_user_id', request.url));
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: userId } });

    if (!user) {
      return NextResponse.redirect(new URL('/patient/profile?google_error=user_not_found', request.url));
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      return NextResponse.redirect(new URL('/patient/profile?google_error=not_configured', request.url));
    }

    const tokens = await googleCalendarService.exchangeCodeForTokens(
      code,
      clientId,
      clientSecret,
      redirectUri
    );

    user.googleAccessToken = tokens.accessToken;
    user.googleRefreshToken = tokens.refreshToken || undefined;
    user.googleTokenExpiresAt = tokens.expiresAt;
    await userRepository.save(user);

    return NextResponse.redirect(new URL('/patient/profile?google_connected=true', request.url));
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    return NextResponse.redirect(new URL('/patient/profile?google_error=callback_failed', request.url));
  }
}
