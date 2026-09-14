import { Router, Request, Response } from 'express';
import { SettingsModel } from '../models/Settings';
import { TradeModel } from '../models/Trade';
import { DailyReviewModel } from '../models/DailyReview';

const router = Router();

// GET settings
router.get('/', async (_req: Request, res: Response) => {
  try {
    let settings = await SettingsModel.findOne({ key: 'global_settings' });
    if (!settings) {
      settings = await SettingsModel.create({ key: 'global_settings' });
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

// PUT update settings
router.put('/', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    let settings = await SettingsModel.findOne({ key: 'global_settings' });
    if (!settings) {
      settings = new SettingsModel({ key: 'global_settings' });
    }

    settings.startingBalance = data.startingBalance;
    settings.defaultAmount = data.defaultAmount;
    settings.defaultPayout = data.defaultPayout;
    settings.dailyTradeLimit = data.dailyTradeLimit;
    settings.planDurationDays = data.planDurationDays;
    settings.currencySymbol = data.currencySymbol;

    await settings.save();
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// POST reset all data
router.post('/reset', async (_req: Request, res: Response) => {
  try {
    await TradeModel.deleteMany({});
    await DailyReviewModel.deleteMany({});
    await SettingsModel.deleteMany({});
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset database' });
  }
});

export default router;
