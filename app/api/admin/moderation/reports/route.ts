import { NextRequest, NextResponse } from 'next/server';
import { moderationService } from '@/lib/services/moderation.service';
import { authenticateAdminAppRouter } from '@/lib/middleware/auth.middleware';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  await authenticateAdminAppRouter()(req);

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as 'pending' | 'reviewed' | 'resolved' | 'dismissed';
    const limit = parseInt(searchParams.get('limit') || '50');

    let reports;
    if (status) {
      reports = await moderationService.getReportsByStatus(status, limit);
    } else {
      reports = await moderationService.getPendingReports();
    }

    return NextResponse.json(reports);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}
