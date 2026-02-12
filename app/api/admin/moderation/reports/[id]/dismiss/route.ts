import { NextRequest, NextResponse } from 'next/server';
import { moderationService } from '@/lib/services/moderation.service';
import { authenticateAdminAppRouter } from '@/lib/middleware/auth.middleware';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(req: NextRequest) {
  const authResult = await authenticateAdminAppRouter()(req);
  
  if ('user' in authResult) {
    try {
      const { searchParams } = new URL(req.url);
      const reportId = searchParams.get('id');

      if (!reportId) {
        return NextResponse.json(
          { error: 'Report ID is required' },
          { status: 400 }
        );
      }

      await moderationService.dismissReport(
        reportId,
        authResult.user.id,
        'Report dismissed by admin'
      );

      return NextResponse.json({ success: true });
    } catch {
      return NextResponse.json(
        { error: 'Failed to dismiss report' },
        { status: 500 }
      );
    }
  }

  return authResult;
}
