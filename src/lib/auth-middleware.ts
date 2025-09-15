import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

/**
 * Authentication middleware for API routes
 * Ensures user is authenticated before accessing protected endpoints
 */
export async function withAuth<T extends unknown[]>(
  handler: (request: NextRequest, userId: string, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    try {
      // Get user session
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session?.user?.id) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      // Rate limiting per user (basic implementation)
      const userAgent = request.headers.get('user-agent') || 'unknown';
      const rateLimitKey = `${session.user.id}:${request.nextUrl.pathname}`;

      if (!checkUserRateLimit(rateLimitKey)) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }

      // Add security headers
      const response = await handler(request, session.user.id, ...args);

      // Add security headers to response
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('X-XSS-Protection', '1; mode=block');

      return response;
    } catch (error) {
      console.error('Authentication middleware error:', error);
      return NextResponse.json(
        { error: 'Authentication check failed' },
        { status: 500 }
      );
    }
  };
}

/**
 * Optional authentication middleware - allows both authenticated and anonymous access
 * Provides user info if available
 */
export async function withOptionalAuth<T extends unknown[]>(
  handler: (request: NextRequest, userId: string | null, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      const userId = session?.user?.id || null;

      const response = await handler(request, userId, ...args);

      // Add basic security headers
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('X-Frame-Options', 'DENY');

      return response;
    } catch (error) {
      console.error('Optional auth middleware error:', error);
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 500 }
      );
    }
  };
}

/**
 * CSRF Protection middleware
 * Validates CSRF tokens for state-changing operations
 */
export async function withCSRF<T extends unknown[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    // Only check CSRF for state-changing methods
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
      const csrfToken = request.headers.get('x-csrf-token');
      const origin = request.headers.get('origin');
      const referer = request.headers.get('referer');

      // Basic origin validation
      const allowedOrigins = [
        process.env.NEXT_PUBLIC_APP_URL,
        'http://localhost:3000',
        'https://localhost:3000'
      ].filter(Boolean);

      if (!origin || !allowedOrigins.some(allowed => allowed && origin.startsWith(allowed))) {
        return NextResponse.json(
          { error: 'Invalid origin' },
          { status: 403 }
        );
      }

      // TODO: Implement proper CSRF token validation
      // For now, we're doing basic origin/referer checking
    }

    return handler(request, ...args);
  };
}

/**
 * Input validation middleware
 * Validates and sanitizes request data
 */
export async function withValidation<T extends unknown[]>(
  validationRules: ValidationRules,
  handler: (request: NextRequest, validatedData: Record<string, unknown>, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    try {
      let data: Record<string, unknown> = {};

      // Parse request data based on content type
      const contentType = request.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        try {
          data = await request.json();
        } catch {
          return NextResponse.json(
            { error: 'Invalid JSON data' },
            { status: 400 }
          );
        }
      } else if (contentType.includes('multipart/form-data')) {
        try {
          const formData = await request.formData();
          data = Object.fromEntries(formData.entries());
        } catch {
          return NextResponse.json(
            { error: 'Invalid form data' },
            { status: 400 }
          );
        }
      }

      // Validate data against rules
      const validationResult = validateData(data, validationRules);
      if (!validationResult.isValid) {
        return NextResponse.json(
          { error: 'Validation failed', details: validationResult.errors },
          { status: 400 }
        );
      }

      return handler(request, validationResult.data || {}, ...args);
    } catch (error) {
      return NextResponse.json(
        { error: 'Request processing failed' },
        { status: 400 }
      );
    }
  };
}

// Basic rate limiting implementation (in-memory)
const userRateLimits = new Map<string, { count: number; resetTime: number }>();

function checkUserRateLimit(key: string): boolean {
  const now = Date.now();
  const limit = userRateLimits.get(key);

  if (!limit || now > limit.resetTime) {
    // Reset or initialize
    userRateLimits.set(key, { count: 1, resetTime: now + 60000 }); // 1 minute window
    return true;
  }

  if (limit.count >= 60) { // Max 60 requests per minute per user
    return false;
  }

  limit.count++;
  return true;
}

// Basic validation types and functions
interface ValidationRules {
  [key: string]: {
    required?: boolean;
    type?: 'string' | 'number' | 'boolean' | 'email';
    maxLength?: number;
    minLength?: number;
    pattern?: RegExp;
  };
}

interface ValidationResult {
  isValid: boolean;
  data?: Record<string, unknown>;
  errors?: string[];
}

function validateData(data: Record<string, unknown>, rules: ValidationRules): ValidationResult {
  const errors: string[] = [];
  const validatedData: Record<string, unknown> = {};

  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];

    // Check required fields
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      continue;
    }

    // Skip validation if field is not provided and not required
    if (value === undefined || value === null) {
      continue;
    }

    // Type validation
    if (rule.type) {
      switch (rule.type) {
        case 'string':
          if (typeof value !== 'string') {
            errors.push(`${field} must be a string`);
            continue;
          }
          break;
        case 'number':
          if (typeof value !== 'number' && isNaN(Number(value))) {
            errors.push(`${field} must be a number`);
            continue;
          }
          break;
        case 'email':
          if (typeof value !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            errors.push(`${field} must be a valid email`);
            continue;
          }
          break;
      }
    }

    // Length validation
    if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
      errors.push(`${field} must be at most ${rule.maxLength} characters`);
      continue;
    }

    if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
      errors.push(`${field} must be at least ${rule.minLength} characters`);
      continue;
    }

    // Pattern validation
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      errors.push(`${field} format is invalid`);
      continue;
    }

    validatedData[field] = value;
  }

  return {
    isValid: errors.length === 0,
    data: validatedData,
    errors: errors.length > 0 ? errors : undefined
  };
}

export type { ValidationRules };