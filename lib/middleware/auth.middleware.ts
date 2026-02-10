import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/auth.service';
import { UserRole, User } from '@/lib/entities/User';

const authService = new AuthService();

export interface AuthenticatedRequest extends NextApiRequest {
  user?: User;
}

export const authenticateUser = 
  (handler: (req: AuthenticatedRequest, res: NextApiResponse) => void, requiredRoles?: UserRole[]) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    const token = req.cookies?.session_token || 
                  req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await authService.getUserBySessionToken(token);

    if (!user) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    if (requiredRoles && !requiredRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    (req as AuthenticatedRequest).user = user;
    return handler(req as AuthenticatedRequest, res);
  };

export const authenticateUserAppRouter = 
  (requiredRoles?: UserRole[]) =>
  async (req: NextRequest) => {
    const token = req.cookies.get('session_token')?.value || 
                  req.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = await authService.getUserBySessionToken(token);

    if (!user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    if (requiredRoles && !requiredRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    return { user };
  };

export const authenticatePatient = (handler: (req: AuthenticatedRequest, res: NextApiResponse) => void) =>
  authenticateUser(handler, [UserRole.PATIENT, UserRole.DIETITIAN, UserRole.ADMIN]);

export const authenticateDietitian = (handler: (req: AuthenticatedRequest, res: NextApiResponse) => void) =>
  authenticateUser(handler, [UserRole.DIETITIAN, UserRole.ADMIN]);

export const authenticateAdmin = (handler: (req: AuthenticatedRequest, res: NextApiResponse) => void) =>
  authenticateUser(handler, [UserRole.ADMIN]);

export const authenticatePatientAppRouter = authenticateUserAppRouter([UserRole.PATIENT, UserRole.DIETITIAN, UserRole.ADMIN]);
export const authenticateDietitianAppRouter = authenticateUserAppRouter([UserRole.DIETITIAN, UserRole.ADMIN]);
export const authenticateAdminAppRouter = authenticateUserAppRouter([UserRole.ADMIN]);
