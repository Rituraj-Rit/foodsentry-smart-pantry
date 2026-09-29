import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendSuccess } from '../utils/apiResponse.js';

function issueToken(userId) {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured.');
  return jwt.sign({}, process.env.JWT_SECRET, { subject: userId.toString(), expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}

function publicUser(user) {
  const consentGiven = user.emailNotificationConsentGiven === true;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailNotificationsEnabled: consentGiven && user.emailNotificationsEnabled !== false,
    emailNotificationConsentGiven: consentGiven,
  };
}

export async function register(req, res) {
  const name = req.body.name.trim();
  const email = req.body.email.trim().toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
  const password = await bcrypt.hash(req.body.password, 12);
  const user = await User.create({ name, email, password });
  return sendSuccess(res, { user: publicUser(user), token: issueToken(user.id) }, 201);
}

export async function login(req, res) {
  const email = req.body.email.trim().toLowerCase();
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return res.status(401).json({ success: false, message: 'Email or password is incorrect.' });
  }
  return sendSuccess(res, { user: publicUser(user), token: issueToken(user.id) });
}

export function currentUser(req, res) {
  return sendSuccess(res, { user: publicUser(req.user) });
}
