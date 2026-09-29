import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { daysUntilExpiry, getExpiryStatus } from '../utils/expiry.js';

const today = new Date('2026-09-29T12:00:00Z');

describe('expiry date classification', () => {
  it('treats a date before the UTC calendar day as expired', () => {
    assert.equal(getExpiryStatus('2026-09-28', today), 'EXPIRED');
  });

  it('treats today through three days ahead as expiring soon', () => {
    for (const date of ['2026-09-29', '2026-09-30', '2026-10-02']) {
      assert.equal(getExpiryStatus(date, today), 'EXPIRING_SOON');
    }
  });

  it('treats four through seven days ahead as expiring this week', () => {
    for (const date of ['2026-10-03', '2026-10-06']) {
      assert.equal(getExpiryStatus(date, today), 'EXPIRING_THIS_WEEK');
    }
  });

  it('treats more than seven days as fresh', () => {
    assert.equal(getExpiryStatus('2026-10-07', today), 'FRESH');
  });

  it('compares date-only values by UTC calendar day', () => {
    assert.equal(daysUntilExpiry('2026-09-30', today), 1);
  });
});
