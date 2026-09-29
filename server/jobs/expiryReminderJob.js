import cron from 'node-cron';
import { DEFAULT_APP_TIMEZONE, runExpiryReminderCheck, getCalendarDateInTimezone } from '../services/expiryNotificationService.js';

let reminderTask;

async function runAndLog() {
  try {
    const result = await runExpiryReminderCheck();
    process.stdout.write(`Expiry reminder check complete: ${result.sent} sent, ${result.skipped} skipped, ${result.failed} failed.\n`);
  } catch (error) {
    process.stderr.write(`Expiry reminder check failed (${error.code || 'JOB_ERROR'}).\n`);
  }
}

export function initializeExpiryReminderJob() {
  if (reminderTask) return reminderTask;
  const timeZone = process.env.APP_TIMEZONE || DEFAULT_APP_TIMEZONE;
  getCalendarDateInTimezone(new Date(), timeZone);
  reminderTask = cron.schedule('0 9 * * *', runAndLog, {
    timezone: timeZone,
    noOverlap: true,
  });
  process.stdout.write(`Expiry reminder scheduler started for 09:00 ${timeZone}.\n`);
  return reminderTask;
}
