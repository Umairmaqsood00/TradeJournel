import { Router, Response } from 'express';
import { SettingsModel } from '../models/Settings';
import { TradeModel } from '../models/Trade';
import { DailyReviewModel } from '../models/DailyReview';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

// GET settings for authenticated user
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    let settings = await SettingsModel.findOne({ userId: req.userId });
    if (!settings) {
      settings = await SettingsModel.create({ userId: req.userId });
    }
    res.json({
      startingBalance: settings.startingBalance,
      defaultAmount: settings.defaultAmount,
      defaultPayout: settings.defaultPayout,
      dailyTradeLimit: settings.dailyTradeLimit,
      planDurationDays: settings.planDurationDays,
      currencySymbol: settings.currencySymbol,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT update settings for authenticated user
router.put('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = req.body;
    let settings = await SettingsModel.findOne({ userId: req.userId });
    if (!settings) {
      settings = new SettingsModel({ userId: req.userId });
    }

    if (data.startingBalance !== undefined) settings.startingBalance = data.startingBalance;
    if (data.defaultAmount !== undefined) settings.defaultAmount = data.defaultAmount;
    if (data.defaultPayout !== undefined) settings.defaultPayout = data.defaultPayout;
    if (data.dailyTradeLimit !== undefined) settings.dailyTradeLimit = data.dailyTradeLimit;
    if (data.planDurationDays !== undefined) settings.planDurationDays = data.planDurationDays;
    if (data.currencySymbol !== undefined) settings.currencySymbol = data.currencySymbol;

    await settings.save();
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// POST reset user data for authenticated user
router.post('/reset', async (req: AuthenticatedRequest, res: Response) => {
  try {
    await TradeModel.deleteMany({ userId: req.userId });
    await DailyReviewModel.deleteMany({ userId: req.userId });
    await SettingsModel.deleteMany({ userId: req.userId });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset database' });
  }
});

export default router;
