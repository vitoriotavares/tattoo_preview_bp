import { NextRequest, NextResponse } from 'next/server';
import { withDebugSecurity } from '@/lib/debug-security';
import { CreditsService } from '@/lib/services/credits-service';
import Stripe from 'stripe';

async function debugWebhookTestHandler(_request: NextRequest) {
  try {

    // Simulate a Stripe checkout session with metadata
    const mockSession = {
      id: 'cs_test_debug123',
      payment_intent: 'pi_test_debug123',
      amount_total: 1490, // R$ 14,90
      currency: 'brl',
      metadata: {
        userId: 'test_user_id_123',
        packageId: 'test_package_id_123',
        credits: '10'
      }
    };

    console.log('=== DEBUG WEBHOOK TEST: Simulating payment processing ===');
    console.log('Mock session:', mockSession);

    const success = await CreditsService.handleStripePaymentSuccess(mockSession as unknown as Stripe.Checkout.Session);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to process simulated payment' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Simulated payment processed successfully',
      mockSession
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Webhook test failed', debug: true },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Debug endpoints not available in production' },
      { status: 404 }
    );
  }

  return debugWebhookTestHandler(request);
}