import { NextRequest } from 'next/server';
import { AvailabilityService } from '@/lib/services/availability.service';
import { DatabaseService } from '@/lib/services/database.service';
import { AuthService } from '@/lib/services/auth.service';

const availabilityService = new AvailabilityService();
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await DatabaseService.initialize();

    const userResult = await getUserFromRequest(request);
    if (!userResult) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const success = await availabilityService.deleteAvailabilitySlot(id);

    if (!success) {
      return Response.json({ error: 'Availability slot not found' }, { status: 404 });
    }

    return Response.json({ message: 'Availability slot deleted successfully' });
  } catch (error) {
    console.error('Delete availability slot error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
