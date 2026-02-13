import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/auth.service';
import { DatabaseService } from '@/lib/services/database.service';
import { User } from '@/lib/entities/User';

const authService = new AuthService();

interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  bio?: string;
  profilePicture?: string;
}

function extractToken(request: Request): string | null {
  const { searchParams } = new URL(request.url);
  
  // Try to get token from multiple sources
  let token = searchParams.get('token') ||
    request.headers.get('authorization')?.replace('Bearer ', '') ||
    request.headers.get('x-auth-token');
  
  // If no token in headers/params, try cookies
  if (!token) {
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);
      token = cookies['session_token'];
    }
  }
  
  return token || null;
}

export async function GET(request: Request) {
  try {
    await DatabaseService.initialize();
    
    const token = extractToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await authService.getUserBySessionToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        profilePicture: user.profilePicture,
        bio: user.bio,
        isVerified: user.isVerified,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await DatabaseService.initialize();
    
    const token = extractToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await authService.getUserBySessionToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body: UpdateProfileData = await request.json();
    
    // Update user fields
    if (body.firstName !== undefined) user.firstName = body.firstName;
    if (body.lastName !== undefined) user.lastName = body.lastName;
    if (body.phone !== undefined) user.phone = body.phone || undefined;
    if (body.dateOfBirth !== undefined) {
      user.dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : undefined;
    }
    if (body.bio !== undefined) user.bio = body.bio || undefined;
    if (body.profilePicture !== undefined) user.profilePicture = body.profilePicture || undefined;

    const userRepository = (await import('@/lib/database')).AppDataSource.getRepository(User);
    const savedUser = await userRepository.save(user);

    return NextResponse.json({
      id: savedUser.id,
      email: savedUser.email,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      role: savedUser.role,
      phone: savedUser.phone,
      dateOfBirth: savedUser.dateOfBirth,
      profilePicture: savedUser.profilePicture,
      bio: savedUser.bio,
      isVerified: savedUser.isVerified,
      isActive: savedUser.isActive,
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt,
    });
  } catch (error) {
    console.error('Error updating current user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await DatabaseService.initialize();
    
    const token = extractToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await authService.getUserBySessionToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const formData = await request.formData();
    const image = formData.get('image') as File | null;
    
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Convert image to base64 data URL
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const mimeType = image.type || 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${base64}`;

    // Update profile picture
    user.profilePicture = dataUrl;

    const userRepository = (await import('@/lib/database')).AppDataSource.getRepository(User);
    const savedUser = await userRepository.save(user);

    return NextResponse.json({ url: savedUser.profilePicture });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
