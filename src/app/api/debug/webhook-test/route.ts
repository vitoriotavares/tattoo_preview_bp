import { NextRequest, NextResponse } from 'next/server';
import { CreditsService } from '@/lib/services/credits-service';
import Stripe from 'stripe';

export async function POST(_request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'This endpoint is only available in development' },
        { status: 403 }
      );
    }

    // Simulate a Stripe checkout session with metadata
    const mockSession = {
      id: 'cs_test_debug123',
      payment_intent: 'pi_test_debug123',
      amount_total: 990, // $9.90
      currency: 'usd',
      metadata: {
        userId: 'test_user_id_123',
        packageId: 'test_package_id_123',
        credits: '5'
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
    console.error('Debug webhook test error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Test failed' },
      { status: 500 }
    );
  }
}