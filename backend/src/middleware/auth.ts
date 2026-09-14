import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';

export const JWT_SECRET = process.env.JWT_SECRET || 'trade_journal_super_secret_key_2026';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userRole?: 'user' | 'admin';
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Access token missing or invalid' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Token expired or invalid' });
  }
}

export async function adminMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const user = await UserModel.findById(req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin privilege required' });
    }
    req.userRole = user.role;
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Failed to verify admin status' });
  }
}
