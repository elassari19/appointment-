import { NextRequest, NextResponse } from 'next/server';
import { stripePaymentService } from '@/lib/services/stripe.service';
import { DatabaseService } from '@/lib/services/database.service';

export async function POST(request: NextRequest) {
  try {
    await DatabaseService.initialize();

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    let event;
    try {
      event = await stripePaymentService.constructWebhookEvent(body, signature);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as any;
        await stripePaymentService.handlePaymentSuccess(paymentIntent.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as any;
        await stripePaymentService.handlePaymentFailure(paymentIntent.id);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as any;
        console.log('Charge refunded:', charge.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
