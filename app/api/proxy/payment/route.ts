// app/api/proxy/payment/route.ts
import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { sanitizeInput } from '@/lib/utils/security';
import { encryptSensitiveData, tokenizeCardNumber, hashCardForFingerprint, createSecurePaymentSession, PCIComplianceCheck } from '@/lib/utils/payment-security';
import { withRetry, createRetryConfig, CircuitBreaker } from '@/lib/utils/retry-fallback';
import { validateCardNumber, validateCVV, validateExpiryDate, checkPCICompliance } from '@/lib/utils/security';

const circuitBreaker = new CircuitBreaker({
  failureThreshold: 3,
  resetTimeout: 120000,
  halfOpenRequests: 2,
});

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');
  const service = searchParams.get('service');
  const operation = searchParams.get('operation');

  if (!targetUrl || !service) {
    return Response.json({ error: 'Missing target URL or service type' }, { status: 400 });
  }

  const validServices = ['stripe', 'paypal', 'mada', 'applepay'];
  if (!validServices.includes(service.toLowerCase())) {
    return Response.json({ error: 'Invalid payment service' }, { status: 400 });
  }

  try {
    const bodyRaw = await request.json();
    const body = sanitizeInput(bodyRaw) as Record<string, unknown>;

    if (operation === 'tokenize') {
      return handleTokenization(body);
    }

    if (operation === 'validate') {
      return handleValidation(body);
    }

    if (operation === 'session') {
      return handleSessionCreation(body);
    }

    const result = await circuitBreaker.execute(async () => {
      const retryResult = await withRetry(
        () => forwardToPaymentService(targetUrl, service, body),
        createRetryConfig({ maxRetries: 3, baseDelay: 500 })
      );
      
      if (!retryResult.success) {
        throw retryResult.error || new Error('Payment request failed');
      }
      
      return retryResult.data!;
    });

    return Response.json(result.data, { status: result.status });
  } catch (error) {
    console.error('Payment proxy error:', error);
    return Response.json({ error: 'Payment processing failed' }, { status: 500 });
  }
}

function handleTokenization(body: Record<string, unknown>): Response {
  const cardNumber = body.cardNumber as string;
  const expMonth = body.expMonth as number | undefined;
  const expYear = body.expYear as number | undefined;
  const cvv = body.cvv as string | undefined;

  if (!cardNumber) {
    return Response.json({ error: 'Card number is required' }, { status: 400 });
  }

  const validation = validateCardNumber(cardNumber);
  if (!validation.valid) {
    return Response.json({ error: 'Invalid card number' }, { status: 400 });
  }

  if (cvv && !validateCVV(cvv, validation.brand)) {
    return Response.json({ error: 'Invalid CVV' }, { status: 400 });
  }

  if ((expMonth || expYear) && !validateExpiryDate(expMonth!, expYear!)) {
    return Response.json({ error: 'Invalid expiry date' }, { status: 400 });
  }

  const pciCheck: PCIComplianceCheck = {
    compliant: true,
    issues: [],
  };

  if (body.cvv) {
    const cvvCheck = validateCVV(body.cvv as string, validation.brand);
    if (!cvvCheck) {
      pciCheck.issues.push('CVV validation failed');
    }
  }

  const tokenized = tokenizeCardNumber(cardNumber);
  const fingerprint = hashCardForFingerprint(cardNumber);

  const encryptedData = encryptSensitiveData(cardNumber);

  return Response.json({
    success: true,
    token: tokenized.token,
    last4: tokenized.last4,
    brand: tokenized.brand,
    fingerprint,
    encrypted: encryptedData,
    pciCompliance: pciCheck,
  });
}

function handleValidation(body: Record<string, unknown>): Response {
  const cardNumber = body.cardNumber as string;
  const cvv = body.cvv as string | undefined;
  const expMonth = body.expMonth as number | undefined;
  const expYear = body.expYear as number | undefined;

  const errors: string[] = [];

  if (cardNumber) {
    const validation = validateCardNumber(cardNumber);
    if (!validation.valid) {
      errors.push('Invalid card number');
    }
  }

  if (cvv) {
    const brand = cardNumber ? validateCardNumber(cardNumber).brand : undefined;
    if (!validateCVV(cvv, brand)) {
      errors.push('Invalid CVV');
    }
  }

  if (expMonth || expYear) {
    if (!validateExpiryDate(expMonth!, expYear!)) {
      errors.push('Invalid or expired expiry date');
    }
  }

  return Response.json({
    valid: errors.length === 0,
    errors,
  });
}

function handleSessionCreation(body: Record<string, unknown>): Response {
  const userId = body.userId as string;
  const duration = body.duration as number | undefined;

  if (!userId) {
    return Response.json({ error: 'User ID is required' }, { status: 400 });
  }

  const session = createSecurePaymentSession(userId, duration || 3600000);

  return Response.json({
    success: true,
    sessionId: session.sessionId,
    expiresAt: session.expiresAt,
  });
}

async function forwardToPaymentService(
  targetUrl: string,
  service: string,
  body: Record<string, unknown>
): Promise<{ data: unknown; status: number }> {
  const response = await fetch(targetUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': process.env.PAYMENT_API_KEY || '',
      ...(service.toLowerCase() === 'stripe' ? {
        'Stripe-Version': '2022-11-15',
        'Idempotency-Key': crypto.randomUUID(),
      } : {}),
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(`Payment service error: ${response.status}`);
    (error as any).status = response.status;
    throw error;
  }

  return { data, status: response.status };
}
