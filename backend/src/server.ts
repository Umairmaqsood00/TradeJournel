import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import tradesRouter from './routes/trades';
import reviewsRouter from './routes/reviews';
import settingsRouter from './routes/settings';
import { TradeModel } from './models/Trade';
import { SettingsModel } from './models/Settings';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://umairmaqsood00:Horse.com1234@cluster.akfvxvp.mongodb.net/trade_journal?retryWrites=true&w=majority&appName=Cluster';

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/trades', tradesRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/settings', settingsRouter);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

async function seedDatabaseIfEmpty() {
  try {
    const count = await TradeModel.countDocuments();
    if (count === 0) {
      const sampleTrades = [
        {
          tradeId: 'tr-1',
          date: '2026-09-11',
          time: '09:15',
          pair: 'EUR/USD',
          direction: 'CALL',
          amount: 3.00,
          payout: 90,
          result: 'WIN',
          profit: 2.70,
          strategy: 'Key Resistance Breakout',
          notes: 'Clean bounce off 15m support level with strong momentum.',
          emotion: 'Calm',
          followedPlan: true,
          createdAt: Date.now() - 400000000,
        },
        {
          tradeId: 'tr-2',
          date: '2026-09-11',
          time: '10:30',
          pair: 'EUR/USD',
          direction: 'PUT',
          amount: 3.00,
          payout: 90,
          result: 'WIN',
          profit: 2.70,
          strategy: 'Double Top Rejection',
          notes: 'Waited for resistance rejection confirmation.',
          emotion: 'Confident',
          followedPlan: true,
          createdAt: Date.now() - 395000000,
        },
        {
          tradeId: 'tr-3',
          date: '2026-09-11',
          time: '11:45',
          pair: 'GBP/JPY',
          direction: 'CALL',
          amount: 3.00,
          payout: 90,
          result: 'LOSS',
          profit: -3.00,
          strategy: 'Trend Continuation',
          notes: 'Fakeout pull back below key level. Stopped out.',
          emotion: 'Calm',
          followedPlan: true,
          createdAt: Date.now() - 390000000,
        },
        {
          tradeId: 'tr-4',
          date: '2026-09-12',
          time: '14:10',
          pair: 'AUD/USD',
          direction: 'CALL',
          amount: 3.00,
          payout: 90,
          result: 'WIN',
          profit: 2.70,
          strategy: 'EMA Crossover',
          notes: 'Smooth uptrend ride after London session opening.',
          emotion: 'Calm',
          followedPlan: true,
          createdAt: Date.now() - 300000000,
        },
        {
          tradeId: 'tr-5',
          date: '2026-09-12',
          time: '15:20',
          pair: 'EUR/USD',
          direction: 'PUT',
          amount: 3.00,
          payout: 90,
          result: 'WIN',
          profit: 2.70,
          strategy: 'Supply Zone Rejection',
          notes: 'Clear rejection wick on 5m chart.',
          emotion: 'Confident',
          followedPlan: true,
          createdAt: Date.now() - 295000000,
        },
        {
          tradeId: 'tr-6',
          date: '2026-09-12',
          time: '16:45',
          pair: 'USD/JPY',
          direction: 'CALL',
          amount: 3.00,
          payout: 90,
          result: 'WIN',
          profit: 2.70,
          strategy: 'Support Bounce',
          notes: 'Third touch of lower trendline channel.',
          emotion: 'Calm',
          followedPlan: true,
          createdAt: Date.now() - 290000000,
        },
      ];

      await TradeModel.insertMany(sampleTrades);
      console.log('Seeded MongoDB Atlas with initial sample trades!');
    }

    const settingsCount = await SettingsModel.countDocuments();
    if (settingsCount === 0) {
      await SettingsModel.create({ key: 'global_settings' });
    }
  } catch (err) {
    console.error('Error seeding database:', err);
  }
}

async function startServer() {
  console.log('Connecting to MongoDB Atlas Cluster...');
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('Successfully connected to MongoDB Atlas Cloud Database!');
    await seedDatabaseIfEmpty();
  } catch (err) {
    console.error('Failed to connect to MongoDB Atlas:', err);
  }

  app.listen(PORT, () => {
    console.log(`Express API Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
