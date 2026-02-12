import { NextRequest, NextResponse } from 'next/server';
import { moderationService } from '@/lib/services/moderation.service';
import { authenticateAdminAppRouter } from '@/lib/middleware/auth.middleware';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const authResult = await authenticateAdminAppRouter()(req);
  
  if ('user' in authResult) {
    try {
      const body = await req.json();

      const report = await moderationService.createReport({
        reporterId: authResult.user.id,
        reporterEmail: authResult.user.email,
        reportedContentId: body.reportedContentId,
        reportedContentType: body.reportedContentType,
        category: body.category,
        description: body.description,
        evidence: body.evidence,
      });

      return NextResponse.json(report, { status: 201 });
    } catch {
      return NextResponse.json(
        { error: 'Failed to create report' },
        { status: 500 }
      );
    }
  }

  return authResult;
}
