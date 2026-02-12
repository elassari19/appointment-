import { NextRequest, NextResponse } from 'next/server';
import { analyticsService } from '@/lib/services/analytics.service';
import { authenticateAdminAppRouter } from '@/lib/middleware/auth.middleware';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  await authenticateAdminAppRouter()(req);

  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const topPatients = await analyticsService.getTopPerformingPatients(limit);
    return NextResponse.json(topPatients);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch top performing patients' },
      { status: 500 }
    );
  }
}
