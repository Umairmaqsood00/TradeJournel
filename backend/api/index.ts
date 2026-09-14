import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import authRouter from '../src/routes/auth';
import tradesRouter from '../src/routes/trades';
import reviewsRouter from '../src/routes/reviews';
import settingsRouter from '../src/routes/settings';
import adminRouter from '../src/routes/admin';
import { UserModel } from '../src/models/User';
import { TradeModel } from '../src/models/Trade';
import { SettingsModel } from '../src/models/Settings';

dotenv.config();

const app = express();
const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://umairmaqsood00:Horse.com1234@cluster.akfvxvp.mongodb.net/trade_journal?retryWrites=true&w=majority&appName=Cluster';

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/trades', tradesRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/admin', adminRouter);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

let isConnected = false;

async function connectDb() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    isConnected = true;
    console.log('Connected to MongoDB Atlas on Vercel Serverless Function');
    await seedDatabaseIfEmpty();
  } catch (err) {
    console.error('Failed to connect to MongoDB Atlas:', err);
  }
}

async function seedDatabaseIfEmpty() {
  try {
    let defaultUser = await UserModel.findOne({ email: 'umair@tradejournal.com' });
    if (!defaultUser) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      defaultUser = await UserModel.create({
        name: 'Umair',
        email: 'umair@tradejournal.com',
        password: hashedPassword,
        role: 'admin',
        createdAt: Date.now(),
      });
      console.log('Seeded default admin user "Umair"');
    } else if (defaultUser.role !== 'admin') {
      defaultUser.role = 'admin';
      await defaultUser.save();
    }

    const userId = defaultUser._id;
    await TradeModel.updateMany({ userId: { $exists: false } }, { $set: { userId } });

    let userSettings = await SettingsModel.findOne({ userId });
    if (!userSettings) {
      await SettingsModel.create({ userId });
    }
  } catch (err) {
    console.error('Error seeding database on Vercel:', err);
  }
}

export default async function handler(req: any, res: any) {
  await connectDb();
  return app(req, res);
}
