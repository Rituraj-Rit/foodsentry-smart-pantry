import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Clock3, Users } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import { getErrorMessage } from '../services/api';
import api from '../services/api';

export default function RecipeDetails() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    api.get(`/recipes/${id}`).then(({ data }) => { if (active) setRecipe(data.data.recipe); }).catch((requestError) => { if (active) setError(getErrorMessage(requestError)); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);
  if (loading) return <div className="page-container"><div className="recipe-loading"><span className="spinner" /><p>Getting the recipe ready…</p></div></div>;
  if (error || !recipe) return <div className="page-container details-error"><Link className="back-link" to="/recipes"><ArrowLeft size={16} /> Back to recipes</Link><EmptyState title="Couldn't load this recipe" description={error || 'Try another recipe.'} /></div>;
  return <div className="page-container recipe-detail-page"><Link className="back-link" to="/recipes"><ArrowLeft size={16} /> Back to recipes</Link><div className="recipe-detail-grid"><article className="recipe-detail-main"><span className="eyebrow">YOUR NEXT KITCHEN PROJECT</span><h1>{recipe.title}</h1><p className="detail-summary">{recipe.summary || 'A recipe to make the most of your ingredients.'}</p><div className="detail-meta">{recipe.readyInMinutes && <span><Clock3 size={16} />{recipe.readyInMinutes} minutes</span>}{recipe.servings && <span><Users size={16} />Serves {recipe.servings}</span>}</div>{recipe.instructions && <section className="instructions"><h2>Let's cook</h2>{recipe.instructions.split(/\n+/).map((step, index) => <p className="instruction-step" key={index}><span>{String(index + 1).padStart(2, '0')}</span>{step.replace(/^\d+[.)]?\s*/, '')}</p>)}</section>}{recipe.sourceUrl && <a className="source-link" href={recipe.sourceUrl} target="_blank" rel="noreferrer">View original recipe <ArrowUpRight size={15} /></a>}</article><aside className="recipe-detail-aside">{recipe.image && <img className="detail-image" src={recipe.image} alt={recipe.title} />}<div className="ingredients-panel"><span className="eyebrow">GATHER THESE</span><h2>Ingredients</h2><ul>{recipe.ingredients.map((ingredient, index) => <li key={`${ingredient}-${index}`}><span />{ingredient}</li>)}</ul></div></aside></div></div>;
}
