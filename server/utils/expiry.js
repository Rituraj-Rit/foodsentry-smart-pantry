const DAY_MS = 24 * 60 * 60 * 1000;

export function daysUntilExpiry(value, now = new Date()) {
  const expiry = new Date(value);
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const expiryDay = Date.UTC(expiry.getUTCFullYear(), expiry.getUTCMonth(), expiry.getUTCDate());
  return Math.ceil((expiryDay - today) / DAY_MS);
}

export function getExpiryStatus(value, now = new Date()) {
  const days = daysUntilExpiry(value, now);
  if (days < 0) return 'EXPIRED';
  if (days <= 3) return 'EXPIRING_SOON';
  if (days <= 7) return 'EXPIRING_THIS_WEEK';
  return 'FRESH';
}
