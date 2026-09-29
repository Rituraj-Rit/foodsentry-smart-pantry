import { ArrowUpRight, Clock3, CookingPot } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RecipeCard({ recipe }) {
  return <Link className="recipe-card" to={`/recipes/${recipe.id}`}>
    {recipe.image ? <img src={recipe.image} alt="" loading="lazy" /> : <div className="recipe-image-fallback"><CookingPot size={26} /></div>}
    <div className="recipe-card-content"><div className="recipe-kicker"><span>FoodSentry pick</span><ArrowUpRight size={16} /></div><h3>{recipe.title}</h3>
      {recipe.readyInMinutes && <span className="recipe-meta"><Clock3 size={14} />{recipe.readyInMinutes} min</span>}
      {recipe.usedIngredients && <p className="recipe-ingredients">Uses {recipe.usedIngredients.slice(0, 3).join(', ') || 'your pantry ingredients'}</p>}
      {recipe.missedIngredients && <p className="recipe-missing">{recipe.missedIngredients.length ? `${recipe.missedIngredients.length} ingredients to add` : 'You have everything'}</p>}
    </div>
  </Link>;
}
