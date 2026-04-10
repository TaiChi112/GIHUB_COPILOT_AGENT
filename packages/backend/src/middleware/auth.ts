import type { Context } from 'elysia';
import { verifyAccessToken } from '../utils/jwt';
import type { JWTPayload } from '@shared/*';

export interface AuthContext {
  user: JWTPayload | null;
}

/**
 * Authentication middleware - verifies JWT token
 * Attaches user payload to context if valid
 */
export async function authMiddleware(context: Context): Promise<AuthContext> {
  const authHeader = context.request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null };
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  try {
    const payload = await verifyAccessToken(token);
    return { user: payload };
  } catch (error) {
    return { user: null };
  }
}

/**
 * Require authentication - throws error if not authenticated
 */
export function requireAuth(context: AuthContext): asserts context is AuthContext & { user: JWTPayload } {
  if (!context.user) {
    throw new Error('Unauthorized');
  }
}

/**
 * Require admin role - throws error if not admin
 */
export function requireAdmin(context: AuthContext): asserts context is AuthContext & { user: JWTPayload } {
  requireAuth(context);
  if (context.user.role !== 'admin') {
    throw new Error('Forbidden');
  }
}
