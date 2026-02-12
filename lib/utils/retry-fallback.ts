import { isTransientError } from './api-cache';

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
  retryOnStatusCodes: number[];
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
  totalTime: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  jitter: true,
  retryOnStatusCodes: [429, 500, 502, 503, 504],
};

export function createRetryConfig(overrides: Partial<RetryConfig> = {}): RetryConfig {
  return { ...DEFAULT_RETRY_CONFIG, ...overrides };
}

function calculateDelay(attempt: number, config: RetryConfig): number {
  const exponentialDelay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt);
  const delay = Math.min(exponentialDelay, config.maxDelay);

  if (config.jitter) {
    const jitterRange = delay * 0.3;
    const jitter = Math.random() * jitterRange - jitterRange / 2;
    return Math.max(0, Math.round(delay + jitter));
  }

  return Math.round(delay);
}

function shouldRetry(error: unknown, config: RetryConfig): boolean {
  if (error instanceof Error) {
    if (isTransientError(error)) {
      return true;
    }

    if ('status' in error && typeof (error as { status?: number }).status === 'number') {
      const status = (error as { status: number }).status;
      return config.retryOnStatusCodes.includes(status);
    }
  }

  if (error instanceof Response) {
    return config.retryOnStatusCodes.includes(error.status);
  }

  return false;
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<RetryResult<T>> {
  const startTime = Date.now();
  let lastError: unknown;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const data = await operation();
      return {
        success: true,
        data,
        attempts: attempt + 1,
        totalTime: Date.now() - startTime,
      };
    } catch (error) {
      lastError = error;

      if (attempt === config.maxRetries || !shouldRetry(error, config)) {
        break;
      }

      const delay = calculateDelay(attempt, config);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return {
    success: false,
    error: lastError instanceof Error ? lastError : new Error(String(lastError)),
    attempts: config.maxRetries + 1,
    totalTime: Date.now() - startTime,
  };
}

export interface FallbackStrategy<T> {
  name: string;
  execute: () => Promise<T>;
  priority: number;
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  halfOpenRequests: number;
}

export interface CircuitBreakerState {
  state: 'closed' | 'open' | 'half-open';
  failureCount: number;
  lastFailure: number;
  successCount: number;
}

export class CircuitBreaker {
  private state: CircuitBreakerState;
  private config: CircuitBreakerConfig;

  constructor(config?: Partial<CircuitBreakerConfig>) {
    this.config = {
      failureThreshold: config?.failureThreshold || 5,
      resetTimeout: config?.resetTimeout || 30000,
      halfOpenRequests: config?.halfOpenRequests || 3,
    };
    this.state = {
      state: 'closed',
      failureCount: 0,
      lastFailure: 0,
      successCount: 0,
    };
  }

  private canExecute(): boolean {
    if (this.state.state === 'closed') {
      return true;
    }

    if (this.state.state === 'open') {
      if (Date.now() - this.state.lastFailure >= this.config.resetTimeout) {
        this.state.state = 'half-open';
        this.state.successCount = 0;
        return true;
      }
      return false;
    }

    return this.state.successCount < this.config.halfOpenRequests;
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (!this.canExecute()) {
      throw new Error(`Circuit breaker is ${this.state.state}. Cannot execute operation.`);
    }

    try {
      const result = await operation();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private recordSuccess(): void {
    if (this.state.state === 'half-open') {
      this.state.successCount++;
      if (this.state.successCount >= this.config.halfOpenRequests) {
        this.reset();
      }
    } else {
      this.state.failureCount = Math.max(0, this.state.failureCount - 1);
    }
  }

  private recordFailure(): void {
    this.state.failureCount++;
    this.state.lastFailure = Date.now();

    if (this.state.failureCount >= this.config.failureThreshold) {
      this.state.state = 'open';
    }
  }

  reset(): void {
    this.state = {
      state: 'closed',
      failureCount: 0,
      lastFailure: 0,
      successCount: 0,
    };
  }

  getState(): CircuitBreakerState {
    return { ...this.state };
  }
}

export async function withFallback<T>(
  strategies: FallbackStrategy<T>[],
  operation: () => Promise<T>
): Promise<T> {
  const sortedStrategies = [...strategies].sort((a, b) => a.priority - b.priority);

  const errors: Array<{ strategy: string; error: Error }> = [];

  for (const strategy of sortedStrategies) {
    try {
      return await strategy.execute();
    } catch (error) {
      errors.push({
        strategy: strategy.name,
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  try {
    return await operation();
  } catch (error) {
    throw new Error(
      `All strategies failed. Errors: ${errors.map(e => `${e.strategy}: ${e.error.message}`).join('; ')}`
    );
  }
}

export interface FallbackData<T> {
  data: T;
  source: 'primary' | 'cache' | 'fallback';
  stale: boolean;
}

export async function withCacheFallback<T>(
  primaryFetch: () => Promise<T>,
  cacheFetch: () => Promise<T | null>,
  fallbackData: T,
  maxStalenessMs: number = 300000
): Promise<FallbackData<T>> {
  try {
    const primaryResult = await withRetry(primaryFetch, createRetryConfig({ maxRetries: 2 }));

    if (primaryResult.success && primaryResult.data) {
      return { data: primaryResult.data, source: 'primary', stale: false };
    }
  } catch {
  }

  try {
    const cached = await cacheFetch();
    if (cached !== null) {
      return { data: cached, source: 'cache', stale: true };
    }
  } catch {
  }

  return { data: fallbackData, source: 'fallback', stale: true };
}

export class GoogleApiFallbackManager {
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private serviceStatus: Map<string, boolean> = new Map();

  getCircuitBreaker(service: string): CircuitBreaker {
    if (!this.circuitBreakers.has(service)) {
      this.circuitBreakers.set(service, new CircuitBreaker());
    }
    return this.circuitBreakers.get(service)!;
  }

  isServiceAvailable(service: string): boolean {
    return this.serviceStatus.get(service) !== false;
  }

  markServiceStatus(service: string, available: boolean): void {
    this.serviceStatus.set(service, available);
  }

  async executeWithFallbacks<T>(
    service: string,
    operation: () => Promise<T>,
    fallbackOperation?: () => Promise<T>
  ): Promise<T> {
    const circuitBreaker = this.getCircuitBreaker(service);

    try {
      const result = await circuitBreaker.execute(operation);
      this.markServiceStatus(service, true);
      return result;
    } catch (error) {
      this.markServiceStatus(service, false);

      if (fallbackOperation) {
        return await fallbackOperation();
      }

      throw error;
    }
  }

  getAllServiceStatus(): Record<string, { state: string; available: boolean }> {
    const status: Record<string, { state: string; available: boolean }> = {};

    for (const [service, breaker] of this.circuitBreakers) {
      const state = breaker.getState();
      status[service] = {
        state: state.state,
        available: state.state !== 'open',
      };
    }

    return status;
  }
}

export const googleApiFallbackManager = new GoogleApiFallbackManager();
