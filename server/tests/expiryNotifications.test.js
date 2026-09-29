import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildExpiryReminderEmail } from '../services/emailService.js';
import {
  addCalendarDays,
  getCalendarDateInTimezone,
  getUtcCalendarRange,
} from '../services/expiryNotificationService.js';

describe('expiry reminder calendar dates', () => {
  it('uses the configured local calendar day around UTC midnight', () => {
    assert.equal(getCalendarDateInTimezone(new Date('2026-09-29T18:31:00Z'), 'Asia/Kolkata'), '2026-09-30');
    assert.equal(getCalendarDateInTimezone(new Date('2026-09-29T18:31:00Z'), 'UTC'), '2026-09-29');
  });

  it('targets exactly two calendar days ahead', () => {
    const today = getCalendarDateInTimezone(new Date('2026-09-29T18:31:00Z'), 'Asia/Kolkata');
    assert.equal(addCalendarDays(today, 2), '2026-10-02');
  });

  it('builds a half-open UTC range for date-only expiry values', () => {
    const { start, end } = getUtcCalendarRange('2026-10-02');
    assert.equal(start.toISOString(), '2026-10-02T00:00:00.000Z');
    assert.equal(end.toISOString(), '2026-10-03T00:00:00.000Z');
  });
});

describe('expiry reminder email template', () => {
  it('includes the requested copy, quantities, dates, and pantry link without external images', () => {
    const message = buildExpiryReminderEmail('Asha', [{
      name: 'Milk', quantity: 2, unit: 'litre', expiryDate: '2026-10-02T00:00:00.000Z',
    }], 'https://foodsentry.example');
    assert.match(message.subject, /FoodSentry Reminder: Your food expires in 2 days/);
    assert.match(message.text, /Milk — 2 litres/);
    assert.match(message.html, /Hello Asha/);
    assert.match(message.html, /View My Pantry/);
    assert.match(message.html, /https:\/\/foodsentry\.example\/pantry/);
    assert.doesNotMatch(message.html, /<img\b/i);
  });

  it('escapes user-controlled names before embedding them in HTML', () => {
    const message = buildExpiryReminderEmail('<img src=x onerror=alert(1)>', [{
      name: '<script>alert(1)</script>', quantity: 1, unit: 'pieces', expiryDate: '2026-10-02',
    }]);
    assert.doesNotMatch(message.html, /<script>/i);
    assert.match(message.html, /&lt;script&gt;/);
  });

  it('uses accurate copy when retrying a reminder with one day remaining', () => {
    const message = buildExpiryReminderEmail('Asha', [{ name: 'Milk', quantity: 1, unit: 'litre', expiryDate: '2026-10-02' }], undefined, 1);
    assert.equal(message.subject, 'FoodSentry Reminder: Your food expires tomorrow ⚠️');
    assert.match(message.text, /will expire in 1 day/);
  });
});
