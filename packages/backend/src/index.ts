import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { errorHandler } from './middleware/errorHandler';

// Import routes (will be created next)
import { authRoutes } from './routes/auth';
import { productRoutes } from './routes/products';
import { cartRoutes } from './routes/cart';
import { orderRoutes } from './routes/orders';
import { paymentRoutes } from './routes/payments';

const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const app = new Elysia()
  // CORS configuration
  .use(
    cors({
      origin: FRONTEND_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  )
  
  // Global error handler
  .onError(errorHandler)

  // Health check endpoint
  .get('/', () => ({
    message: 'E-commerce API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  }))

  .get('/health', () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }))

  // API routes
  .group('/api', (app) =>
    app
      .use(authRoutes)
      .use(productRoutes)
      .use(cartRoutes)
      .use(orderRoutes)
      .use(paymentRoutes)
  )

  // Start server
  .listen(PORT);

console.log(`🚀 Server is running at http://localhost:${PORT}`);

export default app;
export type App = typeof app;
