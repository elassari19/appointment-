import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['en', 'ar'];
const defaultLocale = 'en';

export default function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith('/api') ||
      pathname.startsWith('/_next') ||
      pathname.includes('.') ||
      pathname === '/favicon.ico') {
    return NextResponse.next();
  }

  if (pathname.match(/^\/(en|ar)\//)) {
    const cleanPath = pathname.replace(/^\/(en|ar)/, '');
    return NextResponse.redirect(new URL(cleanPath, request.url));
  }

  if (pathname === '/' || pathname === '') {
    const cookieLocale = request.cookies.get('locale')?.value;
    let locale = cookieLocale && locales.includes(cookieLocale)
      ? cookieLocale
      : defaultLocale;

    if (!cookieLocale && request.headers.get('Accept-Language')) {
      const acceptLang = request.headers.get('Accept-Language')?.split(',')[0] || '';
      const parsedLocale = acceptLang.split('-')[0];
      locale = locales.includes(parsedLocale) ? parsedLocale : defaultLocale;
    }

    const response = NextResponse.next();
    response.cookies.set('locale', locale, { path: '/', maxAge: 31536000 });
    response.headers.set('x-locale', locale);
    return response;
  }

  const cookieLocale = request.cookies.get('locale')?.value;
  let locale = cookieLocale && locales.includes(cookieLocale)
    ? cookieLocale
    : defaultLocale;

  if (!cookieLocale && request.headers.get('Accept-Language')) {
    const acceptLang = request.headers.get('Accept-Language')?.split(',')[0] || '';
    const parsedLocale = acceptLang.split('-')[0];
    locale = locales.includes(parsedLocale) ? parsedLocale : defaultLocale;
  }

  const response = NextResponse.next();
  if (!request.cookies.get('locale')) {
    response.cookies.set('locale', locale, { path: '/', maxAge: 31536000 });
  }
  response.headers.set('x-locale', locale);

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}
