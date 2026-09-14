import mongoose, { Schema, Document } from 'mongoose';

export interface IDailyReview extends Document {
  userId: mongoose.Types.ObjectId;
  date: string;
  whatWentWell: string;
  whatWentWrong: string;
  improvements: string;
  mindset: string;
  overtraded: boolean;
  revengeTraded: boolean;
  usedMartingale: boolean;
  brokeLimit: boolean;
}

const DailyReviewSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: String, required: true },
    whatWentWell: { type: String, default: '' },
    whatWentWrong: { type: String, default: '' },
    improvements: { type: String, default: '' },
    mindset: { type: String, default: '' },
    overtraded: { type: Boolean, default: false },
    revengeTraded: { type: Boolean, default: false },
    usedMartingale: { type: Boolean, default: false },
    brokeLimit: { type: Boolean, default: false },
  },
  { timestamps: true }
);

DailyReviewSchema.index({ userId: 1, date: 1 }, { unique: true });

export const DailyReviewModel = mongoose.model<IDailyReview>('DailyReview', DailyReviewSchema);
