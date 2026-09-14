import mongoose, { Schema, Document } from 'mongoose';

export interface ITrade extends Document {
  tradeId: string;
  date: string;
  time: string;
  pair: string;
  direction: 'CALL' | 'PUT';
  amount: number;
  payout: number;
  result: 'WIN' | 'LOSS';
  profit: number;
  strategy?: string;
  notes?: string;
  screenshotUrl?: string;
  emotion: string;
  followedPlan: boolean;
  createdAt: number;
}

const TradeSchema: Schema = new Schema(
  {
    tradeId: { type: String, required: true, unique: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    pair: { type: String, required: true, uppercase: true },
    direction: { type: String, enum: ['CALL', 'PUT'], required: true },
    amount: { type: Number, required: true },
    payout: { type: Number, required: true },
    result: { type: String, enum: ['WIN', 'LOSS'], required: true },
    profit: { type: Number, required: true },
    strategy: { type: String, default: '' },
    notes: { type: String, default: '' },
    screenshotUrl: { type: String, default: '' },
    emotion: { type: String, default: 'Calm' },
    followedPlan: { type: Boolean, default: true },
    createdAt: { type: Number, default: Date.now },
  },
  { timestamps: true }
);

export const TradeModel = mongoose.model<ITrade>('Trade', TradeSchema);
