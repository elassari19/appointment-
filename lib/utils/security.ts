import crypto from 'crypto';
import { createHash } from 'crypto';

export interface SanitizationConfig {
  maxStringLength: number;
  allowedTags: string[];
  maxNestingDepth: number;
  maxArrayLength: number;
  maxObjectDepth: number;
}

export const DEFAULT_SANITIZATION_CONFIG: SanitizationConfig = {
  maxStringLength: 10000,
  allowedTags: ['b', 'i', 'u', 'strong', 'em', 'p', 'br', 'ul', 'ol', 'li', 'a'],
  maxNestingDepth: 10,
  maxArrayLength: 1000,
  maxObjectDepth: 10,
};

const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
  /<embed\b[^<]]*>/gi,
  /expression\s*\(/gi,
  /data:/gi,
  /vbscript:/gi,
];

const SQL_INJECTION_PATTERNS = [
  /(\b)(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b/gi,
  /['";].*(--|#|\/\*)/,
  /\/\*.*\*\//g,
  /xp_/gi,
  /0x[0-9a-fA-F]+/g,
];

const XSS_PATTERNS = [
  /<[^>]*>/g,
  /&#[xX][0-9a-fA-F]+;/g,
  /&#\d+;/g,
];

export function sanitizeInput(input: unknown, config: SanitizationConfig = DEFAULT_SANITIZATION_CONFIG, _depth: number = 0): unknown {
  if (typeof input === 'string') {
    return sanitizeString(input, config);
  }

  if (Array.isArray(input)) {
    return sanitizeArray(input, config);
  }

  if (input !== null && typeof input === 'object') {
    return sanitizeObject(input as Record<string, unknown>, config);
  }

  return input;
}

function sanitizeString(str: string, config: SanitizationConfig): string {
  if (str.length > config.maxStringLength) {
    str = str.substring(0, config.maxStringLength);
  }

  for (const pattern of DANGEROUS_PATTERNS) {
    str = str.replace(pattern, '');
  }

  for (const pattern of SQL_INJECTION_PATTERNS) {
    str = str.replace(pattern, (match, prefix, keyword) => {
      if (prefix && keyword) {
        return `${prefix} ${keyword}`;
      }
      return '[REDACTED]';
    });
  }

  str = str.replace(/[<>]/g, (char) => {
    return char === '<' ? '&lt;' : '&gt;';
  });

  return str;
}

function sanitizeArray(arr: unknown[], config: SanitizationConfig, depth: number = 0): unknown[] {
  if (depth > config.maxNestingDepth) {
    return [];
  }

  return arr.slice(0, config.maxArrayLength).map(item => sanitizeInput(item, config));
}

function sanitizeObject(obj: Record<string, unknown>, config: SanitizationConfig, depth: number = 0): Record<string, unknown> {
  if (depth > config.maxObjectDepth) {
    return {};
  }

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const sanitizedKey = sanitizeKey(key);
    if (sanitizedKey) {
      sanitized[sanitizedKey] = sanitizeInput(value, config, depth + 1);
    }
  }

  return sanitized;
}

function sanitizeKey(key: string): string {
  const sanitized = key.replace(/[^a-zA-Z0-9_-]/g, '');
  return sanitized.substring(0, 100);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const maxLength = 254;
  return emailRegex.test(email) && email.length <= maxLength;
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (password.length > 128) {
    errors.push('Password must not exceed 128 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return { valid: errors.length === 0, errors };
}

export function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function validateCardNumber(cardNumber: string): { valid: boolean; brand: string } {
  const cleanNumber = cardNumber.replace(/\s/g, '');

  if (!/^\d{13,19}$/.test(cleanNumber)) {
    return { valid: false, brand: 'unknown' };
  }

  if (!luhnCheck(cleanNumber)) {
    return { valid: false, brand: 'unknown' };
  }

  return { valid: true, brand: detectCardBrand(cleanNumber) };
}

function luhnCheck(cardNumber: string): boolean {
  let sum = 0;
  let isEven = false;

  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

function detectCardBrand(cardNumber: string): string {
  const patterns: Record<string, RegExp> = {
    visa: /^4/,
    mastercard: /^5[1-5]/,
    amex: /^3[47]/,
    discover: /^6(?:011|5)/,
    diners: /^3(?:0[0-5]|[68])/,
    jcb: /^(?:2131|1800|35)/,
  };

  for (const [brand, pattern] of Object.entries(patterns)) {
    if (pattern.test(cardNumber)) {
      return brand;
    }
  }

  return 'unknown';
}

export function validateCVV(cvv: string, brand?: string): boolean {
  const cvvPatterns: Record<string, RegExp> = {
    amex: /^\d{4}$/,
    default: /^\d{3}$/,
  };

  const pattern = brand && cvvPatterns[brand] ? cvvPatterns[brand] : cvvPatterns.default;
  return pattern.test(cvv);
}

export function validateExpiryDate(month: number, year: number): boolean {
  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;

  if (month < 1 || month > 12) {
    return false;
  }

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return false;
  }

  const maxFutureYear = currentYear + 20;
  if (year > maxFutureYear) {
    return false;
  }

  return true;
}

export interface PCIComplianceCheck {
  compliant: boolean;
  issues: string[];
}

export function checkPCICompliance(data: {
  cardNumber?: string;
  cvv?: string;
  trackData?: string;
  pan?: string;
}): PCIComplianceCheck {
  const issues: string[] = [];

  if (data.trackData) {
    issues.push('Track data (magnetic stripe) should not be stored');
  }

  if (data.cvv && data.cvv.length > 3) {
    issues.push('CVV should not exceed 3-4 digits');
  }

  if (data.pan && !data.pan.includes('*')) {
    issues.push('Full PAN should be tokenized or masked');
  }

  if (data.cardNumber && !luhnCheck(data.cardNumber.replace(/\s/g, ''))) {
    issues.push('Invalid card number (failed Luhn check)');
  }

  return {
    compliant: issues.length === 0,
    issues,
  };
}

export interface SecurityHeaders {
  'X-Content-Type-Options': string;
  'X-Frame-Options': string;
  'X-XSS-Protection': string;
  'Referrer-Policy': string;
  'Permissions-Policy': string;
  'Content-Security-Policy'?: string;
  'Strict-Transport-Security'?: string;
}

export function getSecurityHeaders(enableCSP: boolean = false): SecurityHeaders {
  const headers: SecurityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };

  if (enableCSP) {
    headers['Content-Security-Policy'] = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.googleapis.com https://*.gapi.com",
      "frame-src 'self' https://meet.google.com",
      "media-src 'self' blob:",
    ].join('; ');
  }

  return headers;
}

export function hashData(data: string, algorithm: 'sha256' | 'sha512' = 'sha256'): string {
  return createHash(algorithm).update(data).digest('hex');
}

export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

export interface RateLimitBucket {
  tokens: number;
  lastRefill: number;
}

export function createTokenBucket(maxTokens: number, refillRate: number): RateLimitBucket {
  return {
    tokens: maxTokens,
    lastRefill: Date.now(),
  };
}

export function consumeToken(bucket: RateLimitBucket, maxTokens: number, refillRate: number): boolean {
  const now = Date.now();
  const timePassed = now - bucket.lastRefill;
  const tokensToAdd = (timePassed / 1000) * refillRate;

  bucket.tokens = Math.min(maxTokens, bucket.tokens + tokensToAdd);
  bucket.lastRefill = now;

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return true;
  }

  return false;
}

export function getTimeUntilRefill(bucket: RateLimitBucket, maxTokens: number, refillRate: number): number {
  if (bucket.tokens >= 1) return 0;
  const tokensNeeded = 1 - bucket.tokens;
  return Math.ceil((tokensNeeded / refillRate) * 1000);
}
