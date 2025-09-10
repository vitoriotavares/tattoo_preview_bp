import { NextRequest, NextResponse } from 'next/server';
import { verifyStripeWebhookSignature } from '@/lib/stripe';
import { CreditsService } from '@/lib/services/credits-service';
import Stripe from 'stripe';

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = verifyStripeWebhookSignature(body, signature);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        console.log('=== WEBHOOK: Processing checkout session completed ===');
        console.log('Session ID:', session.id);
        console.log('Session metadata:', session.metadata);
        console.log('Payment intent:', session.payment_intent);
        console.log('Amount total:', session.amount_total);
        
        const success = await CreditsService.handleStripePaymentSuccess(session);
        
        if (!success) {
          console.error('❌ Failed to process payment for session:', session.id);
          return NextResponse.json(
            { error: 'Failed to process payment' },
            { status: 500 }
          );
        }
        
        console.log('✅ Successfully processed payment for session:', session.id);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment intent succeeded:', paymentIntent.id);
        // Additional logic if needed
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment intent failed:', paymentIntent.id);
        // Handle failed payments if needed
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}