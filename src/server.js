/**
 * Main Express Server
 * 
 * Initializes and runs the Express application
 */

import express from 'express';
import 'express-async-errors';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import { apiLimiter } from './middleware/rateLimit.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import clientRoutes from './routes/clients.js';
import invoiceRoutes from './routes/invoices.js';
import lineItemRoutes from './routes/lineItems.js';

// Load environment variables
dotenv.config();

const { PORT = 3000, NODE_ENV = 'development' } = process.env;

// Initialize Express app
const app = express();

// ===== MIDDLEWARE =====

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate limiting
app.use('/api/', apiLimiter);

// ===== REQUEST LOGGING (Development) =====
if (NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// ===== HEALTH CHECK =====
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV
  });
});

// ===== API ROUTES =====
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/invoices', lineItemRoutes);

// ===== ERROR HANDLING =====

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// ===== START SERVER =====
const startServer = () => {
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📝 Environment: ${NODE_ENV}`);
  });
};

if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}

export default app;
