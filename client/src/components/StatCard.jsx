export default function StatCard({ label, value, hint, icon: Icon, tone = 'green' }) {
  return <article className={`stat-card stat-${tone}`}><span className="stat-icon"><Icon size={19} /></span><div><p>{label}</p><strong>{value}</strong><small>{hint}</small></div></article>;
}
