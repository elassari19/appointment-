export type ContentCategory = 'spam' | 'harassment' | 'hate' | 'violence' | 'adult' | 'medical';

export interface ContentFilterResult {
  allowed: boolean;
  category?: ContentCategory;
  confidence?: number;
  reason?: string;
}

const SPAM_PATTERNS = [
  /\b(buy now|click here|limited time|act now|free money)\b/i,
  /\b(http|https|www\.)\S+/i,
  /\b\d{10,}\b/,
  /(.)\1{5,}/i,
];

const HARASSMENT_PATTERNS = [
  /\b(stupid|idiot|dumb|ugly|worthless)\b/i,
];

const HATE_PATTERNS = [
  /\b(hate|kill|die|nazi|racist)\b/i,
];

const VIOLENCE_PATTERNS = [
  /\b(kill|murder|threat|harm|attack)\b/i,
];

const ADULT_PATTERNS = [
  /\b(sex|nude|xxx|adult content)\b/i,
];

export function filterContent(content: string): ContentFilterResult {
  const lowerContent = content.toLowerCase();
  
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(lowerContent)) {
      return {
        allowed: false,
        category: 'spam',
        confidence: 0.9,
        reason: 'Content contains spam-like patterns',
      };
    }
  }

  for (const pattern of HARASSMENT_PATTERNS) {
    if (pattern.test(lowerContent)) {
      return {
        allowed: false,
        category: 'harassment',
        confidence: 0.85,
        reason: 'Content contains harassment',
      };
    }
  }

  for (const pattern of HATE_PATTERNS) {
    if (pattern.test(lowerContent)) {
      return {
        allowed: false,
        category: 'hate',
        confidence: 0.9,
        reason: 'Content contains hate speech',
      };
    }
  }

  for (const pattern of VIOLENCE_PATTERNS) {
    if (pattern.test(lowerContent)) {
      return {
        allowed: false,
        category: 'violence',
        confidence: 0.85,
        reason: 'Content contains violent threats',
      };
    }
  }

  for (const pattern of ADULT_PATTERNS) {
    if (pattern.test(lowerContent)) {
      return {
        allowed: false,
        category: 'adult',
        confidence: 0.8,
        reason: 'Content contains adult material',
      };
    }
  }

  return {
    allowed: true,
    confidence: 1,
  };
}

export function sanitizeContent(content: string): string {
  let sanitized = content;
  
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  sanitized = sanitized.replace(urlPattern, '[URL removed]');
  
  const phonePattern = /\b\d{10,}\b/g;
  sanitized = sanitized.replace(phonePattern, '[Phone removed]');
  
  const emailPattern = /\b[\w.-]+@[\w.-]+\.\w{2,}\b/g;
  sanitized = sanitized.replace(emailPattern, '[Email removed]');
  
  return sanitized.trim();
}
