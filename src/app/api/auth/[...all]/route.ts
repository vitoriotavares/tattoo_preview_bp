import { NextRequest, NextResponse } from "next/server"
import { toNextJsHandler } from "better-auth/next-js"

// Lazy load auth to catch initialization errors
let authHandler: ReturnType<typeof toNextJsHandler> | null = null

async function getAuthHandler() {
  if (authHandler) return authHandler

  try {
    console.log('[AUTH] Loading auth configuration...')
    const { auth } = await import("@/lib/auth")
    authHandler = toNextJsHandler(auth)
    console.log('[AUTH] Auth handler created successfully')
    return authHandler
  } catch (error) {
    console.error('[AUTH] Failed to create auth handler:', error)
    throw error
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('[AUTH] GET request:', request.url)
    const handler = await getAuthHandler()
    return await handler.GET(request)
  } catch (error) {
    console.error('[AUTH] GET Error:', error)
    
    // More detailed error response
    const errorMessage = error instanceof Error ? error.message : 'Unknown authentication error'
    
    return NextResponse.json(
      { 
        error: 'Authentication service unavailable',
        details: errorMessage,
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[AUTH] POST request:', request.url)
    const handler = await getAuthHandler()
    return await handler.POST(request)
  } catch (error) {
    console.error('[AUTH] POST Error:', error)
    
    // More detailed error response
    const errorMessage = error instanceof Error ? error.message : 'Unknown authentication error'
    
    return NextResponse.json(
      { 
        error: 'Authentication service unavailable',
        details: errorMessage,
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}