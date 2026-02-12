import { NextRequest, NextResponse } from 'next/server';
import { checkDefaultRateLimit, getClientIP } from '@/lib/utils/rate-limit';

export function rateLimitMiddleware(request: NextRequest): NextResponse | null {
  const ip = getClientIP(request);
  const result = checkDefaultRateLimit(ip);

  const response = NextResponse.next();

  response.headers.set('X-RateLimit-Limit', String(result.limit));
  response.headers.set('X-RateLimit-Remaining', String(result.remaining));
  response.headers.set('X-RateLimit-Reset', String(result.reset));

  if (!result.success) {
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': String(Math.ceil((result.reset - Date.now()) / 1000)),
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(result.reset),
      },
    });
  }

  return null;
}

export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const rateLimitResponse = rateLimitMiddleware(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    return handler(request);
  };
}
