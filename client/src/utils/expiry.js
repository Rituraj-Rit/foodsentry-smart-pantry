export function daysUntilExpiry(value, now = new Date()) {
  const expiry = new Date(value);
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const expiryDay = Date.UTC(expiry.getUTCFullYear(), expiry.getUTCMonth(), expiry.getUTCDate());
  return Math.ceil((expiryDay - today) / 86400000);
}

export function getExpiryStatus(value, now = new Date()) {
  const days = daysUntilExpiry(value, now);
  if (days < 0) return 'EXPIRED';
  if (days <= 3) return 'EXPIRING_SOON';
  if (days <= 7) return 'EXPIRING_THIS_WEEK';
  return 'FRESH';
}

export function expiryLabel(value) {
  const status = getExpiryStatus(value);
  const days = daysUntilExpiry(value);
  if (status === 'EXPIRED') return 'Expired — do not use';
  if (days === 0) return 'Expires today';
  if (days === 1) return 'Expires tomorrow';
  return `Expires in ${days} days`;
}
