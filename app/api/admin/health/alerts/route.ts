import { NextRequest, NextResponse } from 'next/server';
import { healthCheckService } from '@/lib/services/health-check.service';
import { authenticateAdminAppRouter } from '@/lib/middleware/auth.middleware';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const result = await authenticateAdminAppRouter()(req);

    if (result instanceof NextResponse) {
      return result;
    }

    const body = await req.json();
    const { alertType, severity, metadata } = body;

    if (!alertType || !severity) {
      return NextResponse.json(
        { error: 'Alert type and severity are required' },
        { status: 400 }
      );
    }

    const alert = await healthCheckService.createPerformanceAlert(alertType, severity, metadata || {});
    return NextResponse.json(alert);
  } catch {
    return NextResponse.json(
      { error: 'Failed to create performance alert' },
      { status: 500 }
    );
  }
}
