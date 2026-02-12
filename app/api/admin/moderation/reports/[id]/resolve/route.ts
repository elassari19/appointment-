import { NextRequest, NextResponse } from 'next/server';
import { moderationService } from '@/lib/services/moderation.service';
import { authenticateAdminAppRouter } from '@/lib/middleware/auth.middleware';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest) {
  const authResult = await authenticateAdminAppRouter()(req);
  
  if ('user' in authResult) {
    try {
      const body = await req.json();
      const { reportId, resolution, action, reason } = body;

      if (!reportId || !action) {
        return NextResponse.json(
          { error: 'Report ID and action are required' },
          { status: 400 }
        );
      }

      const report = await moderationService.resolveReport(
        reportId,
        authResult.user.id,
        resolution || '',
        action,
        reason || ''
      );

      return NextResponse.json(report);
    } catch {
      return NextResponse.json(
        { error: 'Failed to resolve report' },
        { status: 500 }
      );
    }
  }

  return authResult;
}
