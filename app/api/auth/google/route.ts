import { NextRequest, NextResponse } from 'next/server';
import { GoogleCalendarService } from '@/lib/services/google-calendar.service';
import { AuthService } from '@/lib/services/auth.service';

const googleCalendarService = new GoogleCalendarService();
const authService = new AuthService();

async function getUserFromRequest(request: NextRequest) {
  const token = request.cookies.get('session_token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return null;
  }

  return await authService.getUserBySessionToken(token);
}

export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      return NextResponse.json(
        { error: 'Google OAuth not configured' },
        { status: 500 }
      );
    }

    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const authUrl = googleCalendarService.getAuthorizationUrl(clientId, redirectUri, user.id);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Google OAuth init error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Google OAuth' },
      { status: 500 }
    );
  }
}
