import { Router, Response } from 'express';
import { UserModel } from '../models/User';
import { TradeModel } from '../models/Trade';
import { DailyReviewModel } from '../models/DailyReview';
import { SettingsModel } from '../models/Settings';
import { authMiddleware, adminMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);
router.use(adminMiddleware);

// GET /api/admin/users - Get all users with performance stats
router.get('/users', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await UserModel.find().select('-password').sort({ createdAt: -1 });

    const userStatsPromises = users.map(async (u) => {
      const trades = await TradeModel.find({ userId: u._id });
      const totalTrades = trades.length;
      const wins = trades.filter((t) => t.result === 'WIN').length;
      const losses = trades.filter((t) => t.result === 'LOSS').length;
      const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0;
      const netPL = Math.round(trades.reduce((sum, t) => sum + (t.profit || 0), 0) * 100) / 100;

      return {
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        role: u.role || 'user',
        createdAt: u.createdAt,
        stats: {
          totalTrades,
          wins,
          losses,
          winRate,
          netPL,
        },
      };
    });

    const result = await Promise.all(userStatsPromises);
    res.json(result);
  } catch (err: any) {
    console.error('Error fetching admin users:', err);
    res.status(500).json({ error: 'Failed to fetch user list' });
  }
});

// DELETE /api/admin/users/:userId - Dismiss/Delete user account and purge data
router.delete('/users/:userId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;

    if (userId === req.userId) {
      return res.status(400).json({ error: 'Admin cannot delete their own account from Admin Desk' });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete user and associated records
    await UserModel.deleteOne({ _id: userId });
    await TradeModel.deleteMany({ userId });
    await DailyReviewModel.deleteMany({ userId });
    await SettingsModel.deleteMany({ userId });

    res.json({ success: true, message: `User ${user.email} and all associated data deleted successfully.` });
  } catch (err: any) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Failed to delete user account' });
  }
});

export default router;
