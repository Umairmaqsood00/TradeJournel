import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  userId: mongoose.Types.ObjectId;
  startingBalance: number;
  defaultAmount: number;
  defaultPayout: number;
  dailyTradeLimit: number;
  planDurationDays: number;
  currencySymbol: string;
}

const SettingsSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    startingBalance: { type: Number, default: 150.40 },
    defaultAmount: { type: Number, default: 3.00 },
    defaultPayout: { type: Number, default: 90 },
    dailyTradeLimit: { type: Number, default: 3 },
    planDurationDays: { type: Number, default: 10 },
    currencySymbol: { type: String, default: '$' },
  },
  { timestamps: true }
);

export const SettingsModel = mongoose.model<ISettings>('Settings', SettingsSchema);
