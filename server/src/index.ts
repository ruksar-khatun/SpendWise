import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import transactionRoutes from './routes/transaction.routes.js';
import budgetRoutes from './routes/budget.routes.js';
import goalRoutes from './routes/goal.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import { errorHandler } from './middleware/error.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server, mobile app, or matched frontend origin
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(null, true); // Permissive in deployment to prevent CORS blockers
    }
  },
  credentials: true,
}));
app.use(express.json());

app.get('/api/health', (_req, res) => { res.json({ status: 'ok', service: 'SpendWise Full-Stack API', timestamp: new Date().toISOString() }); });

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);

app.use(errorHandler);
app.use((_req, res) => { res.status(404).json({ error: 'Endpoint not found' }); });

app.listen(PORT, () => {
  console.log(`🚀 SpendWise Server is running at http://localhost:${PORT}`);
  console.log(`📡 Health check available at http://localhost:${PORT}/api/health`);
});
export default app;