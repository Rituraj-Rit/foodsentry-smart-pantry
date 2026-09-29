import { useEffect, useState } from 'react';
import { AlertTriangle, ArrowRight, Clock3, Search, Sparkles, UtensilsCrossed } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import RecipeCard from '../components/RecipeCard';
import { getErrorMessage } from '../services/api';
import api from '../services/api';
import { getExpiryStatus } from '../utils/expiry';

export default function Recipes() {
  const [params] = useSearchParams();
  const [ingredients, setIngredients] = useState('');
  const [items, setItems] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pantryLoading, setPantryLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  useEffect(() => {
    api.get('/pantry').then(({ data }) => {
      const active = data.data.items.filter((item) => getExpiryStatus(item.expiryDate) !== 'EXPIRED');
      setItems(active);
      if (!ingredients) setIngredients(active.map((item) => item.name).join(', '));
      if (params.get('expiring') === '1') searchWith(active.filter((item) => getExpiryStatus(item.expiryDate) !== 'FRESH'));
    }).catch((requestError) => setError(getErrorMessage(requestError))).finally(() => setPantryLoading(false));
  }, []);
  async function searchWith(sourceItems) {
    const names = sourceItems.map((item) => item.name);
    if (!names.length) {
      setRecipes([]);
      setNotice('No safe-to-use ingredients are expiring this week.');
      setError('');
      return;
    }
    setIngredients(names.join(', '));
    await requestRecipes(names);
  }
  async function requestRecipes(names) {
    const clean = [...new Set(names.map((name) => name.trim()).filter(Boolean))].slice(0, 20);
    if (!clean.length) { setError('Add at least one ingredient to search.'); return; }
    setLoading(true); setError(''); setNotice('');
    try {
      const { data } = await api.get('/recipes/search', { params: { ingredients: clean.join(',') } });
      setRecipes(data.data.recipes);
    } catch (requestError) { setError(getErrorMessage(requestError)); setRecipes([]); }
    finally { setLoading(false); }
  }
  function submit(event) { event.preventDefault(); requestRecipes(ingredients.split(',')); }
  const expiring = items.filter((item) => getExpiryStatus(item.expiryDate) !== 'FRESH');
  return <div className="page-container recipes-page">
    <section className="page-heading-row"><div><span className="eyebrow">MAKE THE MOST OF WHAT'S HERE</span><h1>Find your next meal</h1><p>Tell us what you have. We'll find a few good places to start.</p></div><span className="heading-illustration"><UtensilsCrossed size={25} /></span></section>
    <form className="recipe-search-panel" onSubmit={submit}><label className="field"><span>Ingredients to cook with</span><div className="ingredient-search"><Search size={18} /><input value={ingredients} onChange={(event) => setIngredients(event.target.value)} placeholder="Try tomato, chickpeas, spinach…" /></div><small>Separate ingredients with commas. Search considers up to 20.</small></label><Button type="submit" icon={Search} disabled={loading}>{loading ? 'Finding recipes…' : 'Find recipes'}</Button></form>
    <div className="use-expiring-row"><div className="expiring-callout"><span className="quick-icon quick-icon-coral"><Clock3 size={18} /></span><span><strong>Use what needs using</strong><small>{pantryLoading ? 'Checking your pantry…' : expiring.length ? `${expiring.length} ingredients are coming up soon` : 'No urgent ingredients right now'}</small></span></div><Button variant="secondary" icon={Sparkles} onClick={() => searchWith(expiring)} disabled={pantryLoading || !expiring.length}>Use expiring ingredients <ArrowRight size={15} /></Button></div>
    {error && <div className="inline-error" role="alert"><AlertTriangle size={17} />{error}</div>}{notice && <p className="info-notice">{notice}</p>}
    <section className="recipe-results"><div className="section-heading"><div><span className="eyebrow">A FEW IDEAS FOR YOU</span><h2>{recipes.length ? `${recipes.length} recipes to explore` : 'Recipes for your ingredients'}</h2></div></div>
      {loading ? <div className="recipe-loading"><span className="spinner" /><h3>Finding something delicious…</h3><p>Matching your ingredients with recipes.</p></div> : recipes.length ? <div className="recipe-grid">{recipes.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)}</div> : <EmptyState title="No recipes found just yet" description="Add a few ingredients above and we'll look for something to make." />}
    </section>
  </div>;
}
