import Stripe from 'stripe';
import { AppDataSource } from '@/lib/database';
import { Payment, PaymentStatus, PaymentMethod } from '@/lib/entities/Payment';
import { Appointment, AppointmentStatus } from '@/lib/entities/Appointment';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-01-28.clover' as const,
});

export interface CreatePaymentIntentParams {
  amount: number;
  currency?: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  patientEmail: string;
  description?: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export class StripePaymentService {
  private paymentRepository = AppDataSource.getRepository(Payment);
  private appointmentRepository = AppDataSource.getRepository(Appointment);

  async createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntentResponse> {
    const {
      amount,
      currency = 'sar',
      appointmentId,
      patientId,
      doctorId,
      doctorName,
      patientEmail,
      description,
    } = params;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      metadata: {
        appointmentId,
        patientId,
        doctorId,
      },
      description: description || `Consultation with Dr. ${doctorName}`,
      receipt_email: patientEmail,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
    };
  }

  async handlePaymentSuccess(paymentIntentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      const { appointmentId, patientId, doctorId } = paymentIntent.metadata;

      const payment = new Payment();
      payment.amount = paymentIntent.amount / 100;
      payment.currency = paymentIntent.currency.toUpperCase();
      payment.status = PaymentStatus.COMPLETED;
      payment.method = this.mapStripePaymentMethod(paymentIntent.payment_method_types[0]);
      payment.transactionId = paymentIntent.id;
      payment.reference = paymentIntent.id;

      const appointment = await this.appointmentRepository.findOne({
        where: { id: appointmentId },
      });

      if (!appointment) {
        return { success: false, error: 'Appointment not found' };
      }

      payment.appointment = appointment;
      await this.paymentRepository.save(payment);

      appointment.status = AppointmentStatus.CONFIRMED;
      appointment.confirmedAt = new Date();
      await this.appointmentRepository.save(appointment);

      return { success: true };
    } catch (error) {
      console.error('Payment success handling error:', error);
      return { success: false, error: 'Failed to process payment confirmation' };
    }
  }

  async handlePaymentFailure(paymentIntentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      const { appointmentId } = paymentIntent.metadata;

      const payment = new Payment();
      payment.amount = paymentIntent.amount / 100;
      payment.currency = paymentIntent.currency.toUpperCase();
      payment.status = PaymentStatus.FAILED;
      payment.method = PaymentMethod.CREDIT_CARD;
      payment.transactionId = paymentIntent.id;
      payment.reference = paymentIntent.id;

      const appointment = await this.appointmentRepository.findOne({
        where: { id: appointmentId },
      });

      if (appointment) {
        payment.appointment = appointment;
        await this.paymentRepository.save(payment);

        appointment.status = AppointmentStatus.CANCELLED;
        appointment.cancelledAt = new Date();
        appointment.cancellationReason = 'Payment failed';
        await this.appointmentRepository.save(appointment);
      }

      return { success: true };
    } catch (error) {
      console.error('Payment failure handling error:', error);
      return { success: false, error: 'Failed to process payment failure' };
    }
  }

  async createRefund(paymentId: string, amount?: number): Promise<{ success: boolean; refundId?: string; error?: string }> {
    try {
      const payment = await this.paymentRepository.findOne({
        where: { id: paymentId },
      });

      if (!payment || !payment.transactionId) {
        return { success: false, error: 'Payment not found' };
      }

      const refund = await stripe.refunds.create({
        payment_intent: payment.transactionId,
        amount: amount ? Math.round(amount * 100) : undefined,
      });

      payment.status = PaymentStatus.REFUNDED;
      await this.paymentRepository.save(payment);

      return { success: true, refundId: refund.id };
    } catch (error) {
      console.error('Refund error:', error);
      return { success: false, error: 'Failed to process refund' };
    }
  }

  async constructWebhookEvent(payload: string | Buffer, signature: string): Promise<Stripe.Event> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }

  private mapPaymentMethod(method: string | PaymentMethod): PaymentMethod {
    const mapping: Record<string, PaymentMethod> = {
      card: PaymentMethod.CREDIT_CARD,
      mada: PaymentMethod.MADA,
      apple_pay: PaymentMethod.APPLE_PAY,
    };
    return mapping[method] || PaymentMethod.CREDIT_CARD;
  }

  private mapStripePaymentMethod(method: string): PaymentMethod {
    const mapping: Record<string, PaymentMethod> = {
      card: PaymentMethod.CREDIT_CARD,
      mada: PaymentMethod.MADA,
      apple_pay: PaymentMethod.APPLE_PAY,
    };
    return mapping[method] || PaymentMethod.CREDIT_CARD;
  }
}

export const stripePaymentService = new StripePaymentService();
