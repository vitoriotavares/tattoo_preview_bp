import { NextRequest, NextResponse } from 'next/server';
import { CreditsService } from '@/lib/services/credits-service';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, userId, credits, amount, paymentIntentId } = await request.json();

    console.log('=== MANUAL PAYMENT PROCESSING ===');
    console.log('Session ID:', sessionId);
    console.log('User ID:', userId);
    console.log('Credits:', credits);
    console.log('Amount:', amount);
    console.log('Payment Intent:', paymentIntentId);

    // Create a mock session object for the credits service
    const mockSession = {
      id: sessionId,
      payment_status: 'paid',
      payment_intent: paymentIntentId,
      amount_total: parseInt(amount),
      currency: 'brl',
      metadata: {
        userId,
        packageId: 'manual-processing',
        credits: credits.toString()
      }
    };

    console.log('Processing with mock session:', mockSession);

    const success = await CreditsService.handleStripePaymentSuccess(mockSession as unknown as import('stripe').Stripe.Checkout.Session);

    if (success) {
      console.log('✅ Manual processing successful');
      return NextResponse.json({
        success: true,
        message: 'Payment processed successfully',
        sessionId,
        creditsAdded: credits
      });
    } else {
      console.error('❌ Manual processing failed');
      return NextResponse.json({
        success: false,
        error: 'Failed to process payment'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Manual processing error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}