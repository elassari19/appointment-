import { NextRequest, NextResponse } from 'next/server';
import { analyticsService } from '@/lib/services/analytics.service';
import { authenticateAdminAppRouter } from '@/lib/middleware/auth.middleware';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  await authenticateAdminAppRouter()(req);

  try {
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '30');
    const trend = await analyticsService.getAppointmentTrend(days);
    return NextResponse.json(trend);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch appointment trend' },
      { status: 500 }
    );
  }
}
