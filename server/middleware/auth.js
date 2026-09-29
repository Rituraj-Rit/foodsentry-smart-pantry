import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function requireAuth(req, res, next) {
  try {
    const header = req.get('authorization') || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) return res.status(401).json({ success: false, message: 'Authentication required.' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select('name email');
    if (!user) return res.status(401).json({ success: false, message: 'Your session is no longer valid.' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Your session is invalid or expired.' });
  }
}
