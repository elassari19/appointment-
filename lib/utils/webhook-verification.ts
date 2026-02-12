import crypto from 'crypto';

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || '';

export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string | string[] | undefined,
  secret: string = WEBHOOK_SECRET
): boolean {
  if (!signature || !secret) {
    return false;
  }

  const sig = Array.isArray(signature) ? signature[0] : signature;
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(sig),
    Buffer.from(expectedSignature)
  );
}

export function verifyStripeWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): boolean {
  const elements = signature.split(',');
  const signatureMap: Record<string, string> = {};

  for (const element of elements) {
    const [key, value] = element.split('=');
    signatureMap[key] = value;
  }

  const timestamp = signatureMap['t'];
  const expectedSig = signatureMap['v1'];

  if (!timestamp || !expectedSig) {
    return false;
  }

  const signedPayload = `${timestamp}.${payload}`;
  const computedSignature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(expectedSig),
    Buffer.from(computedSignature)
  );
}

export function generateWebhookSignature(
  payload: string | Buffer,
  secret: string = WEBHOOK_SECRET
): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}
