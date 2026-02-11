import { NextRequest, NextResponse } from 'next/server';
import { authenticateUserAppRouter } from '@/lib/middleware/auth.middleware';
import { ProfileService, UpdateProfileData } from '@/lib/services/profile.service';
import { User } from '@/lib/entities/User';

const profileService = new ProfileService();

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateUserAppRouter();
    
    if ('user' in authResult && authResult.user instanceof User) {
      const profile = await profileService.getProfile(authResult.user.id);
      
      if (!profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      }
      
      return NextResponse.json(profile);
    }
    
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authResult = await authenticateUserAppRouter();
    
    if ('user' in authResult && authResult.user instanceof User) {
      const body: UpdateProfileData = await req.json();
      const updatedProfile = await profileService.updateProfile(authResult.user.id, body);

      if (!updatedProfile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      }

      return NextResponse.json(updatedProfile);
    }
    
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authResult = await authenticateUserAppRouter();
    
    if ('user' in authResult && authResult.user instanceof User) {
      const body: UpdateProfileData = await req.json();
      const updatedProfile = await profileService.updateProfile(authResult.user.id, body);

      if (!updatedProfile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      }

      return NextResponse.json(updatedProfile);
    }
    
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
