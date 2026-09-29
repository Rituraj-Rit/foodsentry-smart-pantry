import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { getExpiryStatus } from '../utils/expiry';

export function useExpiryAlerts(items) {
  useEffect(() => {
    if (!items.length) return;
    const today = new Date().toISOString().slice(0, 10);
    const key = `foodsentry-alerts-${today}`;
    if (sessionStorage.getItem(key)) return;
    const expired = items.filter((item) => getExpiryStatus(item.expiryDate) === 'EXPIRED');
    const soon = items.filter((item) => getExpiryStatus(item.expiryDate) === 'EXPIRING_SOON');
    if (expired.length) toast.error(`${expired.length} ${expired.length === 1 ? 'item has' : 'items have'} expired. Check your pantry.`, { toastId: key });
    else if (soon.length) toast.info(`${soon[0].name} ${soon.length === 1 ? 'expires' : `and ${soon.length - 1} more expire`} soon.`, { toastId: key });
    sessionStorage.setItem(key, 'shown');
  }, [items]);
}
