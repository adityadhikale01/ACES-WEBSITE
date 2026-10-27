import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB, getDBStatus } from './config/db.js';
import { seedDatabase } from './seed/seedData.js';
import { getStorageStatus } from './services/storageService.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import registrationRoutes from './routes/registrationRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import designationRoutes from './routes/designationRoutes.js';
import membershipRoutes from './routes/membershipRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware
const allowedOrigins = [
  CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || origin.endsWith('.netlify.app')) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve public uploads safely
app.use('/uploads/public', express.static(path.join(process.cwd(), 'uploads', 'public')));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: getDBStatus(),
    storage: getStorageStatus(),
  });
});

app.get('/api/v1/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'ACES KBTCOE Backend API',
    version: '1.1.0',
    database: getDBStatus(),
    storage: getStorageStatus(),
  });
});

// Mount versioned API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/registrations', registrationRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/designations', designationRoutes);
app.use('/api/v1/applications', membershipRoutes);
app.use('/api/v1/team', teamRoutes);
app.use('/api/v1/activities', activityRoutes);
app.use('/api/v1/gallery', galleryRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/content', contentRoutes);
app.use('/api/v1/admin', adminRoutes);

// 404 handler for unmatched routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} not found on this server.`,
  });
});

// Centralized error handling
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Server Error]', err);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'An unexpected server error occurred.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start Server & Connect Database
const startServer = async () => {
  const dbConnected = await connectDB();
  if (dbConnected) {
    try {
      await seedDatabase();
    } catch (err: any) {
      console.warn('[Seed Warning]', err.message);
    }
  }

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 ACES KBTCOE API Server running on port ${PORT}`);
    console.log(`📡 URL: http://localhost:${PORT}/api/v1`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
    console.log(`💾 Database Status: ${getDBStatus().state}`);
    console.log(`☁️ Cloudinary Status: ${getStorageStatus().cloudinary ? 'Active' : 'Local Fallback'}`);
    console.log(`====================================================`);
  });
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export { app, startServer };
export default app;
