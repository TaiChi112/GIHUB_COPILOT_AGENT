import { Elysia, t } from 'elysia';
import { registerUser, loginUser, refreshAccessToken, logoutUser, getUserById } from '../services/authService';
import { authMiddleware, requireAuth } from '../middleware/auth';
import { RegisterDTOSchema, LoginDTOSchema } from '@shared/*';

export const authRoutes = new Elysia({ prefix: '/auth' })
  // Register endpoint
  .post(
    '/register',
    async ({ body }) => {
      const validatedData = RegisterDTOSchema.parse(body);
      const result = await registerUser(validatedData);
      return {
        message: 'Registration successful',
        ...result,
      };
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
        full_name: t.String(),
      }),
    }
  )

  // Login endpoint
  .post(
    '/login',
    async ({ body, cookie }) => {
      const validatedData = LoginDTOSchema.parse(body);
      const { authResponse, refreshToken } = await loginUser(validatedData);

      // Set refresh token as httpOnly cookie
      cookie.refreshToken.set({
        value: refreshToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });

      return authResponse;
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
    }
  )

  // Refresh token endpoint
  .post('/refresh', async ({ cookie }) => {
    const refreshToken = cookie.refreshToken.value;

    if (!refreshToken) {
      throw new Error('Refresh token not provided');
    }

    const { accessToken, newRefreshToken } = await refreshAccessToken(refreshToken);

    // Set new refresh token cookie
    cookie.refreshToken.set({
      value: newRefreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return { accessToken };
  })

  // Get current user endpoint
  .get('/me', async ({ request }) => {
    const authContext = await authMiddleware({ request } as any);
    requireAuth(authContext);

    const user = await getUserById(authContext.user.userId);
    return user;
  })

  // Logout endpoint
  .post('/logout', async ({ request, cookie }) => {
    const authContext = await authMiddleware({ request } as any);
    requireAuth(authContext);

    await logoutUser(authContext.user.userId);

    // Clear refresh token cookie
    cookie.refreshToken.remove();

    return { message: 'Logged out successfully' };
  });
