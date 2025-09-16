import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString();
  const requestId = `debug_${Date.now()}`;

  try {
    console.log(`=== WEBHOOK DEBUG [${requestId}] START ===`);
    console.log(`[${requestId}] Timestamp:`, timestamp);
    console.log(`[${requestId}] Method:`, request.method);
    console.log(`[${requestId}] URL:`, request.url);
    console.log(`[${requestId}] Headers:`, Object.fromEntries(request.headers.entries()));

    const body = await request.text();
    console.log(`[${requestId}] Body length:`, body.length);
    console.log(`[${requestId}] Body preview:`, body.substring(0, 200));

    // Always return 200 OK to avoid any redirects
    const response = NextResponse.json({
      received: true,
      requestId,
      timestamp,
      method: request.method,
      url: request.url,
      bodyLength: body.length,
      headers: Object.fromEntries(request.headers.entries()),
    });

    console.log(`[${requestId}] Responding with 200 OK`);
    console.log(`=== WEBHOOK DEBUG [${requestId}] END ===`);

    return response;
  } catch (error) {
    console.error(`[${requestId}] Error in debug webhook:`, error);

    return NextResponse.json({
      error: 'Debug webhook error',
      requestId,
      timestamp,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Debug webhook endpoint is live',
    timestamp: new Date().toISOString(),
    purpose: 'Captures webhook requests for debugging'
  });
}