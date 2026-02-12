import { getUserFromCookie } from '@/app/actions/auth';

export type UserRole = 'patient' | 'doctor' | 'admin';

interface ServerUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export async function getServerUser(): Promise<ServerUser | null> {
  return getUserFromCookie();
}

export function checkRoleAccess(user: ServerUser | null, requiredRoles: UserRole[]): { allowed: boolean; redirect?: never } {
  if (!user) {
    return { allowed: false };
  }
  
  if (!requiredRoles.includes(user.role)) {
    return { allowed: false };
  }
  
  return { allowed: true };
}

export function getRoleDashboardPath(role: UserRole): string {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'doctor':
      return '/doctors';
    case 'patient':
      return '/patient';
    default:
      return '/';
  }
}
