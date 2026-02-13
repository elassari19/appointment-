import { NextRequest, NextResponse } from 'next/server';
import { GoogleCalendarService } from '@/lib/services/google-calendar.service';
import { DatabaseService } from '@/lib/services/database.service';

const calendarService = new GoogleCalendarService();

export async function GET(request: NextRequest) {
  try {
    await DatabaseService.initialize();

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        new URL('/settings?calendar=error&message=Authentication cancelled', request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/settings?calendar=error&message=No authorization code received', request.url)
      );
    }

    const clientId = process.env.GOOGLE_CLIENTId;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/calendar/callback`;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(
        new URL('/settings?calendar=error&message=Google Calendar not configured', request.url)
      );
    }

    const tokens = await calendarService.exchangeCodeForTokens(
      code,
      clientId,
      clientSecret,
      redirectUri
    );

    calendarService.setTokens(tokens);

    return NextResponse.redirect(
      new URL('/settings?calendar=success', request.url)
    );
  } catch (err) {
    console.error('Calendar OAuth callback error:', err);
    return NextResponse.redirect(
      new URL('/settings?calendar=error&message=Failed to connect calendar', request.url)
    );
  }
}
