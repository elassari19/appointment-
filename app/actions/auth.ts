'use server';

import { cookies } from 'next/headers';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'patient' | 'doctor' | 'admin';
}

export async function setUserCookie(user: User | null) {
  const cookieStore = await cookies();
  
  if (user) {
    cookieStore.set('auth_user', JSON.stringify(user), {
      path: '/',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });
  } else {
    cookieStore.delete('auth_user');
  }
}

export async function getUserFromCookie(): Promise<User | null> {
  const cookieStore = await cookies();
  const authUser = cookieStore.get('auth_user')?.value;
  
  if (!authUser) {
    return null;
  }
  
  try {
    return JSON.parse(authUser) as User;
  } catch {
    return null;
  }
}
