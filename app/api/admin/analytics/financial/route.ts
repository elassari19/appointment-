import { NextRequest, NextResponse } from 'next/server';
import { analyticsService } from '@/lib/services/analytics.service';
import { authenticateAdminAppRouter } from '@/lib/middleware/auth.middleware';

export async function GET(req: NextRequest) {
  const authResult = authenticateAdminAppRouter()(req);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const metrics = await analyticsService.getFinancialMetrics();
    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Failed to fetch financial metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch financial metrics' },
      { status: 500 }
    );
  }
}
