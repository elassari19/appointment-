import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

export interface EncryptedData {
  encrypted: string;
  iv: string;
  tag: string;
  salt: string;
}

export interface TokenizedPaymentData {
  token: string;
  last4: string;
  brand?: string;
  expMonth?: number;
  expYear?: number;
  type: 'card' | 'bank_account' | 'wallet';
}

const ENCRYPTION_KEY = process.env.PAYMENT_DATA_KEY || crypto.randomBytes(32).toString('hex');

function deriveKey(salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(ENCRYPTION_KEY, salt, 100000, KEY_LENGTH, 'sha512');
}

export function encryptSensitiveData(data: string): EncryptedData {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const key = deriveKey(salt);
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const tag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
    salt: salt.toString('hex'),
  };
}

export function decryptSensitiveData(encryptedData: EncryptedData): string {
  const salt = Buffer.from(encryptedData.salt, 'hex');
  const key = deriveKey(salt);
  const iv = Buffer.from(encryptedData.iv, 'hex');
  const tag = Buffer.from(encryptedData.tag, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

export function tokenizeCardNumber(cardNumber: string): TokenizedPaymentData {
  const cleanNumber = cardNumber.replace(/\s/g, '');

  const brand = detectCardBrand(cleanNumber);
  const last4 = cleanNumber.slice(-4);
  const token = generatePaymentToken();

  return {
    token,
    last4,
    brand,
    type: 'card',
  };
}

export function tokenizeBankAccount(accountData: {
  accountNumber: string;
  routingNumber?: string;
  bankName?: string;
}): TokenizedPaymentData {
  const encrypted = encryptSensitiveData(accountData.accountNumber);
  const token = generatePaymentToken();

  return {
    token: `${token}_bank`,
    last4: accountData.accountNumber.slice(-4),
    type: 'bank_account',
  };
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

export function generatePaymentToken(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = crypto.randomBytes(12).toString('hex');
  return `pay_${timestamp}_${randomPart}`;
}

export function hashCardForFingerprint(cardNumber: string): string {
  const cleanNumber = cardNumber.replace(/\s/g, '');
  const hash = crypto.createHash('sha256')
    .update(cleanNumber)
    .digest('hex');
  return hash.substring(0, 16);
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

export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (data.length <= visibleChars) {
    return '*'.repeat(data.length);
  }

  const masked = '*'.repeat(data.length - visibleChars);
  return masked + data.slice(-visibleChars);
}

export function formatCardNumber(cardNumber: string): string {
  const clean = cardNumber.replace(/\D/g, '');
  const brand = detectCardBrand(clean);

  if (brand === 'amex') {
    return clean.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3').trim();
  }

  return clean.replace(/(\d{4})/g, '$1 ').trim();
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

export function createSecurePaymentSession(userId: string, durationMs: number = 3600000): {
  sessionId: string;
  expiresAt: number;
} {
  const sessionId = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + durationMs;

  return {
    sessionId,
    expiresAt,
  };
}

export function validateSecurePaymentSession(sessionId: string, expiresAt: number): boolean {
  if (!sessionId || sessionId.length < 32) {
    return false;
  }

  return Date.now() < expiresAt;
}

export interface ComplianceReport {
  timestamp: Date;
  tokenizedCards: number;
  maskedCards: number;
  encryptionAlgorithm: string;
  keyDerivation: string;
  pciComplianceStatus: 'compliant' | 'needs-review' | 'non-compliant';
}
