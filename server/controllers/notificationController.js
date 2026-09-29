import User from '../models/User.js';
import PantryItem from '../models/PantryItem.js';
import { sendTestExpiryReminder } from '../services/expiryNotificationService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export function getPreferences(req, res) {
  return sendSuccess(res, {
    emailNotificationsEnabled: req.user.emailNotificationConsentGiven === true && req.user.emailNotificationsEnabled !== false,
    emailNotificationConsentGiven: req.user.emailNotificationConsentGiven === true,
  });
}

export async function updatePreferences(req, res) {
  const user = await User.findByIdAndUpdate(req.user.id, {
    $set: {
      emailNotificationsEnabled: req.body.emailNotificationsEnabled,
      emailNotificationConsentGiven: true,
    },
  }, { new: true, runValidators: true }).select('emailNotificationsEnabled emailNotificationConsentGiven');
  if (!user) return res.status(404).json({ success: false, message: 'User account not found.' });
  return sendSuccess(res, {
    emailNotificationsEnabled: user.emailNotificationsEnabled,
    emailNotificationConsentGiven: user.emailNotificationConsentGiven,
  });
}

export async function sendTestExpiryEmail(req, res) {
  const uniqueIds = [...new Set(req.body.pantryItemIds)];
  const items = await PantryItem.find({ userId: req.user.id, _id: { $in: uniqueIds } })
    .select('name quantity unit expiryDate');
  if (items.length !== uniqueIds.length) {
    return res.status(404).json({ success: false, message: 'One or more pantry items were not found.' });
  }
  try {
    await sendTestExpiryReminder(req.user, items);
  } catch (sendError) {
    if (sendError.status === 409) throw sendError;
    const error = new Error('Test email could not be sent. Check the server email configuration.');
    error.status = 502;
    throw error;
  }
  return sendSuccess(res, { sent: true, itemCount: items.length });
}
