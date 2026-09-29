import Notification from '../models/Notification.js';
import PantryItem from '../models/PantryItem.js';
import User from '../models/User.js';
import { sendExpiryReminderEmail } from './emailService.js';

export const EXPIRY_REMINDER_TYPE = 'expiry_2_days';
export const DEFAULT_APP_TIMEZONE = 'Asia/Kolkata';
const REMINDER_DAYS = 2;
const CLAIM_TIMEOUT_MS = 15 * 60 * 1000;

export function getCalendarDateInTimezone(value = new Date(), timeZone = DEFAULT_APP_TIMEZONE) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(value);
  const values = Object.fromEntries(parts.map(({ type, value: part }) => [type, part]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function addCalendarDays(dateString, dayCount) {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + dayCount);
  return date.toISOString().slice(0, 10);
}

export function getUtcCalendarRange(dateString) {
  const start = new Date(`${dateString}T00:00:00.000Z`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

function getExpiryScheduledFor(dateString) {
  return getUtcCalendarRange(dateString).start;
}

async function claimNotification(userId, items, expiryDate) {
  const scheduledFor = getExpiryScheduledFor(expiryDate);
  const key = { userId, type: EXPIRY_REMINDER_TYPE, scheduledFor };
  try {
    await Notification.updateOne(key, {
      $setOnInsert: {
        ...key,
        pantryItemIds: items.map((item) => item._id),
        status: 'pending',
      },
    }, { upsert: true, setDefaultsOnInsert: true });
  } catch (error) {
    if (error.code !== 11000) throw error;
  }

  const staleSendingBefore = new Date(Date.now() - CLAIM_TIMEOUT_MS);
  return Notification.findOneAndUpdate({
    ...key,
    $or: [
      { status: 'pending' },
      { status: 'failed' },
      { status: 'sending', updatedAt: { $lt: staleSendingBefore } },
    ],
  }, {
    $set: {
      status: 'sending',
      pantryItemIds: items.map((item) => item._id),
      lastErrorCode: null,
    },
  }, { new: true });
}

async function sendUserExpiryReminder(user, items, expiryDate, sendEmail, daysRemaining = REMINDER_DAYS) {
  const scheduledFor = getExpiryScheduledFor(expiryDate);
  const existing = await Notification.findOne({
    userId: user._id, type: EXPIRY_REMINDER_TYPE, scheduledFor,
  }).select('status');
  if (existing?.status === 'sent') return 'skipped';

  const notification = await claimNotification(user._id, items, expiryDate);
  if (!notification) return 'skipped';

  try {
    await sendEmail(user.email, user.name, items, { daysRemaining });
    await Notification.updateOne({ _id: notification._id, status: 'sending' }, {
      $set: { status: 'sent', sentAt: new Date(), lastErrorCode: null },
    });
    return 'sent';
  } catch (error) {
    const errorCode = typeof error.code === 'string' ? error.code.slice(0, 80) : 'SMTP_ERROR';
    await Notification.updateOne({ _id: notification._id, status: 'sending' }, {
      $set: { status: 'failed', lastErrorCode: errorCode },
    });
    process.stderr.write(`Expiry reminder delivery failed for user ${user._id} (${errorCode}).\n`);
    return 'failed';
  }
}

async function retryFailedNotifications({ today, targetExpiryDate, sendEmail, result }) {
  const todayStart = getUtcCalendarRange(today).start;
  const targetStart = getUtcCalendarRange(targetExpiryDate).start;
  const failed = await Notification.find({
    type: EXPIRY_REMINDER_TYPE,
    status: 'failed',
    scheduledFor: { $gte: todayStart, $lt: targetStart },
  });

  for (const notification of failed) {
    const expiryDate = notification.scheduledFor.toISOString().slice(0, 10);
    const { start, end } = getUtcCalendarRange(expiryDate);
    const user = await User.findOne({
      _id: notification.userId,
      emailNotificationsEnabled: { $ne: false },
    }).select('name email');
    if (!user) {
      result.skipped += 1;
      continue;
    }
    const items = await PantryItem.find({
      _id: { $in: notification.pantryItemIds },
      userId: user._id,
      expiryDate: { $gte: start, $lt: end },
    }).select('_id userId name quantity unit expiryDate');
    if (!items.length) {
      result.skipped += 1;
      continue;
    }
    const daysRemaining = Math.max(0, (Date.parse(expiryDate) - Date.parse(today)) / 86400000);
    const status = await sendUserExpiryReminder(user, items, expiryDate, sendEmail, daysRemaining);
    result[status] += 1;
  }
}

export async function runExpiryReminderCheck({
  now = new Date(),
  timeZone = process.env.APP_TIMEZONE || DEFAULT_APP_TIMEZONE,
  sendEmail = sendExpiryReminderEmail,
} = {}) {
  const today = getCalendarDateInTimezone(now, timeZone);
  const expiryDate = addCalendarDays(today, REMINDER_DAYS);
  const { start, end } = getUtcCalendarRange(expiryDate);
  const result = { expiryDate, users: 0, items: 0, sent: 0, skipped: 0, failed: 0 };
  await retryFailedNotifications({ today, targetExpiryDate: expiryDate, sendEmail, result });
  const dueItems = await PantryItem.find({ expiryDate: { $gte: start, $lt: end } })
    .select('_id userId name quantity unit expiryDate');
  const grouped = new Map();
  for (const item of dueItems) {
    const userId = item.userId.toString();
    if (!grouped.has(userId)) grouped.set(userId, []);
    grouped.get(userId).push(item);
  }
  if (grouped.size === 0) return result;

  const users = await User.find({
    _id: { $in: [...grouped.keys()] },
    emailNotificationsEnabled: { $ne: false },
    emailNotificationConsentGiven: true,
  }).select('name email');
  result.users = grouped.size;
  result.items = dueItems.length;
  for (const user of users) {
    const status = await sendUserExpiryReminder(user, grouped.get(user.id.toString()), expiryDate, sendEmail);
    result[status] += 1;
  }
  result.skipped += grouped.size - users.length;
  return result;
}

export async function sendTestExpiryReminder(user, items) {
  if (user.emailNotificationsEnabled === false || user.emailNotificationConsentGiven !== true) {
    const error = new Error('Email expiry notifications are disabled in your profile.');
    error.status = 409;
    throw error;
  }
  return sendExpiryReminderEmail(user.email, user.name, items);
}
