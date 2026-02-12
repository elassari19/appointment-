import { NextRequest } from 'next/server';
import { AppointmentService } from '@/lib/services/appointment.service';
import { DatabaseService } from '@/lib/services/database.service';
import { AuthService } from '@/lib/services/auth.service';

const appointmentService = new AppointmentService();
const authService = new AuthService();

async function getUserFromRequest(request: NextRequest): Promise<{ userId: string } | null> {
  const token = request.cookies.get('session_token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return null;
  }

  const user = await authService.getUserBySessionToken(token);
  if (!user) {
    return null;
  }

  return { userId: user.id };
}

export async function GET(request: NextRequest) {
  try {
    await DatabaseService.initialize();

    const userResult = await getUserFromRequest(request);
    if (!userResult) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;

    const doctors = await appointmentService.getDoctors({ search });

    return Response.json({ doctors });
  } catch (error) {
    console.error('Get doctors error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
