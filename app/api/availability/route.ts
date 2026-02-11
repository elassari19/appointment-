import { NextRequest } from 'next/server';
import { AvailabilityService, AvailabilityData } from '@/lib/services/availability.service';
import { DatabaseService } from '@/lib/services/database.service';
import { AuthService } from '@/lib/services/auth.service';
import { DayOfWeek } from '@/lib/entities/Availability';
import { z } from 'zod';

const availabilityService = new AvailabilityService();
const authService = new AuthService();

const updateAvailabilitySchema = z.object({
  availability: z.array(
    z.object({
      dayOfWeek: z.nativeEnum(DayOfWeek),
      startTime: z.string(),
      endTime: z.string(),
      isAvailable: z.boolean(),
      defaultDuration: z.number().optional(),
    })
  ),
});

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
    const dietitianId = searchParams.get('dietitianId');

    if (!dietitianId) {
      return Response.json({ error: 'dietitianId is required' }, { status: 400 });
    }

    const availability = await availabilityService.getDietitianAvailability(dietitianId);
    const weeklySchedule = await availabilityService.getWeeklySchedule(dietitianId);

    return Response.json({ availability, weeklySchedule });
  } catch (error) {
    console.error('Get availability error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await DatabaseService.initialize();

    const userResult = await getUserFromRequest(request);
    if (!userResult) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = updateAvailabilitySchema.safeParse(body);

    if (!validationResult.success) {
      return Response.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { availability } = validationResult.data;

    const updated = await availabilityService.updateDietitianAvailability(
      userResult.userId,
      availability
    );

    return Response.json({
      message: 'Availability updated successfully',
      availability: updated,
    });
  } catch (error) {
    console.error('Update availability error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await DatabaseService.initialize();

    const userResult = await getUserFromRequest(request);
    if (!userResult) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = updateAvailabilitySchema.shape.availability.element.safeParse(body);

    if (!validationResult.success) {
      return Response.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const newSlot = await availabilityService.addAvailabilitySlot(
      userResult.userId,
      validationResult.data
    );

    return Response.json(
      { message: 'Availability slot added successfully', slot: newSlot },
      { status: 201 }
    );
  } catch (error) {
    console.error('Add availability slot error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
