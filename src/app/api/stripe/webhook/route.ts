import { NextRequest, NextResponse } from 'next/server';
import { verifyStripeWebhookSignature } from '@/lib/stripe';
import { CreditsService } from '@/lib/services/credits-service';
import Stripe from 'stripe';

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `wh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    console.log(`=== WEBHOOK START [${requestId}] ===`);
    
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error(`[${requestId}] Missing stripe-signature header`);
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = verifyStripeWebhookSignature(body, signature);
      console.log(`[${requestId}] Webhook signature verified for event: ${event.type}`);
    } catch (err) {
      console.error(`[${requestId}] Webhook signature verification failed:`, err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    console.log(`[${requestId}] Processing event type: ${event.type}`);
    
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        console.log(`[${requestId}] === PROCESSING CHECKOUT SESSION COMPLETED ===`);
        console.log(`[${requestId}] Session ID:`, session.id);
        console.log(`[${requestId}] Payment Status:`, session.payment_status);
        console.log(`[${requestId}] Session metadata:`, JSON.stringify(session.metadata));
        console.log(`[${requestId}] Payment intent:`, session.payment_intent);
        console.log(`[${requestId}] Amount total:`, session.amount_total);
        console.log(`[${requestId}] Currency:`, session.currency);
        
        // Validate required metadata before processing
        const { userId, packageId, credits } = session.metadata || {};
        if (!userId || !packageId || !credits) {
          console.error(`[${requestId}] ❌ CRITICAL: Missing required metadata!`, {
            userId: !!userId,
            packageId: !!packageId,
            credits: !!credits,
            fullMetadata: session.metadata
          });
          
          return NextResponse.json(
            { error: 'Missing required metadata in session' },
            { status: 400 }
          );
        }
        
        const success = await CreditsService.handleStripePaymentSuccess(session);
        
        if (!success) {
          console.error(`[${requestId}] ❌ Failed to process payment for session:`, session.id);
          console.error(`[${requestId}] This will require manual intervention!`);
          
          return NextResponse.json(
            { error: 'Failed to process payment' },
            { status: 500 }
          );
        }
        
        console.log(`[${requestId}] ✅ Successfully processed payment for session:`, session.id);
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
        console.log(`[${requestId}] Unhandled event type: ${event.type}`);
    }

    const processingTime = Date.now() - startTime;
    console.log(`[${requestId}] === WEBHOOK COMPLETED in ${processingTime}ms ===`);
    
    return NextResponse.json({ 
      received: true, 
      requestId,
      processingTime 
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`[${requestId}] ❌ WEBHOOK ERROR after ${processingTime}ms:`, error);
    console.error(`[${requestId}] Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        error: 'Webhook handler failed',
        requestId,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}