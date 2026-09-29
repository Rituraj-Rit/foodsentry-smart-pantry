import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectDatabase } from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import pantryRoutes from './routes/pantryRoutes.js';
import recipeRoutes from './routes/recipeRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { initializeExpiryReminderJob } from './jobs/expiryReminderJob.js';

const app = express();
const PORT = process.env.PORT || 5000;
const clientOrigin = new URL(process.env.CLIENT_URL || 'http://localhost:5173').origin;

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: clientOrigin }));
app.use(express.json({ limit: '32kb' }));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-8', legacyHeaders: false }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false }));
app.use('/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false }));
app.use(['/pantry', '/recipes', '/ai', '/notifications'], rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-8', legacyHeaders: false }));

app.get('/api/health', (req, res) => res.json({ success: true, data: { status: 'ok' } }));
app.get('/health', (req, res) => res.json({ status: 'ok', message: 'FoodSentry API is healthy' }));
app.get('/', (req, res) => res.json({ success: true, message: 'FoodSentry API is running' }));
app.use('/auth', authRoutes);
app.use('/pantry', pantryRoutes);
app.use('/recipes', recipeRoutes);
app.use('/ai', aiRoutes);
app.use('/notifications', notificationRoutes);

// Keep the original /api-prefixed routes working for existing local clients.
app.use('/api/auth', authRoutes);
app.use('/api/pantry', pantryRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use(notFound);
app.use(errorHandler);

connectDatabase().then(() => {
  initializeExpiryReminderJob();
  app.listen(PORT, '0.0.0.0', () => console.log(`FoodSentry server running on port ${PORT}`));
}).catch((error) => {
  process.stderr.write(`Database connection failed: ${error.message}\n`);
  process.exitCode = 1;
});
