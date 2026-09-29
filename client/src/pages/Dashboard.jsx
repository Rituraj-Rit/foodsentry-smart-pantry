import { useEffect, useState } from 'react';
import { AlertTriangle, ArrowRight, Check, Clock3, Leaf, Plus, Sparkles, UtensilsCrossed } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import PantryForm from '../components/PantryForm';
import PantryItemCard from '../components/PantryItemCard';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import { useExpiryAlerts } from '../hooks/useExpiryAlerts';
import api, { getErrorMessage } from '../services/api';
import { getExpiryStatus } from '../utils/expiry';
import { toast } from 'react-toastify';

export default function Dashboard() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  useExpiryAlerts(items);
  async function loadItems() {
    try { const { data } = await api.get('/pantry?sort=expiry'); setItems(data.data.items); setError(''); }
    catch (requestError) { setError(getErrorMessage(requestError)); }
    finally { setLoading(false); }
  }
  useEffect(() => { loadItems(); }, []);
  const expired = items.filter((item) => getExpiryStatus(item.expiryDate) === 'EXPIRED');
  const soon = items.filter((item) => ['EXPIRING_SOON', 'EXPIRING_THIS_WEEK'].includes(getExpiryStatus(item.expiryDate)));
  const fresh = items.filter((item) => getExpiryStatus(item.expiryDate) === 'FRESH');
  const recent = [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);
  async function addItem(values) {
    setSaving(true);
    try { await api.post('/pantry', values); toast.success(`${values.name} added to your pantry.`); setFormOpen(false); await loadItems(); }
    catch (requestError) { toast.error(getErrorMessage(requestError)); }
    finally { setSaving(false); }
  }
  return <div className="page-container dashboard-page">
    <section className="welcome-row"><div><span className="eyebrow">TUESDAY, {new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric' }).format(new Date()).toUpperCase()}</span><h1>Good to see you, {user?.name?.split(' ')[0]}<span className="welcome-period">.</span></h1><p>Here's what's happening in your pantry today.</p></div><Button icon={Plus} onClick={() => setFormOpen(true)}>Add ingredient</Button></section>
    {error && <div className="inline-error" role="alert"><AlertTriangle size={17} />{error}<button onClick={loadItems}>Try again</button></div>}
    <section className="stats-grid" aria-label="Pantry summary"><StatCard label="In your pantry" value={items.length} hint="ingredients tracked" icon={Leaf} tone="green" /><StatCard label="Use this week" value={soon.length} hint="coming up soon" icon={Clock3} tone="yellow" /><StatCard label="Expired" value={expired.length} hint="check these items" icon={AlertTriangle} tone="red" /><StatCard label="Still fresh" value={fresh.length} hint="plenty of time" icon={Check} tone="blue" /></section>
    <section className="dashboard-quick"><div className="quick-copy"><span className="eyebrow">A GOOD PLACE TO START</span><h2>What sounds good?</h2><p>Use what you have, before it slips your mind.</p></div><div className="quick-actions"><Link to="/pantry" className="quick-action"><span className="quick-icon quick-icon-gold"><Plus size={19} /></span><span><strong>Add ingredients</strong><small>Keep your pantry up to date</small></span><ArrowRight size={16} /></Link><Link to="/recipes?expiring=1" className="quick-action"><span className="quick-icon quick-icon-green"><UtensilsCrossed size={19} /></span><span><strong>Find a recipe</strong><small>Make the most of what's fresh</small></span><ArrowRight size={16} /></Link><Link to="/ai-recipe" className="quick-action"><span className="quick-icon quick-icon-coral"><Sparkles size={19} /></span><span><strong>Ask Chef AI</strong><small>Get a recipe made for you</small></span><ArrowRight size={16} /></Link></div></section>
    <div className="dashboard-columns"><section className="content-section expiring-section"><div className="section-heading"><div><span className="eyebrow">DON'T LET THESE GO</span><h2>Coming up soon</h2></div><Link className="section-link" to="/pantry?status=EXPIRING_SOON">View pantry <ArrowRight size={15} /></Link></div>{loading ? <div className="loading-row"><span className="spinner" />Checking your pantry…</div> : soon.length ? <div className="pantry-card-grid">{soon.slice(0, 4).map((item) => <PantryItemCard key={item._id} item={item} onEdit={() => {}} onDelete={() => {}} />)}</div> : <EmptyState title="Nothing is about to expire" description="Your ingredients are looking good. Keep adding what you bring home." />}</section>
      <section className="content-section recent-section"><div className="section-heading"><div><span className="eyebrow">JUST ADDED</span><h2>Recent ingredients</h2></div><Link className="section-link" to="/pantry">See all <ArrowRight size={15} /></Link></div>{loading ? <div className="loading-row"><span className="spinner" />Loading ingredients…</div> : recent.length ? <div className="recent-list">{recent.map((item) => <div className="recent-row" key={item._id}><span className="recent-initial">{item.name[0].toUpperCase()}</span><span className="recent-name"><strong>{item.name}</strong><small>{item.category}</small></span><span>{item.quantity} {item.unit}</span></div>)}</div> : <EmptyState title="Your pantry starts here" description="Add your first ingredient to see it here." action={<Button size="small" icon={Plus} onClick={() => setFormOpen(true)}>Add ingredient</Button>} />}</section></div>
    {formOpen && <PantryForm onClose={() => setFormOpen(false)} onSave={addItem} saving={saving} />}
  </div>;
}
