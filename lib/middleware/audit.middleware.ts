import { NextRequest, NextResponse } from 'next/server';
import { auditService, AuditLogData, AuditSeverity } from '@/lib/services/audit.service';
import { authenticateUser, AuthenticatedRequest } from '@/lib/middleware/auth.middleware';

export function createAuditMiddleware(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
  auditData: Omit<AuditLogData, 'user' | 'ipAddress' | 'userAgent'>
) {
  return authenticateUser(async (req: AuthenticatedRequest, res: any) => {
    try {
      const response = await handler(req);

      if (response.ok) {
        await auditService.logFromRequest(req as unknown as NextRequest, {
          user: req.user,
          ...auditData,
        });
      }

      return response;
    } catch (error) {
      await auditService.logFromRequest(req as unknown as NextRequest, {
        user: req.user,
        ...auditData,
        severity: AuditSeverity.ERROR,
        description: `Error during ${auditData.action}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
      throw error;
    }
  });
}

export function createPublicAuditMiddleware(
  handler: (req: NextRequest) => Promise<NextResponse>,
  auditData: Omit<AuditLogData, 'user' | 'ipAddress' | 'userAgent'>
) {
  return async (req: NextRequest, res: any) => {
    try {
      const response = await handler(req);

      if (response.ok) {
        await auditService.logFromRequest(req, {
          ...auditData,
        });
      }

      return response;
    } catch (error) {
      await auditService.logFromRequest(req, {
        ...auditData,
        severity: AuditSeverity.ERROR,
        description: `Error during ${auditData.action}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
      throw error;
    }
  };
}
