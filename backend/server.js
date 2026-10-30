import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';
import { verifyEmailService } from './utils/emailService.js';

import authRoutes from './features/auth/authRoutes.js';
import eventRoutes from './features/events/eventRoutes.js';
import registrationRoutes from './features/registrations/registrationRoutes.js';
import paymentRoutes from './features/payments/paymentRoutes.js';
import teamRoutes from './features/team/teamRoutes.js';
import designationRoutes from './features/team/designationRoutes.js';
import galleryRoutes from './features/gallery/galleryRoutes.js';
import activityRoutes from './features/activities/activityRoutes.js';
import membershipRoutes from './features/membership/membershipRoutes.js';
import contactRoutes from './features/contact/contactRoutes.js';
import contentRoutes from './features/content/contentRoutes.js';
import adminRoutes from './features/admin/adminRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS & Cookie Parser
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Static folders
const rootUploadsPath = path.resolve(__dirname, '../uploads');
const backendUploadsPath = path.resolve(__dirname, 'uploads');
const assetsPath = path.resolve(__dirname, '../assets');

[
  rootUploadsPath,
  backendUploadsPath,
  path.join(rootUploadsPath, 'public/branding'),
  path.join(rootUploadsPath, 'public/team'),
  path.join(rootUploadsPath, 'public/media'),
  path.join(backendUploadsPath, 'public/branding'),
  path.join(backendUploadsPath, 'public/team'),
  path.join(backendUploadsPath, 'public/media'),
].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

app.use('/uploads', express.static(rootUploadsPath));
app.use('/uploads', express.static(backendUploadsPath));
app.use('/assets', express.static(assetsPath));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'ACES KBTCOE Backend API',
    version: '1.0.0',
  });
});

// Mount Feature API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/registrations', registrationRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/team', teamRoutes);
app.use('/api/v1/designations', designationRoutes);
app.use('/api/v1/gallery', galleryRoutes);
app.use('/api/v1/activities', activityRoutes);
app.use('/api/v1/applications', membershipRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/content', contentRoutes);
app.use('/api/v1/admin', adminRoutes);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

export const startServer = async () => {
  try {
    await connectDB();
    await verifyEmailService();
    const server = app.listen(PORT, () => {
      console.log(`[ACES Server] Running on http://localhost:${PORT}`);
    });
    return server;
  } catch (err) {
    console.error('Failed to start server:', err);
  }
};

if (process.env.NODE_ENV !== 'test' && !process.argv[1]?.includes('test')) {
  startServer();
}

export default app;
