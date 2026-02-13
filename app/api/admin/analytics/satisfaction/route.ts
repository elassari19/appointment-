import { NextRequest, NextResponse } from 'next/server';
import { analyticsService } from '@/lib/services/analytics.service';
import { authenticateAdminAppRouter } from '@/lib/middleware/auth.middleware';

export async function GET(req: NextRequest) {
  const authResult = await authenticateAdminAppRouter()(req);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const metrics = await analyticsService.getUserSatisfactionMetrics();
    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Failed to fetch satisfaction metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch satisfaction metrics' },
      { status: 500 }
    );
  }
}
