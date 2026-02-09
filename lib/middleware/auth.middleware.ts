import { NextApiRequest, NextApiResponse } from 'next';
import { AuthService } from '@/lib/services/auth.service';
import { UserRole } from '@/lib/entities/User';
import { User } from '@/lib/entities/User';

const authService = new AuthService();

export interface AuthenticatedRequest extends NextApiRequest {
  user?: User;
}

export const authenticateUser = 
  (handler: (req: AuthenticatedRequest, res: NextApiResponse) => void, requiredRoles?: UserRole[]) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    // Extract session token from cookies or Authorization header
    const token = req.cookies?.session_token || 
                  req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Validate the session
    const user = await authService.getUserBySessionToken(token);

    if (!user) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    // Check role permissions if required
    if (requiredRoles && !requiredRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Add user to request object
    (req as AuthenticatedRequest).user = user;

    // Call the original handler
    return handler(req as AuthenticatedRequest, res);
  };

// Convenience wrappers for specific roles
export const authenticatePatient = (handler: (req: AuthenticatedRequest, res: NextApiResponse) => void) =>
  authenticateUser(handler, [UserRole.PATIENT, UserRole.DIETITIAN, UserRole.ADMIN]);

export const authenticateDietitian = (handler: (req: AuthenticatedRequest, res: NextApiResponse) => void) =>
  authenticateUser(handler, [UserRole.DIETITIAN, UserRole.ADMIN]);

export const authenticateAdmin = (handler: (req: AuthenticatedRequest, res: NextApiResponse) => void) =>
  authenticateUser(handler, [UserRole.ADMIN]);