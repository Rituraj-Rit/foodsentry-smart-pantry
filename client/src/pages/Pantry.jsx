import { useEffect, useState } from 'react';
import { AlertTriangle, Plus, Search, SlidersHorizontal } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import PantryForm from '../components/PantryForm';
import PantryItemCard from '../components/PantryItemCard';
import { getErrorMessage } from '../services/api';
import api from '../services/api';

const filters = [['ALL', 'All items'], ['FRESH', 'Fresh'], ['EXPIRING_SOON', 'Use soon'], ['EXPIRING_THIS_WEEK', 'This week'], ['EXPIRED', 'Expired']];

export default function Pantry() {
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('expiry');
  const [filter, setFilter] = useState(filters.some(([key]) => key === params.get('status')) ? params.get('status') : 'ALL');
  const [formItem, setFormItem] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/pantry', { params: { search: search || undefined, sort, status: filter === 'ALL' ? undefined : filter } });
        setItems(data.data.items);
        setError('');
      } catch (requestError) { setError(getErrorMessage(requestError)); }
      finally { setLoading(false); }
    }, 220);
    return () => window.clearTimeout(timer);
  }, [search, sort, filter, refresh]);
  function chooseFilter(value) { setFilter(value); setParams(value === 'ALL' ? {} : { status: value }, { replace: true }); }
  function openEdit(item) { setFormItem(item); setFormOpen(true); }
  async function save(values) {
    setSaving(true);
    try {
      if (formItem) await api.put(`/pantry/${formItem._id}`, values);
      else await api.post('/pantry', values);
      toast.success(formItem ? 'Ingredient updated.' : `${values.name} added to your pantry.`);
      setFormOpen(false); setFormItem(null);
      const { data } = await api.get('/pantry', { params: { search: search || undefined, sort, status: filter === 'ALL' ? undefined : filter } });
      setItems(data.data.items);
    } catch (requestError) { toast.error(getErrorMessage(requestError)); }
    finally { setSaving(false); }
  }
  async function remove(item) {
    if (!window.confirm(`Remove ${item.name} from your pantry?`)) return;
    try {
      await api.delete(`/pantry/${item._id}`);
      setItems((current) => current.filter((entry) => entry._id !== item._id));
      toast.success(`${item.name} removed.`);
    } catch (requestError) { toast.error(getErrorMessage(requestError)); }
  }
  return <div className="page-container pantry-page">
    <section className="page-heading-row"><div><span className="eyebrow">A CLEARER VIEW OF WHAT YOU HAVE</span><h1>My pantry</h1><p>Keep your ingredients in sight, and the good stuff in rotation.</p></div><Button icon={Plus} onClick={() => { setFormItem(null); setFormOpen(true); }}>Add ingredient</Button></section>
    <section className="pantry-toolbar"><label className="search-box"><Search size={18} /><span className="sr-only">Search pantry</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search ingredients" /></label><label className="sort-select"><SlidersHorizontal size={16} /><span className="sr-only">Sort pantry</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="expiry">Expiry date</option><option value="name">Name A–Z</option><option value="recent">Recently added</option></select></label></section>
    <div className="filter-tabs" role="group" aria-label="Filter pantry items">{filters.map(([value, label]) => <button key={value} className={filter === value ? 'filter-tab selected' : 'filter-tab'} onClick={() => chooseFilter(value)}>{label}{value === 'ALL' && <span>{items.length}</span>}</button>)}</div>
    {error && <div className="inline-error"><AlertTriangle size={17} />{error}<button onClick={() => setRefresh((value) => value + 1)}>Try again</button></div>}
    {loading ? <div className="loading-row pantry-loading"><span className="spinner" />Loading your pantry…</div> : items.length ? <div className="pantry-card-grid">{items.map((item) => <PantryItemCard key={item._id} item={item} onEdit={openEdit} onDelete={remove} interactive />)}</div> : <EmptyState title={search || filter !== 'ALL' ? 'No ingredients found' : 'No ingredients in your pantry yet'} description={search || filter !== 'ALL' ? 'Try a different search or filter.' : 'Add what you have at home. FoodSentry will help you keep an eye on it.'} action={!search && filter === 'ALL' && <Button icon={Plus} onClick={() => setFormOpen(true)}>Add an ingredient</Button>} />}
    {formOpen && <PantryForm item={formItem} onClose={() => { setFormOpen(false); setFormItem(null); }} onSave={save} saving={saving} />}
  </div>;
}
