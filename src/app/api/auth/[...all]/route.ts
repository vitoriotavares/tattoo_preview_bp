import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"
import { NextRequest, NextResponse } from "next/server"

const authHandler = toNextJsHandler(auth)

export async function GET(request: NextRequest) {
  try {
    console.log('[AUTH] GET request:', request.url)
    return await authHandler.GET(request)
  } catch (error) {
    console.error('[AUTH] GET Error:', error)
    return NextResponse.json(
      { error: 'Authentication service error' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[AUTH] POST request:', request.url)
    return await authHandler.POST(request)
  } catch (error) {
    console.error('[AUTH] POST Error:', error)
    return NextResponse.json(
      { error: 'Authentication service error' }, 
      { status: 500 }
    )
  }
}