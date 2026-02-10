import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['en', 'ar'];

export default function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  if (pathname === '/' || pathname === '') {
    const cookie = request.cookies.get('locale')?.value;
    let locale = cookie && locales.includes(cookie) ? cookie : 'en';
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}
