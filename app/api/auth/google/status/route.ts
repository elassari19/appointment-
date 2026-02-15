import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/auth.service';
import { DatabaseService } from '@/lib/services/database.service';

const authService = new AuthService();

async function getUserFromRequest(request: NextRequest) {
  const token = request.cookies.get('session_token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return null;
  }

  return await authService.getUserBySessionToken(token);
}

export async function GET(request: NextRequest) {
  try {
    await DatabaseService.initialize();

    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const isConnected = !!(user as any).googleAccessToken;

    let isTokenValid = false;
    if (isConnected) {
      const expiresAt = (user as any).googleTokenExpiresAt;
      if (expiresAt) {
        isTokenValid = new Date(expiresAt) > new Date();
      }
    }

    return NextResponse.json({
      connected: isConnected,
      isTokenValid: isConnected ? isTokenValid : false,
    });
  } catch (error) {
    console.error('Google status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await DatabaseService.initialize();

    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { AppDataSource } = await import('@/lib/database');
    const { User } = await import('@/lib/entities/User');
    
    const userRepository = AppDataSource.getRepository(User);
    user.googleAccessToken = undefined;
    user.googleRefreshToken = undefined;
    user.googleTokenExpiresAt = undefined;
    await userRepository.save(user);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Google disconnect error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
