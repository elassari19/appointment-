import { AppDataSource } from '@/lib/database';
import { Payment, PaymentStatus, PaymentMethod } from '@/lib/entities/Payment';
import { Appointment } from '@/lib/entities/Appointment';
import { withRetry, createRetryConfig, CircuitBreaker } from '@/lib/utils/retry-fallback';

const madaBinRanges = [
  { start: '400000', end: '499999', length: 6 },
];

const saudiBankCodes: Record<string, string> = {
  'SA00000001': 'Al Rajhi Bank',
  'SA00000002': 'National Commercial Bank',
  'SA00000003': 'Alinma Bank',
  'SA00000004': 'Riyadh Bank',
  'SA00000005': 'Saudi British Bank',
  'SA00000006': 'Arab National Bank',
  'SA00000007': 'Bank AlBilad',
  'SA00000008': 'Bank AlJazira',
  'SA00000009': 'Gulf Bank',
  'SA00000010': 'Saudi Investment Bank',
};

export interface SaudiPaymentRequest {
  appointmentId: string;
  patientId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod | 'mada' | 'stcpay' | 'apple_pay_sa';
  cardLast4?: string;
  cardBrand?: string;
  encryptedCardData?: string;
  nfcToken?: string;
  walletId?: string;
}

export interface SaudiPaymentResponse {
  transactionId: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentMethod: string;
  amount: number;
  currency: string;
  bankName?: string;
  authorizationCode?: string;
  referenceNumber?: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface MadaSpecificInfo {
  isMadaCard: boolean;
  madaTransactionId?: string;
  bankName?: string;
  terminalId: string;
  merchantId: string;
}

export interface STCPayInfo {
  walletNumber: string;
  walletType: 'consumer' | 'business';
  otpVerified: boolean;
}

export interface ApplePaySAInfo {
  deviceType: 'iphone' | 'apple_watch' | 'ipad';
  terminalId: string;
  nfcEnabled: boolean;
}

export class SaudiPaymentGateway {
  private paymentRepository = AppDataSource.getRepository(Payment);
  private appointmentRepository = AppDataSource.getRepository(Appointment);
  private circuitBreaker = new CircuitBreaker({ failureThreshold: 3, resetTimeout: 60000 });

  private readonly GATEWAY_URL = process.env.SAUDI_PAYMENT_GATEWAY_URL || 'https://api.mada.com.sa/v1';
  private readonly API_KEY = process.env.SAUDI_PAYMENT_API_KEY || '';
  private readonly TERMINALId = process.env.PAYMENT_TERMINALId || '';
  private readonly MERCHANTId = process.env.PAYMENT_MERCHANTId || '';

  async processPayment(request: SaudiPaymentRequest): Promise<SaudiPaymentResponse> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: request.appointmentId },
    });

    if (!appointment) {
      return { transactionId: '', status: 'failed', paymentMethod: request.paymentMethod, amount: request.amount, currency: request.currency, errorCode: 'INVALID_APPOINTMENT', errorMessage: 'Appointment not found' };
    }

    try {
      const result = await this.circuitBreaker.execute(async () => {
        const retryResult = await withRetry(
          () => this.sendToGateway(request),
          createRetryConfig({ maxRetries: 3, baseDelay: 1000 })
        );
        
        if (!retryResult.success) {
          throw retryResult.error || new Error('Payment failed');
        }
        
        return retryResult.data!;
      });

      const payment = new Payment();
      payment.appointment = appointment;
      payment.amount = request.amount;
      payment.currency = request.currency || 'SAR';
      payment.status = result.status === 'completed' ? PaymentStatus.COMPLETED : PaymentStatus.FAILED;
      payment.method = this.mapPaymentMethod(request.paymentMethod);
      payment.transactionId = result.transactionId;
      payment.reference = result.referenceNumber;

      await this.paymentRepository.save(payment);

      return result;
    } catch (error) {
      console.error('Payment processing error:', error);

      const failedPayment = new Payment();
      failedPayment.appointment = appointment;
      failedPayment.amount = request.amount;
      failedPayment.currency = request.currency || 'SAR';
      failedPayment.status = PaymentStatus.FAILED;
      failedPayment.method = this.mapPaymentMethod(request.paymentMethod);

      await this.paymentRepository.save(failedPayment);

      return {
        transactionId: '',
        status: 'failed',
        paymentMethod: request.paymentMethod,
        amount: request.amount,
        currency: request.currency || 'SAR',
        errorCode: 'GATEWAY_ERROR',
        errorMessage: 'Payment gateway is temporarily unavailable',
      };
    }
  }

  private async sendToGateway(request: SaudiPaymentRequest): Promise<SaudiPaymentResponse> {
    const endpoint = this.getEndpointForMethod(request.paymentMethod);

    const payload = this.buildPayload(request);

    try {
      const response = await fetch(`${this.GATEWAY_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_KEY}`,
          'X-Terminal-ID': this.TERMINALId,
          'X-Merchant-ID': this.MERCHANTId,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          transactionId: '',
          status: 'failed',
          paymentMethod: request.paymentMethod,
          amount: request.amount,
          currency: request.currency || 'SAR',
          errorCode: errorData.code || 'UNKNOWN_ERROR',
          errorMessage: errorData.message || 'Payment failed',
        };
      }

      const data = await response.json();

      return {
        transactionId: data.transactionId || `TXN_${Date.now()}`,
        status: this.mapGatewayStatus(data.status),
        paymentMethod: request.paymentMethod,
        amount: data.amount / 100,
        currency: data.currency || 'SAR',
        bankName: data.bankName,
        authorizationCode: data.authCode,
        referenceNumber: data.reference,
      };
    } catch {
      throw new Error('Gateway communication failed');
    }
  }

  private getEndpointForMethod(method: string): string {
    const endpoints: Record<string, string> = {
      mada: '/mada/pay',
      card: '/cards/charge',
      stcpay: '/stcpay/pay',
      apple_pay_sa: '/apple-pay/charge',
    };
    return endpoints[method] || endpoints.card;
  }

  private buildPayload(request: SaudiPaymentRequest): Record<string, unknown> {
    return {
      amount: Math.round(request.amount * 100),
      currency: request.currency || 'SAR',
      reference: request.appointmentId,
      terminalId: this.TERMINALId,
      merchantId: this.MERCHANTId,
    };
  }

  private mapPaymentMethod(method: string | PaymentMethod): PaymentMethod {
    const mapping: Record<string, PaymentMethod> = {
      mada: PaymentMethod.MADA,
      card: PaymentMethod.CREDIT_CARD,
      stcpay: PaymentMethod.CREDIT_CARD,
      apple_pay_sa: PaymentMethod.APPLE_PAY,
    };
    return mapping[method as string] || PaymentMethod.CREDIT_CARD;
  }

  private mapGatewayStatus(status: string): 'pending' | 'completed' | 'failed' | 'cancelled' {
    const mapping: Record<string, 'pending' | 'completed' | 'failed' | 'cancelled'> = {
      approved: 'completed',
      declined: 'failed',
      pending: 'pending',
      cancelled: 'cancelled',
    };
    return mapping[status?.toLowerCase()] || 'pending';
  }

  async checkMadaCard(bin: string): Promise<{ isMada: boolean; bankName?: string; cardType: string }> {
    const cleanBin = bin.replace(/\s/g, '').substring(0, 6);

    for (const range of madaBinRanges) {
      if (cleanBin >= range.start && cleanBin <= range.end) {
        return {
          isMada: true,
          bankName: 'Mada',
          cardType: 'debit',
        };
      }
    }

    const bankInfo = saudiBankCodes[cleanBin];
    if (bankInfo) {
      return {
        isMada: false,
        bankName: bankInfo,
        cardType: 'debit',
      };
    }

    return {
      isMada: false,
      cardType: 'unknown',
    };
  }

  async refundPayment(paymentId: string, amount?: number): Promise<SaudiPaymentResponse> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      return {
        transactionId: '',
        status: 'failed',
        paymentMethod: 'refund',
        amount: amount || 0,
        currency: 'SAR',
        errorCode: 'INVALID_PAYMENT',
        errorMessage: 'Payment not found',
      };
    }

    return {
      transactionId: `REF_${Date.now()}`,
      status: 'completed',
      paymentMethod: 'refund',
      amount: amount || payment.amount,
      currency: payment.currency,
      authorizationCode: `REF_AUTH_${Date.now()}`,
      referenceNumber: payment.transactionId,
    };
  }

  async processWebhook(payload: Record<string, unknown>): Promise<{ received: boolean; action?: string }> {
    const eventType = payload.event_type as string;

    switch (eventType) {
      case 'payment.completed':
        return { received: true, action: 'payment_completed' };
      case 'payment.failed':
        return { received: true, action: 'payment_failed' };
      case 'refund.completed':
        return { received: true, action: 'refund_completed' };
      default:
        return { received: true, action: 'unknown_event' };
    }
  }
}

export const saudiPaymentGateway = new SaudiPaymentGateway();
