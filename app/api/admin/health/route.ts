import { NextRequest, NextResponse } from 'next/server';
import { healthCheckService } from '@/lib/services/health-check.service';
import { authenticateAdminAppRouter } from '@/lib/middleware/auth.middleware';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const result = await authenticateAdminAppRouter()(req);

    if (result instanceof NextResponse) {
      return result;
    }

    const health = await healthCheckService.performSystemHealthCheck();
    return NextResponse.json(health);
  } catch {
    return NextResponse.json(
      { error: 'Failed to perform health check' },
      { status: 500 }
    );
  }
}
