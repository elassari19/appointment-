import { NextRequest, NextResponse } from 'next/server';
import { AuthService, AuthResult } from '@/lib/services/auth.service';
import { UserRole } from '@/lib/entities/User';

// Initialize auth service
const authService = new AuthService();

// Define route protections
const protectedRoutes = {
  '/api/admin': [UserRole.ADMIN],
  '/api/dietitian': [UserRole.DIETITIAN, UserRole.ADMIN],
  '/api/patient': [UserRole.PATIENT, UserRole.DIETITIAN, UserRole.ADMIN],
  '/admin': [UserRole.ADMIN],
  '/dietitian': [UserRole.DIETITIAN, UserRole.ADMIN],
  '/patient': [UserRole.PATIENT, UserRole.DIETITIAN, UserRole.ADMIN],
};

export async function middleware(request: NextRequest) {
  // Check if this is a protected route
  const matchedRoute = Object.keys(protectedRoutes).find(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  if (matchedRoute) {
    // Extract session token from cookies or headers
    const token = request.cookies.get('session_token')?.value || 
                  request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      // Redirect to login for browser requests, return 401 for API requests
      if (request.nextUrl.pathname.startsWith('/api')) {
        return NextResponse.json(
          { error: 'Authentication required' }, 
          { status: 401 }
        );
      } else {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
      }
    }

    // Validate the session and check user role
    const requiredRoles = protectedRoutes[matchedRoute] as UserRole[];
    const validation = await authService.validateUserRole(token, requiredRoles);

    if (!validation.isValid) {
      // Return 403 for unauthorized access
      if (request.nextUrl.pathname.startsWith('/api')) {
        return NextResponse.json(
          { error: 'Insufficient permissions' }, 
          { status: 403 }
        );
      } else {
        const url = request.nextUrl.clone();
        url.pathname = '/unauthorized';
        return NextResponse.redirect(url);
      }
    }
  }

  // Continue with the request
  return NextResponse.next();
}

// Specify which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};