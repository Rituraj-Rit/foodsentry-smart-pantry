const labels = { EXPIRED: 'Expired', EXPIRING_SOON: 'Use soon', EXPIRING_THIS_WEEK: 'This week', FRESH: 'Fresh' };

export default function StatusBadge({ status }) {
  return <span className={`status-badge status-${status?.toLowerCase() || 'fresh'}`}><span aria-hidden="true" />{labels[status] || 'Fresh'}</span>;
}
