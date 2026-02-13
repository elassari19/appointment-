import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdminAppRouter, authenticatePatientAppRouter, authenticateDietitianAppRouter } from '@/lib/middleware/auth.middleware';
import { rlsService, ResourceType } from '@/lib/services/rls.service';
import { User } from '@/lib/entities/User';

interface AuthenticatedRequest extends NextRequest {
  user: User;
}

export function withRLS(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
  resourceType: ResourceType,
  getAuthMiddleware: (req: NextRequest) => Promise<NextResponse | { user: User }>
) {
  return async (req: NextRequest) => {
    const authResult = await getAuthMiddleware(req);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const resourceId = req.nextUrl.searchParams.get('id') || undefined;
    const resourceOwnerId = req.nextUrl.searchParams.get('ownerId') || undefined;

    const hasAccess = rlsService.canAccess({
      user,
      resourceType,
      resourceId,
      resourceOwnerId,
    });

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied. You do not have permission to access this resource.' },
        { status: 403 }
      );
    }

    const authenticatedReq = req as AuthenticatedRequest;
    authenticatedReq.user = user;

    return handler(authenticatedReq);
  };
}

export function withAppointmentRLS(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
  role: 'patient' | 'dietitian' | 'admin'
) {
  const authMiddleware = role === 'admin' ? authenticateAdminAppRouter :
                         role === 'dietitian' ? authenticateDietitianAppRouter :
                         authenticatePatientAppRouter;

  return async (req: NextRequest) => {
    const authResult = await authMiddleware()(req);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult as { user: User };
    const appointmentId = req.nextUrl.searchParams.get('id');

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    const hasAccess = await rlsService.canAccessAppointmentById(user, appointmentId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied. You do not have permission to access this appointment.' },
        { status: 403 }
      );
    }

    const authenticatedReq = req as AuthenticatedRequest;
    authenticatedReq.user = user;

    return handler(authenticatedReq);
  };
}

export function withAvailabilityRLS(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const authResult = await authenticateDietitianAppRouter()(req);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const availabilityId = req.nextUrl.searchParams.get('id');

    if (!availabilityId) {
      return NextResponse.json(
        { error: 'Availability ID is required' },
        { status: 400 }
      );
    }

    const hasAccess = await rlsService.canAccessAvailabilityById(user, availabilityId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied. You do not have permission to access this availability.' },
        { status: 403 }
      );
    }

    const authenticatedReq = req as AuthenticatedRequest;
    authenticatedReq.user = user;

    return handler(authenticatedReq);
  };
}

export function withPaymentRLS(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const authResult = await authenticatePatientAppRouter()(req);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const paymentId = req.nextUrl.searchParams.get('id');

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    const hasAccess = await rlsService.canAccessPaymentById(user, paymentId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied. You do not have permission to access this payment.' },
        { status: 403 }
      );
    }

    const authenticatedReq = req as AuthenticatedRequest;
    authenticatedReq.user = user;

    return handler(authenticatedReq);
  };
}
