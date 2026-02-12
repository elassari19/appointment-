interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const inMemoryStore: Map<string, RateLimitEntry> = new Map();

const defaultConfig: RateLimitConfig = {
  windowMs: 60 * 1000,
  maxRequests: 100,
};

const authConfig: RateLimitConfig = {
  windowMs: 60 * 1000,
  maxRequests: 5,
};

const webhookConfig: RateLimitConfig = {
  windowMs: 60 * 1000,
  maxRequests: 100,
};

export function rateLimit(
  identifier: string,
  config: RateLimitConfig = defaultConfig
): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now();
  const entry = inMemoryStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    inMemoryStore.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      reset: now + config.windowMs,
    };
  }

  if (entry.count >= config.maxRequests) {
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      reset: entry.resetTime,
    };
  }

  entry.count++;
  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - entry.count,
    reset: entry.resetTime,
  };
}

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

export function checkAuthRateLimit(identifier: string) {
  return rateLimit(identifier, authConfig);
}

export function checkWebhookRateLimit(identifier: string) {
  return rateLimit(identifier, webhookConfig);
}

export function checkDefaultRateLimit(identifier: string) {
  return rateLimit(identifier, defaultConfig);
}

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of inMemoryStore.entries()) {
    if (now > entry.resetTime) {
      inMemoryStore.delete(key);
    }
  }
}, 60 * 1000);
