import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdminAppRouter } from '@/lib/middleware/auth.middleware';
import { auditService } from '@/lib/services/audit.service';
import { AuditAction } from '@/lib/entities/AuditLog';

export async function GET(request: NextRequest) {
  const authResult = await authenticateAdminAppRouter()(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') as AuditAction | null;
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let result;

    if (action) {
      result = await auditService.getLogsByAction(action, limit, offset);
    } else if (userId) {
      result = await auditService.getLogsByUser(userId, limit, offset);
    } else if (startDate && endDate) {
      result = await auditService.getLogsByDateRange(
        new Date(startDate),
        new Date(endDate),
        limit,
        offset
      );
    } else {
      const logs = await auditService.getRecentActivity(limit);
      return NextResponse.json({ logs, total: logs.length });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
