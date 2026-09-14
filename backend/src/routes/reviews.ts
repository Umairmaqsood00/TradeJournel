import { Router, Response } from 'express';
import { DailyReviewModel } from '../models/DailyReview';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

// GET all daily reviews for authenticated user
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const reviews = await DailyReviewModel.find({ userId: req.userId });
    const formatted = reviews.map((r) => ({
      date: r.date,
      whatWentWell: r.whatWentWell,
      whatWentWrong: r.whatWentWrong,
      improvements: r.improvements,
      mindset: r.mindset,
      overtraded: r.overtraded,
      revengeTraded: r.revengeTraded,
      usedMartingale: r.usedMartingale,
      brokeLimit: r.brokeLimit,
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// POST save/update daily review for authenticated user
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = req.body;
    let review = await DailyReviewModel.findOne({ userId: req.userId, date: data.date });
    if (!review) {
      review = new DailyReviewModel({ userId: req.userId, date: data.date });
    }

    review.whatWentWell = data.whatWentWell || '';
    review.whatWentWrong = data.whatWentWrong || '';
    review.improvements = data.improvements || '';
    review.mindset = data.mindset || '';
    review.overtraded = Boolean(data.overtraded);
    review.revengeTraded = Boolean(data.revengeTraded);
    review.usedMartingale = Boolean(data.usedMartingale);
    review.brokeLimit = Boolean(data.brokeLimit);

    await review.save();
    res.json({ success: true, review });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save review' });
  }
});

export default router;
