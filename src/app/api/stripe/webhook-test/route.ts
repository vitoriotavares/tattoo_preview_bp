import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'OK',
    message: 'Webhook endpoint is accessible',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headers = Object.fromEntries(request.headers.entries());

    console.log('=== WEBHOOK TEST ENDPOINT HIT ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Method:', request.method);
    console.log('Headers:', JSON.stringify(headers, null, 2));
    console.log('Body length:', body.length);
    console.log('Body preview:', body.substring(0, 200));

    return NextResponse.json({
      received: true,
      timestamp: new Date().toISOString(),
      bodyLength: body.length,
      hasSignature: !!headers['stripe-signature']
    });
  } catch (error) {
    console.error('Webhook test error:', error);
    return NextResponse.json(
      { error: 'Test endpoint error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}