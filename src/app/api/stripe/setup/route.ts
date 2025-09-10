import { NextResponse } from 'next/server';
import { CreditsService } from '@/lib/services/credits-service';

// This route is only for development/setup purposes
export async function POST() {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'This endpoint is only available in development' },
        { status: 403 }
      );
    }

    console.log('Setting up Stripe products and prices...');
    
    await CreditsService.createStripeProductsAndPrices();
    
    return NextResponse.json({
      message: 'Stripe products and prices created successfully'
    });

  } catch (error) {
    console.error('Stripe setup error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Setup failed' },
      { status: 500 }
    );
  }
}