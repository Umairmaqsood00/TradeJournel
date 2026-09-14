import mongoose, { Schema, Document } from 'mongoose';

export interface IDailyReview extends Document {
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
    date: { type: String, required: true, unique: true },
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

export const DailyReviewModel = mongoose.model<IDailyReview>('DailyReview', DailyReviewSchema);
