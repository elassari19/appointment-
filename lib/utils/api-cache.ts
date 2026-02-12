import NodeCache from 'node-cache';

const apiCache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

const GOOGLE_API_RATE_LIMITS: Record<string, { requestsPerMinute: number; burst: number }> = {
  'calendar': { requestsPerMinute: 60, burst: 10 },
  'oauth2': { requestsPerMinute: 60, burst: 10 },
  'gmail': { requestsPerMinute: 50, burst: 10 },
  'drive': { requestsPerMinute: 50, burst: 10 },
  'default': { requestsPerMinute: 30, burst: 5 },
};

const requestTimestamps: Map<string, number[]> = new Map();

export function getRateLimitConfig(apiType: string): { requestsPerMinute: number; burst: number } {
  return GOOGLE_API_RATE_LIMITS[apiType] || GOOGLE_API_RATE_LIMITS['default'];
}

export function checkRateLimit(apiType: string): { allowed: boolean; remaining: number; waitTime: number } {
  const config = getRateLimitConfig(apiType);
  const now = Date.now();
  const windowMs = 60 * 1000;

  const key = apiType;
  const timestamps = requestTimestamps.get(key) || [];

  const validTimestamps = timestamps.filter(t => now - t < windowMs);
  requestTimestamps.set(key, validTimestamps);

  if (validTimestamps.length >= config.requestsPerMinute) {
    const oldestTimestamp = Math.min(...validTimestamps);
    const waitTime = windowMs - (now - oldestTimestamp);
    return { allowed: false, remaining: 0, waitTime };
  }

  return { allowed: true, remaining: config.requestsPerMinute - validTimestamps.length - 1, waitTime: 0 };
}

export function recordRequest(apiType: string): void {
  const key = apiType;
  const timestamps = requestTimestamps.get(key) || [];
  timestamps.push(Date.now());
  requestTimestamps.set(key, timestamps);
}

export function getCachedData<T>(key: string): T | null {
  const entry = apiCache.get<CacheEntry<T>>(key);
  if (entry && entry.expiresAt > Date.now()) {
    return entry.data;
  }
  apiCache.del(key);
  return null;
}

export function setCachedData<T>(key: string, data: T, ttlSeconds: number = 60): void {
  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + ttlSeconds * 1000,
  };
  apiCache.set(key, entry, ttlSeconds);
}

export function invalidateCache(pattern: string): void {
  const keys = apiCache.keys();
  keys.forEach((key: string) => {
    if (key.includes(pattern)) {
      apiCache.del(key);
    }
  });
}

export function getCacheStats(): { keys: number; hits: number; misses: number } {
  return {
    keys: apiCache.keys().length,
    hits: (apiCache as { getStats?: () => { hits: number; misses: number } }).getStats?.().hits || 0,
    misses: (apiCache as { getStats?: () => { hits: number; misses: number } }).getStats?.().misses || 0,
  };
}

export async function cachedApiCall<T>(
  apiType: string,
  cacheKey: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number = 60
): Promise<T> {
  const cached = getCachedData<T>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  const rateLimit = checkRateLimit(apiType);
  if (!rateLimit.allowed) {
    throw new Error(`Rate limit exceeded for ${apiType}. Please wait ${rateLimit.waitTime}ms.`);
  }

  recordRequest(apiType);

  const data = await fetchFn();
  setCachedData(cacheKey, data, ttlSeconds);

  return data;
}

export function parseRateLimitHeaders(headers: Headers): RateLimitInfo | null {
  const limit = headers.get('x-rate-limit-limit');
  const remaining = headers.get('x-rate-limit-remaining');
  const reset = headers.get('x-rate-limit-reset');

  if (!limit || !remaining || !reset) {
    return null;
  }

  return {
    limit: parseInt(limit, 10),
    remaining: parseInt(remaining, 10),
    reset: parseInt(reset, 10),
  };
}

export function isTransientError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('500') ||
      message.includes('502') ||
      message.includes('503') ||
      message.includes('504') ||
      message.includes('timeout') ||
      message.includes('econnreset') ||
      message.includes('etimedout') ||
      message.includes('network')
    );
  }
  return false;
}
