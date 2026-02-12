// app/api/proxy/google/route.ts
import { NextRequest } from 'next/server';
import { cachedApiCall, checkRateLimit, recordRequest, parseRateLimitHeaders, isTransientError } from '@/lib/utils/api-cache';
import { withRetry, createRetryConfig, CircuitBreaker, googleApiFallbackManager } from '@/lib/utils/retry-fallback';

const circuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  resetTimeout: 60000,
  halfOpenRequests: 3,
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');
  const apiType = searchParams.get('type') || 'default';
  const useCache = searchParams.get('cache') !== 'false';

  if (!targetUrl) {
    return Response.json({ error: 'Missing target URL' }, { status: 400 });
  }

  if (!targetUrl.startsWith('https://www.googleapis.com/') && 
      !targetUrl.startsWith('https://oauth2.googleapis.com/')) {
    return Response.json({ error: 'Invalid Google API endpoint' }, { status: 400 });
  }

  const rateLimit = checkRateLimit(apiType);
  if (!rateLimit.allowed) {
    return Response.json(
      { error: 'Rate limit exceeded', retryAfter: rateLimit.waitTime },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rateLimit.waitTime / 1000)) } }
    );
  }

  const cacheKey = `google_get_${Buffer.from(targetUrl).toString('base64').slice(0, 100)}`;

  try {
    const result = await circuitBreaker.execute(async () => {
      if (useCache) {
        return await cachedApiCall(
          apiType,
          cacheKey,
          () => fetchGoogleApi(targetUrl, 'GET'),
          60
        );
      }
      return await fetchGoogleApi(targetUrl, 'GET');
    });

    recordRequest(apiType);
    googleApiFallbackManager.markServiceStatus(apiType, true);

    return Response.json(result.data, { status: result.status });
  } catch (error) {
    googleApiFallbackManager.markServiceStatus(apiType, false);
    console.error('Google API proxy error:', error);

    if (error instanceof Error && error.message.includes('Rate limit')) {
      return Response.json(
        { error: error.message },
        { status: 429 }
      );
    }

    return Response.json({ error: 'Service temporarily unavailable' }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');
  const apiType = searchParams.get('type') || 'default';

  if (!targetUrl) {
    return Response.json({ error: 'Missing target URL' }, { status: 400 });
  }

  if (!targetUrl.startsWith('https://www.googleapis.com/') && 
      !targetUrl.startsWith('https://oauth2.googleapis.com/')) {
    return Response.json({ error: 'Invalid Google API endpoint' }, { status: 400 });
  }

  const rateLimit = checkRateLimit(apiType);
  if (!rateLimit.allowed) {
    return Response.json(
      { error: 'Rate limit exceeded', retryAfter: rateLimit.waitTime },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rateLimit.waitTime / 1000)) } }
    );
  }

  try {
    const body = await request.json();
    const result = await withRetry(
      () => fetchGoogleApi(targetUrl, 'POST', body),
      createRetryConfig({ maxRetries: 3, baseDelay: 1000 })
    );

    recordRequest(apiType);

    if (result.success) {
      return Response.json(result.data, { status: result.attempts > 1 ? 200 : 201 });
    }

    throw result.error;
  } catch (error) {
    console.error('Google API proxy error:', error);
    return Response.json({ error: 'Proxy request failed' }, { status: 500 });
  }
}

async function fetchGoogleApi(url: string, method: 'GET' | 'POST', body?: unknown): Promise<{ data: unknown; status: number }> {
  const response = await fetch(url, {
    method,
    headers: {
      'Authorization': process.env.GOOGLE_API_KEY || '',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(`Google API error: ${response.status}`);
    (error as any).status = response.status;
    throw error;
  }

  return { data, status: response.status };
}