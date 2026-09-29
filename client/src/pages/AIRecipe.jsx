import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Check, ChefHat, Clock3, Plus, Sparkles, Users } from 'lucide-react';
import Button from '../components/Button';
import { getErrorMessage } from '../services/api';
import api from '../services/api';
import { getExpiryStatus } from '../utils/expiry';

const dietOptions = ['No preference', 'Vegetarian', 'Vegan', 'Pescatarian', 'Gluten-free', 'Dairy-free', 'High protein'];
const cuisineOptions = ['Any cuisine', 'Indian', 'Italian', 'Mexican', 'Japanese', 'Mediterranean', 'Thai', 'Middle Eastern'];

export default function AIRecipe() {
  const [pantry, setPantry] = useState([]);
  const [selected, setSelected] = useState([]);
  const [custom, setCustom] = useState('');
  const [diet, setDiet] = useState('No preference');
  const [cuisine, setCuisine] = useState('Any cuisine');
  const [servings, setServings] = useState(2);
  const [loadingPantry, setLoadingPantry] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [recipe, setRecipe] = useState(null);
  useEffect(() => {
    api.get('/pantry').then(({ data }) => {
      const items = data.data.items;
      setPantry(items);
      setSelected(items.filter((item) => getExpiryStatus(item.expiryDate) !== 'EXPIRED').map((item) => item.name));
    }).catch((requestError) => setError(getErrorMessage(requestError))).finally(() => setLoadingPantry(false));
  }, []);
  const expired = useMemo(() => pantry.filter((item) => getExpiryStatus(item.expiryDate) === 'EXPIRED'), [pantry]);
  const available = useMemo(() => pantry.filter((item) => getExpiryStatus(item.expiryDate) !== 'EXPIRED'), [pantry]);
  function toggle(name) { setSelected((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name]); }
  function addCustom(event) {
    event.preventDefault();
    const name = custom.trim();
    if (!name) return;
    if (expired.some((item) => item.name.toLowerCase() === name.toLowerCase())) {
      setWarning(`${name} is expired and cannot be used in a recipe.`);
      return;
    }
    setSelected((current) => current.some((item) => item.toLowerCase() === name.toLowerCase()) ? current : [...current, name]);
    setCustom(''); setWarning('');
  }
  async function generate(event) {
    event.preventDefault();
    setError(''); setWarning(''); setRecipe(null);
    const ingredients = [...new Set([...selected, ...custom.split(',').map((value) => value.trim()).filter(Boolean)])];
    if (!ingredients.length) { setWarning('Choose or add at least one ingredient first.'); return; }
    const expiredMatches = ingredients.filter((name) => expired.some((item) => item.name.toLowerCase() === name.toLowerCase()));
    if (expiredMatches.length) { setWarning(`Remove expired ingredients: ${expiredMatches.join(', ')}.`); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/ai/generate-recipe', { ingredients, diet: diet === 'No preference' ? '' : diet, cuisine: cuisine === 'Any cuisine' ? '' : cuisine, servings: Number(servings) });
      setRecipe(data.data.recipe);
    } catch (requestError) { setError(getErrorMessage(requestError)); }
    finally { setLoading(false); }
  }
  return <div className="page-container ai-page"><section className="page-heading-row"><div><span className="eyebrow">A LITTLE HELP FROM CHEF AI</span><h1>Something good, from what you have.</h1><p>Pick the ingredients you want to use. We'll take it from there.</p></div><span className="ai-heading-icon"><Sparkles size={23} /></span></section>
    <div className="ai-layout"><form className="ai-controls" onSubmit={generate}><section className="ai-field-section"><div className="ai-section-title"><span>01</span><div><h2>Choose ingredients</h2><p>Expired items are left out for safety.</p></div></div>
        {loadingPantry ? <div className="loading-row"><span className="spinner" />Loading pantry ingredients…</div> : available.length ? <div className="ingredient-select-list">{available.map((item) => <label className={`ingredient-choice${selected.includes(item.name) ? ' chosen' : ''}`} key={item._id}><input type="checkbox" checked={selected.includes(item.name)} onChange={() => toggle(item.name)} /><span className="checkmark"><Check size={13} /></span><span className="choice-name">{item.name}<small>{item.quantity} {item.unit}</small></span><span className="choice-expiry">{item.expiryStatus === 'EXPIRING_SOON' ? 'Use soon' : item.expiryStatus === 'EXPIRING_THIS_WEEK' ? 'This week' : 'Fresh'}</span></label>)}</div> : <p className="field-hint">No ingredients in your pantry yet. Add some below or start with a custom ingredient.</p>}
        {expired.length > 0 && <div className="expired-warning"><AlertTriangle size={17} /><span><strong>{expired.length} expired {expired.length === 1 ? 'ingredient is' : 'ingredients are'} excluded.</strong><small>{expired.map((item) => item.name).join(', ')}. Expired food should not be used.</small></span></div>}
        <div className="field custom-ingredient-field"><label htmlFor="custom-ingredient">Add another ingredient</label><div className="add-custom-row"><input id="custom-ingredient" value={custom} onChange={(event) => setCustom(event.target.value)} placeholder="e.g. lemon" /><button className="icon-button" type="button" aria-label="Add ingredient" onClick={addCustom}><Plus size={18} /></button></div></div>
      </section><section className="ai-field-section ai-preferences"><div className="ai-section-title"><span>02</span><div><h2>Set the mood</h2><p>Fine-tune your recipe if you like.</p></div></div><label className="field">Dietary preference<select value={diet} onChange={(event) => setDiet(event.target.value)}>{dietOptions.map((option) => <option key={option}>{option}</option>)}</select></label><label className="field">Cuisine<select value={cuisine} onChange={(event) => setCuisine(event.target.value)}>{cuisineOptions.map((option) => <option key={option}>{option}</option>)}</select></label><label className="field">Servings<input type="number" min="1" max="12" value={servings} onChange={(event) => setServings(event.target.value)} /></label></section>
      {warning && <p className="form-warning" role="alert"><AlertTriangle size={16} />{warning}</p>}{error && <p className="form-error" role="alert">{error}</p>}<Button type="submit" icon={Sparkles} className="generate-button" disabled={loading || loadingPantry}>{loading ? 'Chef AI is creating your recipe…' : 'Generate my recipe'}</Button>
    </form>
    <section className="ai-result" aria-live="polite">{loading ? <div className="ai-loading"><span className="chef-loader"><ChefHat size={26} /></span><h2>Chef AI is creating your recipe…</h2><p>Finding a good way to bring these ingredients together.</p><div className="loading-bars"><i /><i /><i /></div></div> : recipe ? <article className="generated-recipe"><span className="eyebrow"><Sparkles size={13} /> MADE FOR YOUR PANTRY</span><h2>{recipe.title}</h2><p className="generated-description">{recipe.description}</p><div className="generated-meta"><span><Clock3 size={15} />Prep {recipe.prepTime}</span><span><ChefHat size={15} />Cook {recipe.cookTime}</span><span><Users size={15} />Serves {recipe.servings}</span></div><section><h3>Ingredients</h3><ul className="generated-ingredients">{recipe.ingredients.map((item, index) => <li key={`${item.name}-${index}`}><span>{item.name}{item.optional && <small>Optional</small>}</span><strong>{item.amount}</strong></li>)}</ul></section><section><h3>Method</h3><ol className="generated-steps">{recipe.instructions.map((step, index) => <li key={`${index}-${step}`}><span>{String(index + 1).padStart(2, '0')}</span>{step}</li>)}</ol></section><section className="nutrition-row"><h3>Estimated nutrition</h3><div>{Object.entries(recipe.nutrition).map(([key, value]) => <span key={key}><strong>{value}</strong><small>{key}</small></span>)}</div></section><p className="ai-safety-note"><AlertTriangle size={14} />Always check ingredients for freshness and follow safe food handling guidance.</p></article> : <div className="ai-empty"><span className="ai-empty-icon"><ChefHat size={26} /></span><span className="eyebrow">YOUR RECIPE WILL APPEAR HERE</span><h2>Let's make something of it.</h2><p>Choose a few ingredients, set any preferences, and let Chef AI find a practical way to bring them together.</p><div className="empty-recipe-lines"><i /><i /><i /></div></div>}</section></div>
  </div>;
}
