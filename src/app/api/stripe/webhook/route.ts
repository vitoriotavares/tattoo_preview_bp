import { NextRequest, NextResponse } from 'next/server';
import { verifyStripeWebhookSignature } from '@/lib/stripe';
import { CreditsService } from '@/lib/services/credits-service';
import Stripe from 'stripe';

// Simple in-memory cache for processed events (in production, use Redis or database)
const processedEvents = new Map<string, number>();

// Clean up old entries every hour
setInterval(() => {
  const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
  for (const [eventId, timestamp] of processedEvents.entries()) {
    if (timestamp < cutoff) {
      processedEvents.delete(eventId);
    }
  }
}, 60 * 60 * 1000); // 1 hour

async function isEventProcessed(eventId: string): Promise<boolean> {
  return processedEvents.has(eventId);
}

function markEventProcessed(eventId: string): void {
  processedEvents.set(eventId, Date.now());
}

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `wh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    console.log(`=== WEBHOOK START [${requestId}] ===`);

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    // Security: Check request size
    if (body.length > 1024 * 1024) { // 1MB limit
      console.error(`[${requestId}] Request too large: ${body.length} bytes`);
      return NextResponse.json(
        { error: 'Request too large' },
        { status: 413 }
      );
    }

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

    // Security: Check event timestamp to prevent replay attacks
    const eventTimestamp = event.created;
    const currentTime = Math.floor(Date.now() / 1000);
    const timeDifference = currentTime - eventTimestamp;
    const tolerance = 300; // 5 minutes tolerance

    if (timeDifference > tolerance) {
      console.error(`[${requestId}] Event too old: ${timeDifference}s ago (tolerance: ${tolerance}s)`);
      return NextResponse.json(
        { error: 'Event timestamp too old' },
        { status: 400 }
      );
    }

    // Additional security: Check for potential duplicate events
    // Note: In production, you should implement proper idempotency checking with a database
    const eventId = event.id;
    if (await isEventProcessed(eventId)) {
      console.warn(`[${requestId}] Event ${eventId} already processed, ignoring duplicate`);
      return NextResponse.json({ received: true, status: 'duplicate' });
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
        console.log(`[${requestId}] === PROCESSING PAYMENT INTENT SUCCEEDED ===`);
        console.log(`[${requestId}] Payment Intent ID:`, paymentIntent.id);
        console.log(`[${requestId}] Status:`, paymentIntent.status);
        console.log(`[${requestId}] Payment Intent metadata:`, JSON.stringify(paymentIntent.metadata));

        // Check if we have metadata for credit purchase
        if (paymentIntent.metadata && Object.keys(paymentIntent.metadata).length > 0) {
          const { userId, packageId, credits } = paymentIntent.metadata;

          if (userId && packageId && credits) {
            console.log(`[${requestId}] Found credit purchase metadata in payment intent, processing...`);

            // Create a mock session object for compatibility with existing logic
            const mockSession = {
              id: `pi_session_${paymentIntent.id}`,
              payment_status: 'paid',
              payment_intent: paymentIntent.id,
              amount_total: paymentIntent.amount,
              currency: paymentIntent.currency,
              metadata: paymentIntent.metadata
            } as Stripe.Checkout.Session;

            const success = await CreditsService.handleStripePaymentSuccess(mockSession);

            if (!success) {
              console.error(`[${requestId}] ❌ Failed to process payment intent:`, paymentIntent.id);
              return NextResponse.json(
                { error: 'Failed to process payment intent' },
                { status: 500 }
              );
            }

            console.log(`[${requestId}] ✅ Successfully processed payment intent:`, paymentIntent.id);
          } else {
            console.log(`[${requestId}] ⚠️ Payment intent ${paymentIntent.id} succeeded but missing credit purchase metadata`);
          }
        } else {
          console.log(`[${requestId}] ⚠️ Payment intent ${paymentIntent.id} succeeded but no metadata found`);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment intent failed:', paymentIntent.id);
        // Handle failed payments if needed
        break;
      }

      case 'charge.updated': {
        const charge = event.data.object as Stripe.Charge;
        console.log(`[${requestId}] === PROCESSING CHARGE UPDATED ===`);
        console.log(`[${requestId}] Charge ID:`, charge.id);
        console.log(`[${requestId}] Payment Intent:`, charge.payment_intent);
        console.log(`[${requestId}] Charge Status:`, charge.status);
        console.log(`[${requestId}] Charge metadata:`, JSON.stringify(charge.metadata));

        // Only process if charge is succeeded and we have metadata
        if (charge.status === 'succeeded' && charge.metadata && Object.keys(charge.metadata).length > 0) {
          const { userId, packageId, credits } = charge.metadata;

          if (userId && packageId && credits) {
            console.log(`[${requestId}] Found metadata in charge, processing payment...`);

            // Create a mock session object for compatibility with existing logic
            const mockSession = {
              id: `charge_session_${charge.id}`,
              payment_status: 'paid',
              payment_intent: charge.payment_intent,
              amount_total: charge.amount,
              currency: charge.currency,
              metadata: charge.metadata
            } as Stripe.Checkout.Session;

            const success = await CreditsService.handleStripePaymentSuccess(mockSession);

            if (!success) {
              console.error(`[${requestId}] ❌ Failed to process charge payment:`, charge.id);
              return NextResponse.json(
                { error: 'Failed to process charge payment' },
                { status: 500 }
              );
            }

            console.log(`[${requestId}] ✅ Successfully processed charge payment:`, charge.id);
          } else {
            console.log(`[${requestId}] ⚠️ Charge ${charge.id} succeeded but missing metadata, likely not a credit purchase`);
          }
        } else {
          console.log(`[${requestId}] ⚠️ Charge ${charge.id} not succeeded or no metadata, skipping`);
        }
        break;
      }

      default:
        console.log(`[${requestId}] Unhandled event type: ${event.type}`);
    }

    // Mark event as processed to prevent duplicates
    markEventProcessed(eventId);

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