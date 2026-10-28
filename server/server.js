import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { connectDB } from './src/config/db.js';
import { globalLimiter } from './src/middleware/rateLimit.js';
import { errorHandler } from './src/middleware/error.js';

import authRoutes from './src/routes/auth.js';
import doctorsRoutes from './src/routes/doctors.js';
import appointmentsRoutes from './src/routes/appointments.js';
import paymentsRoutes from './src/routes/payments.js';
import prescriptionsRoutes from './src/routes/prescriptions.js';
import medicinesRoutes from './src/routes/medicines.js';
import ordersRoutes from './src/routes/orders.js';
import aiRoutes from './src/routes/ai.js';

const app = express();

// Security headers with relaxed cross-origin embedder policy for Jitsi & external assets
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(null, true); // Allow during development for testing convenience
      }
    },
    credentials: true,
  })
);

// Body parsers with 5MB limit for photo uploads
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Global rate limiter
app.use('/api', globalLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    platform: 'CareSync Telemedicine API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount modular API routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/prescriptions', prescriptionsRoutes);
app.use('/api/medicines', medicinesRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/ai', aiRoutes);

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve compiled client assets if dist exists (e.g. unified deployment on Render/Railway/Heroku)
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) next();
  });
});

// Central error handler
app.use(errorHandler);

import Doctor from './src/models/Doctor.js';
import { seedDatabase } from './src/scripts/seed.js';

const PORT = process.env.PORT || 5000;

// Connect to database, auto-seed if empty, and start HTTP server
connectDB()
  .then(async () => {
    // Check if database needs initial seeding
    const docCount = await Doctor.countDocuments();
    if (docCount === 0) {
      console.log('[CareSync Server] Database has 0 doctors. Running automatic initial seed...');
      await seedDatabase(false);
    }

    app.listen(PORT, () => {
      console.log(`[CareSync Server] Running on http://localhost:${PORT}`);
      console.log(`[CareSync Server] Health check: http://localhost:${PORT}/api/health`);
    });
  })
  .catch((err) => {
    console.error('[CareSync Server] Failed to initialize database:', err);
    process.exit(1);
  });

