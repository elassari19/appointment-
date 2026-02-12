import { NextRequest, NextResponse } from 'next/server';
import { analyticsService } from '@/lib/services/analytics.service';
import { authenticateAdminAppRouter } from '@/lib/middleware/auth.middleware';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const authResult = await authenticateAdminAppRouter()(req);
  
  if ('user' in authResult) {
    try {
      const body = await req.json();
      const { start, end } = body;

      if (!start || !end) {
        return NextResponse.json(
          { error: 'Start and end dates are required' },
          { status: 400 }
        );
      }

      const analytics = await analyticsService.getDateRangeAnalytics({ start, end });
      return NextResponse.json(analytics);
    } catch {
      return NextResponse.json(
        { error: 'Failed to fetch date range analytics' },
        { status: 500 }
      );
    }
  }

  return authResult;
}
