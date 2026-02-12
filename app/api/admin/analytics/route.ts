import { NextRequest, NextResponse } from 'next/server';
import { analyticsService } from '@/lib/services/analytics.service';
import { authenticateAdminAppRouter } from '@/lib/middleware/auth.middleware';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return authenticateAdminAppRouter()(req);
}
