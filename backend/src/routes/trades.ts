import { Router, Request, Response } from 'express';
import { TradeModel } from '../models/Trade';

const router = Router();

// GET all trades
router.get('/', async (_req: Request, res: Response) => {
  try {
    const trades = await TradeModel.find().sort({ createdAt: -1 });
    const formatted = trades.map((t) => ({
      id: t.tradeId,
      date: t.date,
      time: t.time,
      pair: t.pair,
      direction: t.direction,
      amount: t.amount,
      payout: t.payout,
      result: t.result,
      profit: t.profit,
      strategy: t.strategy,
      notes: t.notes,
      screenshotUrl: t.screenshotUrl,
      emotion: t.emotion,
      followedPlan: t.followedPlan,
      createdAt: t.createdAt,
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trades' });
  }
});

// POST new trade or update existing
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const existing = await TradeModel.findOne({ tradeId: data.id });
    if (existing) {
      existing.date = data.date;
      existing.time = data.time;
      existing.pair = data.pair;
      existing.direction = data.direction;
      existing.amount = data.amount;
      existing.payout = data.payout;
      existing.result = data.result;
      existing.profit = data.profit;
      existing.strategy = data.strategy;
      existing.notes = data.notes;
      existing.screenshotUrl = data.screenshotUrl;
      existing.emotion = data.emotion;
      existing.followedPlan = data.followedPlan;
      await existing.save();
      return res.json({ success: true, trade: existing });
    }

    const newTrade = new TradeModel({
      tradeId: data.id || `tr-${Date.now()}`,
      date: data.date,
      time: data.time,
      pair: data.pair,
      direction: data.direction,
      amount: data.amount,
      payout: data.payout,
      result: data.result,
      profit: data.profit,
      strategy: data.strategy || '',
      notes: data.notes || '',
      screenshotUrl: data.screenshotUrl || '',
      emotion: data.emotion || 'Calm',
      followedPlan: data.followedPlan ?? true,
      createdAt: data.createdAt || Date.now(),
    });

    await newTrade.save();
    res.status(201).json({ success: true, trade: newTrade });
  } catch (error) {
    console.error('Error saving trade:', error);
    res.status(500).json({ error: 'Failed to save trade' });
  }
});

// DELETE trade by id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await TradeModel.deleteOne({ tradeId: id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete trade' });
  }
});

export default router;
