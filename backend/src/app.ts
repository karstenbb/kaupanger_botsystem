import express from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import prisma from './services/prisma';

const app = express();

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Tillat requests utan origin (curl, mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
      : [];
    
    // Tillat alle viss inga CORS_ORIGIN er sett, eller viss origin er i lista
    if (allowedOrigins.length === 0 || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    return callback(new Error('Ikkje tillate av CORS'));
  },
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Health check — pingar DB for å halde tilkoplinga varm
app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected', timestamp: new Date().toISOString() });
  }
});

// API routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

export default app;
